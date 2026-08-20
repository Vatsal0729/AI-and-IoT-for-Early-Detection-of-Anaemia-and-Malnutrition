// src/modules/anemia/melaninCalibration.ts
import { FitzpatrickScale } from '../../types';
import { rgbToLab } from '../../utils/colorUtils';

export function calculateITA(r: number, g: number, b: number): number {
  const lab = rgbToLab(r, g, b);
  // ITA formula: arctan((L* - 50) / b*) * (180 / PI)
  let ita = Math.atan2(lab.L - 50, lab.b) * (180 / Math.PI);
  // Normalize bounds
  if (ita > 90) ita = 90;
  if (ita < -90) ita = -90;
  return ita;
}

export function detectSkinTone(periorbitalR: number, periorbitalG: number, periorbitalB: number): FitzpatrickScale {
  const ita = calculateITA(periorbitalR, periorbitalG, periorbitalB);
  
  if (ita > 55) return 1;
  if (ita > 41) return 2;
  if (ita > 28) return 3;
  if (ita > 10) return 4;
  if (ita > -30) return 5;
  return 6;
}

export function getMelaninCorrectionFactors(ita: number): { lShift: number, aShift: number, bShift: number } {
  // Continuous non-linear compensation for periorbital melanin pigmentation
  // Base reference is ITA = 41 (Type 2/3 boundary)
  const baseITA = 41;
  const deltaITA = baseITA - ita;
  
  // Melanin absorbs light and shifts chromaticity towards yellow/brown (lower L*, higher b*)
  // We apply an inverse shift proportional to the melanin index
  const lShift = deltaITA > 0 ? deltaITA * 0.45 : 0;
  const aShift = deltaITA > 0 ? deltaITA * 0.25 : 0;
  const bShift = deltaITA > 0 ? -(deltaITA * 0.15) : 0;
  
  return { lShift, aShift, bShift };
}

export function applyMelaninCorrection(lab: {L:number,a:number,b:number}, ita: number): {L:number,a:number,b:number} {
  const shifts = getMelaninCorrectionFactors(ita);
  return {
    L: Math.max(0, Math.min(100, lab.L + shifts.lShift)),
    a: Math.max(-128, Math.min(127, lab.a + shifts.aShift)),
    b: Math.max(-128, Math.min(127, lab.b + shifts.bShift))
  };
}
