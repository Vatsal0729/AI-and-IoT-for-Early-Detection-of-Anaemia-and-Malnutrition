import { Patient, AnemiaSeverity } from '../types';
import { colors, getSeverityColor, getSeverityLabel } from '../theme/theme';

export function getNormalHbRange(patient: Patient): { min: number; max: number } {
  if (patient.ageUnit === 'months' || (patient.ageUnit === 'years' && patient.age < 5)) {
    // Children 6-59 months
    return { min: 11.0, max: 14.0 };
  } else if (patient.ageUnit === 'years' && patient.age >= 5 && patient.age < 12) {
    // Children 5-11 years
    return { min: 11.5, max: 15.5 };
  } else if (patient.ageUnit === 'years' && patient.age >= 12 && patient.age < 15) {
    // Children 12-14 years
    return { min: 12.0, max: 16.0 };
  } else if (patient.gender === 'female' && patient.age >= 15) {
    // Non-pregnant adolescent/adult females
    return { min: 12.0, max: 16.0 };
  } else {
    // Adult males (15+ years)
    return { min: 13.0, max: 17.0 };
  }
}

export function classifyAnemia(hbValue: number, patient: Patient): { severity: AnemiaSeverity; color: string; label: string; description: string } {
  let severity: AnemiaSeverity = 'no_anemia';
  
  if (patient.ageUnit === 'months' || (patient.ageUnit === 'years' && patient.age < 5)) {
    // Children 6-59 months (WHO threshold: Normal >= 11.0, Mild 10.0-10.9, Moderate 7.0-9.9, Severe < 7.0)
    if (hbValue >= 11.0) severity = 'no_anemia';
    else if (hbValue >= 10.0) severity = 'borderline_anemia';
    else if (hbValue >= 7.0) severity = 'anemia';
    else severity = 'severe_anemia';
  } else if (patient.ageUnit === 'years' && patient.age >= 5 && patient.age < 12) {
    // Children 5-11 years (Normal >= 11.5, Mild 11.0-11.4, Moderate 8.0-10.9, Severe < 8.0)
    if (hbValue >= 11.5) severity = 'no_anemia';
    else if (hbValue >= 11.0) severity = 'borderline_anemia';
    else if (hbValue >= 8.0) severity = 'anemia';
    else severity = 'severe_anemia';
  } else if (patient.ageUnit === 'years' && patient.age >= 12 && patient.age < 15) {
    // Children 12-14 years (Normal >= 12.0, Mild 11.0-11.9, Moderate 8.0-10.9, Severe < 8.0)
    if (hbValue >= 12.0) severity = 'no_anemia';
    else if (hbValue >= 11.0) severity = 'borderline_anemia';
    else if (hbValue >= 8.0) severity = 'anemia';
    else severity = 'severe_anemia';
  } else if (patient.gender === 'female' && patient.age >= 15) {
    // Females 15+ (Normal >= 12.0, Mild 11.0-11.9, Moderate 8.0-10.9, Severe < 8.0)
    if (hbValue >= 12.0) severity = 'no_anemia';
    else if (hbValue >= 11.0) severity = 'borderline_anemia';
    else if (hbValue >= 8.0) severity = 'anemia';
    else severity = 'severe_anemia';
  } else {
    // Males 15+ (Normal >= 13.0, Mild 11.0-12.9, Moderate 8.0-10.9, Severe < 8.0)
    if (hbValue >= 13.0) severity = 'no_anemia';
    else if (hbValue >= 11.0) severity = 'borderline_anemia';
    else if (hbValue >= 8.0) severity = 'anemia';
    else severity = 'severe_anemia';
  }

  const color = getSeverityColor(severity);
  const label = getSeverityLabel(severity);

  let description = 'Hemoglobin levels are healthy and within the normal physiological range.';
  if (severity === 'borderline_anemia') {
    description = 'Hemoglobin is slightly below the optimal range. Dietary optimization and prophylactic supplementation recommended.';
  } else if (severity === 'anemia') {
    description = 'Noticeable hemoglobin reduction. Requires oral Iron-Folic Acid (IFA) therapeutic supplementation and fortified diet.';
  } else if (severity === 'severe_anemia') {
    description = 'Critically low hemoglobin level. Urgent clinical referral required for physician evaluation.';
  }

  return { severity, color, label, description };
}

export function getAnemiaRecommendations(severity: AnemiaSeverity, patient: Patient): string[] {
  switch (severity) {
    case 'no_anemia':
      return [
        'Maintain a diverse, nutrient-rich diet with whole grains, pulses, and green leafy vegetables.',
        'Continue regular growth monitoring and annual deworming.',
        'Promote good hand hygiene and clean drinking water.'
      ];
    case 'borderline_anemia':
      return [
        'Increase intake of naturally iron-dense foods (Moringa leaves, Spinach, Jaggery, Lentils).',
        'Pair iron foods with Vitamin C (Amla, Lemon, Guava) to maximize intestinal absorption.',
        'Initiate prophylactic weekly Iron-Folic Acid (IFA) as per national guidelines.',
        'Schedule follow-up screening in 30 days.'
      ];
    case 'anemia':
      return [
        'Initiate therapeutic Iron-Folic Acid (IFA) syrup/tablet supplementation immediately.',
        'Do not consume tea, coffee, or calcium-rich milk within 2 hours of iron doses.',
        'Provide daily iron-fortified meals with sprouted pulses and dark leafy greens.',
        'Follow up in 14 days to track hemoglobin response.'
      ];
    case 'severe_anemia':
      return [
        'URGENT: Refer immediately to nearest Community Health Centre or District Hospital.',
        'Requires physician evaluation for possible intravenous iron or blood transfusion.',
        'Do not delay referral for dietary measures alone.',
        'Follow up within 7 days post-treatment.'
      ];
    default:
      return [];
  }
}
