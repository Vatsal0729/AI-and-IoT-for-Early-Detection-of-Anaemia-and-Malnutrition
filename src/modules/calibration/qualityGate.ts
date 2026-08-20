// src/modules/calibration/qualityGate.ts
import { PPGSignal, QualityCheckResult, QualityIssue } from '../../types';

export function validatePPGSignal(signal: PPGSignal): QualityCheckResult {
  const issues: QualityIssue[] = [];
  
  if (signal.durationMs < 3000) {
    issues.push({ type: 'motion', severity: 'error', message: 'Signal duration too short (minimum 3s)' });
  }
  
  const saturatedFrames = signal.rawData.filter(d => d.red > 250 || d.green > 250).length;
  if (saturatedFrames > signal.rawData.length * 0.1) {
    issues.push({ type: 'overexposed', severity: 'error', message: 'Sensor saturated - press more lightly' });
  }
  
  const passed = issues.filter(i => i.severity === 'error').length === 0;
  
  return {
    passed,
    score: passed ? 0.9 : 0.2,
    issues
  };
}

export function validateConjunctivaImage(meanR: number, meanG: number, meanB: number): QualityCheckResult {
  const issues: QualityIssue[] = [];
  
  if (meanR < 20 && meanG < 20 && meanB < 20) {
    issues.push({ type: 'low_light', severity: 'error', message: 'Image is too dark' });
  }
  
  if (meanR > 245 && meanG > 245 && meanB > 245) {
    issues.push({ type: 'overexposed', severity: 'error', message: 'Image is overexposed' });
  }
  
  if (meanR < meanG || meanR < meanB) {
    issues.push({ type: 'poor_roi', severity: 'error', message: 'No conjunctiva tissue detected in ROI' });
  }
  
  const passed = issues.filter(i => i.severity === 'error').length === 0;
  
  return {
    passed,
    score: passed ? 1.0 : 0.0,
    issues
  };
}

export function validateMUACImage(hasReferenceObject: boolean, armDetected: boolean): QualityCheckResult {
  const issues: QualityIssue[] = [];
  
  if (!hasReferenceObject) {
    issues.push({ type: 'poor_roi', severity: 'error', message: 'Reference object not detected in frame' });
  }
  
  if (!armDetected) {
    issues.push({ type: 'poor_roi', severity: 'error', message: 'Patient arm not properly detected' });
  }
  
  const passed = issues.filter(i => i.severity === 'error').length === 0;
  
  return {
    passed,
    score: passed ? 1.0 : 0.0,
    issues
  };
}

export function getOverallQuality(checks: QualityCheckResult[]): { passed: boolean, score: number } {
  let passed = true;
  let totalScore = 0;
  
  for (const check of checks) {
    if (!check.passed) passed = false;
    totalScore += check.score;
  }
  
  return {
    passed,
    score: checks.length > 0 ? totalScore / checks.length : 0
  };
}
