import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography, getSeverityColor } from '../theme/theme';
import { AnemiaSeverity } from '../types';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  severity: AnemiaSeverity;
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 4,
  max = 18,
  severity,
  size = 240,
}) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + size * 0.25;

  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  const startAngle = Math.PI;
  const currentAngle = startAngle - percentage * Math.PI;

  const createArc = (startA: number, endA: number) => {
    const startX = cx + radius * Math.cos(startA);
    const startY = cy - radius * Math.sin(startA);
    const endX = cx + radius * Math.cos(endA);
    const endY = cy - radius * Math.sin(endA);
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  };

  const bgPath = createArc(Math.PI, 0);
  const fgPath = createArc(Math.PI, currentAngle);
  const valueColor = getSeverityColor(severity);

  const ticks = [7, 10, 11, 14];

  return (
    <View style={[styles.container, { width: size, height: cy + 20 }]}>
      <Svg width={size} height={cy + 20}>
        <Path d={bgPath} stroke={colors.gaugeBackground} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        <Path d={fgPath} stroke={valueColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        
        {ticks.map(tick => {
          if (tick <= min || tick >= max) return null;
          const tickPct = (tick - min) / (max - min);
          const tickAngle = Math.PI - tickPct * Math.PI;
          const innerRadius = radius - strokeWidth / 2;
          const outerRadius = radius + strokeWidth / 2;
          const x1 = cx + innerRadius * Math.cos(tickAngle);
          const y1 = cy - innerRadius * Math.sin(tickAngle);
          const x2 = cx + outerRadius * Math.cos(tickAngle);
          const y2 = cy - outerRadius * Math.sin(tickAngle);
          return (
            <Path key={tick} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={colors.surface} strokeWidth={3} />
          );
        })}

        <SvgText x={strokeWidth/2} y={cy + 15} fill={colors.textSecondary} fontSize={12} textAnchor="middle">{min}</SvgText>
        <SvgText x={size - strokeWidth/2} y={cy + 15} fill={colors.textSecondary} fontSize={12} textAnchor="middle">{max}</SvgText>
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.valueContainer, { top: strokeWidth, height: cy - strokeWidth }]}>
        <Text style={[styles.valueText, { color: valueColor }]}>{value.toFixed(1)}</Text>
        <Text style={styles.unitText}>g/dL</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  valueText: {
    ...typography.metric,
  },
  unitText: {
    ...typography.metricUnit,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
});
