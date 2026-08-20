import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polygon } from 'react-native-svg';
import { colors, spacing, typography } from '../theme/theme';
import { MUACZone } from '../types';

interface MUACBandProps {
  value: number;
  zone: MUACZone;
  showMarker?: boolean;
}

export const MUACBand: React.FC<MUACBandProps> = ({ value, zone, showMarker = true }) => {
  const height = 40;
  
  const scaleMin = 0;
  const scaleMax = 20;
  const totalRange = scaleMax - scaleMin;
  
  const getPct = (val: number) => Math.max(0, Math.min(100, ((val - scaleMin) / totalRange) * 100));

  const sections = [
    { start: 0, end: 11.5, color: colors.muacRed, label: 'Red' },
    { start: 11.5, end: 12.5, color: colors.muacOrange, label: 'Orange' },
    { start: 12.5, end: 13.5, color: colors.muacYellow, label: 'Yellow' },
    { start: 13.5, end: 20, color: colors.muacGreen, label: 'Green' },
  ];

  const markerPosition = getPct(value);

  return (
    <View style={styles.container}>
      {showMarker && (
        <View style={styles.markerContainer}>
          <View style={[styles.markerPositioner, { left: `${markerPosition}%` }]}>
            <Text style={styles.markerValue}>{value.toFixed(1)} cm</Text>
            <Svg width="12" height="10" viewBox="0 0 12 10">
              <Polygon points="0,0 12,0 6,10" fill={colors.textPrimary} />
            </Svg>
          </View>
        </View>
      )}

      <View style={[styles.bandContainer, { height }]}>
        {sections.map((sec, idx) => (
          <View
            key={idx}
            style={[
              styles.section,
              {
                width: `${getPct(sec.end) - getPct(sec.start)}%`,
                backgroundColor: sec.color,
                borderTopLeftRadius: idx === 0 ? 8 : 0,
                borderBottomLeftRadius: idx === 0 ? 8 : 0,
                borderTopRightRadius: idx === sections.length - 1 ? 8 : 0,
                borderBottomRightRadius: idx === sections.length - 1 ? 8 : 0,
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.labelsContainer}>
        {sections.map((sec, idx) => (
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
    paddingVertical: spacing.md,
  },
  markerContainer: {
    height: 30,
    width: '100%',
    position: 'relative',
  },
  markerPositioner: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }],
    width: 40,
  },
  markerValue: {
    ...typography.smallBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  bandContainer: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  section: {
    height: '100%',
  },
  labelsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.sm,
  },
  labelWrapper: {
    alignItems: 'center',
  },
  labelText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  }
});
