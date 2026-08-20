// src/utils/mathUtils.ts
export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

export function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function movingAverage(signal: number[], windowSize: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(signal.length, i + Math.floor(windowSize / 2) + 1);
    const window = signal.slice(start, end);
    result.push(mean(window));
  }
  return result;
}

export function savitzkyGolay(signal: number[], windowSize: number = 5): number[] {
  // Simplified 3rd degree polynomial, 5-point window Savitzky-Golay filter
  if (signal.length < windowSize || windowSize !== 5) return movingAverage(signal, windowSize);
  
  const result = new Array(signal.length).fill(0);
  const coeffs = [-3, 12, 17, 12, -3];
  const norm = 35;
  
  for (let i = 0; i < signal.length; i++) {
    if (i < 2 || i > signal.length - 3) {
      result[i] = signal[i];
    } else {
      let sum = 0;
      for (let j = -2; j <= 2; j++) {
        sum += signal[i + j] * coeffs[j + 2];
      }
      result[i] = sum / norm;
    }
  }
  return result;
}

export function calculateSQI(signal: number[]): number {
  // Signal Quality Index based on skewness and kurtosis
  if (signal.length < 4) return 0;
  
  const m = mean(signal);
  const sd = standardDeviation(signal);
  if (sd === 0) return 0;
  
  let skewnessSum = 0;
  let kurtosisSum = 0;
  
  for (const val of signal) {
    const diff = (val - m) / sd;
    skewnessSum += Math.pow(diff, 3);
    kurtosisSum += Math.pow(diff, 4);
  }
  
  const skewness = skewnessSum / signal.length;
  const kurtosis = kurtosisSum / signal.length;
  
  // Ideal PPG has skewness around 0.5-1.5 and kurtosis around 2.5-4.5
  const skewScore = Math.max(0, 1 - Math.abs(skewness - 1.0) / 2.0);
  const kurtScore = Math.max(0, 1 - Math.abs(kurtosis - 3.5) / 4.0);
  
  return (skewScore * 0.4 + kurtScore * 0.6) * 100;
}

export function detrend(signal: number[]): number[] {
  const n = signal.length;
  if (n < 2) return signal;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += signal[i];
    sumXY += i * signal[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return signal.map((val, i) => val - (slope * i + intercept));
}

export function normalize(signal: number[]): number[] {
  if (signal.length === 0) return [];
  const min = Math.min(...signal);
  const max = Math.max(...signal);
  if (max === min) return signal.map(() => 0.5);
  return signal.map(val => (val - min) / (max - min));
}

export function rmsValue(signal: number[]): number {
  if (signal.length === 0) return 0;
  const sqSum = signal.reduce((sum, val) => sum + val * val, 0);
  return Math.sqrt(sqSum / signal.length);
}

export function butterworthBandpass(signal: number[], lowCut: number, highCut: number, sampleRate: number, order: number = 2): number[] {
  if (signal.length === 0) return [];
  const nyquist = sampleRate / 2;
  const low = lowCut / nyquist;
  const high = highCut / nyquist;
  
  const forwardFilter = (data: number[]) => {
    let y = new Array(data.length).fill(0);
    let alphaLow = (2 * Math.PI * lowCut) / sampleRate;
    let alphaHigh = (2 * Math.PI * highCut) / sampleRate;
    
    let stateLow = data[0];
    let stateHigh = data[0];
    
    for(let i = 0; i < data.length; i++) {
        stateLow += alphaLow * (data[i] - stateLow);
        stateHigh += alphaHigh * (stateLow - stateHigh);
        y[i] = stateLow - stateHigh;
    }
    return y;
  };
  
  const forward = forwardFilter(signal);
  const reversed = forward.reverse();
  const backward = forwardFilter(reversed);
  return backward.reverse();
}

export function findPeaks(signal: number[], minDistance: number, minHeight: number = -Infinity): number[] {
  const peaks: number[] = [];
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] >= minHeight) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
        peaks.push(i);
      } else if (signal[i] > signal[peaks[peaks.length - 1]]) {
        peaks[peaks.length - 1] = i; 
      }
    }
  }
  return peaks;
}

export function computeFFT(signal: number[], sampleRate: number): { frequencies: number[], magnitudes: number[] } {
  const n = signal.length;
  const magnitudes = new Array(Math.floor(n / 2)).fill(0);
  const frequencies = new Array(Math.floor(n / 2)).fill(0);
  
  for (let k = 0; k < magnitudes.length; k++) {
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      re += signal[t] * Math.cos(angle);
      im -= signal[t] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(re * re + im * im) / n;
    frequencies[k] = (k * sampleRate) / n;
  }
  
  return { frequencies, magnitudes };
}
