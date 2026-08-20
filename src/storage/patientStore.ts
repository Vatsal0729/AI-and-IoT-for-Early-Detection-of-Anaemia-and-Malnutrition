import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Patient, ScanSession } from '../types';
import { getSeverityLabel, getMUACZoneLabel } from '../theme/theme';

const PATIENTS_KEY = '@hemonutri_patients';
const SESSIONS_KEY = '@hemonutri_sessions';

export async function savePatient(patient: Patient): Promise<void> {
  try {
    const existing = await getAllPatients();
    const index = existing.findIndex(p => p.id === patient.id);
    if (index >= 0) {
      existing[index] = patient;
    } else {
      existing.push(patient);
    }
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(existing));
    
    // Auto-update persistent CSV backup file
    await updateCSVFileOnDisk();
  } catch (error) {
    console.error('Failed to save patient', error);
  }
}

export async function getPatient(id: string): Promise<Patient | null> {
  try {
    const all = await getAllPatients();
    return all.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Failed to get patient', error);
    return null;
  }
}

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const data = await AsyncStorage.getItem(PATIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get all patients', error);
    return [];
  }
}

export async function deletePatient(id: string): Promise<void> {
  try {
    const existing = await getAllPatients();
    const filtered = existing.filter(p => p.id !== id);
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(filtered));
    await updateCSVFileOnDisk();
  } catch (error) {
    console.error('Failed to delete patient', error);
  }
}

export async function saveScanSession(session: ScanSession): Promise<void> {
  try {
    const existing = await getAllSessions();
    const index = existing.findIndex(s => s.id === session.id);
    if (index >= 0) {
      existing[index] = session;
    } else {
      existing.push(session);
    }
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(existing));
    
    // Auto-update persistent CSV backup file
    await updateCSVFileOnDisk();
  } catch (error) {
    console.error('Failed to save session', error);
  }
}

export async function getPatientSessions(patientId: string): Promise<ScanSession[]> {
  try {
    const all = await getAllSessions();
    return all.filter(s => s.patientId === patientId);
  } catch (error) {
    console.error('Failed to get patient sessions', error);
    return [];
  }
}

export async function getAllSessions(): Promise<ScanSession[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get all sessions', error);
    return [];
  }
}

export async function getOverallStats(): Promise<{ patientsScreened: number; anemiaDetected: number; malnutritionDetected: number }> {
  try {
    const allSessions = await getAllSessions();
    const allPatients = await getAllPatients();
    
    // Total screened is total patients who have at least one session
    const screenedPatientIds = new Set(allSessions.map(s => s.patientId));
    let screened = screenedPatientIds.size;
    
    let anemia = 0;
    let malnutrition = 0;

    // To prevent double counting, let's just check the latest session for each patient
    for (const pId of screenedPatientIds) {
      const patientSessions = allSessions.filter(s => s.patientId === pId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latest = patientSessions[0];
      
      if (latest.anemiaResult && ['borderline_anemia', 'anemia', 'severe_anemia', 'mild', 'moderate', 'severe'].includes(latest.anemiaResult.severity)) {
        anemia++;
      }
      if (latest.nutritionResult?.muac && latest.nutritionResult.muac.circumferenceCm < 12.5) {
        malnutrition++;
      }
    }

    // Fallback if no sessions exist but patients do
    if (screened === 0 && allPatients.length > 0) {
       screened = allPatients.length; // Just to show records are there
    }

    return { patientsScreened: screened, anemiaDetected: anemia, malnutritionDetected: malnutrition };
  } catch (error) {
    console.error('Failed to get stats', error);
    return { patientsScreened: 0, anemiaDetected: 0, malnutritionDetected: 0 };
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([PATIENTS_KEY, SESSIONS_KEY]);
    await updateCSVFileOnDisk();
  } catch (error) {
    console.error('Failed to clear data', error);
  }
}

// ============================================================================
// CSV Export & Persistence Engine (RFC-4180 Compliant)
// ============================================================================

export async function generatePatientsCSVString(): Promise<string> {
  const [patients, sessions] = await Promise.all([getAllPatients(), getAllSessions()]);
  
  const headers = [
    'Patient ID',
    'Full Name',
    'Age',
    'Age Unit',
    'Gender',
    'Weight (kg)',
    'Guardian Name',
    'Village / Location',
    'Registration Date',
    'Total Scans Recorded',
    'Latest Scan Date',
    'Hemoglobin (g/dL)',
    'Anemia Severity',
    'Pulse Rate (BPM)',
    'Perfusion Index (%)',
    'MUAC Circumference (cm)',
    'MUAC Zone Classification',
    'Facial Muscle Preservation Score (%)',
    'Facial Wasting Class',
    'IFA Dosage Prescription',
    'Referral Required',
    'Referral Urgency'
  ];

  const escapeCSV = (field: any): string => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = patients.map(p => {
    const patientSessions = sessions
      .filter(s => s.patientId === p.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const latest = patientSessions[0];
    const anemia = latest?.anemiaResult;
    const nutrition = latest?.nutritionResult;

    return [
      escapeCSV(p.id),
      escapeCSV(p.name),
      escapeCSV(p.age),
      escapeCSV(p.ageUnit),
      escapeCSV(p.gender),
      escapeCSV(p.weight),
      escapeCSV(p.guardianName || 'N/A'),
      escapeCSV(p.village || 'Field Unit'),
      escapeCSV(p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'),
      escapeCSV(patientSessions.length),
      escapeCSV(latest?.timestamp ? new Date(latest.timestamp).toLocaleDateString() : 'Pending Scan'),
      escapeCSV(anemia?.hbEstimate?.value ? anemia.hbEstimate.value.toFixed(1) : 'N/A'),
      escapeCSV(anemia?.severity ? getSeverityLabel(anemia.severity) : 'N/A'),
      escapeCSV(anemia?.ppgFeatures?.heartRate ? Math.round(anemia.ppgFeatures.heartRate) : 'N/A'),
      escapeCSV(anemia?.ppgFeatures?.perfusionIndex ? anemia.ppgFeatures.perfusionIndex.toFixed(2) : 'N/A'),
      escapeCSV(nutrition?.muac?.circumferenceCm ? nutrition.muac.circumferenceCm.toFixed(1) : 'N/A'),
      escapeCSV(nutrition?.muacZone ? getMUACZoneLabel(nutrition.muacZone) : 'N/A'),
      escapeCSV(nutrition?.emaciation?.preservationScore ? nutrition.emaciation.preservationScore.toFixed(0) : 'N/A'),
      escapeCSV(nutrition?.emaciation?.classification ? nutrition.emaciation.classification.replace('_', ' ') : 'N/A'),
      escapeCSV(anemia?.dosage?.elementalIronMg ? `${anemia.dosage.elementalIronMg}mg (${anemia.dosage.syrupMlPerDose}mL ${anemia.dosage.frequency})` : 'None'),
      escapeCSV(anemia?.referralNeeded || nutrition?.referralNeeded ? 'YES' : 'NO'),
      escapeCSV(anemia?.referralUrgency || nutrition?.referralUrgency || 'routine')
    ].join(',');
  });

  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
}

export async function updateCSVFileOnDisk(): Promise<string> {
  try {
    const csvContent = await generatePatientsCSVString();
    // @ts-ignore
    const fileUri = `${FileSystem.cacheDirectory}hemonutri_field_records.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: 'utf8' as any });
    return fileUri;
  } catch (error) {
    console.error('Error writing CSV to local disk:', error);
    return '';
  }
}

export async function exportAndShareCSV(): Promise<void> {
  try {
    const fileUri = await updateCSVFileOnDisk();
    if (!fileUri) throw new Error('Could not generate CSV data file');

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Device sharing service is not available');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export HemoNutri AI Clinical Records (CSV)',
      UTI: 'public.comma-separated-values-text'
    });
  } catch (error: any) {
    console.error('Failed to export CSV report:', error);
    throw new Error(error?.message || 'Failed to export CSV report');
  }
}

/**
 * Import patients from a CSV file.
 * Expects header row: Patient ID,Name,Age,Age Unit,Gender,Weight (kg),Guardian Name,Village / Location,...
 * Only imports the first 8 demographic columns. Scan data columns are ignored on import.
 */
export async function importCSVFromContent(csvText: string): Promise<{ imported: number; skipped: number }> {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { imported: 0, skipped: 0 };

  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuote && row[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const header = parseCSVRow(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const existing = await getAllPatients();
  const existingIds = new Set(existing.map(p => p.id));

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCSVRow(lines[i]).map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 6) { skipped++; continue; }

      const id = cols[0] || ('IMP-' + Date.now().toString(36).toUpperCase() + i);
      if (existingIds.has(id)) { skipped++; continue; }

      const age = parseFloat(cols[2]) || 0;
      const weight = parseFloat(cols[5]) || 0;
      if (age <= 0 || weight <= 0) { skipped++; continue; }

      const patient: Patient = {
        id,
        name: cols[1] || 'Unknown',
        age,
        ageUnit: (cols[3] as 'months' | 'years') || 'years',
        gender: (cols[4] as 'male' | 'female' | 'other') || 'other',
        weight,
        guardianName: cols[6] || undefined,
        village: cols[7] || undefined,
        createdAt: new Date().toISOString(),
      };

      existing.push(patient);
      existingIds.add(id);
      imported++;
    } catch {
      skipped++;
    }
  }

  if (imported > 0) {
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(existing));
    await updateCSVFileOnDisk();
  }

  return { imported, skipped };
}
