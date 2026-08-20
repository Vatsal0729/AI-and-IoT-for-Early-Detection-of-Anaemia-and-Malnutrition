import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon } from 'react-native-svg';
import { colors, spacing, typography } from '../theme/theme';
import { MUACZone } from '../types';
import { getMUACBandThresholds } from '../modules/nutrition/muacCalculation';

interface MUACBandProps {
  value: number;
  zone: MUACZone;
  ageMonths?: number;
  gender?: 'male' | 'female' | 'other';
  showMarker?: boolean;
}

export const MUACBand: React.FC<MUACBandProps> = ({
  value,
  zone,
  ageMonths = 240, // Default adult
  gender = 'other',
  showMarker = true,
}) => {
  const height = 36;
  const config = getMUACBandThresholds(ageMonths, gender);

  const scaleMin = config.scaleMin;
  const scaleMax = config.scaleMax;
  const totalRange = scaleMax - scaleMin;

  const getPct = (val: number) => Math.max(0, Math.min(100, ((val - scaleMin) / totalRange) * 100));
  const markerPosition = getPct(value);

  return (
    <View style={styles.container}>
      {showMarker && (
        <View style={styles.markerContainer}>
          <View style={[styles.markerPositioner, { left: `${markerPosition}%` }]}>
            <Text style={styles.markerValue}>{value.toFixed(1)} cm</Text>
            <Svg width="12" height="10" viewBox="0 0 12 10">
              <Polygon points="0,0 12,0 6,10" fill={colors.primary} />
            </Svg>
          </View>
        </View>
      )}

      <View style={[styles.bandContainer, { height }]}>
        {config.sections.map((sec, idx) => (
          <View
            key={idx}
            style={[
              styles.section,
              {
                width: `${getPct(sec.end) - getPct(sec.start)}%`,
                backgroundColor: sec.color,
                borderTopLeftRadius: idx === 0 ? 6 : 0,
                borderBottomLeftRadius: idx === 0 ? 6 : 0,
                borderTopRightRadius: idx === config.sections.length - 1 ? 6 : 0,
                borderBottomRightRadius: idx === config.sections.length - 1 ? 6 : 0,
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.labelsContainer}>
        {config.sections.map((sec, idx) => (
          <View key={idx} style={[styles.labelWrapper, { width: `${getPct(sec.end) - getPct(sec.start)}%` }]}>
            <Text style={styles.labelText}>{sec.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  markerContainer: {
    height: 28,
    width: '100%',
    position: 'relative',
  },
  markerPositioner: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -24 }],
    width: 48,
  },
  markerValue: {
    ...typography.smallBold,
    color: colors.primary,
    marginBottom: 2,
  },
  bandContainer: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 6,
  },
  section: {
    height: '100%',
  },
  labelsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 4,
  },
  labelWrapper: {
    alignItems: 'center',
  },
  labelText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
