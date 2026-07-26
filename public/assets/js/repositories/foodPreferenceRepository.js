/**
 * Food Preference Repository
 */

import { BaseRepository } from '../storage/storageManager.js';

const FOOD_PREFERENCE_NAME = 'food-preference';
const ALLOWED_PREFERENCES = ['love', 'okay', 'dislike'];

class FoodPreferenceRepository extends BaseRepository {
  constructor() {
    super('habits');
  }

  /**
   * Get all saved food preferences
   * @returns {Promise<{ success: boolean, data?: object[], error?: string }>}
   */
  async getAllPreferences() {
    const result = await super.getAll();
    if (!result.success) {
      return result;
    }

    const preferences = result.data.filter(item => item.name === FOOD_PREFERENCE_NAME);
    return { success: true, data: preferences };
  }

  /**
   * Get food preferences as a quick lookup map
   * @returns {Promise<{ success: boolean, data?: Record<string, string>, error?: string }>}
   */
  async getPreferenceMap() {
    const result = await this.getAllPreferences();
    if (!result.success) {
      return result;
    }

    const map = {};
    result.data.forEach(item => {
      map[item.foodId] = item.preference;
    });

    return { success: true, data: map };
  }

  /**
   * Save or update a preference
   * @param {string} foodId
   * @param {'love'|'okay'|'dislike'} preference
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async setPreference(foodId, preference) {
    if (!foodId) {
      return { success: false, error: 'Food ID is required' };
    }

    if (!ALLOWED_PREFERENCES.includes(preference)) {
      return { success: false, error: 'Invalid food preference' };
    }

    const existing = await super.getById(`food-pref:${foodId}`);
    const record = {
      id: `food-pref:${foodId}`,
      name: FOOD_PREFERENCE_NAME,
      foodId,
      preference,
      updatedAt: new Date().toISOString()
    };

    if (existing.success && existing.data?.createdAt) {
      record.createdAt = existing.data.createdAt;
    }

    return super.save(record);
  }
}

const foodPreferenceRepository = new FoodPreferenceRepository();
export default foodPreferenceRepository;
