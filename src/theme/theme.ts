// ============================================================================
// HemoNutri AI — Medical-Grade Theme System
// ============================================================================

import { MD3LightTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

// ---- Color Palette ----

export const colors = {
  // Primary palette
  primary: '#1565C0',
  primaryLight: '#42A5F5',
  primaryDark: '#0D47A1',
  primaryContainer: '#E3F2FD',

  // Secondary palette
  secondary: '#00897B',
  secondaryLight: '#4DB6AC',
  secondaryDark: '#00695C',

  // Anemia 4-Tier Severity Colors
  anemiaNormal: '#2E7D32',      // No Anemia (Green)
  anemiaBorderline: '#F9A825',  // Borderline Anemia (Yellow)
  anemiaModerate: '#E65100',    // Anemia (Orange)
  anemiaSevere: '#C62828',      // Severe Anemia (Red)

  // MUAC 4-Tier Zone Colors
  muacGreen: '#4CAF50',         // >= 13.5 cm (Normal)
  muacYellow: '#FDD835',        // 12.5 - 13.4 cm (At Risk)
  muacOrange: '#FF9800',        // 11.5 - 12.4 cm (Moderate Malnutrition)
  muacRed: '#F44336',           // < 11.5 cm (Severe Acute Malnutrition)

  // Status colors
  success: '#2E7D32',
  warning: '#F9A825',
  danger: '#E65100',
  critical: '#C62828',
  info: '#1565C0',

  // PPG waveform colors
  ppgRed: '#E53935',
  ppgGreen: '#43A047',
  ppgBlue: '#1E88E5',
  ppgGrid: '#E2E8F0',

  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  surfaceMuted: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // Borders & Dividers
  border: '#CBD5E1',
  divider: '#E2E8F0',

  // Gauge
  gaugeBackground: '#E2E8F0',
  gaugeTrack: '#CBD5E1',
};

// ---- Spacing Scale ----

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ---- Border Radius ----

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 999,
};

// ---- Typography ----

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  small: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  smallBold: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14 },
  metric: { fontSize: 44, fontWeight: '700' as const, lineHeight: 52, letterSpacing: -0.5 },
  metricMd: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38, letterSpacing: -0.3 },
  metricUnit: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 11, fontWeight: '700' as const, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};

// ---- Paper Theme Override ----

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textOnPrimary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.critical,
    outline: colors.border,
  },
  roundness: radius.md,
};

// ---- Shadow Presets ----

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ---- Common Styles ----

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.elevated,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: colors.textOnPrimary,
    ...typography.bodyBold,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    color: colors.primary,
    ...typography.bodyBold,
  },
});

// ---- Severity Color & Label Helpers ----

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'no_anemia':
    case 'normal':
      return colors.anemiaNormal;
    case 'borderline_anemia':
    case 'mild':
      return colors.anemiaBorderline;
    case 'anemia':
    case 'moderate':
      return colors.anemiaModerate;
    case 'severe_anemia':
    case 'severe':
      return colors.anemiaSevere;
    default:
      return colors.textSecondary;
  }
}

export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'no_anemia':
    case 'normal':
      return 'No Anemia';
    case 'borderline_anemia':
    case 'mild':
      return 'Borderline Anemia';
    case 'anemia':
    case 'moderate':
      return 'Anemia';
    case 'severe_anemia':
    case 'severe':
      return 'Severe Anemia';
    default:
      return 'Not Evaluated';
  }
}

export function getMUACZoneColor(zone: string): string {
  switch (zone) {
    case 'green': return colors.muacGreen;
    case 'yellow': return colors.muacYellow;
    case 'orange': return colors.muacOrange;
    case 'red': return colors.muacRed;
    default: return colors.textSecondary;
  }
}

export function getMUACZoneLabel(zone: string): string {
  switch (zone) {
    case 'green': return 'Normal (Well-Nourished)';
    case 'yellow': return 'At Risk of Malnutrition';
    case 'orange': return 'Moderate Malnutrition (MAM)';
    case 'red': return 'Severe Malnutrition (SAM)';
    default: return 'Unknown Zone';
  }
}
