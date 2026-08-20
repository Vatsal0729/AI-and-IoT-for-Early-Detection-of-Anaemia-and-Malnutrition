import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Button, Card, Text, Surface, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, spacing, typography, commonStyles, radius, getSeverityColor, getSeverityLabel, getMUACZoneColor, getMUACZoneLabel } from '../theme/theme';
import QRCode from 'react-native-qrcode-svg';
import { generateHealthPassportPDF, shareHealthPassport, printHealthPassport } from '../passport/pdfGenerator';
import { generatePassportHTML } from '../passport/passportTemplate';
import { encodePatientData } from '../passport/qrEncoder';
import { saveScanSession } from '../storage/patientStore';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthPassport'>;

export default function HealthPassportScreen({ route, navigation }: Props) {
  const { passport } = route.params;
  const { patient, anemiaResult, nutritionResult } = passport;

  const [loading, setLoading] = useState(false);

  const qrData = passport.qrPayload || encodePatientData(passport);

  const handlePrint = async () => {
    try {
      setLoading(true);
      const html = generatePassportHTML(passport);
      await printHealthPassport(html);
    } catch (error: any) {
      Alert.alert('Print Error', error?.message || 'Could not print health passport. Please try sharing as PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const uri = await generateHealthPassportPDF(passport);
      await shareHealthPassport(uri);
    } catch (error: any) {
      Alert.alert('Share Error', error?.message || 'Could not generate/share PDF on this device.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndReturn = async () => {
    try {
      setLoading(true);
      await saveScanSession({
        id: passport.id || ('SES-' + Date.now().toString(36).toUpperCase()),
        patientId: patient.id,
        patientName: patient.name,
        type: 'comprehensive',
        status: 'completed',
        anemiaResult,
        nutritionResult,
        timestamp: passport.generatedAt || new Date().toISOString(),
      });
      navigation.navigate('Home');
    } catch (error) {
      navigation.navigate('Home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Top Bar with Home Button */}
        <View style={[commonStyles.rowBetween, { marginBottom: spacing.xs }]}>
          <Text style={typography.captionBold}>OFFICIAL SCREENING RECORD</Text>
          <IconButton 
            icon="home" 
            iconColor={colors.primary} 
            size={26} 
            onPress={() => navigation.navigate('Home')}
          />
        </View>

        {/* Crisp Rectangular Health Card */}
        <View style={styles.rectangularHealthCard}>
          {/* Card Top Banner */}
          <View style={styles.cardHeaderBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>DIGITAL HEALTH PASSPORT</Text>
              <Text style={styles.cardHeaderSubtitle}>HemoNutri AI • Track HTAD-06</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardMetaText}>ID: {patient.id}</Text>
              <Text style={styles.cardMetaText}>{new Date(passport.generatedAt).toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Patient Details Grid */}
          <View style={styles.demographicsContainer}>
            <View style={styles.demographicsRow}>
              <View style={styles.demoCol}>
                <Text style={styles.miniLabel}>PATIENT NAME</Text>
                <Text style={styles.demoValue}>{patient.name}</Text>
              </View>
              <View style={styles.demoCol}>
                <Text style={styles.miniLabel}>AGE / GENDER</Text>
                <Text style={styles.demoValue}>{patient.age} {patient.ageUnit} • {patient.gender.toUpperCase()}</Text>
              </View>
            </View>

            <View style={[styles.demographicsRow, { marginTop: spacing.xs }]}>
              <View style={styles.demoCol}>
                <Text style={styles.miniLabel}>WEIGHT</Text>
                <Text style={styles.demoValue}>{patient.weight} kg</Text>
              </View>
              <View style={styles.demoCol}>
                <Text style={styles.miniLabel}>GUARDIAN / VILLAGE</Text>
                <Text style={styles.demoValue}>{patient.guardianName || patient.village || 'Field Unit'}</Text>
              </View>
            </View>
          </View>

          {/* Clinical Findings Section */}
          <View style={styles.findingsContainer}>
            <Text style={styles.sectionHeaderLabel}>CLINICAL DIAGNOSTIC METRICS</Text>
            
            {/* Anemia Row */}
            {anemiaResult ? (
              <View style={[styles.metricRow, { borderLeftColor: getSeverityColor(anemiaResult.severity) }]}>
                <View>
                  <Text style={typography.captionBold}>Hemoglobin (Hb)</Text>
                  <Text style={typography.caption}>Dual-Modality (PPG + Eye)</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.metricHighlight, { color: getSeverityColor(anemiaResult.severity) }]}>
                    {anemiaResult.hbEstimate.value.toFixed(1)} g/dL
                  </Text>
                  <Text style={[styles.severityBadgeText, { color: getSeverityColor(anemiaResult.severity) }]}>
                    {getSeverityLabel(anemiaResult.severity).toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Nutrition MUAC Row */}
            {nutritionResult?.muac ? (
              <View style={[styles.metricRow, { borderLeftColor: nutritionResult.muacZone ? getMUACZoneColor(nutritionResult.muacZone) : colors.primary }]}>
                <View>
                  <Text style={typography.captionBold}>Nutrition (MUAC)</Text>
                  <Text style={typography.caption}>Arm Circumference</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.metricHighlight, { color: nutritionResult.muacZone ? getMUACZoneColor(nutritionResult.muacZone) : colors.textPrimary }]}>
                    {nutritionResult.muac.circumferenceCm.toFixed(1)} cm
                  </Text>
                  <Text style={[styles.severityBadgeText, { color: nutritionResult.muacZone ? getMUACZoneColor(nutritionResult.muacZone) : colors.textSecondary }]}>
                    {getMUACZoneLabel(nutritionResult.muacZone || 'green').toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Facial Muscle & Fat Preservation */}
            {nutritionResult?.emaciation ? (
              <View style={[styles.metricRow, { borderLeftColor: colors.secondary }]}>
                <View>
                  <Text style={typography.captionBold}>Facial Preservation</Text>
                  <Text style={typography.caption}>3D Muscle & Fat Mesh</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.metricHighlight, { color: colors.secondary }]}>
                    {nutritionResult.emaciation.preservationScore.toFixed(0)}/100
                  </Text>
                  <Text style={[styles.severityBadgeText, { color: colors.secondary }]}>
                    {nutritionResult.emaciation.classification.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Action & Prescription Summary */}
            {anemiaResult?.dosage && anemiaResult.dosage.elementalIronMg > 0 ? (
              <View style={styles.prescriptionBox}>
                <Text style={styles.miniLabel}>IFA PRESCRIPTION PROTOCOL</Text>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {anemiaResult.dosage.elementalIronMg} mg Elemental Iron ({anemiaResult.dosage.syrupMlPerDose} mL)
                </Text>
                <Text style={typography.caption}>
                  {anemiaResult.dosage.frequency} for {anemiaResult.dosage.durationWeeks} weeks
                </Text>
              </View>
            ) : null}

            {/* Follow-up Banner */}
            <View style={styles.followUpBanner}>
              <Text style={[styles.miniLabel, { color: colors.primary }]}>NEXT CLINICAL FOLLOW-UP</Text>
              <Text style={[typography.bodyBold, { color: colors.primaryDark }]}>
                {new Date(passport.followUpDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* QR Code Section (Structured Rectangular Box) */}
          <View style={styles.qrSectionContainer}>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrData}
                size={105}
                color="black"
                backgroundColor="white"
              />
            </View>
            <View style={styles.qrDetailsWrapper}>
              <Text style={styles.miniLabel}>OFFLINE SYNC QR PAYLOAD</Text>
              <Text style={typography.caption}>Scan with any field tablet to sync patient records without internet connectivity.</Text>
              <Text style={[typography.small, { color: colors.textTertiary, marginTop: 4 }]}>HW: {passport.healthWorkerId} • PHC: {passport.facilityName}</Text>
            </View>
          </View>
        </View>

        {/* Actions (Print / Share / Save) */}
        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            <>
              <View style={commonStyles.rowBetween}>
                <Button 
                  mode="outlined" 
                  onPress={handlePrint} 
                  style={[styles.actionBtn, { marginRight: spacing.sm }]} 
                  icon="printer"
                  textColor={colors.primary}
                >
                  Print Card
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleShare} 
                  style={styles.actionBtn} 
                  icon="share-variant"
                  textColor={colors.primary}
                >
                  Share PDF
                </Button>
              </View>
              <Button 
                mode="contained" 
                onPress={handleSaveAndReturn} 
                style={[commonStyles.buttonPrimary, { marginTop: spacing.xs }]}
                icon="check-bold"
              >
                Save Record & Return Home
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  rectangularHealthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeaderBanner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  cardHeaderSubtitle: {
    fontSize: 10,
    color: colors.primaryContainer,
  },
  cardMetaText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  demographicsContainer: {
    padding: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  demographicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoCol: {
    flex: 1,
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  demoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  findingsContainer: {
    padding: spacing.sm,
  },
  sectionHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  metricHighlight: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  prescriptionBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    borderRadius: 2,
  },
  followUpBanner: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.xs,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 2,
  },
  qrSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  qrDetailsWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderColor: colors.primary,
    borderRadius: radius.xs,
  },
});
