import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Card, Button, Avatar, Surface, IconButton, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ScanSession, HealthPassport } from '../types';
import { colors, spacing, typography, commonStyles, radius, getSeverityColor, getSeverityLabel, shadows } from '../theme/theme';
import { GaugeChart } from '../components/GaugeChart';
import { ReferralAlert } from '../components/ReferralAlert';
import { saveScanSession } from '../storage/patientStore';
import { encodePatientData } from '../passport/qrEncoder';
import { getDietaryAdvice } from '../clinical/mealPlanner';

type Props = NativeStackScreenProps<RootStackParamList, 'AnemiaResult'>;

export default function AnemiaResultScreen({ route, navigation }: Props) {
  const { patient, result } = route.params;
  const hbValue = result.hbEstimate.value.toFixed(1);
  const severityColor = getSeverityColor(result.severity);
  const severityLabel = getSeverityLabel(result.severity);

  const ageMonths = patient.ageUnit === 'months' ? patient.age : patient.age * 12;
  const dietaryAdvice = getDietaryAdvice(result.severity, ageMonths);

  useEffect(() => {
    const session: ScanSession = {
      id: 'SES-' + Date.now().toString(36).toUpperCase(),
      patientId: patient.id,
      patientName: patient.name,
      type: 'anemia',
      status: 'completed',
      anemiaResult: result,
      timestamp: new Date().toISOString(),
    };
    saveScanSession(session);
  }, []);

  const handleGeneratePassport = () => {
    let followUpDays = 30;
    if (result.severity === 'severe_anemia') followUpDays = 7;
    else if (result.severity === 'anemia') followUpDays = 14;

    const passport: HealthPassport = {
      id: 'HP-' + Date.now().toString(36).toUpperCase(),
      patient,
      anemiaResult: result,
      healthWorkerName: 'ASHA Field Officer',
      healthWorkerId: 'HW-IND-409',
      facilityName: 'Primary Health Centre',
      generatedAt: new Date().toISOString(),
      followUpDate: new Date(Date.now() + followUpDays * 86400000).toISOString(),
      qrPayload: '',
    };
    passport.qrPayload = encodePatientData(passport);
    navigation.navigate('HealthPassport', { passport });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Top bar */}
        <View style={[commonStyles.rowBetween, { marginBottom: spacing.sm }]}>
          <View>
            <Text style={typography.captionBold}>ANEMIA DIAGNOSTIC REPORT</Text>
            <Text style={typography.bodyBold}>{patient.name} · {patient.age} {patient.ageUnit}</Text>
          </View>
          <IconButton icon="home" iconColor={colors.primary} size={24} onPress={() => navigation.navigate('Home')} />
        </View>

        {/* Main Result Card */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>HEMOGLOBIN CONCENTRATION</Text>
          <Text style={[styles.hbValue, { color: severityColor }]}>
            {hbValue} <Text style={styles.unit}>g/dL</Text>
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: severityColor + '18' }]}>
            <Text style={[styles.severityText, { color: severityColor }]}>
              {severityLabel.toUpperCase()}
            </Text>
          </View>
          <GaugeChart value={result.hbEstimate.value} min={4} max={18} severity={result.severity} size={220} />
        </View>

        {/* Referral Alert */}
        {result.referralNeeded && (
          <View style={{ marginBottom: spacing.sm }}>
            <ReferralAlert
              urgency={result.referralUrgency || 'urgent'}
              reasons={[
                `Critical Hb: ${hbValue} g/dL — Below WHO Emergency Threshold`,
                'Immediate clinical iron therapy or transfusion assessment required',
              ]}
              facility="Sub-District / District Hospital"
            />
          </View>
        )}

        {/* Cardiovascular Vitals */}
        {result.ppgFeatures && (
          <Card style={styles.card}>
            <Text style={typography.captionBold}>CARDIOVASCULAR VITALS</Text>
            <View style={[commonStyles.rowBetween, { marginTop: spacing.sm }]}>
              <View style={styles.vitalBox}>
                <Text style={typography.small}>PULSE RATE</Text>
                <Text style={[typography.h3, { color: colors.primary }]}>
                  {result.ppgFeatures.heartRate.toFixed(0)}<Text style={typography.small}> BPM</Text>
                </Text>
              </View>
              <View style={styles.vitalBox}>
                <Text style={typography.small}>PERFUSION INDEX</Text>
                <Text style={[typography.h3, { color: colors.secondary }]}>
                  {result.ppgFeatures.perfusionIndex}%
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* IFA Prescription */}
        {result.dosage && result.dosage.elementalIronMg > 0 ? (
          <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
            <View style={commonStyles.row}>
              <Avatar.Icon size={40} icon="pill" style={{ backgroundColor: colors.primaryContainer }} color={colors.primary} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={typography.captionBold}>IFA SUPPLEMENTATION PRESCRIPTION</Text>
                <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 2 }]}>
                  {result.dosage.elementalIronMg} mg Elemental Iron · {result.dosage.syrupMlPerDose} mL
                </Text>
                <Text style={typography.caption}>
                  {result.dosage.frequency} for {result.dosage.durationWeeks} weeks
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.success }]}>
            <View style={commonStyles.row}>
              <Avatar.Icon size={40} icon="check-circle-outline" style={{ backgroundColor: colors.surfaceVariant }} color={colors.success} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={typography.captionBold}>HEMOGLOBIN NORMAL</Text>
                <Text style={typography.caption}>No pharmaceutical supplementation required. Maintain balanced diet.</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Evidence-based Dietary Recommendations */}
        <Card style={styles.card}>
          <Text style={typography.captionBold}>CLINICAL DIETARY RECOMMENDATIONS</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm }]}>
            Per WHO/ICMR/NIN guidelines for iron-deficiency anaemia
          </Text>
          {dietaryAdvice.map((advice, idx) => (
            <Surface key={idx} style={styles.adviceItem} elevation={0}>
              <Text style={[typography.body, { lineHeight: 20 }]}>{advice}</Text>
            </Surface>
          ))}
        </Card>

        {/* Actions */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('NutritionScan', { patient, anemiaResult: result })}
          style={[styles.primaryBtn, { marginBottom: spacing.xs }]}
          labelStyle={typography.bodyBold}
          icon="ruler"
        >
          Continue to Nutrition & MUAC Scan
        </Button>
        <Button
          mode="outlined"
          onPress={handleGeneratePassport}
          style={styles.secondaryBtn}
          textColor={colors.primary}
          icon="card-account-details-outline"
        >
          Generate Health Passport
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: spacing.md, paddingBottom: 60 },
  headerCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadows.card,
    marginBottom: spacing.sm,
  },
  title: { ...typography.captionBold, color: colors.textSecondary, textAlign: 'center' },
  hbValue: { ...typography.metric, marginVertical: spacing.xs },
  unit: { ...typography.metricUnit, color: colors.textSecondary },
  severityBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.xs, marginBottom: spacing.xs },
  severityText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, ...shadows.card },
  vitalBox: { flex: 1, backgroundColor: colors.surfaceMuted, padding: spacing.sm, borderRadius: radius.xs, marginHorizontal: 3, alignItems: 'center' },
  adviceItem: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 4 },
  secondaryBtn: { borderColor: colors.primary, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 4 },
});
