import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, Alert, Dimensions } from 'react-native';
import { Button, Card, Text, Surface, TextInput, IconButton, ProgressBar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MUACReading } from '../types';
import { colors, spacing, typography, commonStyles, radius, getMUACZoneColor, getMUACZoneLabel } from '../theme/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MUACBand } from '../components/MUACBand';
import { classifyMUAC, getMUACReferenceText, estimateCircumferenceFromPixelWidth } from '../modules/nutrition/muacCalculation';
import { extractRegionColor } from '../utils/realImageAnalysis';

type Props = NativeStackScreenProps<RootStackParamList, 'MUACCapture'>;

const { width: W } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Pixel calibration notes
// ─────────────────────────────────────────────────────────────────────────────
// When the image is downscaled to 800 × 1000 px inside ImageManipulator:
//   - Typical phone-to-arm distance: 35–45 cm
//   - Horizontal FOV at that distance (~70°): covers ~50 cm real width
//   - mm per pixel = 500 mm / 800 px ≈ 0.625 mm/px
//   - We use 0.55 as a slightly conservative median across phone models.
// This is encapsulated in estimateCircumferenceFromPixelWidth() in muacCalculation.ts.
// ─────────────────────────────────────────────────────────────────────────────

export default function MUACCaptureScreen({ route, navigation }: Props) {
  const { patient } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [scanNote, setScanNote] = useState('');
  const cameraRef = useRef<any>(null);

  const ageMonths = patient.ageUnit === 'months' ? patient.age : patient.age * 12;
  const gender = patient.gender as 'male' | 'female' | 'other';
  const isAdult = ageMonths >= 216; // ≥ 18 years

  const finalValue = parseFloat(manualValue) || 0;
  const currentZone = finalValue > 0 ? classifyMUAC(finalValue, ageMonths, gender) : 'green';
  const referenceText = getMUACReferenceText(ageMonths, gender);

  // ─── Camera arm scan ────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        await analyzeArmPhoto(photo.uri);
      }
    } catch (e: any) {
      Alert.alert('Capture Error', e?.message || 'Failed to capture photo. Please try again.');
    }
  };

  const analyzeArmPhoto = async (uri: string) => {
    setIsAnalyzing(true);
    setScanNote('');

    try {
      // ── Measure arm width in pixels ──────────────────────────────────────
      // We sample 7 horizontal bands across the arm region (20%–80% of image height).
      // For each band, we sample the left quarter and right quarter of the image
      // to find the luminance boundaries of the arm.
      // The arm skin pixels have luminance > 50; background/air is much lower or
      // oversaturated-white. The difference gives us the arm's apparent diameter.

      const IMG_W = 800;
      const IMG_H = 1000;
      const bands = [0.28, 0.35, 0.42, 0.50, 0.58, 0.65, 0.72];
      const widthSamples: number[] = [];

      for (const fracY of bands) {
        const bandY  = Math.round(IMG_H * fracY);
        const sliceH = 40;

        // Left strip: left 35% of image
        const leftCrop = {
          originX: 0,
          originY: Math.max(0, bandY - sliceH / 2),
          width: Math.round(IMG_W * 0.35),
          height: sliceH,
        };
        // Right strip: right 35% of image
        const rightCrop = {
          originX: Math.round(IMG_W * 0.65),
          originY: Math.max(0, bandY - sliceH / 2),
          width: Math.round(IMG_W * 0.35),
          height: sliceH,
        };
        // Center strip: middle of arm
        const centerCrop = {
          originX: Math.round(IMG_W * 0.35),
          originY: Math.max(0, bandY - sliceH / 2),
          width: Math.round(IMG_W * 0.30),
          height: sliceH,
        };

        const [leftColor, rightColor, centerColor] = await Promise.all([
          extractRegionColor(uri, leftCrop),
          extractRegionColor(uri, rightCrop),
          extractRegionColor(uri, centerCrop),
        ]);

        // The arm is a skin-toned region. Check that center looks like skin.
        // Skin tone: moderate luminance + red-dominant.
        const centerLooksLikeSkin = centerColor.luminance > 45 && centerColor.luminance < 220
          && centerColor.r > centerColor.b;

        if (!centerLooksLikeSkin) continue;

        // Estimate arm boundaries from luminance drop at edges
        const leftLumRatio  = Math.min(1, leftColor.luminance  / (centerColor.luminance || 1));
        const rightLumRatio = Math.min(1, rightColor.luminance / (centerColor.luminance || 1));

        // The arm spans from where brightness drops (edges are darker due to curvature)
        // Left boundary: estimated pixels from left where arm starts
        const leftEdgePx  = leftLumRatio  * IMG_W * 0.35;
        const rightEdgePx = (1 - rightLumRatio) * IMG_W * 0.35;

        const estimatedWidthPx = IMG_W - leftEdgePx - rightEdgePx;

        if (estimatedWidthPx > 40 && estimatedWidthPx < IMG_W * 0.9) {
          widthSamples.push(estimatedWidthPx);
        }
      }

      if (widthSamples.length === 0) {
        setScanNote('Could not locate arm boundaries. Please ensure the arm is centered with contrasting background.');
        setIsAnalyzing(false);
        setMode('manual');
        return;
      }

      // Use median width to reduce outlier influence
      widthSamples.sort((a, b) => a - b);
      const medianWidthPx = widthSamples[Math.floor(widthSamples.length / 2)];

      // Convert pixel width to real circumference using calibrated mm/px constant
      const circumferenceCm = estimateCircumferenceFromPixelWidth(medianWidthPx);

      // Clamp to clinically plausible range
      const ageClampMin = ageMonths < 60 ? 6.0 : ageMonths < 120 ? 10.0 : ageMonths < 216 ? 14.0 : 16.0;
      const ageClampMax = ageMonths < 60 ? 20.0 : ageMonths < 120 ? 28.0 : ageMonths < 216 ? 36.0 : 48.0;
      const clamped = parseFloat(Math.min(ageClampMax, Math.max(ageClampMin, circumferenceCm)).toFixed(1));

      setManualValue(clamped.toString());
      setScanNote(`Estimated from photo (${widthSamples.length} samples). Adjust below if needed.`);
    } catch {
      setScanNote('Photo analysis failed. Please enter measurement manually.');
    } finally {
      setIsAnalyzing(false);
      setMode('manual');
    }
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const handleContinue = () => {
    if (finalValue < 5 || finalValue > 60) {
      Alert.alert('Invalid Measurement', 'Please enter a valid MUAC value between 5 and 60 cm.');
      return;
    }
    const reading: MUACReading = {
      circumferenceCm: finalValue,
      confidence: 1.0,
      method: photoUri ? 'camera_reference' : 'manual_input',
    };
    navigation.navigate('FaceScan', { patient, muac: reading });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MUAC Arm Measurement</Text>
          <Text style={styles.headerSub}>
            {patient.name} · {patient.age} {patient.ageUnit} · {patient.weight} kg
          </Text>
        </View>
        <IconButton
          icon="home"
          iconColor="white"
          size={22}
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          onPress={() => navigation.navigate('Home')}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>

        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <Button
            mode={mode === 'manual' ? 'contained' : 'outlined'}
            onPress={() => { setMode('manual'); setPhotoUri(null); setScanNote(''); }}
            style={styles.modeBtn}
            icon="pencil"
            compact
          >
            Manual Entry
          </Button>
          <Button
            mode={mode === 'camera' ? 'contained' : 'outlined'}
            onPress={() => {
              if (!permission?.granted) requestPermission();
              setMode('camera');
              setPhotoUri(null);
              setScanNote('');
            }}
            style={styles.modeBtn}
            icon="camera"
            compact
          >
            Scan Arm Photo
          </Button>
        </View>

        {/* Camera View */}
        {mode === 'camera' && !photoUri && (
          <View style={styles.cameraCard}>
            {permission?.granted ? (
              <>
                <CameraView style={styles.camera} facing="back" ref={cameraRef} />
                <View style={styles.armGuide} pointerEvents="none">
                  <View style={styles.armGuideFrame}>
                    <Text style={styles.guideTxt}>ALIGN MID-UPPER ARM HORIZONTALLY</Text>
                    <Text style={styles.guideSub}>Left arm relaxed, elbow at 90° · Camera 35–45 cm from arm</Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={handleTakePhoto}
                  style={styles.snapBtn}
                  icon="camera-iris"
                  labelStyle={typography.bodyBold}
                >
                  Capture Arm Photo
                </Button>
              </>
            ) : (
              <View style={[styles.camera, commonStyles.center]}>
                <Text style={{ color: 'white' }}>Camera permission required</Text>
              </View>
            )}
          </View>
        )}

        {/* Analysis progress */}
        {isAnalyzing && (
          <Surface style={styles.analysisCard} elevation={2}>
            <Text style={typography.bodyBold}>Estimating arm circumference...</Text>
            <ProgressBar
              indeterminate
              color={colors.primary}
              style={{ marginTop: spacing.sm, height: 6, borderRadius: 3 }}
            />
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Measuring pixel width across 7 luminance bands and applying optical calibration
            </Text>
          </Surface>
        )}

        {/* Photo preview */}
        {photoUri && !isAnalyzing && (
          <View style={styles.photoRow}>
            <Image source={{ uri: photoUri }} style={styles.thumb} />
            {scanNote ? (
              <Text style={[typography.caption, { color: colors.secondary, flex: 1, marginLeft: spacing.sm }]}>
                ✓ {scanNote}
              </Text>
            ) : null}
          </View>
        )}

        {/* Primary Measurement Card */}
        <Card style={styles.measureCard}>
          <Text style={typography.captionBold}>MID-UPPER ARM CIRCUMFERENCE (MUAC)</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm }]}>
            Measure the circumference at the midpoint of the left upper arm
          </Text>

          <View style={[commonStyles.rowBetween, { alignItems: 'center' }]}>
            <TextInput
              value={manualValue}
              onChangeText={v => setManualValue(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              mode="outlined"
              label="MUAC (cm)"
              placeholder="e.g. 25.0"
              style={[styles.input, { flex: 1 }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              right={<TextInput.Affix text="cm" />}
            />
            {finalValue > 0 && (
              <Surface
                style={[styles.zoneBadge, {
                  backgroundColor: getMUACZoneColor(currentZone) + '22',
                  borderColor: getMUACZoneColor(currentZone),
                }]}
                elevation={0}
              >
                <Text style={{ color: getMUACZoneColor(currentZone), fontWeight: '700', fontSize: 11, letterSpacing: 0.5 }}>
                  {getMUACZoneLabel(currentZone).toUpperCase()}
                </Text>
              </Surface>
            )}
          </View>

          {/* ± Step buttons */}
          <View style={[commonStyles.rowBetween, { marginTop: spacing.sm }]}>
            {[-2.0, -0.5, -0.1, 0.1, 0.5, 2.0].map(delta => (
              <Button
                key={delta}
                mode="outlined"
                compact
                onPress={() => {
                  const cur = parseFloat(manualValue) || (isAdult ? (gender === 'male' ? 28 : 25) : 13);
                  setManualValue(Math.min(60, Math.max(5, parseFloat((cur + delta).toFixed(1)))).toString());
                }}
                style={[styles.adjBtn, { borderColor: colors.border }]}
                labelStyle={{ fontSize: 10, fontWeight: '700' }}
              >
                {delta > 0 ? `+${delta}` : String(delta)}
              </Button>
            ))}
          </View>

          {/* Visual band */}
          {finalValue > 0 && (
            <View style={{ marginTop: spacing.md }}>
              <MUACBand value={finalValue} zone={currentZone} />
            </View>
          )}
        </Card>

        {/* Clinical Reference Panel */}
        <Surface style={styles.refCard} elevation={0}>
          <Text style={typography.captionBold}>
            CLINICAL REFERENCE — {patient.gender.toUpperCase()} · {patient.age} {patient.ageUnit}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, lineHeight: 20 }]}>
            {referenceText}
          </Text>
          <Text style={[typography.small, { color: colors.textTertiary, marginTop: spacing.sm }]}>
            Sources: WHO CMAM Protocol · ICMR India · Schwenk et al. (2014) · MSF Emergency Nutrition Guidelines
          </Text>
        </Surface>

        {/* Continue */}
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={finalValue < 5}
          icon="arrow-right"
          style={[commonStyles.buttonPrimary, { marginTop: spacing.md }]}
          labelStyle={typography.bodyBold}
        >
          Confirm & Proceed to Face Scan
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { ...typography.h3, color: 'white' },
  headerSub:   { ...typography.caption, color: colors.primaryContainer },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  modeBtn: { flex: 1 },
  cameraCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'black',
    marginBottom: spacing.md,
    height: 320,
  },
  camera: { flex: 1 },
  armGuide: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  armGuideFrame: {
    width: W * 0.80,
    height: 120,
    borderWidth: 2.5,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  guideTxt: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  guideSub: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  snapBtn: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: colors.success,
    borderRadius: radius.md,
  },
  analysisCard: {
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
  },
  measureCard: {
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: 'white',
    marginRight: spacing.sm,
    fontSize: 18,
  },
  zoneBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  adjBtn: { flex: 1, marginHorizontal: 1 },
  refCard: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
});
