import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button, Card, Text, Surface, Divider, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, HealthPassport, ScanSession } from '../types';
import { colors, spacing, typography, commonStyles, radius, getMUACZoneColor, getMUACZoneLabel } from '../theme/theme';
import { MUACBand } from '../components/MUACBand';
import { ReferralAlert } from '../components/ReferralAlert';
import { saveScanSession } from '../storage/patientStore';
import { encodePatientData } from '../passport/qrEncoder';
import { getDietaryAdvice } from '../clinical/mealPlanner';

type Props = NativeStackScreenProps<RootStackParamList, 'NutritionResult'>;

export default function NutritionResultScreen({ route, navigation }: Props) {
  const { patient, result } = route.params;
  const { muac, muacZone, emaciation, mealPlan } = result;

  const ageMonths = patient.ageUnit === 'months' ? patient.age : patient.age * 12;
  const severity = emaciation?.classification === 'severe_wasting' ? 'severe_anemia' :
    emaciation?.classification === 'moderate_wasting' ? 'anemia' : 'borderline_anemia';
  const dietaryAdvice = getDietaryAdvice(severity, ageMonths);

  useEffect(() => {
    const session: ScanSession = {
      id: 'SES-' + Date.now().toString(36).toUpperCase(),
      patientId: patient.id,
      patientName: patient.name,
      type: 'nutrition',
      status: 'completed',
      nutritionResult: result,
      timestamp: new Date().toISOString(),
    };
    saveScanSession(session);
  }, []);

  const handleGeneratePassport = () => {
    const isCritical = muacZone === 'red' || emaciation?.classification === 'severe_wasting';
    const followUpDays = isCritical ? 7 : 30;
    const passport: HealthPassport = {
      id: 'HP-' + Date.now().toString(36).toUpperCase(),
      patient,
      nutritionResult: result,
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

  const IndicatorBar = ({ label, valuePercent, color }: { label: string; valuePercent: number; color?: string }) => {
    const barColor = color ?? (valuePercent >= 70 ? colors.success : valuePercent >= 45 ? colors.warning : colors.critical);
    return (
      <View style={styles.indicatorRow}>
        <Text style={[typography.caption, { width: 145, color: colors.textSecondary }]}>{label}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.min(100, Math.max(4, valuePercent))}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={[typography.captionBold, { width: 36, textAlign: 'right', color: barColor }]}>{valuePercent.toFixed(0)}%</Text>
      </View>
    );
  };

  const zoneColor = getMUACZoneColor(muacZone ?? 'green');

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Top bar */}
        <View style={[commonStyles.rowBetween, { marginBottom: spacing.sm }]}>
          <View>
            <Text style={typography.captionBold}>NUTRITION TRIAGE REPORT</Text>
            <Text style={typography.bodyBold}>{patient.name} · {patient.age} {patient.ageUnit}</Text>
          </View>
          <IconButton icon="home" iconColor={colors.primary} size={24} onPress={() => navigation.navigate('Home')} />
        </View>

        {/* Referral Alert */}
        {result.referralNeeded && (
          <View style={{ marginBottom: spacing.sm }}>
            <ReferralAlert
              urgency={result.referralUrgency || 'urgent'}
              reasons={[
                muac ? `MUAC ${muac.circumferenceCm.toFixed(1)} cm — Below Safe Threshold` : 'Anthropometric deficit detected',
                'Nutritional rehabilitation required',
              ]}
              facility="Nutrition Rehabilitation Centre (NRC)"
            />
          </View>
        )}

        {/* MUAC Result */}
        {muac && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={typography.captionBold}>MID-UPPER ARM CIRCUMFERENCE</Text>
              <View style={[commonStyles.rowBetween, { marginVertical: spacing.sm }]}>
                <Text style={[typography.metric, { color: zoneColor }]}>
                  {muac.circumferenceCm.toFixed(1)} <Text style={typography.metricUnit}>cm</Text>
                </Text>
                <Surface style={[styles.badge, { backgroundColor: zoneColor + '18', borderColor: zoneColor }]} elevation={0}>
                  <Text style={[typography.captionBold, { color: zoneColor }]}>
                    {getMUACZoneLabel(muacZone ?? 'green').toUpperCase()}
                  </Text>
                </Surface>
              </View>
              <MUACBand value={muac.circumferenceCm} zone={muacZone ?? 'green'} />
            </Card.Content>
          </Card>
        )}

        {/* Facial Emaciation Breakdown */}
        {emaciation && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={commonStyles.rowBetween}>
                <View>
                  <Text style={typography.captionBold}>FACIAL EMACIATION SCORE</Text>
                  <Text style={[typography.h4, {
                    color: emaciation.classification === 'severe_wasting' ? colors.critical :
                      emaciation.classification === 'moderate_wasting' ? colors.warning : colors.success,
                    textTransform: 'capitalize',
                  }]}>
                    {emaciation.classification.replace(/_/g, ' ')}
                  </Text>
                </View>
                <Text style={[typography.h2, {
                  color: emaciation.preservationScore >= 70 ? colors.success :
                    emaciation.preservationScore >= 45 ? colors.warning : colors.critical,
                }]}>
                  {emaciation.preservationScore.toFixed(0)}
                  <Text style={typography.small}>/100</Text>
                </Text>
              </View>
              <Divider style={{ marginVertical: spacing.sm }} />
              <IndicatorBar label="Cheek Fat Reserve" valuePercent={emaciation.facialIndicators.cheekFullness * 100} />
              <IndicatorBar label="Temporal Muscle" valuePercent={(1 - emaciation.facialIndicators.temporalWasting) * 100} />
              <IndicatorBar label="Orbital Fat Volume" valuePercent={(1 - emaciation.facialIndicators.periorbitalHollowing) * 100} />
              <IndicatorBar label="Jawline Softness" valuePercent={(1 - emaciation.facialIndicators.jawProminence) * 100} />
            </Card.Content>
          </Card>
        )}

        {/* Evidence-Based Dietary Recommendations */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={typography.captionBold}>CLINICAL DIETARY RECOMMENDATIONS</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm, marginTop: 2 }]}>
              Based on WHO/ICMR/NIN guidelines for iron-deficiency malnutrition
            </Text>
            {dietaryAdvice.map((advice, idx) => (
              <Surface key={idx} style={styles.adviceItem} elevation={0}>
                <Text style={[typography.body, { lineHeight: 20 }]}>{advice}</Text>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Meal Plan */}
        {mealPlan && mealPlan.meals.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={commonStyles.rowBetween}>
                <Text style={typography.h4}>Iron-Rich Meal Plan</Text>
                <Text style={[typography.captionBold, { color: colors.secondary }]}>₹{mealPlan.totalCostINR}/day</Text>
              </View>
              <View style={[commonStyles.rowBetween, { backgroundColor: colors.surfaceVariant, padding: spacing.sm, borderRadius: radius.sm, marginVertical: spacing.xs }]}>
                <View>
                  <Text style={typography.small}>Target Calories</Text>
                  <Text style={typography.bodyBold}>{mealPlan.targetCalories} kcal</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={typography.small}>Key Nutrients</Text>
                  <Text style={typography.bodyBold}>Iron · Vit C · Folate</Text>
                </View>
              </View>
              <Divider style={{ marginBottom: spacing.sm }} />
              {mealPlan.meals.map((meal, idx) => (
                <Surface key={idx} style={styles.mealItem} elevation={0}>
                  <View style={commonStyles.rowBetween}>
                    <Text style={typography.bodyBold}>{meal.name}</Text>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>₹{meal.costINR}</Text>
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {meal.ingredients.map(i => i.name).join(' · ')}
                  </Text>
                  <Text style={[typography.caption, { color: colors.secondary, marginTop: 4 }]}>
                    Iron: {meal.ironContentMg} mg · {meal.prepTimeMin} min prep
                  </Text>
                  <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4, lineHeight: 16 }]}>
                    {meal.instructions}
                  </Text>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <Button
          mode="contained"
          onPress={handleGeneratePassport}
          style={[commonStyles.buttonPrimary, { marginTop: spacing.sm, marginBottom: spacing.xs }]}
          icon="card-account-details-outline"
          labelStyle={typography.bodyBold}
        >
          Generate Health Passport
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home')}
          style={commonStyles.buttonSecondary}
          icon="home"
        >
          Return to Dashboard
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: 60 },
  card: { ...commonStyles.card, marginBottom: spacing.sm },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceMuted, borderRadius: 4, overflow: 'hidden', marginHorizontal: spacing.xs },
  barFill: { height: '100%', borderRadius: 4 },
  adviceItem: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  mealItem: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
});
