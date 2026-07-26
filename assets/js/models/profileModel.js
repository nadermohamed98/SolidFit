
/**
 * Profile Model
 * Represents user profile data
 */

import { generateId, isValidId } from '../utils/idGenerator.js';
import { validateRequired, validateString, validateNumber, validateDate, validateArray, validateObject } from '../utils/validator.js';
import { toISOString } from '../utils/date.js';

const FOOD_PREFERENCE_CATEGORIES = ['proteins', 'carbs', 'vegetables', 'fruits', 'dairy'];

function createDefaultFoodPreferences(data = {}) {
  const preferences = {};

  FOOD_PREFERENCE_CATEGORIES.forEach(category => {
    const source = data[category] || {};
    preferences[category] = {
      favorite: source.favorite || '',
      neutral: source.neutral || '',
      avoid: source.avoid || ''
    };
  });

  return preferences;
}

const ProfileModel = {
  /**
   * Create a new profile object
   * @param {object} data
   * @returns {object} profile
   */
  create(data) {
    return {
      id: data.id || generateId(),
      name: data.name || '',
      age: data.age || null,
      height: data.height || null, // in cm
      currentWeight: data.currentWeight || null, // in kg
      goal: data.goal || '',
      activityLevel: data.activityLevel || '',
      trainingDaysPerWeek: data.trainingDaysPerWeek || null,
      workoutTime: data.workoutTime || '',
      gymDays: Array.isArray(data.gymDays) ? data.gymDays : [],
      workoutDuration: data.workoutDuration || null,
      foodPreferences: createDefaultFoodPreferences(data.foodPreferences),
      goalWeight: data.goalWeight || null, // in kg
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Validate profile data
   * @param {object} profile
   * @returns {object} { success: boolean, error?: string, data?: object }
   */
  validate(profile) {
    // Validate ID
    if (profile.id) {
      if (!isValidId(profile.id)) {
        return { success: false, error: 'Invalid profile ID' };
      }
    }

    // Validate name
    const nameValidation = validateString(profile.name, 'Name', { minLength: 0, maxLength: 100 });
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }

    // Validate age
    if (profile.age !== null && profile.age !== undefined) {
      const ageValidation = validateNumber(profile.age, 'Age', { min: 0, max: 120 });
      if (!ageValidation.valid) {
        return { success: false, error: ageValidation.error };
      }
    }

    // Validate height
    if (profile.height !== null && profile.height !== undefined) {
      const heightValidation = validateNumber(profile.height, 'Height', { min: 0, max: 300 });
      if (!heightValidation.valid) {
        return { success: false, error: heightValidation.error };
      }
    }

    // Validate currentWeight
    if (profile.currentWeight !== null && profile.currentWeight !== undefined) {
      const currentWeightValidation = validateNumber(profile.currentWeight, 'Current weight', { min: 0, max: 500 });
      if (!currentWeightValidation.valid) {
        return { success: false, error: currentWeightValidation.error };
      }
    }

    // Validate goal
    const goalValidation = validateString(profile.goal, 'Goal', { minLength: 0, maxLength: 100 });
    if (!goalValidation.valid) {
      return { success: false, error: goalValidation.error };
    }

    // Validate activityLevel
    const activityLevelValidation = validateString(profile.activityLevel, 'Activity level', { minLength: 0, maxLength: 100 });
    if (!activityLevelValidation.valid) {
      return { success: false, error: activityLevelValidation.error };
    }

    // Validate trainingDaysPerWeek
    if (profile.trainingDaysPerWeek !== null && profile.trainingDaysPerWeek !== undefined) {
      const trainingDaysValidation = validateNumber(profile.trainingDaysPerWeek, 'Training days per week', { min: 0, max: 7 });
      if (!trainingDaysValidation.valid) {
        return { success: false, error: trainingDaysValidation.error };
      }
    }

    // Validate workoutTime
    const workoutTimeValidation = validateString(profile.workoutTime, 'Workout time', { minLength: 0, maxLength: 50 });
    if (!workoutTimeValidation.valid) {
      return { success: false, error: workoutTimeValidation.error };
    }

    // Validate gymDays
    const gymDaysValidation = validateArray(profile.gymDays, 'Gym days');
    if (!gymDaysValidation.valid) {
      return { success: false, error: gymDaysValidation.error };
    }
    if (profile.gymDays.length > 7) {
      return { success: false, error: 'Gym days must be at most 7 items' };
    }
    for (const day of profile.gymDays) {
      const dayValidation = validateString(day, 'Gym day', { minLength: 1, maxLength: 20 });
      if (!dayValidation.valid) {
        return { success: false, error: dayValidation.error };
      }
    }

    // Validate workoutDuration
    if (profile.workoutDuration !== null && profile.workoutDuration !== undefined) {
      const workoutDurationValidation = validateNumber(profile.workoutDuration, 'Workout duration', { min: 0, max: 600 });
      if (!workoutDurationValidation.valid) {
        return { success: false, error: workoutDurationValidation.error };
      }
    }

    // Validate foodPreferences
    const foodPreferencesValidation = validateObject(profile.foodPreferences, 'Food preferences');
    if (!foodPreferencesValidation.valid) {
      return { success: false, error: foodPreferencesValidation.error };
    }
    for (const category of FOOD_PREFERENCE_CATEGORIES) {
      const categoryValue = profile.foodPreferences[category];
      const categoryValidation = validateObject(categoryValue, `${category} preferences`);
      if (!categoryValidation.valid) {
        return { success: false, error: categoryValidation.error };
      }

      const favoriteValidation = validateString(categoryValue.favorite || '', `${category} favorite`, { minLength: 0, maxLength: 1000 });
      if (!favoriteValidation.valid) {
        return { success: false, error: favoriteValidation.error };
      }

      const neutralValidation = validateString(categoryValue.neutral || '', `${category} neutral`, { minLength: 0, maxLength: 1000 });
      if (!neutralValidation.valid) {
        return { success: false, error: neutralValidation.error };
      }

      const avoidValidation = validateString(categoryValue.avoid || '', `${category} avoid`, { minLength: 0, maxLength: 1000 });
      if (!avoidValidation.valid) {
        return { success: false, error: avoidValidation.error };
      }
    }

    // Validate goalWeight
    if (profile.goalWeight !== null && profile.goalWeight !== undefined) {
      const weightValidation = validateNumber(profile.goalWeight, 'Goal weight', { min: 0, max: 500 });
      if (!weightValidation.valid) {
        return { success: false, error: weightValidation.error };
      }
    }

    // Validate dates
    if (profile.createdAt) {
      const createdAtValidation = validateDate(profile.createdAt, 'Created at');
      if (!createdAtValidation.valid) {
        return { success: false, error: createdAtValidation.error };
      }
    }

    return { success: true, data: profile };
  }
};

export default ProfileModel;
