// ============================================================================
// HemoNutri AI — Medical-Grade Theme System (White + Blue Accent)
// ============================================================================

import { MD3LightTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

// ---- Color Palette ----

export const colors = {
  // Primary blue palette
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  primaryContainer: '#EFF6FF',

  // Secondary sky blue palette
  secondary: '#0EA5E9',
  secondaryLight: '#38BDF8',
  secondaryDark: '#0284C7',

  // Anemia 4-Tier Severity Colors
  anemiaNormal: '#16A34A',      // No Anemia (Green)
  anemiaBorderline: '#F59E0B',  // Borderline Anemia (Yellow)
  anemiaModerate: '#EA580C',    // Anemia (Orange)
  anemiaSevere: '#DC2626',      // Severe Anemia (Red)

  // MUAC 4-Tier Zone Colors
  muacGreen: '#16A34A',         // >= 13.5 cm (Normal)
  muacYellow: '#F59E0B',        // 12.5 - 13.4 cm (At Risk)
  muacOrange: '#EA580C',        // 11.5 - 12.4 cm (Moderate Malnutrition)
  muacRed: '#DC2626',           // < 11.5 cm (Severe Acute Malnutrition)

  // Status colors
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EA580C',
  critical: '#DC2626',
  info: '#2563EB',

  // PPG waveform colors
  ppgRed: '#DC2626',
  ppgGreen: '#16A34A',
  ppgBlue: '#2563EB',
  ppgGrid: '#F1F5F9',

  // Backgrounds & Surfaces (Pure White Design Language)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  surfaceMuted: '#F1F5F9',

  // Typography Colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Gauge & Meter elements
  gaugeBackground: '#F1F5F9',
  gaugeTrack: '#E2E8F0',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
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

// ---- Shadow Presets (Soft & Subtle) ----

export const shadows = {
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  modal: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ---- Common Styles ----

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenPadded: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.card,
  },
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: colors.textOnPrimary,
    ...typography.bodyBold,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
      return 'Optimal';
    case 'borderline_anemia':
    case 'mild':
      return 'Borderline';
    case 'anemia':
    case 'moderate':
      return 'Moderate Deficiency';
    case 'severe_anemia':
    case 'severe':
      return 'Critical Deficiency';
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
