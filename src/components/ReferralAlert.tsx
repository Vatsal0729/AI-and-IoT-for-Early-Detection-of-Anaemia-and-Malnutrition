import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';

interface ReferralAlertProps {
  urgency: 'routine' | 'urgent' | 'emergency';
  reasons: string[];
  facility?: string;
}

export const ReferralAlert: React.FC<ReferralAlertProps> = ({ urgency, reasons, facility }) => {
  const config = {
    emergency: { bg: colors.critical, text: colors.textOnPrimary, icon: '⚠️', title: 'EMERGENCY REFERRAL REQUIRED' },
    urgent: { bg: colors.warning, text: colors.textPrimary, icon: '!', title: 'URGENT: Referral Recommended' },
    routine: { bg: colors.muacYellow, text: colors.textPrimary, icon: 'i', title: 'Follow-Up Referral Advised' },
  };

  const { bg, text, icon, title } = config[urgency];

  return (
    <Surface style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.icon, { color: text }]}>{icon}</Text>
        <Text style={[styles.title, { color: text }]}>{title}</Text>
      </View>
      
      <View style={styles.reasonsList}>
        {reasons.map((r, i) => (
          <Text key={i} style={[styles.reason, { color: text }]}>• {r}</Text>
        ))}
      </View>

      {facility && (
        <View style={styles.facilityContainer}>
          <Text style={[styles.facilityLabel, { color: text }]}>Recommended Facility:</Text>
          <Text style={[styles.facilityText, { color: text }]}>{facility}</Text>
        </View>
      )}

      {urgency === 'emergency' && (
        <Text style={[styles.transportText, { color: text }]}>
          Arrange immediate transport. Provide supportive care en route.
        </Text>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    flex: 1,
  },
  reasonsList: {
    marginBottom: spacing.md,
  },
  reason: {
    ...typography.body,
    marginBottom: 4,
  },
  facilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  facilityLabel: {
    ...typography.bodyBold,
    marginRight: spacing.sm,
  },
  facilityText: {
    ...typography.body,
  },
  transportText: {
    ...typography.bodyBold,
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: spacing.sm,
    borderRadius: radius.sm,
  }
});
