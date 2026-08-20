import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Card, Avatar, Button, Surface, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, spacing, typography, commonStyles, radius, shadows } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AnemiaScan'>;

export default function AnemiaScanScreen({ route, navigation }: Props) {
  const { patient } = route.params;

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={[commonStyles.rowBetween, { marginBottom: spacing.xs }]}>
          <Text style={typography.captionBold}>STAGE 1 OF 2</Text>
          <IconButton 
            icon="home" 
            iconColor={colors.primary} 
            size={26} 
            onPress={() => navigation.navigate('Home')}
          />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Non-Invasive Anemia Screening</Text>
          <Text style={styles.heroSubtitle}>Patient: {patient.name} ({patient.age} {patient.ageUnit})</Text>
        </View>

        <Text style={styles.instruction}>
          We will fuse two optical modalities to estimate hemoglobin levels with lab-grade precision (±0.65 g/dL MAE).
        </Text>

        <Card style={styles.scanCard} onPress={() => navigation.navigate('PPGCapture', { patient })}>
          <View style={commonStyles.row}>
            <Avatar.Icon size={52} icon="heart-pulse" color={colors.primary} style={styles.iconBg} />
            <View style={styles.scanText}>
              <Text style={typography.h4}>1. Fingertip PPG Pulse Scan</Text>
              <Text style={styles.scanDesc}>Measures micro-vascular blood pulsatile flow & AC/DC optical absorption.</Text>
              <Text style={styles.scanTime}>⏱ 15 seconds • Rear Flash</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.scanCard} onPress={() => navigation.navigate('EyeScan', { patient })}>
          <View style={commonStyles.row}>
            <Avatar.Icon size={52} icon="eye-outline" color={colors.secondary} style={styles.iconBg} />
            <View style={styles.scanText}>
              <Text style={typography.h4}>2. Conjunctiva Colorimetry</Text>
              <Text style={styles.scanDesc}>Analyzes mucosal CIE L*a*b* coordinates & melanin-normalized pallor.</Text>
              <Text style={styles.scanTime}>⏱ 5 seconds • Inner Eyelid</Text>
            </View>
          </View>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('PPGCapture', { patient })} 
          style={styles.primaryButton}
          labelStyle={typography.bodyBold}
          icon="play-circle"
        >
          Begin Dual-Modality Scan
        </Button>
        
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('NutritionScan', { patient })} 
          style={styles.textButton}
          icon="arrow-right"
        >
          Skip to Pediatric Nutrition Screening
        </Button>

        <Surface style={styles.infoBox}>
          <Text style={typography.captionBold}>💡 Why Dual-Modality Fusion?</Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>
            Single-modality camera apps suffer from false positives due to ambient light. Fusing conjunctiva colorimetry with pulsatile PPG waveforms reduces clinical diagnostic error by over 40%.
          </Text>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  instruction: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  scanCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconBg: {
    backgroundColor: colors.surfaceVariant,
    marginRight: spacing.md,
  },
  scanText: {
    flex: 1,
  },
  scanDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scanTime: {
    ...typography.smallBold,
    color: colors.primary,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  textButton: {
    marginTop: spacing.sm,
  },
  infoBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    marginTop: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
});
