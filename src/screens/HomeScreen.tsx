import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Card, Avatar, Chip, IconButton, Surface, Button, ActivityIndicator } from 'react-native-paper';
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
        `${imported} patient${imported !== 1 ? 's' : ''} imported successfully.${skipped > 0 ? `\n${skipped} row(s) skipped (duplicate or invalid data).` : ''}`,
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
          <View style={commonStyles.row}>
            <Avatar.Text 
              size={44} 
              label={item.name ? item.name.substring(0, 2).toUpperCase() : 'PT'} 
              color={colors.textOnPrimary} 
              style={{ backgroundColor: colors.primary }} 
            />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={typography.bodyBold}>{item.name}</Text>
              <Text style={typography.caption}>
                {item.age} {item.ageUnit} • {item.weight} kg {item.village ? `• ${item.village}` : ''}
              </Text>
            </View>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            {severity ? (
              <Chip 
                textStyle={{ color: getSeverityColor(severity), fontWeight: '700', fontSize: 11 }} 
                style={{ backgroundColor: getSeverityColor(severity) + '15', marginBottom: 4 }}
              >
                Hb {hb?.toFixed(1)} g/dL
              </Chip>
            ) : null}

            {muacZone ? (
              <Chip 
                textStyle={{ color: getMUACZoneColor(muacZone), fontWeight: '700', fontSize: 11 }} 
                style={{ backgroundColor: getMUACZoneColor(muacZone) + '15' }}
              >
                MUAC {muac?.toFixed(1)} cm
              </Chip>
            ) : null}

            {!severity && !muacZone ? (
              <Chip 
                icon="plus-circle-outline" 
                textStyle={{ color: colors.primary, fontSize: 11 }} 
                style={{ backgroundColor: colors.primaryContainer }}
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
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>HemoNutri AI</Text>
            <Text style={styles.headerSubtitle}>Field Triage & Diagnostic Suite</Text>
          </View>
          <Avatar.Icon size={52} icon="heart-pulse" color={colors.primary} style={{ backgroundColor: 'white', elevation: 4 }}/>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={styles.statValue}>{stats.patientsScreened}</Text>
              <Avatar.Icon size={24} icon="account-group" color={colors.primary} style={{ backgroundColor: 'transparent', marginLeft: 4 }}/>
            </View>
            <Text style={styles.statLabel}>Screened</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={[styles.statValue, { color: stats.anemiaDetected > 0 ? colors.anemiaModerate : colors.primary }]}>
                {stats.anemiaDetected}
              </Text>
              <Avatar.Icon size={24} icon="water" color={stats.anemiaDetected > 0 ? colors.anemiaModerate : colors.primary} style={{ backgroundColor: 'transparent', marginLeft: 4 }}/>
            </View>
            <Text style={styles.statLabel}>Anemia</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={[styles.statValue, { color: stats.malnutritionDetected > 0 ? colors.muacOrange : colors.primary }]}>
                {stats.malnutritionDetected}
              </Text>
              <Avatar.Icon size={24} icon="food-apple" color={stats.malnutritionDetected > 0 ? colors.muacOrange : colors.primary} style={{ backgroundColor: 'transparent', marginLeft: 4 }}/>
            </View>
            <Text style={styles.statLabel}>Malnutrition</Text>
          </Card>
        </View>

        {/* Quick Diagnostic Access Bar */}
        <Surface style={styles.quickBanner}>
          <View style={commonStyles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>⚡ Instant 15s Non-Invasive Screening</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Optical PPG + Eye Colorimetry + Spatial Anthropometry
              </Text>
            </View>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('PatientRegistration')}
              style={{ backgroundColor: colors.secondary }}
              labelStyle={{ fontSize: 12, fontWeight: '700' }}
            >
              + New Patient
            </Button>
          </View>
        </Surface>

        {/* CSV Export & Import Data Bar */}
        <Surface style={styles.dataBanner} elevation={1}>
          <Text style={typography.bodyBold}>Field Data Management</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            {patients.length} patient record{patients.length !== 1 ? 's' : ''} on device
          </Text>
          <View style={[commonStyles.rowBetween, { gap: spacing.sm }]}>
            <Button
              mode="outlined"
              icon="file-import-outline"
              onPress={handleImportCSV}
              style={[{ flex: 1, borderColor: colors.secondary }]}
              textColor={colors.secondary}
              compact
            >
              Import CSV
            </Button>
            <Button
              mode="outlined"
              icon="file-export-outline"
              loading={exporting}
              disabled={exporting || patients.length === 0}
              onPress={handleExportCSV}
              style={[{ flex: 1, borderColor: colors.primary }]}
              textColor={colors.primary}
              compact
            >
              Export CSV
            </Button>
          </View>
          <Button
            mode="text"
            icon="delete-outline"
            onPress={handleClearAllData}
            style={{ marginTop: spacing.sm, alignSelf: 'center' }}
            textColor={colors.critical}
            compact
          >
            Clear Local Database
          </Button>
        </Surface>

        {/* Recent Patients */}
        <View style={styles.listContainer}>
          <View style={commonStyles.rowBetween}>
            <Text style={commonStyles.sectionTitle}>Registered Patients ({patients.length})</Text>
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
              <Avatar.Icon size={64} icon="account-plus-outline" style={{ backgroundColor: colors.surfaceMuted }} color={colors.textSecondary}/>
              <Text style={styles.emptyStateTitle}>No Patients Registered</Text>
              <Text style={styles.emptyStateText}>Tap the button below to register a patient and begin screening.</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('PatientRegistration')} 
                style={{ marginTop: spacing.md, backgroundColor: colors.primary }}
              >
                Register First Patient
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        label="New Screening"
        style={styles.fab}
        onPress={() => navigation.navigate('PatientRegistration')}
        color={colors.textOnPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100, // space for FAB
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textOnPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.primaryContainer,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginTop: -spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickBanner: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    ...shadows.card,
  },
  dataBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  patientCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    ...typography.h3,
    marginTop: spacing.md,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
