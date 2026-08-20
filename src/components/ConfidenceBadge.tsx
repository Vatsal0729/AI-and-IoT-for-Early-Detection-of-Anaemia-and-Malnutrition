import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../theme/theme';

interface ConfidenceBadgeProps {
  confidence: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  label = 'Confidence',
  size = 'medium'
}) => {
  const dimensions = {
    small: { radius: 24, strokeWidth: 4, font: typography.smallBold },
    medium: { radius: 36, strokeWidth: 6, font: typography.bodyBold },
    large: { radius: 48, strokeWidth: 8, font: typography.h3 },
  };

  const { radius, strokeWidth, font } = dimensions[size];
  const sizePx = radius * 2;
  const cx = radius;
  const cy = radius;
  const r = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * r;
  
  const clampedConfidence = Math.max(0, Math.min(1, confidence));
  const strokeDashoffset = circumference - clampedConfidence * circumference;

  let color = colors.success;
  if (clampedConfidence < 0.7) color = colors.critical;
  else if (clampedConfidence < 0.85) color = colors.warning;

  return (
    <View style={styles.container}>
      <View style={{ width: sizePx, height: sizePx, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={sizePx} height={sizePx} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, styles.textContainer]}>
          <Text style={[font, { color }]} numberOfLines={1}>{(clampedConfidence * 100).toFixed(0)}%</Text>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  }
});
