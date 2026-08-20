// ============================================================================
// HemoNutri AI — Core Type Definitions
// ============================================================================

// ---- Patient Types ----

export interface Patient {
  id: string;
  name: string;
  age: number;
  ageUnit: 'months' | 'years';
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height?: number; // cm
  guardianName?: string;
  phone?: string;
  village?: string;
  district?: string;
  createdAt: string;
}

// ---- PPG Signal Types ----

export interface PPGDataPoint {
  timestamp: number; // milliseconds from start
  red: number;       // mean red channel value (0-255)
  green: number;     // mean green channel value (0-255)
  blue: number;      // mean blue channel value (0-255)
}

export interface PPGSignal {
  rawData: PPGDataPoint[];
  filteredRed: number[];
  filteredGreen: number[];
  filteredBlue: number[];
  sampleRate: number;
  durationMs: number;
}

export interface PPGFeatures {
  heartRate: number;         // BPM
  acDcRatioRed: number;      // AC/DC ratio for red channel
  acDcRatioGreen: number;    // AC/DC ratio for green channel
  acDcRatioBlue: number;     // AC/DC ratio for blue channel
  perfusionIndex: number;    // PI = (AC/DC) * 100
  signalQuality: number;    // 0-1 quality score
  peakIntervals: number[];  // R-R intervals in ms
}

// ---- Conjunctiva Analysis Types ----

export interface ConjunctivaAnalysis {
  labL: number;  // CIE L* (Lightness)
  labA: number;  // CIE a* (red-green axis) — KEY indicator
  labB: number;  // CIE b* (yellow-blue axis)
  meanRGB: { r: number; g: number; b: number };
  roiQuality: number;       // 0-1 quality score
  skinTone: FitzpatrickScale;
  pallor: number;           // 0-1 pallor score (1 = very pale)
}

export type FitzpatrickScale = 1 | 2 | 3 | 4 | 5 | 6;

// ---- Hemoglobin Estimation Types ----

export interface HbEstimate {
  value: number;             // g/dL
  confidence: number;        // 0-1
  method: 'conjunctiva' | 'ppg' | 'fused';
  qualityWarnings: string[];
}

export type AnemiaSeverity = 'no_anemia' | 'borderline_anemia' | 'anemia' | 'severe_anemia';

export interface AnemiaResult {
  hbEstimate: HbEstimate;
  severity: AnemiaSeverity;
  severityColor: string;
  ppgFeatures?: PPGFeatures;
  ppgHbEstimate?: HbEstimate;
  conjunctivaAnalysis?: ConjunctivaAnalysis;
  conjunctivaHbEstimate?: HbEstimate;
  recommendations: string[];
  dosage?: IFADosage;
  dietaryAdvice: string[];
  referralNeeded: boolean;
  referralUrgency?: 'routine' | 'urgent' | 'emergency';
  timestamp: string;
}

export interface IFADosage {
  elementalIronMg: number;
  syrupMlPerDose: number;
  frequency: string;
  durationWeeks: number;
  formulation: string;
}

// ---- MUAC Types ----

export interface MUACReading {
  circumferenceCm: number;
  confidence: number;
  method: 'camera_reference' | 'manual_input';
}

export type MUACZone = 'green' | 'yellow' | 'orange' | 'red';

// ---- Emaciation Types ----

export interface EmaciationResult {
  score: number; // 0-100 Wasting Severity Index (lower is better, <25 is normal)
  preservationScore: number; // 0-100 Fat & Muscle Preservation Score (higher is better, >=80 is healthy)
  classification: WastingClass;
  facialIndicators: {
    cheekFullness: number;     // 0-1 (1 = full buccal fat pad)
    temporalWasting: number;   // 0-1 (0 = full, 1 = deep temple depression)
    jawProminence: number;     // 0-1 (0 = normal soft jawline, 1 = angular skeletal prominence)
    periorbitalHollowing: number; // 0-1 (0 = normal orbital fat, 1 = sunken orbits)
  };
  confidence: number;
}

export type WastingClass = 'normal' | 'mild_wasting' | 'moderate_wasting' | 'severe_wasting';

// ---- Nutrition Result Types ----

export interface NutritionResult {
  muac?: MUACReading;
  muacZone?: MUACZone;
  muacZoneColor?: string;
  emaciation?: EmaciationResult;
  recommendations: string[];
  mealPlan?: MealPlan;
  referralNeeded: boolean;
  referralUrgency?: 'routine' | 'urgent' | 'emergency';
  timestamp: string;
}

// ---- Meal Plan Types ----

export interface MealPlan {
  targetCalories: number;
  meals: MealSuggestion[];
  totalCostINR: number;
  region: string;
  keyNutrients: string[];
}

export interface MealSuggestion {
  name: string;
  nameLocal?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: MealIngredient[];
  prepTimeMin: number;
  nutritionHighlights: string[];
  costINR: number;
  instructions: string;
  ironContentMg: number;
}

export interface MealIngredient {
  name: string;
  nameLocal?: string;
  quantity: string;
  costINR: number;
}

// ---- Health Passport Types ----

export interface HealthPassport {
  id: string;
  patient: Patient;
  anemiaResult?: AnemiaResult;
  nutritionResult?: NutritionResult;
  healthWorkerName: string;
  healthWorkerId: string;
  facilityName: string;
  generatedAt: string;
  followUpDate: string;
  qrPayload: string;
}

// ---- Scan Session Types ----

export interface ScanSession {
  id: string;
  patientId: string;
  patientName: string;
  type: 'anemia' | 'nutrition' | 'comprehensive';
  status: 'in_progress' | 'completed';
  anemiaResult?: AnemiaResult;
  nutritionResult?: NutritionResult;
  timestamp: string;
}

// ---- Navigation Types ----

export type RootStackParamList = {
  Home: undefined;
  PatientRegistration: undefined;
  AnemiaScan: { patient: Patient };
  PPGCapture: { patient: Patient };
  EyeScan: { patient: Patient; ppgFeatures?: PPGFeatures; ppgHb?: HbEstimate };
  AnemiaResult: { patient: Patient; result: AnemiaResult };
  NutritionScan: { patient: Patient; anemiaResult?: AnemiaResult };
  MUACCapture: { patient: Patient };
  FaceScan: { patient: Patient; muac?: MUACReading };
  NutritionResult: { patient: Patient; result: NutritionResult };
  HealthPassport: { passport: HealthPassport };
  PatientHistory: { patient: Patient };
};

// ---- Calibration Types ----

export interface CalibrationState {
  ambientLux: number;
  isLowLight: boolean;
  skinTone: FitzpatrickScale;
  cameraExposure?: number;
  qualityScore: number;
}

// ---- Quality Gate Types ----

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-1
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'low_light' | 'overexposed' | 'blurry' | 'no_finger' | 'poor_roi' | 'motion';
  severity: 'warning' | 'error';
  message: string;
}
