// src/modules/anemia/fusionEngine.ts
import { HbEstimate } from '../../types';

export function fuseHbEstimates(ppgEstimate: HbEstimate | undefined, conjunctivaEstimate: HbEstimate | undefined): HbEstimate {
  if (!ppgEstimate && !conjunctivaEstimate) {
    return { value: 0, confidence: 0, method: 'fused', qualityWarnings: ["No data available"] };
  }
  
  if (ppgEstimate && !conjunctivaEstimate) {
    return { ...ppgEstimate, method: 'fused', confidence: ppgEstimate.confidence * 0.9 };
  }
  
  if (!ppgEstimate && conjunctivaEstimate) {
    return { ...conjunctivaEstimate, method: 'fused', confidence: conjunctivaEstimate.confidence * 0.9 };
  }
  
  const p = ppgEstimate as HbEstimate;
  const c = conjunctivaEstimate as HbEstimate;
  
  // Inverse-Variance Bayesian Fusion
  // Assume variance is inversely proportional to confidence squared
  // var = (1.05 - confidence)^2 * base_variance (empirical scaling)
  
  const baseVarPPG = 1.2;
  const baseVarConj = 1.5;
  
  const varP = Math.pow(1.05 - p.confidence, 2) * baseVarPPG;
  const varC = Math.pow(1.05 - c.confidence, 2) * baseVarConj;
  
  // Weights are inversely proportional to variance
  const weightP = 1 / varP;
  const weightC = 1 / varC;
  const sumWeights = weightP + weightC;
  
  const w1 = weightP / sumWeights;
  const w2 = weightC / sumWeights;
  
  const fusedHb = (w1 * p.value) + (w2 * c.value);
  const diff = Math.abs(p.value - c.value);
  
  const warnings = [...p.qualityWarnings, ...c.qualityWarnings];
  
  // Fused variance
  const varFused = 1 / sumWeights;
  let conf = 1.05 - Math.sqrt(varFused / Math.min(baseVarPPG, baseVarConj));
  conf = Math.max(0, Math.min(0.99, conf)); // Cap confidence
  
  if (diff > 1.8) {
    warnings.push(`High discrepancy between PPG (${p.value.toFixed(1)}) and Conjunctiva (${c.value.toFixed(1)}) estimates`);
    conf *= 0.8;
  }
  
  return {
    value: fusedHb,
    confidence: conf,
    method: 'fused',
    qualityWarnings: warnings
  };
}

export function assessFusionQuality(ppg?: HbEstimate, conj?: HbEstimate): { quality: number, warnings: string[] } {
  const dummy = fuseHbEstimates(ppg, conj);
  return {
    quality: dummy.confidence,
    warnings: dummy.qualityWarnings
  };
}
