
/**
 * Nutrition Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import NutritionModel from '../models/nutritionModel.js';
import { toDateString } from '../utils/date.js';

class NutritionRepository extends BaseRepository {
  constructor() {
    super('nutrition');
  }

  /**
   * Get nutrition document for a specific date
   * @param {string} date
   * @returns {Promise<object>}
   */
  async getByDate(date = toDateString()) {
    const allResult = await this.getAll();
    if (!allResult.success) {
      return allResult;
    }
    const doc = allResult.data.find(d => d.date === date);
    return { success: true, data: doc || null };
  }

  /**
   * Add a new meal to today's nutrition document
   * @param {object} mealData
   * @param {string} date
   * @returns {Promise<object>}
   */
  async addMeal(mealData, date = toDateString()) {
    const existingResult = await this.getByDate(date);
    if (!existingResult.success) {
      return existingResult;
    }

    const meal = NutritionModel.createMeal(mealData);
    const mealValidation = NutritionModel.validateMeal(meal);
    if (!mealValidation.success) {
      return mealValidation;
    }

    let nutritionDoc;
    if (existingResult.data) {
      nutritionDoc = {
        ...existingResult.data,
        meals: [...existingResult.data.meals, meal]
      };
    } else {
      nutritionDoc = NutritionModel.create({ date, meals: [meal] });
    }

    nutritionDoc.totals = NutritionModel.calculateTotals(nutritionDoc.meals);
    nutritionDoc.updatedAt = new Date().toISOString();

    const validation = NutritionModel.validate(nutritionDoc);
    if (!validation.success) {
      return validation;
    }

    return this.save(nutritionDoc);
  }

  /**
   * Update an existing meal
   * @param {string} mealId
   * @param {object} mealData
   * @param {string} date
   * @returns {Promise<object>}
   */
  async updateMeal(mealId, mealData, date = toDateString()) {
    const existingResult = await this.getByDate(date);
    if (!existingResult.success) {
      return existingResult;
    }

    if (!existingResult.data) {
      return { success: false, error: 'Nutrition document not found' };
    }

    const mealIndex = existingResult.data.meals.findIndex(m => m.id === mealId);
    if (mealIndex === -1) {
      return { success: false, error: 'Meal not found' };
    }

    const updatedMeal = {
      ...existingResult.data.meals[mealIndex],
      ...mealData,
      id: mealId,
      updatedAt: new Date().toISOString()
    };

    const mealValidation = NutritionModel.validateMeal(updatedMeal);
    if (!mealValidation.success) {
      return mealValidation;
    }

    const updatedMeals = [...existingResult.data.meals];
    updatedMeals[mealIndex] = updatedMeal;

    const nutritionDoc = {
      ...existingResult.data,
      meals: updatedMeals,
      totals: NutritionModel.calculateTotals(updatedMeals),
      updatedAt: new Date().toISOString()
    };

    const validation = NutritionModel.validate(nutritionDoc);
    if (!validation.success) {
      return validation;
    }

    return this.save(nutritionDoc);
  }

  /**
   * Delete a meal
   * @param {string} mealId
   * @param {string} date
   * @returns {Promise<object>}
   */
  async deleteMeal(mealId, date = toDateString()) {
    const existingResult = await this.getByDate(date);
    if (!existingResult.success) {
      return existingResult;
    }

    if (!existingResult.data) {
      return { success: false, error: 'Nutrition document not found' };
    }

    const updatedMeals = existingResult.data.meals.filter(m => m.id !== mealId);

    const nutritionDoc = {
      ...existingResult.data,
      meals: updatedMeals,
      totals: NutritionModel.calculateTotals(updatedMeals),
      updatedAt: new Date().toISOString()
    };

    return this.save(nutritionDoc);
  }
}

const nutritionRepository = new NutritionRepository();
export default nutritionRepository;

