// src/utils/colorUtils.ts
export function rgbToLab(r: number, g: number, b: number): { L: number, a: number, b: number } {
  let rN = r / 255;
  let gN = g / 255;
  let bN = b / 255;

  rN = rN > 0.04045 ? Math.pow((rN + 0.055) / 1.055, 2.4) : rN / 12.92;
  gN = gN > 0.04045 ? Math.pow((gN + 0.055) / 1.055, 2.4) : gN / 12.92;
  bN = bN > 0.04045 ? Math.pow((bN + 0.055) / 1.055, 2.4) : bN / 12.92;

  const x = (rN * 0.4124 + gN * 0.3576 + bN * 0.1805) * 100;
  const y = (rN * 0.2126 + gN * 0.7152 + bN * 0.0722) * 100;
  const z = (rN * 0.0193 + gN * 0.1192 + bN * 0.9505) * 100;

  const refX = 95.047, refY = 100.0, refZ = 108.883;
  let xL = x / refX, yL = y / refY, zL = z / refZ;

  xL = xL > 0.008856 ? Math.pow(xL, 1/3) : (7.787 * xL) + (16 / 116);
  yL = yL > 0.008856 ? Math.pow(yL, 1/3) : (7.787 * yL) + (16 / 116);
  zL = zL > 0.008856 ? Math.pow(zL, 1/3) : (7.787 * zL) + (16 / 116);

  const L = (116 * yL) - 16;
  const a = 500 * (xL - yL);
  const b_val = 200 * (yL - zL);

  return { L, a, b: b_val };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number, s: number, v: number } {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
      case gN: h = (bN - rN) / d + 2; break;
      case bN: h = (rN - gN) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

export function labToRgb(L: number, a: number, b: number): { r: number, g: number, b: number } {
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const refX = 95.047, refY = 100.0, refZ = 108.883;
  const y3 = Math.pow(y, 3), x3 = Math.pow(x, 3), z3 = Math.pow(z, 3);
  
  y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  x *= refX / 100; y *= refY / 100; z *= refZ / 100;

  let rN = x *  3.2406 + y * -1.5372 + z * -0.4986;
  let gN = x * -0.9689 + y *  1.8758 + z *  0.0415;
  let bN = x *  0.0557 + y * -0.2040 + z *  1.0570;

  rN = rN > 0.0031308 ? 1.055 * Math.pow(rN, 1/2.4) - 0.055 : 12.92 * rN;
  gN = gN > 0.0031308 ? 1.055 * Math.pow(gN, 1/2.4) - 0.055 : 12.92 * gN;
  bN = bN > 0.0031308 ? 1.055 * Math.pow(bN, 1/2.4) - 0.055 : 12.92 * bN;

  return {
    r: Math.max(0, Math.min(255, Math.round(rN * 255))),
    g: Math.max(0, Math.min(255, Math.round(gN * 255))),
    b: Math.max(0, Math.min(255, Math.round(bN * 255)))
  };
}

export function colorDistance(lab1: {L:number, a:number, b:number}, lab2: {L:number, a:number, b:number}): number {
  return Math.sqrt(Math.pow(lab1.L - lab2.L, 2) + Math.pow(lab1.a - lab2.a, 2) + Math.pow(lab1.b - lab2.b, 2));
}

export function getRednessFactor(r: number, g: number, b: number): number {
  const sum = r + g + b;
  if (sum === 0) return 0;
  return r / sum;
}

export function adjustForMelanin(lab: {L:number, a:number, b:number}, fitzpatrick: number): {L:number, a:number, b:number} {
  const lShift = (fitzpatrick - 3) * 2.5; 
  const aShift = (fitzpatrick - 3) * 1.5;
  
  if (fitzpatrick > 3) {
    return {
      L: lab.L + lShift,
      a: lab.a + aShift,
      b: lab.b
    };
  }
  return { ...lab };
}
