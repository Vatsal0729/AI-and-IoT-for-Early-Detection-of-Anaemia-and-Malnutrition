// src/modules/calibration/ambientLight.ts
export function estimateAmbientLight(imageR: number, imageG: number, imageB: number, exposure?: number): { lux: number, isLowLight: boolean } {
  const luminance = 0.299 * imageR + 0.587 * imageG + 0.114 * imageB;
  const expFactor = exposure ? (30 / Math.max(exposure, 1)) : 1;
  const estimatedLux = luminance * expFactor * 2; 
  
  return {
    lux: estimatedLux,
    isLowLight: estimatedLux < 50
  };
}

export function getExposureCompensation(lux: number): { rGain: number, gGain: number, bGain: number } {
  const targetLux = 200;
  if (lux <= 0) return { rGain: 1, gGain: 1, bGain: 1 };
  
  const baseGain = targetLux / lux;
  const safeGain = Math.min(baseGain, 3.0);
  
  return {
    rGain: safeGain,
    gGain: safeGain,
    bGain: safeGain
  };
}

export function isAdequateLighting(lux: number): boolean {
  return lux >= 50;
}
