// src/clinical/mealPlanner.ts
import { Patient, AnemiaSeverity, MealPlan, MealSuggestion } from '../types';

// Evidence-based dietary recommendations derived from:
// WHO/UNICEF/USAID "Community-Based Management of Acute Malnutrition" (CMAM)
// NIN India "Dietary Guidelines for Indians" (2020)
// ICMR Nutrient Requirements & Recommended Dietary Allowances for Indians (2020)

const IRON_RICH_MEALS_MILD: MealSuggestion[] = [
  {
    name: 'Palak Chana Dal',
    nameLocal: 'पालक चना दाल',
    mealType: 'lunch',
    ingredients: [
      { name: 'Spinach (Palak)', quantity: '100g', costINR: 5 },
      { name: 'Bengal Gram (Chana Dal)', quantity: '60g', costINR: 7 },
      { name: 'Tomato', quantity: '1 medium', costINR: 3 },
    ],
    prepTimeMin: 30,
    nutritionHighlights: ['Iron 6.8 mg', 'Protein 14g', 'Folic Acid 180 µg'],
    costINR: 15,
    instructions: 'Pressure-cook dal. Sauté chopped spinach with tomato, turmeric, and cumin. Mix with dal. Serve with lemon squeeze to enhance iron absorption.',
    ironContentMg: 6.8,
  },
  {
    name: 'Bajra Roti with Methi Sabzi',
    nameLocal: 'बाजरा रोटी मेथी सब्ज़ी',
    mealType: 'dinner',
    ingredients: [
      { name: 'Pearl Millet Flour (Bajra)', quantity: '80g', costINR: 4 },
      { name: 'Fenugreek Leaves (Methi)', quantity: '100g', costINR: 5 },
      { name: 'Mustard Oil', quantity: '5ml', costINR: 1 },
    ],
    prepTimeMin: 25,
    nutritionHighlights: ['Iron 7.8 mg', 'Calcium 190mg', 'Folate 52 µg'],
    costINR: 10,
    instructions: 'Knead bajra flour into stiff dough. Roll thick rotis and cook on cast-iron tawa. Stir-fry methi with garlic and cumin. Pair with a glass of lassi.',
    ironContentMg: 7.8,
  },
  {
    name: 'Moong Dal Cheela with Amla Chutney',
    nameLocal: 'मूंग दाल चीला',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Yellow Moong Dal', quantity: '60g', costINR: 7 },
      { name: 'Spinach', quantity: '30g', costINR: 2 },
      { name: 'Amla (Indian Gooseberry)', quantity: '2 units', costINR: 3 },
    ],
    prepTimeMin: 20,
    nutritionHighlights: ['Iron 4.2 mg', 'Vitamin C 120 mg', 'Protein 12g'],
    costINR: 12,
    instructions: 'Soak dal for 2 hours. Grind with green chilli and ginger. Add spinach. Pour on hot tawa and cook like a pancake. Serve with fresh amla chutney for Vitamin C absorption boost.',
    ironContentMg: 4.2,
  },
  {
    name: 'Horsegram Rasam',
    nameLocal: 'Kulthi Dal Soup',
    mealType: 'dinner',
    ingredients: [
      { name: 'Horse Gram (Kulthi)', quantity: '60g', costINR: 6 },
      { name: 'Tamarind', quantity: '10g', costINR: 2 },
      { name: 'Curry Leaves', quantity: '10 leaves', costINR: 1 },
    ],
    prepTimeMin: 40,
    nutritionHighlights: ['Iron 6.8 mg', 'Folate 34 µg', 'Protein 22g'],
    costINR: 9,
    instructions: 'Pressure-cook kulthi. Extract cooking water. Add tamarind extract, pepper, curry leaves and boil 10 min. Rich in bioavailable non-heme iron.',
    ironContentMg: 6.8,
  },
  {
    name: 'Ragi Porridge with Jaggery',
    nameLocal: 'रागी की खीर',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Finger Millet Flour (Ragi)', quantity: '60g', costINR: 4 },
      { name: 'Jaggery (Gud)', quantity: '20g', costINR: 2 },
      { name: 'Milk or Water', quantity: '250ml', costINR: 5 },
    ],
    prepTimeMin: 10,
    nutritionHighlights: ['Calcium 210mg', 'Iron 3.6 mg', 'Energy 240 kcal'],
    costINR: 11,
    instructions: 'Dissolve ragi flour in cold water/milk. Cook stirring continuously until thick. Sweeten with jaggery. Ideal for infants 6 months+. Provides calcium and iron together.',
    ironContentMg: 3.6,
  },
  {
    name: 'Beetroot & Peanut Salad',
    nameLocal: 'चुकंदर मूंगफली सलाद',
    mealType: 'snack',
    ingredients: [
      { name: 'Beetroot', quantity: '100g', costINR: 5 },
      { name: 'Roasted Peanuts', quantity: '30g', costINR: 4 },
      { name: 'Lemon', quantity: '½ unit', costINR: 2 },
    ],
    prepTimeMin: 10,
    nutritionHighlights: ['Iron 1.8 mg', 'Folate 109 µg', 'Vitamin C 8 mg'],
    costINR: 11,
    instructions: 'Grate or dice cooked beetroot. Toss with peanuts and lime juice. Beetroot folate supports red blood cell production. Vitamin C enhances iron absorption.',
    ironContentMg: 1.8,
  },
];

const IRON_RICH_MEALS_SEVERE: MealSuggestion[] = [
  {
    name: 'Ready-to-Use Therapeutic Food (RUTF)',
    nameLocal: 'पोषण पुनर्वास दलिया',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Peanut Paste', quantity: '92g', costINR: 20 },
      { name: 'Skimmed Milk Powder', quantity: '25g', costINR: 15 },
      { name: 'Sugar', quantity: '25g', costINR: 3 },
      { name: 'Vegetable Oil', quantity: '25ml', costINR: 5 },
    ],
    prepTimeMin: 5,
    nutritionHighlights: ['Iron 10 mg', 'Energy 520 kcal', 'Protein 13g'],
    costINR: 43,
    instructions: 'RUTF (Ready-to-Use Therapeutic Food) per WHO/UNICEF protocol for SAM/MAM. Patient should consume 200 kcal/kg/day. No water mixing required. Seek NRC referral if not improving in 48 hours.',
    ironContentMg: 10.0,
  },
  {
    name: 'High-Energy Fortified Khichdi',
    nameLocal: 'घी मूंगदाल खिचड़ी',
    mealType: 'lunch',
    ingredients: [
      { name: 'Rice', quantity: '50g', costINR: 4 },
      { name: 'Moong Dal', quantity: '50g', costINR: 6 },
      { name: 'Ghee', quantity: '15g', costINR: 8 },
      { name: 'Moringa Leaf Powder', quantity: '5g', costINR: 3 },
    ],
    prepTimeMin: 30,
    nutritionHighlights: ['Iron 4.5 mg', 'Energy 350 kcal', 'Protein 11g'],
    costINR: 21,
    instructions: 'Cook soft khichdi. Add liberal ghee to increase calorie density. Stir in moringa powder (one of the highest iron sources, 28mg/100g). Serve warm 5× per day in small portions.',
    ironContentMg: 4.5,
  },
  {
    name: 'Sattu Fortified Drink',
    nameLocal: 'सत्तू का घोल',
    mealType: 'snack',
    ingredients: [
      { name: 'Roasted Chana Flour (Sattu)', quantity: '50g', costINR: 5 },
      { name: 'Jaggery', quantity: '15g', costINR: 2 },
      { name: 'Lemon Juice', quantity: '1 tbsp', costINR: 1 },
    ],
    prepTimeMin: 5,
    nutritionHighlights: ['Iron 4.7 mg', 'Protein 10g', 'Energy 180 kcal'],
    costINR: 8,
    instructions: 'Mix sattu in water with jaggery and lemon. Stir well. Give 2× daily. High protein + iron + Vitamin C combination maximises Hb rebuilding. Cheap, shelf-stable, ideal for field use.',
    ironContentMg: 4.7,
  },
];

export function generateMealPlan(patient: Patient, severity: AnemiaSeverity, region: string): MealPlan {
  const ageMonths = patient.ageUnit === 'months' ? patient.age : patient.age * 12;
  const isSevere = severity === 'severe_anemia' || severity === 'anemia';
  
  const pool = isSevere ? IRON_RICH_MEALS_SEVERE : IRON_RICH_MEALS_MILD;
  
  // Select 3 meals covering different meal types
  const breakfast = pool.find(m => m.mealType === 'breakfast') || pool[0];
  const lunch = pool.find(m => m.mealType === 'lunch') || pool[1];
  const dinner = pool.find(m => m.mealType === 'dinner') || pool[2];
  const snack = pool.find(m => m.mealType === 'snack');
  
  let selected = [breakfast, lunch, dinner];
  if (snack && selected.length < 4) selected.push(snack);

  // Age-appropriate modifications
  const adjustedMeals = selected.map(meal => {
    const m = { ...meal };
    if (ageMonths < 6) {
      m.instructions = 'EXCLUSIVE BREASTFEEDING only for infants under 6 months. This plan is for the lactating mother.';
    } else if (ageMonths < 12) {
      m.name = `Pureed ${m.name}`;
      m.instructions = `Mash into smooth puree. No salt. No honey. Small spoon feeds. ${m.instructions}`;
      m.costINR = parseFloat((m.costINR * 0.5).toFixed(2));
    } else if (ageMonths < 24) {
      m.name = `Soft ${m.name}`;
      m.instructions = `Mash to soft lumps, cut small pieces. ${m.instructions}`;
    }
    return m;
  });

  const totalIron = adjustedMeals.reduce((sum, m) => sum + m.ironContentMg, 0);
  const targetCalories = ageMonths < 12 ? 800 : ageMonths < 60 ? 1200 : patient.age > 12 ? 2100 : 1600;

  return {
    targetCalories,
    meals: adjustedMeals,
    totalCostINR: parseFloat(adjustedMeals.reduce((s, m) => s + m.costINR, 0).toFixed(2)),
    region,
    keyNutrients: ['Iron', 'Vitamin C', 'Folic Acid', 'Protein', 'Calcium'],
  };
}

export function getDietaryAdvice(severity: AnemiaSeverity, ageMonths: number): string[] {
  const advice: string[] = [];

  if (severity === 'severe_anemia') {
    advice.push('🚨 Immediate referral to PHC or NRC required. Clinical iron supplementation mandatory.');
    advice.push('💊 IFA syrup (Ferrous Sulphate 20mg elemental iron) twice daily with meals, away from tea/coffee.');
    advice.push('🥜 Give RUTF (Plumpy\'nut/locally made peanut paste) 5–6 times daily targeting 200 kcal/kg/day.');
    advice.push('🦠 Check for concurrent infections (malaria, hookworm). Treat before supplementation.');
  } else if (severity === 'anemia') {
    advice.push('💊 Prescribe IFA tablets (Ferrous Sulphate 200mg + Folic Acid 0.5mg) once daily with lunch.');
    advice.push('🌿 Add Moringa leaf powder (1 tsp) to every cooked meal — highest natural iron at 28mg/100g.');
    advice.push('🍋 Pair all iron-rich meals with Vitamin C source (lemon juice, amla, guava) to triple absorption.');
    advice.push('🚫 Avoid tea, coffee, and milk within 1 hour of iron meals — they block absorption.');
  } else if (severity === 'borderline_anemia') {
    advice.push('🥬 Increase dark green leafy vegetables to 2 servings daily (palak, methi, amaranth).');
    advice.push('🫘 Include one serving of pulses or legumes with every main meal (chana, rajma, dal).');
    advice.push('🍋 Consume Vitamin C rich foods with meals: one amla or half lemon daily.');
    advice.push('🌾 Replace refined flour (maida) with bajra, jowar, or ragi flour for iron-rich alternatives.');
    advice.push('⚠️ Schedule follow-up Hb check in 4 weeks. Weekly IFA supplementation if borderline persists.');
  } else {
    advice.push('✅ Hemoglobin within normal range. Maintain balanced diet.');
    advice.push('🥦 Continue iron-rich diet: 1 serving green vegetables + 1 serving pulses daily.');
    advice.push('☀️ Daily sunlight exposure (15 min) for Vitamin D synthesis, which supports iron metabolism.');
    advice.push('📅 Routine Hb screening every 6 months for children, every 3 months for pregnant women.');
  }

  if (ageMonths < 24) {
    advice.push('🤱 Continue breastfeeding up to 2 years alongside complementary foods.');
  }

  return advice;
}
