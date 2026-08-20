import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Alert, Image } from 'react-native';
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | undefined>(undefined);

  React.useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (isCapturing || isAnalyzing) return;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) {
        throw new Error('Photo capture failed');
      }

      // 3. After capture, analyze the center region of the photo
      const width = photo.width || 800;
      const height = photo.height || 1000;

      const center = await extractRegionColor(photo.uri, {
        originX: Math.round(width * 0.2),
        originY: Math.round(height * 0.175),
        width: Math.round(width * 0.6),
        height: Math.round(height * 0.65),
      });

      const { luminance, r } = center;
      const isSkinTone = luminance >= 55 && luminance <= 215 && r > 40;
      const isTooDarkOrBright = luminance < 30 || luminance > 240;

      if (isTooDarkOrBright || !isSkinTone) {
        setIsCapturing(false);
        Alert.alert(
          'No Face Detected',
          "No face detected. Please ensure the patient's face is centered and well-lit."
        );
        return;
      }

      setCapturedUri(photo.uri);
      setIsCapturing(false);
      runAnalysis(photo.uri);
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
      }, 600);
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
        <View style={styles.analysisOverlay}>
          <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFillObject} blurRadius={8} />
          <View style={[StyleSheet.absoluteFillObject, styles.overlayBackground]}>
            <Surface style={styles.analysisCard} elevation={4}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[typography.h3, styles.analysisTitle]}>
                Analyzing...
              </Text>
              <Text style={[typography.body, styles.analysisSubtitle]}>
                Processing facial landmarks and subcutaneous fat distribution
              </Text>
              <ProgressBar
                progress={analysisProgress}
                color={colors.primary}
                style={styles.progressBar}
              />
            </Surface>
          </View>
        </View>
      ) : (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="front"
            ref={cameraRef as any}
          />

          <View style={styles.topHeader}>
            <View>
              <Text style={styles.headerTitle}>Face Scan · Step 3 of 3</Text>
            </View>
            <IconButton
              icon="home"
              iconColor={colors.primary}
              size={24}
              style={{ backgroundColor: colors.surface }}
              onPress={() => navigation.navigate('Home')}
            />
          </View>

          <View style={styles.guideContainer} pointerEvents="none">
            <View style={styles.faceOval} />
          </View>

          <View style={styles.bottomBar}>
            <Surface style={styles.bottomPanel} elevation={2}>
              <Text style={[typography.body, styles.instructionText]}>
                Center the patient's face inside the blue dashed oval and ensure well-lit surroundings.
              </Text>
              <Button
                mode="contained"
                icon="camera"
                onPress={handleCapture}
                disabled={isCapturing}
                loading={isCapturing}
                style={styles.captureBtn}
                buttonColor={colors.primary}
                labelStyle={typography.bodyBold}
              >
                {isCapturing ? 'Capturing...' : 'Capture'}
              </Button>
            </Surface>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  analysisOverlay: { flex: 1 },
  overlayBackground: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  analysisTitle: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  analysisSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginTop: spacing.xl,
    backgroundColor: colors.border,
  },
  topHeader: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  guideContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOval: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.45,
    borderRadius: SCREEN_WIDTH * 0.3,
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  bottomPanel: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  instructionText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  captureBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
});
