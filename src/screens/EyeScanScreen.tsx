import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions, Alert } from 'react-native';
import { Button, Card, Text, Surface, ActivityIndicator, IconButton } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, AnemiaResult, HbEstimate } from '../types';
import { colors, spacing, typography, commonStyles, radius, getSeverityColor, getSeverityLabel } from '../theme/theme';
import { classifyAnemia, getAnemiaRecommendations } from '../clinical/whoClassifier';
import { calculateIFADosage, getSupplementationAdvice } from '../clinical/dosageCalculator';
import { fuseHbEstimates } from '../modules/anemia/fusionEngine';
import { performRealConjunctivaAnalysis } from '../utils/realImageAnalysis';

type Props = NativeStackScreenProps<RootStackParamList, 'EyeScan'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EyeScanScreen({ route, navigation }: Props) {
  const { patient, ppgFeatures, ppgHb } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<any>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
          setPhotoUri(photo.uri);
        }
      } catch (e: any) {
        Alert.alert('Capture Error', 'Could not capture photo. Please try again.');
      }
    }
  };

  const processImage = async () => {
    if (!photoUri) return;
    setIsAnalyzing(true);

    try {
      // 1. Analyze real photo for CIE L*a*b* conjunctival colorimetry and ITA melanin calibration
      const analysis = await performRealConjunctivaAnalysis(photoUri, 800, 1000);

      const eyeHb: HbEstimate = {
        value: analysis.realHb,
        confidence: analysis.roiQuality,
        method: 'conjunctiva',
        qualityWarnings: analysis.roiQuality < 0.5 ? ['Low illumination on inner eyelid mucosal tissue'] : [],
      };

      // 2. Perform Inverse-Variance Bayesian Dual-Modality Fusion (PPG + Real Conjunctiva)
      const fusedHb = fuseHbEstimates(ppgHb, eyeHb);

      // 3. Classify according to exact WHO thresholds into 4 tiers
      const classification = classifyAnemia(fusedHb.value, patient);
      const recommendations = getAnemiaRecommendations(classification.severity, patient);
      const dosage = classification.severity !== 'no_anemia' ? calculateIFADosage(patient, classification.severity) : undefined;
      const advice = dosage ? getSupplementationAdvice(dosage, classification.severity) : [
        'Include dark green leafy vegetables daily (Spinach, Moringa)',
        'Pair iron sources with Vitamin C rich foods (Amla, Lemon, Guava)',
        'Ensure clean drinking water and periodic deworming every 6 months'
      ];

      const isSevere = classification.severity === 'severe_anemia';
      const isAnemia = classification.severity === 'anemia';

      const result: AnemiaResult = {
        hbEstimate: {
          value: parseFloat(fusedHb.value.toFixed(1)),
          confidence: parseFloat(fusedHb.confidence.toFixed(2)),
          method: 'fused',
          qualityWarnings: fusedHb.qualityWarnings,
        },
        severity: classification.severity,
        severityColor: classification.color,
        ppgFeatures,
        ppgHbEstimate: ppgHb,
        conjunctivaAnalysis: analysis,
        conjunctivaHbEstimate: eyeHb,
        recommendations,
        dosage,
        dietaryAdvice: advice,
        referralNeeded: isSevere,
        referralUrgency: isSevere ? 'emergency' : (isAnemia ? 'urgent' : 'routine'),
        timestamp: new Date().toISOString(),
      };

      setIsAnalyzing(false);
      navigation.navigate('AnemiaResult', { patient, result });
    } catch (error: any) {
      setIsAnalyzing(false);
      Alert.alert('Analysis Failed', error?.message || 'Could not analyze eye photo. Retake with good lighting.');
    }
  };

  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} />
        <View style={styles.previewOverlay}>
          {isAnalyzing ? (
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
                Analyzing Real Conjunctiva...
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
                Sampling true CIE L*a*b* mucosa pixels & applying ITA periorbital melanin compensation
              </Text>
            </View>
          ) : (
            <View style={styles.previewControls}>
              <Text style={styles.instructionText}>Confirm Conjunctiva Photo</Text>
              <Text style={styles.subText}>Is the lower inner eyelid mucosal tissue clearly visible in focus?</Text>
              <View style={[commonStyles.rowBetween, { marginTop: spacing.md }]}>
                <Button 
                  mode="outlined" 
                  onPress={() => setPhotoUri(null)} 
                  textColor="white" 
                  style={{ borderColor: 'white', flex: 1, marginRight: 10 }}
                  icon="camera-retake"
                >
                  Retake
                </Button>
                <Button 
                  mode="contained" 
                  onPress={processImage} 
                  style={{ backgroundColor: colors.success, flex: 1.2 }}
                  icon="check-bold"
                >
                  Analyze Scan
                </Button>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" ref={cameraRef} />
      
      {/* Top Header with Home */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.patientNameHeader}>Step 2: Eye Conjunctiva Scan</Text>
          <Text style={styles.patientSubHeader}>{patient.name} ({patient.age} {patient.ageUnit})</Text>
        </View>
        <IconButton 
          icon="home" 
          iconColor="white" 
          size={24} 
          style={{ backgroundColor: colors.primary }} 
          onPress={() => navigation.navigate('Home')}
        />
      </View>

      {/* Target Eye Guide: Precisely in the Center */}
      <View style={styles.centeredGuideOverlay} pointerEvents="none">
        <View style={styles.eyeGuideBox}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          
          <View style={styles.conjunctivaTargetOval}>
            <Text style={styles.targetLabel}>ALIGN LOWER INNER EYELID HERE</Text>
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <Surface style={styles.instructionCard} elevation={2}>
          <Text style={typography.captionBold}>PALPEBRAL CONJUNCTIVA GUIDANCE:</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, lineHeight: 18 }]}>
            • Gently pull down the lower eyelid to expose the inner red mucosal vascular bed{'\n'}
            • Center the exposed conjunctiva inside the box in even ambient lighting{'\n'}
            • Keep the camera steady and tap Capture
          </Text>
        </Surface>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientNameHeader: {
    ...typography.h3,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  patientSubHeader: {
    ...typography.caption,
    color: '#E2E8F0',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  centeredGuideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  eyeGuideBox: {
    width: SCREEN_WIDTH * 0.82,
    height: SCREEN_HEIGHT * 0.28,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primaryLight,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primaryLight,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primaryLight,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primaryLight,
  },
  conjunctivaTargetOval: {
    width: '75%',
    height: '45%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: 'rgba(249, 168, 37, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 3,
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    borderRadius: radius.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  previewControls: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionText: {
    ...typography.h3,
    color: 'white',
    textAlign: 'center',
  },
  subText: {
    ...typography.body,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  analyzingCard: {
    backgroundColor: 'white',
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xxl,
  },
});
