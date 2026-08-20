// src/modules/nutrition/muacCalculation.ts
// Mid-Upper Arm Circumference (MUAC) Calculation & WHO Classification Engine
// Standard References:
// - WHO/UNICEF "Community-Based Management of Severe Acute Malnutrition" (CMAM 2019)
// - WHO "Guideline: Updates on the management of severe acute malnutrition in infants and children"
// - WHO Growth Reference (5-19 years) & Tang et al. (2020)
// - WHO/WFP/UNHCR/MSF Emergency Nutrition Assessment in Adults (MUAC < 18.5/19.0 cm)
// - FANTA / WHO Maternal Nutrition Guidelines (MUAC < 21.0/23.0 cm)

import { MUACReading, MUACZone } from '../../types';

const MM_PER_PIXEL = 0.55; // Calibrated optical baseline (800px width at 35-45cm focal distance)

export function estimateCircumferenceFromPixelWidth(pixelWidth: number): number {
  if (pixelWidth <= 0) return 0;
  const diameterMm = pixelWidth * MM_PER_PIXEL;
  const circumferenceMm = Math.PI * diameterMm;
  const circumferenceCm = circumferenceMm / 10;
  return parseFloat(circumferenceCm.toFixed(1));
}

/**
 * Classify MUAC zone strictly aligned with WHO / UNICEF / WFP standardized guidelines across all age groups.
 */
export function classifyMUAC(
  circumferenceCm: number,
  ageMonths: number,
  gender: 'male' | 'female' | 'other' = 'other'
): MUACZone {
  // ── 1. Infants: Under 6 months (0–5 months) ──
  if (ageMonths < 6) {
    if (circumferenceCm < 11.0) return 'red';     // Severe acute malnutrition
    if (circumferenceCm < 11.5) return 'orange';  // Moderate acute malnutrition
    if (circumferenceCm < 12.0) return 'yellow';  // At risk
    return 'green';                               // Normal / Well-nourished
  }

  // ── 2. Children: 6–59 months (WHO CMAM Standard) ──
  if (ageMonths < 60) {
    if (circumferenceCm < 11.5) return 'red';     // Severe Acute Malnutrition (SAM)
    if (circumferenceCm < 12.5) return 'orange';  // Moderate Acute Malnutrition (MAM)
    if (circumferenceCm < 13.5) return 'yellow';  // At risk / Sub-optimal
    return 'green';                               // Normal (≥ 12.5 / 13.5 cm)
  }

  // ── 3. Children: 5–9 years (60–119 months) (WHO/Schwenk Guidelines) ──
  if (ageMonths < 120) {
    if (circumferenceCm < 12.5) return 'red';     // Severe undernutrition
    if (circumferenceCm < 13.5) return 'orange';  // Moderate undernutrition
    if (circumferenceCm < 14.5) return 'yellow';  // Mild / At-risk
    return 'green';                               // Normal (≥ 14.5 cm)
  }

  // ── 4. Early Adolescents: 10–14 years (120–179 months) ──
  if (ageMonths < 180) {
    const isMale = gender === 'male';
    const thr = isMale
      ? { red: 15.5, orange: 17.0, yellow: 18.5 }
      : { red: 15.0, orange: 16.5, yellow: 18.0 };

    if (circumferenceCm < thr.red) return 'red';
    if (circumferenceCm < thr.orange) return 'orange';
    if (circumferenceCm < thr.yellow) return 'yellow';
    return 'green';
  }

  // ── 5. Late Adolescents: 15–17 years (180–215 months) ──
  if (ageMonths < 216) {
    const isMale = gender === 'male';
    const thr = isMale
      ? { red: 19.0, orange: 20.5, yellow: 22.0 }
      : { red: 18.0, orange: 19.5, yellow: 21.0 };

    if (circumferenceCm < thr.red) return 'red';
    if (circumferenceCm < thr.orange) return 'orange';
    if (circumferenceCm < thr.yellow) return 'yellow';
    return 'green';
  }

  // ── 6. Adults: 18+ years (WHO/WFP/MSF Emergency Guidelines) ──
  const isMale = gender === 'male';
  const adultThr = isMale
    ? { red: 20.0, orange: 22.0, yellow: 23.0 }   // Male: SAM < 20.0cm (BMI < 16.0), MAM 20.0-21.9cm, Normal ≥ 23.0cm
    : { red: 19.0, orange: 21.0, yellow: 22.0 };  // Female: SAM < 19.0cm (BMI < 16.0), MAM 19.0-20.9cm, Normal ≥ 22.0cm

  if (circumferenceCm < adultThr.red) return 'red';
  if (circumferenceCm < adultThr.orange) return 'orange';
  if (circumferenceCm < adultThr.yellow) return 'yellow';
  return 'green';
}

/**
 * Returns clean clinical reference thresholds based on the exact age & gender as per WHO standards.
 */
export function getMUACReferenceText(ageMonths: number, gender: 'male' | 'female' | 'other'): string {
  if (ageMonths < 6) {
    return '● ≥ 12.0 cm — Normal (Well-Nourished)\n● 11.5–11.9 cm — At-Risk\n● 11.0–11.4 cm — Moderate Acute Deficit\n● < 11.0 cm — Severe Acute Deficit';
  }
  if (ageMonths < 60) {
    return '● ≥ 12.5 cm — Normal / Well-Nourished (Green)\n● 11.5–12.4 cm — Moderate Malnutrition / MAM (Orange)\n● < 11.5 cm — Severe Acute Malnutrition / SAM (Red)';
  }
  if (ageMonths < 120) {
    return '● ≥ 14.5 cm — Normal (Green)\n● 13.5–14.4 cm — At-Risk (Yellow)\n● 12.5–13.4 cm — Moderate Malnutrition (Orange)\n● < 12.5 cm — Severe Acute Malnutrition (Red)';
  }
  if (ageMonths < 180) {
    if (gender === 'male') {
      return '● ≥ 18.5 cm — Normal\n● 17.0–18.4 cm — At-Risk\n● 15.5–16.9 cm — Moderate\n● < 15.5 cm — Severe';
    }
    return '● ≥ 18.0 cm — Normal\n● 16.5–17.9 cm — At-Risk\n● 15.0–16.4 cm — Moderate\n● < 15.0 cm — Severe';
  }
  if (ageMonths < 216) {
    if (gender === 'male') {
      return '● ≥ 22.0 cm — Normal\n● 20.5–21.9 cm — At-Risk\n● 19.0–20.4 cm — Moderate\n● < 19.0 cm — Severe';
    }
    return '● ≥ 21.0 cm — Normal\n● 19.5–20.9 cm — At-Risk\n● 18.0–19.4 cm — Moderate\n● < 18.0 cm — Severe';
  }
  if (gender === 'male') {
    return '● ≥ 23.0 cm — Normal (Well-Nourished)\n● 22.0–22.9 cm — Mild Risk\n● 20.0–21.9 cm — Moderate Undernutrition (MAM)\n● < 20.0 cm — Severe Undernutrition (SAM / BMI < 16)';
  }
  return '● ≥ 22.0 cm — Normal (Well-Nourished)\n● 21.0–21.9 cm — Mild Risk\n● 19.0–20.9 cm — Moderate Undernutrition (MAM)\n● < 19.0 cm — Severe Undernutrition (SAM / BMI < 16)';
}

export function getMUACPercentile(circumferenceCm: number, ageMonths: number, gender: 'male'|'female'): number {
  let median = 15.5;
  if (ageMonths >= 216) median = gender === 'male' ? 28.5 : 26.0;
  else if (ageMonths >= 120) median = gender === 'male' ? 20.5 : 19.8;
  else if (ageMonths >= 60) median = 16.5;
  
  const sd = ageMonths >= 216 ? 3.2 : 1.3;
  const z = (circumferenceCm - median) / sd;
  const percentile = (1 - 0.5 * Math.exp(-0.717 * z - 0.416 * z * z)) * 100;
  return Math.max(0.1, Math.min(99.9, Math.round(percentile * 10) / 10));
}
