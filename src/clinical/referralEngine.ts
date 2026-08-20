import { AnemiaResult, NutritionResult } from '../types';

export function assessReferralNeed(
  anemiaResult?: AnemiaResult, 
  nutritionResult?: NutritionResult
): { needed: boolean, urgency: 'routine'|'urgent'|'emergency', reasons: string[], facility: string } {
  let reasons: string[] = [];
  let urgency: 'routine' | 'urgent' | 'emergency' | null = null;
  let facility = 'Local Health Center';

  // Check Anemia criteria
  if (anemiaResult) {
    const hb = anemiaResult.hbEstimate.value;
    if (hb < 5.0) {
      urgency = 'emergency';
      reasons.push('Critically low hemoglobin (<5.0 g/dL)');
      facility = 'District Hospital (Blood Transfusion Capable)';
    } else if (hb < 7.0) {
      if (urgency !== 'emergency') urgency = 'urgent';
      reasons.push('Severe anemia (<7.0 g/dL)');
    } else if (hb < 10.0) {
      if (!urgency) urgency = 'routine';
      reasons.push('Moderate anemia requiring clinical evaluation');
    }
  }

  // Check Nutrition criteria
  if (nutritionResult && nutritionResult.muac) {
    const muac = nutritionResult.muac.circumferenceCm;
    if (muac < 11.5) {
      if (nutritionResult.emaciation && nutritionResult.emaciation.classification === 'severe_wasting') {
        urgency = 'emergency';
        reasons.push('Severe Acute Malnutrition (MUAC < 11.5cm) with severe wasting');
        facility = 'Nutritional Rehabilitation Center (NRC) or District Hospital';
      } else {
        if (urgency !== 'emergency') urgency = 'urgent';
        reasons.push('Severe Acute Malnutrition (MUAC < 11.5cm)');
        facility = 'Nutritional Rehabilitation Center (NRC)';
      }
    } else if (muac >= 11.5 && muac < 12.5) {
      if (!urgency) urgency = 'routine';
      reasons.push('Moderate Acute Malnutrition (11.5cm <= MUAC < 12.5cm)');
    }
  }

  return {
    needed: urgency !== null,
    urgency: urgency || 'routine',
    reasons,
    facility
  };
}

export function getReferralInstructions(urgency: string): string[] {
  switch (urgency) {
    case 'emergency':
      return [
        'Call for an ambulance or arrange immediate private transport.',
        'Keep the patient warm and comfortable during transit.',
        'Do NOT give oral food or fluids if the patient is unconscious.',
        'Hand over the Health Passport QR code to the receiving facility.'
      ];
    case 'urgent':
      return [
        'Advise the family to travel to the facility today.',
        'Provide a written referral slip or printed Health Passport.',
        'Ensure the family understands the severe risk of delay.',
        'Follow up via phone tomorrow to confirm arrival.'
      ];
    case 'routine':
      return [
        'Advise the family to visit the local health center within the week.',
        'Provide dietary advice and supplementation to start immediately.',
        'Schedule a community follow-up in 14 days.'
      ];
    default:
      return [];
  }
}

export function getTransportGuidelines(urgency: string): string {
  if (urgency === 'emergency') return 'Immediate transport required (within 1-2 hours).';
  if (urgency === 'urgent') return 'Transport required today (within 24 hours).';
  return 'Patient should visit the facility within 3-7 days.';
}
