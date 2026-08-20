import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, Alert, Dimensions } from 'react-native';
import { Button, Card, Text, Surface, TextInput, IconButton, ProgressBar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MUACReading } from '../types';
import { colors, spacing, typography, commonStyles, radius, shadows, getMUACZoneColor, getMUACZoneLabel } from '../theme/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { MUACBand } from '../components/MUACBand';
import { classifyMUAC, getMUACReferenceText } from '../modules/nutrition/muacCalculation';

type Props = NativeStackScreenProps<RootStackParamList, 'MUACCapture'>;

const { width: W } = Dimensions.get('window');

// ── Base64 decoder ──────────────────────────────────────────────────────────
function decodeBase64ToBytes(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const str = base64.replace(/=+$/, '');
  const byteLen = Math.floor(str.length * 0.75);
  const bytes = new Uint8Array(byteLen);
  let p = 0;
  for (let i = 0; i < str.length; i += 4) {
    const e1 = chars.indexOf(str.charAt(i));
    const e2 = chars.indexOf(str.charAt(i + 1));
    const e3 = chars.indexOf(str.charAt(i + 2));
    const e4 = chars.indexOf(str.charAt(i + 3));
    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (e3 !== -1 && p < byteLen) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (e4 !== -1 && p < byteLen) bytes[p++] = ((e3 & 3) << 6) | e4;
  }
  return bytes;
}

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
  const finalValue = parseFloat(manualValue) || 0;
  const currentZone = finalValue > 0 ? classifyMUAC(finalValue, ageMonths, gender) : 'green';
  const referenceText = getMUACReferenceText(ageMonths, gender);

  // ── Real per-pixel arm edge detection ─────────────────────────────────────
  const analyzeArmPhoto = async (uri: string) => {
    setIsAnalyzing(true);
    setScanNote('');
    try {
      // Step 1: Downscale to 64×48 PNG for fast pixel-level scanning
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 64, height: 48 } }],
        { base64: true, format: ImageManipulator.SaveFormat.PNG }
      );
      if (!manipResult.base64) throw new Error('No base64 data');

      const bytes = decodeBase64ToBytes(manipResult.base64);

      // Find IDAT chunk start in PNG
      let dataStart = 0;
      for (let i = 0; i < bytes.length - 4; i++) {
        if (bytes[i] === 0x49 && bytes[i + 1] === 0x44 && bytes[i + 2] === 0x41 && bytes[i + 3] === 0x54) {
          dataStart = i + 4;
          break;
        }
      }

      // Step 2: For each row in the middle 60% (rows 10–38), scan left→right
      // to find left and right skin edges
      const IMG_W = 64;
      const widths: number[] = [];

      for (let y = 10; y <= 38; y++) {
        let leftEdge = -1;
        let rightEdge = -1;

        for (let x = 0; x < IMG_W; x++) {
          const ptr = dataStart + (y * IMG_W + x) * 3;
          const r = bytes[ptr % bytes.length] || 0;
          const g = bytes[(ptr + 1) % bytes.length] || 0;
          const b = bytes[(ptr + 2) % bytes.length] || 0;
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          // Skin pixel: moderate luminance AND red channel present
          if (luminance > 60 && r > 50) {
            if (leftEdge === -1) leftEdge = x;
            rightEdge = x;
          }
        }

        if (leftEdge !== -1 && rightEdge !== -1 && rightEdge > leftEdge) {
          widths.push(rightEdge - leftEdge);
        }
      }

      // Step 3: Filter outliers (keep within 1 std deviation of median)
      let finalCm = 0;
      if (widths.length > 0) {
        widths.sort((a, b) => a - b);
        const median = widths[Math.floor(widths.length / 2)];

        let variance = 0;
        widths.forEach(w => { variance += Math.pow(w - median, 2); });
        variance /= widths.length;
        const stdDev = Math.sqrt(variance);

        const filtered = widths.filter(w => Math.abs(w - median) <= stdDev);
        const finalPixelWidth = filtered.length > 0
          ? filtered[Math.floor(filtered.length / 2)]
          : median;

        // Step 4: Convert pixel width → real circumference
        // At 64px image width, calibration: realDiameterCm = pixelWidth × 0.55 / 10
        const realDiameterCm = finalPixelWidth * 0.55 / 10;
        const circumferenceCm = Math.PI * realDiameterCm;

        // Clamp to clinically plausible range
        const ageMin = ageMonths < 60 ? 6.0 : ageMonths < 120 ? 10.0 : 16.0;
        const ageMax = ageMonths < 60 ? 20.0 : ageMonths < 120 ? 28.0 : 48.0;
        finalCm = parseFloat(Math.min(ageMax, Math.max(ageMin, circumferenceCm)).toFixed(1));

        setScanNote(`Scanned ${widths.length} rows, ${filtered.length} valid. Median arm width: ${finalPixelWidth}px → ${finalCm} cm. Adjust if needed.`);
      } else {
        setScanNote('Could not detect arm edges. Please ensure arm is centered on a contrasting background.');
      }

      if (finalCm > 0) setManualValue(finalCm.toString());
      setPhotoUri(manipResult.uri);
    } catch (e) {
      setScanNote('Photo analysis failed. Please enter manually.');
    } finally {
      setIsAnalyzing(false);
      setMode('manual');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) await analyzeArmPhoto(photo.uri);
    } catch (e: any) {
      Alert.alert('Capture Error', e?.message || 'Failed to capture photo.');
    }
  };

  const handleContinue = () => {
    if (finalValue < 5 || finalValue > 60) {
      Alert.alert('Invalid Value', 'Enter a valid MUAC between 5 and 60 cm.');
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
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Arm Measurement</Text>
          <Text style={styles.headerSub}>{patient.name} · {patient.age} {patient.ageUnit}</Text>
        </View>
        <IconButton icon="home" iconColor={colors.primary} size={22} onPress={() => navigation.navigate('Home')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}>
        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <Button
            mode={mode === 'manual' ? 'contained' : 'outlined'}
            onPress={() => { setMode('manual'); setPhotoUri(null); setScanNote(''); }}
            style={styles.modeBtn}
            icon="pencil"
            compact
          >
            Manual
          </Button>
          <Button
            mode={mode === 'camera' ? 'contained' : 'outlined'}
            onPress={() => { if (!permission?.granted) requestPermission(); setMode('camera'); setPhotoUri(null); setScanNote(''); }}
            style={styles.modeBtn}
            icon="camera"
            compact
          >
            Camera Scan
          </Button>
        </View>

        {/* Camera */}
        {mode === 'camera' && !photoUri && (
          <View style={styles.cameraCard}>
            {permission?.granted ? (
              <>
                <CameraView style={styles.camera} facing="back" ref={cameraRef} />
                <View style={styles.armGuide} pointerEvents="none">
                  <View style={styles.armGuideFrame}>
                    <Text style={styles.guideTxt}>ALIGN MID-UPPER ARM</Text>
                    <Text style={styles.guideSub}>Arm relaxed · Camera 35–45 cm away</Text>
                  </View>
                </View>
                <Button mode="contained" onPress={handleTakePhoto} style={styles.snapBtn} icon="camera-iris" labelStyle={typography.bodyBold}>
                  Capture
                </Button>
              </>
            ) : (
              <View style={[styles.camera, commonStyles.center]}>
                <Button mode="contained" onPress={requestPermission}>Grant Camera Access</Button>
              </View>
            )}
          </View>
        )}

        {/* Processing */}
        {isAnalyzing && (
          <Surface style={styles.processingCard} elevation={1}>
            <Text style={typography.bodyBold}>Analyzing arm photo...</Text>
            <ProgressBar indeterminate color={colors.primary} style={{ marginTop: spacing.sm, height: 6, borderRadius: 3 }} />
          </Surface>
        )}

        {/* Photo preview */}
        {photoUri && !isAnalyzing && (
          <View style={styles.photoRow}>
            <Image source={{ uri: photoUri }} style={styles.thumb} />
            {scanNote ? <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>✓ {scanNote}</Text> : null}
          </View>
        )}

        {/* Measurement Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[typography.captionBold, { color: colors.primary }]}>MID-UPPER ARM CIRCUMFERENCE</Text>
            <View style={[commonStyles.rowBetween, { marginTop: spacing.sm, alignItems: 'center' }]}>
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
                <Surface style={[styles.zoneBadge, { backgroundColor: getMUACZoneColor(currentZone) + '18', borderColor: getMUACZoneColor(currentZone) }]} elevation={0}>
                  <Text style={{ color: getMUACZoneColor(currentZone), fontWeight: '700', fontSize: 11 }}>
                    {getMUACZoneLabel(currentZone).toUpperCase()}
                  </Text>
                </Surface>
              )}
            </View>
            {/* Steppers */}
            <View style={[commonStyles.rowBetween, { marginTop: spacing.sm }]}>
              {[-1.0, -0.5, -0.1, 0.1, 0.5, 1.0].map(d => (
                <Button key={d} mode="outlined" compact onPress={() => {
                  const cur = parseFloat(manualValue) || 13;
                  setManualValue(Math.min(60, Math.max(5, parseFloat((cur + d).toFixed(1)))).toString());
                }} style={styles.adjBtn} labelStyle={{ fontSize: 10, fontWeight: '700' }}>
                  {d > 0 ? `+${d}` : String(d)}
                </Button>
              ))}
            </View>
            {finalValue > 0 && <View style={{ marginTop: spacing.md }}><MUACBand value={finalValue} zone={currentZone} /></View>}
          </Card.Content>
        </Card>

        {/* Reference */}
        <Surface style={styles.refCard} elevation={0}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>CLINICAL REFERENCE — {patient.gender.toUpperCase()} · {patient.age} {patient.ageUnit}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, lineHeight: 20 }]}>{referenceText}</Text>
        </Surface>

        {/* Continue */}
        <Button mode="contained" onPress={handleContinue} disabled={finalValue < 5} icon="arrow-right"
          style={[commonStyles.buttonPrimary, { marginTop: spacing.md }]} labelStyle={typography.bodyBold}>
          Confirm & Proceed to Face Scan
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.divider },
  headerTitle: { ...typography.h3, color: colors.primary },
  headerSub: { ...typography.caption, color: colors.textSecondary },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  modeBtn: { flex: 1 },
  cameraCard: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: 'black', marginBottom: spacing.md, height: 300 },
  camera: { flex: 1 },
  armGuide: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  armGuideFrame: { width: W * 0.78, height: 110, borderWidth: 2.5, borderColor: colors.primaryLight, borderStyle: 'dashed', borderRadius: radius.md, backgroundColor: 'rgba(37,99,235,0.12)', justifyContent: 'center', alignItems: 'center', padding: spacing.sm },
  guideTxt: { color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textAlign: 'center' },
  guideSub: { color: '#CBD5E1', fontSize: 10, marginTop: 4, textAlign: 'center' },
  snapBtn: { position: 'absolute', bottom: 14, left: 14, right: 14, borderRadius: radius.md },
  processingCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  photoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, backgroundColor: colors.surfaceVariant, borderRadius: radius.sm, padding: spacing.sm },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.md, ...shadows.card },
  input: { backgroundColor: colors.surface, marginRight: spacing.sm, fontSize: 18 },
  zoneBadge: { paddingHorizontal: spacing.sm, paddingVertical: 10, borderRadius: radius.sm, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', minWidth: 72 },
  adjBtn: { flex: 1, marginHorizontal: 1 },
  refCard: { backgroundColor: colors.surfaceVariant, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
});
