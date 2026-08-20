import { HealthPassport, AnemiaSeverity } from '../types';

export function encodePatientData(passport: HealthPassport): string {
  const sev = passport.anemiaResult?.severity;
  let sevCode = 'no';
  if (sev === 'borderline_anemia' || (sev as string) === 'mild') sevCode = 'bor';
  else if (sev === 'anemia' || (sev as string) === 'moderate') sevCode = 'ane';
  else if (sev === 'severe_anemia' || (sev as string) === 'severe') sevCode = 'sev';

  const data = {
    v: 2, // version 2
    id: passport.patient.id,
    n: passport.patient.name,
    a: passport.patient.age,
    au: passport.patient.ageUnit === 'months' ? 'm' : 'y',
    g: passport.patient.gender.substring(0, 1),
    hb: passport.anemiaResult?.hbEstimate?.value ? parseFloat(passport.anemiaResult.hbEstimate.value.toFixed(1)) : null,
    sev: sevCode,
    mc: passport.nutritionResult?.muac?.circumferenceCm ? parseFloat(passport.nutritionResult.muac.circumferenceCm.toFixed(1)) : null,
    em: passport.nutritionResult?.emaciation?.preservationScore ? Math.round(passport.nutritionResult.emaciation.preservationScore) : null,
    d: passport.generatedAt,
    fd: passport.followUpDate,
    hw: passport.healthWorkerId
  };

  return JSON.stringify(data);
}

export function decodePatientData(qrString: string): Partial<HealthPassport> | null {
  try {
    const data = JSON.parse(qrString);
    if (!data.v && !data.id) return null;

    let mappedSeverity: AnemiaSeverity = 'no_anemia';
    if (data.sev === 'bor' || data.sev === 'mil') mappedSeverity = 'borderline_anemia';
    else if (data.sev === 'ane' || data.sev === 'mod') mappedSeverity = 'anemia';
    else if (data.sev === 'sev') mappedSeverity = 'severe_anemia';

    return {
      patient: {
        id: data.id,
        name: data.n,
        age: data.a,
        ageUnit: data.au === 'm' ? 'months' : 'years',
        gender: data.g === 'm' ? 'male' : (data.g === 'f' ? 'female' : 'other'),
        weight: 0,
        createdAt: data.d
      },
      anemiaResult: data.hb ? {
        hbEstimate: { value: data.hb, confidence: 1, method: 'fused', qualityWarnings: [] },
        severity: mappedSeverity,
        severityColor: '',
        recommendations: [],
        dietaryAdvice: [],
        referralNeeded: mappedSeverity === 'severe_anemia',
        timestamp: data.d
      } : undefined,
      nutritionResult: data.mc ? {
        muac: { circumferenceCm: data.mc, confidence: 1, method: 'manual_input' },
        recommendations: [],
        referralNeeded: false,
        timestamp: data.d
      } : undefined,
      healthWorkerId: data.hw || 'Unknown',
      healthWorkerName: 'Sync Agent',
      facilityName: 'Primary Health Centre',
      generatedAt: data.d,
      followUpDate: data.fd,
      qrPayload: qrString
    };
  } catch (error) {
    console.error('Failed to decode QR string', error);
    return null;
  }
}

export function generateQRPayload(passport: HealthPassport): string {
  return encodePatientData(passport);
}
