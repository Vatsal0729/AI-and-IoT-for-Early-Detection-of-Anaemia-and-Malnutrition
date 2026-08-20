import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Line, G } from 'react-native-svg';
import { colors, spacing, typography, radius } from '../theme/theme';

interface PPGWaveformProps {
  data?: number[];
  color?: string;
  height?: number;
  width?: number;
  animated?: boolean;
  heartRate?: number;
}

export const PPGWaveform: React.FC<PPGWaveformProps> = ({
  data,
  color = colors.ppgGreen,
  height = 150,
  width = 300,
  animated = false,
  heartRate,
}) => {
  const [points, setPoints] = useState<number[]>(data || []);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (data && data.length > 0) {
      setPoints(data);
      return;
    }

    if (animated) {
      const pointCount = 100;
      let time = 0;
      
      const updateWave = () => {
        const newPoints = [];
        time += 0.1;
        for (let i = 0; i < pointCount; i++) {
          const x = i * 0.1;
          const y = Math.sin(x - time) * 30 + Math.sin((x - time) * 3) * 10;
          newPoints.push(y);
        }
        setPoints(newPoints);
        animationRef.current = requestAnimationFrame(updateWave);
      };
      
      animationRef.current = requestAnimationFrame(updateWave);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [data, animated]);

  let path = '';
  if (points.length > 0) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = (max - min) || 1;
    
    path = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const normalizedY = 1 - ((p - min) / range);
      const y = height * 0.1 + normalizedY * height * 0.8;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  const gridLines = [];
  for (let i = 1; i < 5; i++) {
    gridLines.push(<Line key={`h${i}`} x1="0" y1={(height/5)*i} x2={width} y2={(height/5)*i} stroke={colors.ppgGrid} strokeWidth="1" />);
  }
  for (let i = 1; i < 10; i++) {
    gridLines.push(<Line key={`v${i}`} x1={(width/10)*i} y1="0" x2={(width/10)*i} y2={height} stroke={colors.ppgGrid} strokeWidth="1" />);
  }

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg width={width} height={height}>
        <G opacity={0.5}>{gridLines}</G>
        {path ? (
          <Path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
        ) : null}
      </Svg>
      {heartRate !== undefined && (
        <View style={styles.hrContainer}>
          <Text style={styles.hrIcon}>❤️</Text>
          <Text style={styles.hrText}>{heartRate} BPM</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  hrContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  hrIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  hrText: {
    color: colors.textOnPrimary,
    ...typography.smallBold,
  }
});
