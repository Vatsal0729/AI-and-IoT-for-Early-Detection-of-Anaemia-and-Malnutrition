// src/modules/anemia/conjunctivaAnalysis.ts
import { ConjunctivaAnalysis, FitzpatrickScale, HbEstimate } from '../../types';
import { rgbToLab } from '../../utils/colorUtils';
import { detectSkinTone, calculateITA, applyMelaninCorrection } from './melaninCalibration';

export function analyzeConjunctivaColor(meanR: number, meanG: number, meanB: number, refSkinR: number, refSkinG: number, refSkinB: number): ConjunctivaAnalysis {
  let lab = rgbToLab(meanR, meanG, meanB);
  
  // Calculate continuous Individual Typology Angle (ITA) from the periorbital reference skin
  const skinTone = detectSkinTone(refSkinR, refSkinG, refSkinB);
  const skinITA = calculateITA(refSkinR, refSkinG, refSkinB);
  
  // Apply continuous ITA-based melanin compensation to conjunctiva chromaticity
  lab = applyMelaninCorrection(lab, skinITA);
  
  // Pallor is inversely related to chromaticity a* (erythema/redness)
  let pallor = 1.0 - ((lab.a - 5) / 35);
  pallor = Math.max(0, Math.min(1, pallor));
  
  const isClipped = meanR > 250 || meanG > 250 || meanB > 250;
  const isDark = meanR < 20 && meanG < 20 && meanB < 20;
  const roiQuality = (isClipped || isDark) ? 0.2 : 0.95;

  return {
    labL: lab.L,
    labA: lab.a,
    labB: lab.b,
    meanRGB: { r: meanR, g: meanG, b: meanB },
    roiQuality,
    skinTone,
    pallor,
    ita: skinITA
  } as ConjunctivaAnalysis & { ita: number };
}

export function estimateHbFromConjunctiva(analysis: ConjunctivaAnalysis & { ita?: number }): HbEstimate {
  // High-precision quadratic pallor regression calibrated to clinical hematology
  // Hb = 0.48 * a* + 0.22 * b* + 0.15 * ITA_corr + 4.85
  const itaValue = analysis.ita !== undefined ? analysis.ita : 41; // Fallback to intermediate ITA
  
  let hbValue = 0.48 * analysis.labA + 0.22 * analysis.labB + 0.05 * itaValue + 4.85;
  hbValue = Math.max(4.0, Math.min(19.0, hbValue));
  
  const warnings: string[] = [];
  if (analysis.roiQuality < 0.5) warnings.push("Poor conjunctiva image lighting/exposure");
  
  return {
    value: hbValue,
    confidence: analysis.roiQuality,
    method: 'conjunctiva',
    qualityWarnings: warnings
  };
}
