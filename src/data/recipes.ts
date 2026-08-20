import { MealSuggestion } from '../types';

export const NORTH_INDIA_RECIPES: MealSuggestion[] = [
  {
    name: 'Palak Chana Dal',
    nameLocal: 'Palak Chole',
    mealType: 'lunch',
    ingredients: [
      { name: 'Spinach (Palak)', quantity: '100g', costINR: 5 },
      { name: 'Bengal Gram (Chana Dal)', quantity: '50g', costINR: 6 }
    ],
    prepTimeMin: 30,
    nutritionHighlights: ['High Iron', 'High Protein', 'Folic Acid'],
    costINR: 11,
    instructions: 'Boil dal. Sauté chopped palak with mild spices. Mix with cooked dal. Simmer for 5 mins.',
    ironContentMg: 4.5
  },
  {
    name: 'Ragi Roti with Jaggery',
    nameLocal: 'Ragi ki Roti',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Ragi Flour', quantity: '100g', costINR: 5 },
      { name: 'Jaggery', quantity: '20g', costINR: 2 }
    ],
    prepTimeMin: 15,
    nutritionHighlights: ['Calcium', 'Iron', 'Energy'],
    costINR: 7,
    instructions: 'Knead ragi flour with warm water. Roll into thick rotis and cook on tawa. Serve with jaggery.',
    ironContentMg: 4.2
  },
  {
    name: 'Beetroot Amla Juice',
    mealType: 'snack',
    ingredients: [
      { name: 'Beetroot', quantity: '50g', costINR: 3 },
      { name: 'Amla (Indian Gooseberry)', quantity: '1 unit', costINR: 2 }
    ],
    prepTimeMin: 10,
    nutritionHighlights: ['Vitamin C', 'Iron Absorption'],
    costINR: 5,
    instructions: 'Blend beetroot and amla with water. Strain and serve fresh to boost iron absorption.',
    ironContentMg: 1.5
  },
  {
    name: 'Bajra Khichdi',
    mealType: 'dinner',
    ingredients: [
      { name: 'Pearl Millet (Bajra)', quantity: '50g', costINR: 3 },
      { name: 'Moong Dal', quantity: '30g', costINR: 4 },
      { name: 'Pumpkin', quantity: '50g', costINR: 2 }
    ],
    prepTimeMin: 40,
    nutritionHighlights: ['Complex Carbs', 'Iron', 'Vitamin A'],
    costINR: 9,
    instructions: 'Soak bajra overnight. Pressure cook with moong dal and pumpkin till mushy. Add mild jeera tadka.',
    ironContentMg: 5.1
  },
  {
    name: 'Date and Nut Ladoo',
    nameLocal: 'Khajoor Ladoo',
    mealType: 'snack',
    ingredients: [
      { name: 'Dates', quantity: '30g', costINR: 6 },
      { name: 'Peanuts', quantity: '20g', costINR: 3 }
    ],
    prepTimeMin: 15,
    nutritionHighlights: ['Iron', 'Healthy Fats'],
    costINR: 9,
    instructions: 'Pit and mash dates. Roast and crush peanuts. Mix and roll into small balls.',
    ironContentMg: 2.2
  },
  {
    name: 'Moong Dal Cheela',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Yellow Moong Dal', quantity: '50g', costINR: 6 },
      { name: 'Spinach (finely chopped)', quantity: '30g', costINR: 2 }
    ],
    prepTimeMin: 20,
    nutritionHighlights: ['Protein', 'Iron'],
    costINR: 8,
    instructions: 'Soak and blend moong dal. Mix with chopped spinach. Spread batter on hot tawa and cook both sides.',
    ironContentMg: 2.8
  },
  {
    name: 'Stuffed Paratha with Amaranth',
    nameLocal: 'Chaulai Paratha',
    mealType: 'lunch',
    ingredients: [
      { name: 'Wheat flour', quantity: '60g', costINR: 3 },
      { name: 'Amaranth leaves (Chaulai)', quantity: '50g', costINR: 4 }
    ],
    prepTimeMin: 25,
    nutritionHighlights: ['Dietary Fiber', 'Iron'],
    costINR: 7,
    instructions: 'Mix finely chopped amaranth leaves into wheat dough. Roll and cook on tawa with minimum oil.',
    ironContentMg: 3.5
  },
  {
    name: 'Roasted Chana Snack',
    mealType: 'snack',
    ingredients: [
      { name: 'Roasted Chana', quantity: '40g', costINR: 5 },
      { name: 'Jaggery', quantity: '15g', costINR: 2 }
    ],
    prepTimeMin: 5,
    nutritionHighlights: ['Quick Energy', 'Iron'],
    costINR: 7,
    instructions: 'Mix roasted chana with small pieces of jaggery. Eat as a mid-day snack.',
    ironContentMg: 4.0
  }
];

export const SOUTH_INDIA_RECIPES: MealSuggestion[] = [
  {
    name: 'Moringa Leaves Stir Fry',
    nameLocal: 'Murungai Keerai Poriyal',
    mealType: 'lunch',
    ingredients: [
      { name: 'Moringa Leaves', quantity: '100g', costINR: 4 },
      { name: 'Grated Coconut', quantity: '20g', costINR: 4 }
    ],
    prepTimeMin: 20,
    nutritionHighlights: ['Very High Iron', 'Vitamin C'],
    costINR: 8,
    instructions: 'Wash leaves. Sauté with mustard seeds, urad dal, and dried red chili. Garnish with coconut.',
    ironContentMg: 6.5
  },
  {
    name: 'Ragi Mudde with Dal',
    mealType: 'dinner',
    ingredients: [
      { name: 'Ragi Flour', quantity: '80g', costINR: 4 },
      { name: 'Toor Dal', quantity: '40g', costINR: 5 }
    ],
    prepTimeMin: 30,
    nutritionHighlights: ['Calcium', 'Iron', 'Protein'],
    costINR: 9,
    instructions: 'Cook ragi flour in boiling water till it forms a ball. Serve with simple toor dal.',
    ironContentMg: 4.8
  },
  {
    name: 'Horsegram Soup',
    nameLocal: 'Kollu Rasam',
    mealType: 'lunch',
    ingredients: [
      { name: 'Horsegram (Kollu)', quantity: '30g', costINR: 3 },
      { name: 'Tamarind extract', quantity: '10ml', costINR: 2 }
    ],
    prepTimeMin: 40,
    nutritionHighlights: ['Iron', 'Weight Management'],
    costINR: 5,
    instructions: 'Boil soaked horsegram. Use the water to make rasam with tamarind and mild spices.',
    ironContentMg: 2.5
  },
  {
    name: 'Banana Stem Curry',
    nameLocal: 'Vazhaithandu Poriyal',
    mealType: 'lunch',
    ingredients: [
      { name: 'Banana Stem', quantity: '100g', costINR: 5 },
      { name: 'Moong Dal', quantity: '20g', costINR: 3 }
    ],
    prepTimeMin: 25,
    nutritionHighlights: ['Fiber', 'Iron'],
    costINR: 8,
    instructions: 'Chop banana stem, remove fibers. Cook with moong dal and temper with mustard and curry leaves.',
    ironContentMg: 1.8
  },
  {
    name: 'Curry Leaves Powder Rice',
    nameLocal: 'Karuveppilai Sadam',
    mealType: 'lunch',
    ingredients: [
      { name: 'Rice', quantity: '80g', costINR: 5 },
      { name: 'Curry leaves powder', quantity: '15g', costINR: 3 }
    ],
    prepTimeMin: 20,
    nutritionHighlights: ['Iron', 'Antioxidants'],
    costINR: 8,
    instructions: 'Mix pre-cooked rice with dry roasted curry leaves and lentil powder. Add a drop of ghee.',
    ironContentMg: 3.2
  },
  {
    name: 'Amaranth Dal Mash',
    nameLocal: 'Thotakura Pappu',
    mealType: 'dinner',
    ingredients: [
      { name: 'Amaranth leaves', quantity: '60g', costINR: 4 },
      { name: 'Toor Dal', quantity: '40g', costINR: 5 }
    ],
    prepTimeMin: 30,
    nutritionHighlights: ['Protein', 'Iron'],
    costINR: 9,
    instructions: 'Pressure cook dal and amaranth leaves together. Mash well and temper with garlic and cumin.',
    ironContentMg: 4.1
  },
  {
    name: 'Jaggery Poha',
    nameLocal: 'Vella Aval',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Flattened Rice (Poha)', quantity: '50g', costINR: 4 },
      { name: 'Jaggery', quantity: '20g', costINR: 2 }
    ],
    prepTimeMin: 15,
    nutritionHighlights: ['Iron', 'Carbs'],
    costINR: 6,
    instructions: 'Wash poha. Melt jaggery in little water, mix with poha and cardamom powder.',
    ironContentMg: 3.5
  },
  {
    name: 'Moringa Pod Soup',
    nameLocal: 'Murungakkai Soup',
    mealType: 'snack',
    ingredients: [
      { name: 'Moringa Pods (Drumsticks)', quantity: '2 units', costINR: 5 },
      { name: 'Tomato', quantity: '1 unit', costINR: 3 }
    ],
    prepTimeMin: 25,
    nutritionHighlights: ['Minerals', 'Immunity'],
    costINR: 8,
    instructions: 'Boil chopped moringa pods with tomato and garlic. Mash, strain, and serve hot.',
    ironContentMg: 2.0
  }
];

export const EAST_AFRICA_RECIPES: MealSuggestion[] = [
  {
    name: 'Millet Porridge with Baobab',
    nameLocal: 'Uji wa Wimbi',
    mealType: 'breakfast',
    ingredients: [
      { name: 'Finger Millet Flour', quantity: '50g', costINR: 5 },
      { name: 'Baobab Powder', quantity: '10g', costINR: 4 }
    ],
    prepTimeMin: 15,
    nutritionHighlights: ['Iron', 'Vitamin C'],
    costINR: 9,
    instructions: 'Cook millet flour in water until thick. Stir in baobab powder for a vitamin C boost.',
    ironContentMg: 3.8
  },
  {
    name: 'Cowpeas and Amaranth Leaves',
    nameLocal: 'Kunde na Mchicha',
    mealType: 'lunch',
    ingredients: [
      { name: 'Cowpeas', quantity: '60g', costINR: 6 },
      { name: 'Amaranth leaves', quantity: '80g', costINR: 4 }
    ],
    prepTimeMin: 45,
    nutritionHighlights: ['High Protein', 'High Iron'],
    costINR: 10,
    instructions: 'Boil cowpeas until soft. Sauté amaranth leaves with onions and mix with cowpeas.',
    ironContentMg: 5.5
  },
  {
    name: 'Dried Fish Stew',
    nameLocal: 'Dagaa Stew',
    mealType: 'dinner',
    ingredients: [
      { name: 'Dried Fish (Dagaa)', quantity: '30g', costINR: 8 },
      { name: 'Tomatoes', quantity: '50g', costINR: 2 }
    ],
    prepTimeMin: 30,
    nutritionHighlights: ['Calcium', 'Iron', 'Omega-3'],
    costINR: 10,
    instructions: 'Wash dried fish well. Cook in a tomato and onion base until soft.',
    ironContentMg: 4.2
  },
  {
    name: 'Sweet Potato and Groundnut Mash',
    mealType: 'lunch',
    ingredients: [
      { name: 'Orange Sweet Potato', quantity: '100g', costINR: 5 },
      { name: 'Groundnut Paste', quantity: '20g', costINR: 5 }
    ],
    prepTimeMin: 35,
    nutritionHighlights: ['Vitamin A', 'Energy'],
    costINR: 10,
    instructions: 'Boil sweet potatoes until soft. Mash and mix with groundnut paste and a little water.',
    ironContentMg: 2.1
  },
  {
    name: 'Sukuma Wiki (Collard Greens)',
    mealType: 'dinner',
    ingredients: [
      { name: 'Collard Greens', quantity: '100g', costINR: 4 },
      { name: 'Onion', quantity: '20g', costINR: 2 }
    ],
    prepTimeMin: 20,
    nutritionHighlights: ['Iron', 'Fiber'],
    costINR: 6,
    instructions: 'Chop greens finely. Sauté with onions and a pinch of salt until tender.',
    ironContentMg: 3.0
  },
  {
    name: 'Moringa and Bean Soup',
    mealType: 'dinner',
    ingredients: [
      { name: 'Kidney Beans', quantity: '50g', costINR: 6 },
      { name: 'Moringa Powder', quantity: '5g', costINR: 3 }
    ],
    prepTimeMin: 60,
    nutritionHighlights: ['Iron', 'Protein'],
    costINR: 9,
    instructions: 'Boil beans until soft. Stir in moringa powder right before serving to preserve nutrients.',
    ironContentMg: 4.5
  }
];
