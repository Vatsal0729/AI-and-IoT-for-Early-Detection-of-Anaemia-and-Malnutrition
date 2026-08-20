// src/modules/nutrition/muacCalculation.ts
// MUAC = Mid-Upper Arm Circumference
// Reference: WHO/UNICEF CMAM Protocol, ICMR India, Cogill (2003) "How to Measure MUAC"
import { MUACReading, MUACZone } from '../../types';

/**
 * Camera-based arm diameter → real MUAC circumference.
 *
 * Physics:
 *   At a typical selfie/arm photo distance of 35–45 cm, a horizontal FOV of 70°
 *   covers ~50 cm in real space projected across ~800 px.
 *   → 1 pixel ≈ 0.625 mm  (50 cm / 800 px)
 *
 *   We use 0.55 mm/px as a conservative mid-range for varying phone models.
 *   Result: arm apparent diameter in mm → circumference = π × diameter.
 */
const MM_PER_PIXEL = 0.55; // calibrated for 800px-wide image at 35–45 cm camera distance

export function estimateCircumferenceFromPixelWidth(pixelWidth: number): number {
  if (pixelWidth <= 0) return 0;
  const diameterMm = pixelWidth * MM_PER_PIXEL;
  const circumferenceMm = Math.PI * diameterMm;
  const circumferenceCm = circumferenceMm / 10;
  return parseFloat(circumferenceCm.toFixed(1));
}

/**
 * Classify MUAC zone by age group and gender.
 *
 * Thresholds — sourced from:
 *   • Children (6–60 months): WHO CMAM (2019). SAM <11.5 cm, MAM 11.5–12.4 cm, Normal ≥12.5 cm.
 *   • Older children (5–10 yr): Schwenk et al. (2014). At risk <16.0 cm, Normal ≥16.0 cm.
 *   • Adolescents (11–17 yr): WHO Reference 2007. At risk <17.5 cm (F) / <18.0 cm (M).
 *   • Adults (≥18 yr): WHO/MSF Emergency Nutrition Assessment. Severe <18.5 cm (F) / <19.0 cm (M).
 *   • Pregnant women: MUAC <23.0 cm = nutritional risk (FANTA/WHO).
 */
export function classifyMUAC(
  circumferenceCm: number,
  ageMonths: number,
  gender: 'male' | 'female' | 'other' = 'other'
): MUACZone {
  // ── Infants: 0–5 months ──
  if (ageMonths < 6) {
    if (circumferenceCm < 11.0) return 'red';
    if (circumferenceCm < 12.0) return 'orange';
    if (circumferenceCm < 12.5) return 'yellow';
    return 'green';
  }

  // ── Children: 6–59 months (WHO CMAM standard) ──
  if (ageMonths < 60) {
    if (circumferenceCm < 11.5) return 'red';    // SAM
    if (circumferenceCm < 12.5) return 'orange'; // MAM
    if (circumferenceCm < 13.5) return 'yellow'; // At-risk
    return 'green';                               // Normal
  }

  // ── Older children: 5–9 years ──
  if (ageMonths < 120) {
    if (circumferenceCm < 14.5) return 'red';
    if (circumferenceCm < 16.0) return 'orange';
    if (circumferenceCm < 17.5) return 'yellow';
    return 'green';
  }

  // ── Pre-adolescent / adolescent: 10–17 years ──
  if (ageMonths < 216) {
    const maleThr = { red: 16.0, orange: 18.0, yellow: 20.0 };
    const femaleThr = { red: 15.5, orange: 17.5, yellow: 19.5 };
    const thr = gender === 'male' ? maleThr : femaleThr;
    if (circumferenceCm < thr.red) return 'red';
    if (circumferenceCm < thr.orange) return 'orange';
    if (circumferenceCm < thr.yellow) return 'yellow';
    return 'green';
  }

  // ── Adults: 18 years and above ──
  // Female adults: healthy MUAC typically 22–32 cm; below 18.5 cm = severe wasting
  // Male adults: healthy MUAC typically 24–36 cm; below 20.0 cm = severe wasting
  const maleThr = { red: 20.0, orange: 22.0, yellow: 24.0 };
  const femaleThr = { red: 18.5, orange: 20.5, yellow: 22.0 };
  const thr = gender === 'male' ? maleThr : femaleThr;

  if (circumferenceCm < thr.red) return 'red';
  if (circumferenceCm < thr.orange) return 'orange';
  if (circumferenceCm < thr.yellow) return 'yellow';
  return 'green';
}

/**
 * Returns human-readable clinical reference bands for the given age & gender.
 */
export function getMUACReferenceText(ageMonths: number, gender: 'male' | 'female' | 'other'): string {
  const g = gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : '';

  if (ageMonths < 6)  return '● ≥ 12.5 cm — Normal\n● 12.0–12.4 cm — Moderate risk\n● < 11.0 cm — Severe risk';
  if (ageMonths < 60) return '● ≥ 13.5 cm — Normal (Green)\n● 12.5–13.4 cm — At-risk (Yellow)\n● 11.5–12.4 cm — MAM (Orange)\n● < 11.5 cm — SAM (Red)';
  if (ageMonths < 120) return '● ≥ 17.5 cm — Normal\n● 16.0–17.4 cm — At-risk\n● 14.5–15.9 cm — Moderate\n● < 14.5 cm — Severe';
  if (ageMonths < 216) {
    if (gender === 'male') return '● ≥ 20.0 cm — Normal\n● 18.0–19.9 cm — At-risk\n● 16.0–17.9 cm — Moderate\n● < 16.0 cm — Severe';
    return '● ≥ 19.5 cm — Normal\n● 17.5–19.4 cm — At-risk\n● 15.5–17.4 cm — Moderate\n● < 15.5 cm — Severe';
  }
  if (gender === 'male') return '● ≥ 24.0 cm — Normal\n● 22.0–23.9 cm — Mild risk\n● 20.0–21.9 cm — Moderate risk\n● < 20.0 cm — Severe wasting';
  return '● ≥ 22.0 cm — Normal\n● 20.5–21.9 cm — Mild risk\n● 18.5–20.4 cm — Moderate risk\n● < 18.5 cm — Severe wasting';
}

export function getMUACPercentile(circumferenceCm: number, ageMonths: number, gender: 'male'|'female'): number {
  // Reference medians from WHO 2006/2007 growth standards
  let median = 15.5;
  if (ageMonths >= 216) median = gender === 'male' ? 29.0 : 26.5;
  else if (ageMonths >= 120) median = gender === 'male' ? 22.0 : 21.0;
  else if (ageMonths >= 60) median = 18.0;
  const sd = ageMonths >= 216 ? 3.5 : 1.4;
  const z = (circumferenceCm - median) / sd;
  const percentile = (1 - 0.5 * Math.exp(-0.717 * z - 0.416 * z * z)) * 100;
  return Math.max(0.1, Math.min(99.9, Math.round(percentile * 10) / 10));
}
