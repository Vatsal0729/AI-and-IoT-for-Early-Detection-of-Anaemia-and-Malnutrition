import { Patient, AnemiaSeverity, IFADosage } from '../types';

export function calculateIFADosage(patient: Patient, severity: AnemiaSeverity): IFADosage {
  // WHO Guidelines:
  // Prophylactic (Borderline Anemia): ~2 mg/kg/day
  // Therapeutic (Anemia / Severe Anemia): 3-6 mg/kg/day (average 4 mg/kg/day)
  const PROPHYLACTIC_MG_PER_KG = 2;
  const THERAPEUTIC_MG_PER_KG = 4;
  const MAX_DAILY_DOSE = 60; // Max daily elemental iron for young children
  const SYRUP_MG_PER_5ML = 20; // Standard 20mg elemental iron per 5mL

  if (severity === 'no_anemia' || (severity as string) === 'normal') {
    return {
      elementalIronMg: 0,
      syrupMlPerDose: 0,
      frequency: 'Not Required',
      durationWeeks: 0,
      formulation: 'Dietary Maintenance'
    };
  }

  const isBorderline = severity === 'borderline_anemia' || (severity as string) === 'mild';
  const mgPerKg = isBorderline ? PROPHYLACTIC_MG_PER_KG : THERAPEUTIC_MG_PER_KG;
  let targetDailyMg = (patient.weight || 10) * mgPerKg;
  
  if (targetDailyMg > MAX_DAILY_DOSE && (patient.ageUnit === 'months' || patient.age < 5)) {
    targetDailyMg = MAX_DAILY_DOSE;
  }

  const isAdult = patient.ageUnit === 'years' && patient.age >= 12;
  
  if (isAdult) {
    // 60mg elemental iron tablets for adolescents and adults
    const tablets = Math.max(1, Math.round(targetDailyMg / 60));
    return {
      elementalIronMg: tablets * 60,
      syrupMlPerDose: tablets,
      frequency: tablets > 1 ? 'Twice daily' : 'Once daily with meals',
      durationWeeks: isBorderline ? 8 : 12,
      formulation: '60mg Elemental Iron + 500mcg Folic Acid Tablet'
    };
  }

  // Pediatric syrup calculation (20mg/5mL = 4mg/mL)
  const syrupTotalMl = (targetDailyMg / SYRUP_MG_PER_5ML) * 5;
  let frequency = 'Once daily';
  let doseMl = syrupTotalMl;

  if (syrupTotalMl > 5) {
    frequency = 'Twice daily (split dose)';
    doseMl = syrupTotalMl / 2;
  }

  return {
    elementalIronMg: Math.round(targetDailyMg),
    syrupMlPerDose: parseFloat(doseMl.toFixed(1)),
    frequency,
    durationWeeks: isBorderline ? 8 : 12,
    formulation: 'Pediatric IFA Syrup (20mg elemental iron / 5mL)'
  };
}

export function getSupplementationAdvice(dosage: IFADosage, severity: AnemiaSeverity): string[] {
  if (severity === 'no_anemia' || (severity as string) === 'normal') {
    return [
      'Encourage regular family consumption of green leafy vegetables and seasonal fruits.',
      'Ensure children receive periodic deworming every 6 months.'
    ];
  }

  return [
    `Administer ${dosage.syrupMlPerDose} ${dosage.formulation.includes('Tablet') ? 'tablet(s)' : 'mL'} ${dosage.frequency.toLowerCase()} for ${dosage.durationWeeks} weeks.`,
    'Administer with or after meals to minimize stomach discomfort.',
    'Always provide fresh citrus fruit juice (Amla, Orange, Lemon) alongside the dose to increase iron absorption.',
    'Do not take with tea, coffee, milk, or antacids within 2 hours.',
    'Stools may turn dark green or black — inform parents that this is harmless.'
  ];
}

export function calculateFollowUpDate(severity: AnemiaSeverity): string {
  let days = 30;
  if (severity === 'severe_anemia' || (severity as string) === 'severe') days = 7;
  else if (severity === 'anemia' || (severity as string) === 'moderate') days = 14;
  else if (severity === 'borderline_anemia' || (severity as string) === 'mild') days = 30;
  
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}
