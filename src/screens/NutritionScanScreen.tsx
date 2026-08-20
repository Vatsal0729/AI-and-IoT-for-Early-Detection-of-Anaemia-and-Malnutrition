import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button, Card, Text, Surface, Divider, IconButton, Avatar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Patient, AnemiaResult } from '../types';
import { colors, spacing, typography, commonStyles, shadows, radius, getSeverityColor } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NutritionScan'>;

export default function NutritionScanScreen({ route, navigation }: Props) {
  const { patient, anemiaResult } = route.params;

  const handleStart = () => {
    navigation.navigate('MUACCapture', { patient });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={[commonStyles.rowBetween, { marginBottom: spacing.xs }]}>
          <Text style={typography.captionBold}>STAGE 2 OF 2</Text>
          <IconButton 
            icon="home" 
            iconColor={colors.primary} 
            size={26} 
            onPress={() => navigation.navigate('Home')}
          />
        </View>

        {/* Hero Section */}
        <Surface style={styles.heroSection} elevation={1}>
          <Avatar.Icon size={56} icon="baby-face-outline" color={colors.secondary} style={{ backgroundColor: colors.surfaceVariant }} />
          <Text style={[typography.h2, { color: colors.secondary, marginTop: spacing.sm }]}>
            Pediatric Nutrition Screening
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            Screening for: {patient.name} ({patient.age} {patient.ageUnit} • {patient.weight} kg)
          </Text>
        </Surface>

        {/* Anemia Summary (if available) */}
        {anemiaResult && (
          <Card style={[commonStyles.card, { marginVertical: spacing.md, borderLeftWidth: 4, borderLeftColor: getSeverityColor(anemiaResult.severity) }]}>
            <Card.Content>
              <Text style={typography.captionBold}>
                COMPLETED ANEMIA DIAGNOSIS
              </Text>
              <View style={[commonStyles.rowBetween, { marginTop: spacing.xs }]}>
                <Text style={typography.body}>Hemoglobin (Hb)</Text>
                <Text style={[typography.h3, { color: getSeverityColor(anemiaResult.severity) }]}>
                  {anemiaResult.hbEstimate.value.toFixed(1)} g/dL
                </Text>
              </View>
              <View style={[commonStyles.rowBetween, { marginTop: 2 }]}>
                <Text style={typography.caption}>Classification</Text>
                <Text style={[typography.captionBold, { color: getSeverityColor(anemiaResult.severity), textTransform: 'uppercase' }]}>
                  {anemiaResult.severity} Anemia
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Scan Options */}
        <Text style={commonStyles.sectionTitle}>Anthropometric Modules</Text>
        
        <Card style={styles.optionCard} onPress={handleStart}>
          <Card.Content style={commonStyles.row}>
            <Avatar.Icon size={48} icon="ruler" color={colors.primary} style={{ backgroundColor: colors.primaryContainer, marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={typography.h4}>1. Spatial AR MUAC Scan</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Non-contact arm circumference with millimeter depth accuracy (±1.9 mm).
              </Text>
              <Text style={[typography.smallBold, { color: colors.primary, marginTop: 4 }]}>⏱ 10 seconds • Left Upper Arm</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.optionCard} onPress={() => navigation.navigate('FaceScan', { patient })}>
          <Card.Content style={commonStyles.row}>
            <Avatar.Icon size={48} icon="face-recognition" color={colors.secondary} style={{ backgroundColor: colors.surfaceVariant, marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={typography.h4}>2. Facial Emaciation Mesh</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                468-point 3D landmark mesh to evaluate buccal fat loss & temporal wasting.
              </Text>
              <Text style={[typography.smallBold, { color: colors.secondary, marginTop: 4 }]}>⏱ 5 seconds • Front Camera</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={{ marginTop: spacing.md }}>
          <Button 
            mode="contained" 
            onPress={handleStart}
            style={[commonStyles.buttonPrimary, { backgroundColor: colors.secondary }]}
            labelStyle={typography.bodyBold}
            icon="play-circle"
          >
            Start Nutrition Screening
          </Button>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: spacing.xs }}
          >
            Back to Dashboard
          </Button>
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
  heroSection: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadows.card,
  },
  optionCard: {
    ...commonStyles.card,
    marginBottom: spacing.sm,
  },
});
