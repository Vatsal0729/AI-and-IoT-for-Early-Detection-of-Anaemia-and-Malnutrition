import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Animated, Alert, Image } from 'react-native';
import { Button, Text, Surface, ProgressBar, IconButton, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, NutritionResult } from '../types';
import { colors, spacing, typography, commonStyles, radius, getMUACZoneColor } from '../theme/theme';
import { classifyMUAC } from '../modules/nutrition/muacCalculation';
import { generateMealPlan } from '../clinical/mealPlanner';
import { performRealFacialEmaciationAnalysis, extractRegionColor } from '../utils/realImageAnalysis';

type Props = NativeStackScreenProps<RootStackParamList, 'FaceScan'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FaceScanScreen({ route, navigation }: Props) {
  const { patient, muac } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  // Poll for face presence by sampling center luminance from camera frames
  useEffect(() => {
    if (!permission?.granted) return;
    detectIntervalRef.current = setInterval(async () => {
      try {
        if (!cameraRef.current || isCapturing || isAnalyzing) return;
        const snap = await cameraRef.current.takePictureAsync({
          skipProcessing: true,
          quality: 0.1,
        });
        if (!snap?.uri) return;
        // Sample the center region — a face fills it with mid-range skin-tone luminance
        const imgW = 200; const imgH = 250;
        const center = await extractRegionColor(snap.uri, {
          originX: Math.round(imgW * 0.2),
          originY: Math.round(imgH * 0.15),
          width: Math.round(imgW * 0.6),
          height: Math.round(imgH * 0.65),
        });
        // Skin tone luminance is between 60–200. Too dark = no face. Too bright = overexposed.
        const isLikelyFace = center.luminance > 55 && center.luminance < 215;
        setFaceDetected(isLikelyFace);
      } catch {
        // Silently skip failed snaps
      }
    }, 1800);

    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    };
  }, [permission?.granted, isCapturing, isAnalyzing]);

  const handleCapture = async () => {
    if (!faceDetected) {
      Alert.alert('No Face Detected', 'Please position the patient\'s face inside the oval guide and ensure good lighting.');
      return;
    }
    
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setIsCapturing(false);
        runAnalysis(photo.uri);
      } else {
        throw new Error('Photo capture failed');
      }
    } catch (e: any) {
      setIsCapturing(false);
      Alert.alert('Capture Error', e?.message || 'Could not capture photo. Please try again.');
    }
  };

  const runAnalysis = async (uri: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0.1);

    const progressTimer = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 0.12, 0.9));
    }, 300);

    try {
      const emaciation = await performRealFacialEmaciationAnalysis(uri, 800, 1000);
      clearInterval(progressTimer);
      setAnalysisProgress(1.0);

      const ageMonths = patient.ageUnit === 'months' ? patient.age : patient.age * 12;
      let muacZone: any;
      let muacZoneColor: string | undefined;
      let referralNeeded = false;

      if (muac) {
        muacZone = classifyMUAC(muac.circumferenceCm, ageMonths, patient.gender as 'male' | 'female' | 'other');
        muacZoneColor = getMUACZoneColor(muacZone);
        if (muacZone === 'red' || muacZone === 'orange') referralNeeded = true;
      }

      if (emaciation.classification === 'severe_wasting') referralNeeded = true;

      const mealPlan = generateMealPlan(
        patient,
        emaciation.classification === 'severe_wasting' ? 'severe_anemia' : 
        emaciation.classification === 'moderate_wasting' ? 'anemia' : 'borderline_anemia',
        'North India'
      );

      const nutritionResult: NutritionResult = {
        muac,
        muacZone,
        muacZoneColor,
        emaciation,
        mealPlan,
        recommendations: [
          referralNeeded
            ? '🚨 Refer to Nutrition Rehabilitation Centre (NRC) immediately'
            : '✅ Initiate community supplementary feeding and monitor monthly',
          'Provide iron and folic acid supplementation as per national program',
          'Ensure safe water, sanitation and hygiene counselling',
        ],
        referralNeeded,
        referralUrgency: referralNeeded ? 'emergency' : 'routine',
        timestamp: new Date().toISOString(),
      };

      setTimeout(() => {
        setIsAnalyzing(false);
        navigation.navigate('NutritionResult', { patient, result: nutritionResult });
      }, 500);
    } catch (err: any) {
      clearInterval(progressTimer);
      setIsAnalyzing(false);
      Alert.alert('Analysis Error', err?.message || 'Could not analyze face. Please retake in better light.');
    }
  };

  if (!permission) return <View style={commonStyles.screen} />;

  if (!permission.granted) {
    return (
      <View style={[commonStyles.screen, commonStyles.center, { padding: spacing.xl }]}>
        <IconButton icon="camera-off" size={48} iconColor={colors.critical} />
        <Text style={[typography.h3, { textAlign: 'center', marginVertical: spacing.md }]}>Camera Required</Text>
        <Button mode="contained" onPress={requestPermission}>Grant Camera Access</Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isAnalyzing && capturedUri ? (
        /* Analysis overlay with captured photo */
        <View style={styles.analysisOverlay}>
          <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFillObject} blurRadius={4} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={[typography.h3, { color: 'white', marginTop: spacing.md, textAlign: 'center' }]}>
              Analyzing Facial Biomarkers
            </Text>
            <Text style={[typography.body, { color: '#CBD5E1', marginTop: spacing.xs, textAlign: 'center' }]}>
              Computing subcutaneous fat volume, buccal depth and temporal muscle index...
            </Text>
            <ProgressBar
              progress={analysisProgress}
              color={colors.secondary}
              style={{ width: 260, height: 6, borderRadius: 3, marginTop: spacing.lg }}
            />
          </View>
        </View>
      ) : (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="front"
            ref={cameraRef}
          />

          {/* Top Header */}
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.headerTitle}>Facial Emaciation Scan</Text>
              <Text style={styles.headerSub}>{patient.name} • Step 3 of 3</Text>
            </View>
            <IconButton
              icon="home"
              iconColor="white"
              size={22}
              style={{ backgroundColor: colors.primary }}
              onPress={() => navigation.navigate('Home')}
            />
          </View>

          {/* Centered Face Guide Oval */}
          <View style={styles.guideContainer} pointerEvents="none">
            <Animated.View
              style={[
                styles.faceOval,
                faceDetected ? styles.faceOvalDetected : styles.faceOvalSearching,
                { opacity: faceDetected ? 1 : fadeAnim },
              ]}
            />
            <Text style={[styles.guideLabel, { color: faceDetected ? colors.success : '#FFD600' }]}>
              {faceDetected ? '✓ FACE LOCKED' : 'ALIGN FACE IN FRAME'}
            </Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomBar}>
            <Surface style={styles.hint} elevation={2}>
              <Text style={[typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
                Center the patient's face in the oval. Ensure even lighting on both cheeks. The button activates when face is detected.
              </Text>
            </Surface>
            <Button
              mode="contained"
              icon={isCapturing ? undefined : 'camera'}
              onPress={handleCapture}
              disabled={isCapturing}
              loading={isCapturing}
              style={[styles.captureBtn, { backgroundColor: faceDetected ? colors.secondary : '#94A3B8' }]}
              labelStyle={typography.bodyBold}
            >
              {isCapturing ? 'Capturing...' : faceDetected ? 'Capture & Analyze Face' : 'Waiting for Face...'}
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  analysisOverlay: { flex: 1 },
  topHeader: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 4,
  },
  headerSub: {
    ...typography.caption,
    color: '#CBD5E1',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 4,
  },
  guideContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOval: {
    width: SCREEN_WIDTH * 0.68,
    height: SCREEN_HEIGHT * 0.42,
    borderRadius: SCREEN_WIDTH * 0.34,
    borderWidth: 3,
  },
  faceOvalSearching: {
    borderColor: '#FFD600',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,214,0,0.05)',
  },
  faceOvalDetected: {
    borderColor: colors.success,
    borderStyle: 'solid',
    backgroundColor: 'rgba(46,125,50,0.08)',
  },
  guideLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  hint: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  captureBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
});
