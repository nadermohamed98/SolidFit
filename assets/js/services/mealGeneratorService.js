/**
 * Meal Generator Service
 * Generates a deterministic daily meal plan from nutrition goals, food preferences, and food catalog data.
 */

import settingsRepository from '../repositories/settingsRepository.js';
import foodPreferenceRepository from '../repositories/foodPreferenceRepository.js';

const INDEX_URL = './assets/data/catalog/foods/index.json';
const FOODS_BASE_URL = './assets/data/catalog/foods/';
const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snack'];

const catalogCache = {
  categories: null,
  foodsByCategory: new Map()
};

const MEAL_CONFIG = {
  breakfast: {
    slots: [
      { role: 'protein', groups: ['proteins', 'dairy'] },
      { role: 'carb', groups: ['carbs', 'fruits'] },
      { role: 'support', groups: ['fruits', 'healthyFats', 'dairy'] }
    ]
  },
  lunch: {
    slots: [
      { role: 'protein', groups: ['proteins', 'dairy'] },
      { role: 'carb', groups: ['carbs'] },
      { role: 'support', groups: ['vegetables', 'healthyFats'] }
    ]
  },
  dinner: {
    slots: [
      { role: 'protein', groups: ['proteins', 'dairy'] },
      { role: 'carb', groups: ['carbs', 'vegetables'] },
      { role: 'support', groups: ['vegetables', 'healthyFats'] }
    ]
  },
  snack: {
    slots: [
      { role: 'protein', groups: ['proteins', 'dairy'] },
      { role: 'carb', groups: ['fruits', 'carbs'] },
      { role: 'support', groups: ['healthyFats', 'dairy', 'fruits'] }
    ]
  }
};

function round(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function getPreferenceRank(preference) {
  if (preference === 'love') return 0;
  if (preference === 'okay') return 1;
  if (preference === 'dislike') return 99;
  return 2;
}

function matchesMealType(food, mealKey) {
  const mealTypes = Array.isArray(food.mealTypes) ? food.mealTypes : [];
  if (mealTypes.includes(mealKey)) return true;
  if (mealKey === 'snack' && (mealTypes.includes('preWorkout') || mealTypes.includes('postWorkout'))) {
    return true;
  }
  return false;
}

function getMacroValue(food, key, grams) {
  return (Number(food[key]) || 0) * (grams / 100);
}

function getItemTotals(food, grams) {
  return {
    calories: round(getMacroValue(food, 'calories', grams)),
    protein: round(getMacroValue(food, 'protein', grams)),
    carbs: round(getMacroValue(food, 'carbs', grams)),
    fat: round(getMacroValue(food, 'fat', grams))
  };
}

function getBaseGrams(food, mealKey, role) {
  if (food.groupId === 'healthyFats') return 25;
  if (food.groupId === 'vegetables') return mealKey === 'snack' ? 100 : 150;
  if (food.groupId === 'fruits') return 150;
  if (food.groupId === 'dairy') return role === 'protein' ? 200 : 170;
  if (food.groupId === 'carbs') {
    if (mealKey === 'breakfast') return 120;
    if (mealKey === 'snack') return 100;
    return 180;
  }
  if (food.groupId === 'proteins') {
    if (mealKey === 'snack') return 120;
    if (mealKey === 'breakfast') return 140;
    return 180;
  }
  return 100;
}

function getMinGrams(food) {
  if (food.groupId === 'healthyFats') return 10;
  if (food.groupId === 'vegetables') return 80;
  if (food.groupId === 'fruits') return 80;
  if (food.groupId === 'dairy') return 100;
  if (food.groupId === 'carbs') return 60;
  return 80;
}

function getMaxGrams(food) {
  if (food.groupId === 'healthyFats') return 60;
  if (food.groupId === 'vegetables') return 250;
  if (food.groupId === 'fruits') return 250;
  if (food.groupId === 'dairy') return 300;
  if (food.groupId === 'carbs') return 300;
  return 320;
}

function getAdjustmentStep(food, phase) {
  if (food.groupId === 'healthyFats') return 5;
  if (phase === 'protein') {
    return food.groupId === 'proteins' || food.groupId === 'dairy' ? 25 : 15;
  }
  if (phase === 'carbs') {
    return food.groupId === 'carbs' || food.groupId === 'fruits' ? 20 : 10;
  }
  if (phase === 'fats') {
    return food.groupId === 'healthyFats' ? 5 : 10;
  }
  return 15;
}

function getDensityValue(food, roleOrPhase) {
  const calories = Math.max(Number(food.calories) || 0, 1);
  if (roleOrPhase === 'protein') return (Number(food.protein) || 0) / calories;
  if (roleOrPhase === 'carb') return (Number(food.carbs) || 0) / calories;
  if (roleOrPhase === 'fat') return (Number(food.fat) || 0) / calories;
  if (roleOrPhase === 'support') return (Number(food.fiber) || 0) + ((Number(food.fat) || 0) * 0.25);
  return Number(food.calories) || 0;
}

function sortFoods(candidates, preferences, metric) {
  return [...candidates].sort((a, b) => {
    const prefDiff = getPreferenceRank(preferences[a.id]) - getPreferenceRank(preferences[b.id]);
    if (prefDiff !== 0) return prefDiff;

    const densityDiff = getDensityValue(b, metric) - getDensityValue(a, metric);
    if (densityDiff !== 0) return densityDiff;

    return a.name.localeCompare(b.name);
  });
}

function createPlanItem(food, grams, preference) {
  const totals = getItemTotals(food, grams);
  return {
    foodId: food.id,
    name: food.name,
    arabicName: food.arabicName,
    category: food.groupId,
    preference: preference || null,
    grams: round(grams),
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat
  };
}

function flattenPlan(plan) {
  return MEAL_KEYS.flatMap(mealKey => plan[mealKey]);
}

function calculateTotals(plan) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  flattenPlan(plan).forEach(item => {
    totals.calories += item.calories;
    totals.protein += item.protein;
    totals.carbs += item.carbs;
    totals.fat += item.fat;
  });

  return {
    calories: round(totals.calories),
    protein: round(totals.protein),
    carbs: round(totals.carbs),
    fat: round(totals.fat)
  };
}

async function loadCategories() {
  if (catalogCache.categories) {
    return catalogCache.categories;
  }

  const response = await fetch(INDEX_URL);
  if (!response.ok) {
    throw new Error('Failed to load food catalog index');
  }

  const data = await response.json();
  catalogCache.categories = Array.isArray(data.categories) ? data.categories : [];
  return catalogCache.categories;
}

async function loadCategoryFoods(category) {
  if (catalogCache.foodsByCategory.has(category.id)) {
    return catalogCache.foodsByCategory.get(category.id);
  }

  const response = await fetch(`${FOODS_BASE_URL}${category.file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${category.name} foods`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items)
    ? data.items
        .filter(item => item.enabled !== false)
        .map(item => ({ ...item, groupId: category.id }))
    : [];

  catalogCache.foodsByCategory.set(category.id, items);
  return items;
}

async function loadFoodCatalog() {
  const categories = await loadCategories();
  const foods = [];

  for (const category of categories) {
    const categoryFoods = await loadCategoryFoods(category);
    foods.push(...categoryFoods);
  }

  return { categories, foods };
}

function chooseFoodForSlot(foods, mealKey, groups, preferences, usedFoodIds, metric) {
  const directMatches = foods.filter(food =>
    groups.includes(food.groupId) &&
    matchesMealType(food, mealKey) &&
    preferences[food.id] !== 'dislike'
  );

  const sortedDirect = sortFoods(directMatches, preferences, metric);
  const unusedDirect = sortedDirect.find(food => !usedFoodIds.has(food.id));
  if (unusedDirect) return unusedDirect;
  if (sortedDirect[0]) return sortedDirect[0];

  const fallbackMatches = foods.filter(food =>
    groups.includes(food.groupId) &&
    preferences[food.id] !== 'dislike'
  );
  return sortFoods(fallbackMatches, preferences, metric)[0] || null;
}

function buildBasePlan(foods, preferences) {
  const plan = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  };

  const usedFoodIds = new Set();

  for (const mealKey of MEAL_KEYS) {
    const config = MEAL_CONFIG[mealKey];
    config.slots.forEach(slot => {
      const selectedFood = chooseFoodForSlot(
        foods,
        mealKey,
        slot.groups,
        preferences,
        usedFoodIds,
        slot.role === 'support' ? 'support' : slot.role
      );

      if (!selectedFood) return;

      usedFoodIds.add(selectedFood.id);
      plan[mealKey].push(
        createPlanItem(
          selectedFood,
          getBaseGrams(selectedFood, mealKey, slot.role),
          preferences[selectedFood.id]
        )
      );
    });
  }

  return plan;
}

function findAdjustableItems(plan, foodsById, preferences, phase) {
  const phaseGroups = {
    protein: ['proteins', 'dairy', 'healthyFats', 'carbs', 'fruits', 'vegetables'],
    calories: ['carbs', 'healthyFats', 'dairy', 'proteins', 'fruits', 'vegetables'],
    carbs: ['carbs', 'fruits', 'dairy', 'vegetables', 'healthyFats', 'proteins'],
    fats: ['healthyFats', 'dairy', 'proteins', 'carbs', 'fruits', 'vegetables']
  };

  return flattenPlan(plan)
    .filter(item => phaseGroups[phase].includes(item.category))
    .sort((a, b) => {
      const foodA = foodsById.get(a.foodId);
      const foodB = foodsById.get(b.foodId);

      const prefDiff = getPreferenceRank(preferences[a.foodId]) - getPreferenceRank(preferences[b.foodId]);
      if (prefDiff !== 0) return prefDiff;

      const groupDiff = phaseGroups[phase].indexOf(a.category) - phaseGroups[phase].indexOf(b.category);
      if (groupDiff !== 0) return groupDiff;

      const metric = phase === 'fats' ? 'fat' : phase === 'carbs' ? 'carb' : phase === 'protein' ? 'protein' : 'calories';
      const densityDiff = getDensityValue(foodB, metric) - getDensityValue(foodA, metric);
      if (densityDiff !== 0) return densityDiff;

      return a.name.localeCompare(b.name);
    });
}

function refreshItemMacros(item, food) {
  const totals = getItemTotals(food, item.grams);
  item.calories = totals.calories;
  item.protein = totals.protein;
  item.carbs = totals.carbs;
  item.fat = totals.fat;
}

function adjustPlan(plan, goals, foodsById, preferences) {
  const phases = [
    { key: 'protein', goalKey: 'protein', tolerance: 4 },
    { key: 'calories', goalKey: 'calories', tolerance: 60 },
    { key: 'carbs', goalKey: 'carbs', tolerance: 8 },
    { key: 'fats', goalKey: 'fat', tolerance: 5 }
  ];

  phases.forEach(phase => {
    let totals = calculateTotals(plan);
    let remaining = goals[phase.goalKey] - totals[phase.goalKey];
    let guard = 0;

    while (remaining > phase.tolerance && guard < 400) {
      const adjustableItems = findAdjustableItems(plan, foodsById, preferences, phase.key);
      let adjusted = false;

      for (const item of adjustableItems) {
        const food = foodsById.get(item.foodId);
        const nextGrams = item.grams + getAdjustmentStep(food, phase.key);

        if (nextGrams > getMaxGrams(food)) {
          continue;
        }

        item.grams = nextGrams;
        refreshItemMacros(item, food);
        totals = calculateTotals(plan);
        remaining = goals[phase.goalKey] - totals[phase.goalKey];
        adjusted = true;

        if (phase.key !== 'calories' && totals.calories > goals.calories * 1.15) {
          item.grams -= getAdjustmentStep(food, phase.key);
          refreshItemMacros(item, food);
          totals = calculateTotals(plan);
          remaining = goals[phase.goalKey] - totals[phase.goalKey];
          continue;
        }

        if (remaining <= phase.tolerance) {
          break;
        }
      }

      if (!adjusted) {
        break;
      }

      guard += 1;
    }
  });

  // Light trim if calories overshoot too much.
  let totals = calculateTotals(plan);
  let guard = 0;
  while (totals.calories > goals.calories * 1.12 && guard < 200) {
    const adjustableItems = [...flattenPlan(plan)].sort((a, b) => {
      const foodA = foodsById.get(a.foodId);
      const foodB = foodsById.get(b.foodId);

      const prefDiff = getPreferenceRank(preferences[b.foodId]) - getPreferenceRank(preferences[a.foodId]);
      if (prefDiff !== 0) return prefDiff;

      const densityDiff = getDensityValue(foodB, 'calories') - getDensityValue(foodA, 'calories');
      if (densityDiff !== 0) return densityDiff;

      return b.grams - a.grams;
    });

    let trimmed = false;
    for (const item of adjustableItems) {
      const food = foodsById.get(item.foodId);
      const step = getAdjustmentStep(food, item.category === 'healthyFats' ? 'fats' : item.category === 'carbs' || item.category === 'fruits' ? 'carbs' : 'calories');
      const nextGrams = item.grams - step;

      if (nextGrams < getMinGrams(food)) {
        continue;
      }

      item.grams = nextGrams;
      refreshItemMacros(item, food);
      totals = calculateTotals(plan);
      trimmed = true;
      break;
    }

    if (!trimmed) break;
    guard += 1;
  }

  return plan;
}

function normalizeGoals(settings) {
  const source = settings?.nutritionGoals || settings || {};
  const goals = {
    calories: Number(source.calories ?? source.caloriesGoal),
    protein: Number(source.protein ?? source.proteinGoal),
    carbs: Number(source.carbs ?? source.carbsGoal),
    fat: Number(source.fat ?? source.fatGoal)
  };

  if (Object.values(goals).some(value => Number.isNaN(value) || value <= 0)) {
    throw new Error('Nutrition goals are not configured');
  }

  return goals;
}

function filterFoodPool(foods, preferences) {
  return foods.filter(food => preferences[food.id] !== 'dislike');
}

/**
 * Generate a meal plan from explicit inputs
 * @param {{ goals: { calories:number, protein:number, carbs:number, fat:number }, preferences?: Record<string, string>, foods: object[] }} inputs
 * @returns {{ breakfast: object[], lunch: object[], dinner: object[], snack: object[], totals: { calories:number, protein:number, carbs:number, fat:number } }}
 */
export function generateMealPlanFromInputs(inputs) {
  const goals = normalizeGoals(inputs.goals);
  const preferences = inputs.preferences || {};
  const foods = filterFoodPool(inputs.foods || [], preferences);

  if (!foods.length) {
    throw new Error('No catalog foods are available for meal generation');
  }

  const foodsById = new Map(foods.map(food => [food.id, food]));
  const basePlan = buildBasePlan(foods, preferences);
  const adjustedPlan = adjustPlan(basePlan, goals, foodsById, preferences);

  return {
    breakfast: adjustedPlan.breakfast,
    lunch: adjustedPlan.lunch,
    dinner: adjustedPlan.dinner,
    snack: adjustedPlan.snack,
    totals: calculateTotals(adjustedPlan)
  };
}

/**
 * Load goals, preferences, and catalog, then generate a meal plan
 * @returns {Promise<{ breakfast: object[], lunch: object[], dinner: object[], snack: object[], totals: { calories:number, protein:number, carbs:number, fat:number } }>}
 */
export async function generateMealPlan() {
  const [settingsResult, preferenceResult, catalog] = await Promise.all([
    settingsRepository.getSettings(),
    foodPreferenceRepository.getPreferenceMap(),
    loadFoodCatalog()
  ]);

  if (!settingsResult.success) {
    throw new Error(settingsResult.error || 'Failed to load nutrition goals');
  }

  if (!preferenceResult.success) {
    throw new Error(preferenceResult.error || 'Failed to load food preferences');
  }

  return generateMealPlanFromInputs({
    goals: settingsResult.data,
    preferences: preferenceResult.data,
    foods: catalog.foods
  });
}

const mealGeneratorService = {
  loadFoodCatalog,
  generateMealPlan,
  generateMealPlanFromInputs
};

export default mealGeneratorService;
