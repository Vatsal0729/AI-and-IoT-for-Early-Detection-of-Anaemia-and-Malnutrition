import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing, typography, radius } from '../theme/theme';

interface ScanGuideProps {
  type: 'finger' | 'eye' | 'arm' | 'face';
  status: 'waiting' | 'detecting' | 'recording' | 'captured';
  message?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ScanGuide: React.FC<ScanGuideProps> = ({ type, status, message }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'waiting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'waiting': return 'rgba(255,255,255,0.7)';
      case 'detecting': return colors.warning;
      case 'recording': return colors.success;
      case 'captured': return colors.success;
    }
  };

  const getGuideShape = () => {
    const color = getStatusColor();
    const borderStyle = status === 'recording' ? 'solid' : 'dashed';

    switch (type) {
      case 'finger':
        return (
          <Animated.View style={[styles.fingerGuide, { borderColor: color, borderStyle, transform: [{ scale: pulseAnim }] }]} />
        );
      case 'eye':
        return (
          <View style={[styles.eyeGuide, { borderColor: color, borderStyle }]} />
        );
      case 'arm':
        return (
          <View style={[styles.armGuide, { borderColor: color, borderStyle }]} />
        );
      case 'face':
        return (
          <View style={[styles.faceGuide, { borderColor: color, borderStyle }]} />
        );
    }
  };

  const defaultMessage = {
    waiting: 'Position inside guide',
    detecting: 'Hold still...',
    recording: 'Recording data...',
    captured: 'Capture complete!',
  }[status];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.overlay}>
        <View style={styles.centerHole}>
          {getGuideShape()}
        </View>
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, { color: getStatusColor() }]}>
          {message || defaultMessage}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHole: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerGuide: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  eyeGuide: {
    width: 250,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  armGuide: {
    width: SCREEN_WIDTH * 0.7,
    height: 150,
    borderWidth: 4,
    borderRadius: radius.lg,
  },
  faceGuide: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    borderWidth: 4,
  },
  messageContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  messageText: {
    ...typography.h3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  }
});
