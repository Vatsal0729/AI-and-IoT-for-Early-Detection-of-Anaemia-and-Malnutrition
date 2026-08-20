import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Patient, ScanSession } from '../types';
import { colors, spacing, typography, commonStyles, shadows, radius, getSeverityColor, getMUACZoneColor } from '../theme/theme';
import { getAllPatients, getOverallStats, getAllSessions, clearAllData, exportAndShareCSV, importCSVFromContent } from '../storage/patientStore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface PatientWithSession extends Patient {
  latestSession?: ScanSession;
}

export default function HomeScreen({ navigation }: Props) {
  const [patients, setPatients] = useState<PatientWithSession[]>([]);
  const [stats, setStats] = useState({ patientsScreened: 0, anemiaDetected: 0, malnutritionDetected: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    try {
      const [allPatients, todayStats, allSessions] = await Promise.all([
        getAllPatients(),
        getOverallStats(),
        getAllSessions(),
      ]);

      const patientMap: PatientWithSession[] = allPatients.map((p) => {
        const patientSessions = allSessions
          .filter((s) => s.patientId === p.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return {
          ...p,
          latestSession: patientSessions[0],
        };
      });

      patientMap.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPatients(patientMap);
      setStats(todayStats);
    } catch (e) {
      console.error('Error loading home data:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await exportAndShareCSV();
    } catch (e: any) {
      Alert.alert('Export Failed', e.message || 'Could not export CSV data.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      
      const fileUri = result.assets[0].uri;
      // @ts-ignore
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' as any });
      const { imported, skipped } = await importCSVFromContent(content);
      await loadData();
      Alert.alert(
        'Import Complete',
        `${imported} patient${imported !== 1 ? 's' : ''} imported.${skipped > 0 ? ' ' + skipped + ' row(s) skipped.' : ''}`,
      );
    } catch (e: any) {
      Alert.alert('Import Failed', e?.message || 'Could not read the CSV file. Ensure it matches the HemoNutri AI export format.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Reset Database',
      'Are you sure you want to permanently delete all patient profiles, historical measurements, and the cached CSV file? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await loadData();
              Alert.alert('Database Reset', 'All patient and scan data has been deleted.');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete some files.');
            }
          }
        }
      ]
    );
  };

  const renderPatient = ({ item }: { item: PatientWithSession }) => {
    const session = item.latestSession;
    const hb = session?.anemiaResult?.hbEstimate?.value;
    const severity = session?.anemiaResult?.severity;
    const muac = session?.nutritionResult?.muac?.circumferenceCm;
    const muacZone = session?.nutritionResult?.muacZone;

    return (
      <Card 
        style={styles.patientCard} 
        onPress={() => navigation.navigate('PatientHistory', { patient: item })}
      >
        <View style={commonStyles.rowBetween}>
          <View>
            <Text style={typography.bodyBold}>{item.name}</Text>
            <Text style={typography.caption}>
              {item.age} {item.ageUnit} • {item.weight} kg {item.village ? `• ${item.village}` : ''}
            </Text>
          </View>
          
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {severity ? (
              <Chip 
                textStyle={{ color: getSeverityColor(severity), fontWeight: '700', fontSize: 10, marginVertical: 0 }} 
                style={{ backgroundColor: getSeverityColor(severity) + '15', height: 24 }}
                compact
              >
                Hb {hb?.toFixed(1)}
              </Chip>
            ) : null}

            {muacZone ? (
              <Chip 
                textStyle={{ color: getMUACZoneColor(muacZone), fontWeight: '700', fontSize: 10, marginVertical: 0 }} 
                style={{ backgroundColor: getMUACZoneColor(muacZone) + '15', height: 24 }}
                compact
              >
                MUAC {muac?.toFixed(1)}
              </Chip>
            ) : null}

            {!severity && !muacZone ? (
              <Chip 
                textStyle={{ color: colors.primary, fontSize: 10, marginVertical: 0 }} 
                style={{ backgroundColor: colors.primaryContainer, height: 24 }}
                compact
                onPress={() => navigation.navigate('AnemiaScan', { patient: item })}
              >
                Scan Now
              </Chip>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[commonStyles.screen, { backgroundColor: '#FFFFFF' }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>HemoNutri AI</Text>
            <IconButton icon="heart-pulse" iconColor={colors.primary} size={24} style={{ margin: 0 }} />
          </View>
          <Text style={styles.headerSubtitle}>Field Triage & Diagnostic Suite</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.patientsScreened}</Text>
            <Text style={styles.statLabel}>Screened</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: stats.anemiaDetected > 0 ? colors.anemiaModerate : colors.primary }]}>
              {stats.anemiaDetected}
            </Text>
            <Text style={styles.statLabel}>Anemia</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: stats.malnutritionDetected > 0 ? colors.muacOrange : colors.primary }]}>
              {stats.malnutritionDetected}
            </Text>
            <Text style={styles.statLabel}>Malnutrition</Text>
          </Card>
        </View>

        {/* Quick Action */}
        <View style={styles.quickActionContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('PatientRegistration')}
            style={styles.newPatientBtn}
            contentStyle={{ paddingVertical: spacing.xs }}
          >
            New Patient
          </Button>
        </View>

        {/* Data Management Section */}
        <View style={styles.dataManagementRow}>
          <Button mode="text" icon="file-import-outline" onPress={handleImportCSV} compact textColor={colors.textSecondary}>
            Import
          </Button>
          <Button 
            mode="text" 
            icon="file-export-outline" 
            loading={exporting} 
            disabled={exporting || patients.length === 0} 
            onPress={handleExportCSV} 
            compact 
            textColor={colors.textSecondary}
          >
            Export
          </Button>
          <Button mode="text" icon="delete-outline" onPress={handleClearAllData} compact textColor={colors.critical}>
            Clear
          </Button>
        </View>

        {/* Recent Patients */}
        <View style={styles.listContainer}>
          <View style={commonStyles.rowBetween}>
            <Text style={[commonStyles.sectionTitle, { color: colors.textPrimary }]}>Registered Patients</Text>
            {patients.length > 0 && (
              <TouchableOpacity onPress={onRefresh}>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>

          {patients.length > 0 ? (
            <FlatList
              data={patients}
              keyExtractor={(item) => item.id}
              renderItem={renderPatient}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No patients yet</Text>
              <Text style={styles.emptyStateText}>Add your first patient to begin screening.</Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('PatientRegistration')} 
                style={{ marginTop: spacing.sm }}
              >
                Register Patient
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    ...shadows.card,
    borderRadius: radius.md,
  },
  statValue: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickActionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  newPatientBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    width: '60%',
    ...shadows.elevated,
  },
  dataManagementRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    ...shadows.card,
    borderRadius: radius.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
