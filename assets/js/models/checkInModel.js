/**
 * Check-In Model
 * Represents a single daily recovery check-in
 */

import { generateId, isValidId } from '../utils/idGenerator.js';
import { validateRequired, validateString, validateNumber, validateDate } from '../utils/validator.js';
import { toISOString, toDateString } from '../utils/date.js';

const CHECK_IN_NAME = 'daily-checkin';

const CheckInModel = {
  /**
   * Create a check-in record
   * @param {object} data
   * @returns {object}
   */
  create(data = {}) {
    return {
      id: data.id || generateId(),
      name: CHECK_IN_NAME,
      date: data.date || toDateString(),
      sleepHours: typeof data.sleepHours === 'number' ? data.sleepHours : 7,
      sleepQuality: typeof data.sleepQuality === 'number' ? data.sleepQuality : 3,
      energyLevel: typeof data.energyLevel === 'number' ? data.energyLevel : 3,
      motivation: typeof data.motivation === 'number' ? data.motivation : 3,
      stressLevel: typeof data.stressLevel === 'number' ? data.stressLevel : 3,
      shoulderPain: typeof data.shoulderPain === 'number' ? data.shoulderPain : 0,
      kneePain: typeof data.kneePain === 'number' ? data.kneePain : 0,
      otherPain: data.otherPain || '',
      followedNutrition: data.followedNutrition ?? null,
      completedWorkout: data.completedWorkout || 'rest',
      waterGoalReached: data.waterGoalReached ?? null,
      notes: data.notes || '',
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Validate check-in record
   * @param {object} checkIn
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  validate(checkIn) {
    if (checkIn.id && !isValidId(checkIn.id)) {
      return { success: false, error: 'Invalid check-in ID' };
    }

    const dateValidation = validateRequired(checkIn.date, 'Date');
    if (!dateValidation.valid) {
      return { success: false, error: dateValidation.error };
    }

    const numericFields = [
      ['Hours slept', checkIn.sleepHours, 0, 24],
      ['Sleep quality', checkIn.sleepQuality, 1, 5],
      ['Energy level', checkIn.energyLevel, 1, 5],
      ['Motivation', checkIn.motivation, 1, 5],
      ['Stress level', checkIn.stressLevel, 1, 5],
      ['Shoulder pain', checkIn.shoulderPain, 0, 10],
      ['Knee pain', checkIn.kneePain, 0, 10]
    ];

    for (const [label, value, min, max] of numericFields) {
      const validation = validateNumber(value, label, { min, max });
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    const otherPainValidation = validateString(checkIn.otherPain, 'Other pain', { maxLength: 500 });
    if (!otherPainValidation.valid) {
      return { success: false, error: otherPainValidation.error };
    }

    const notesValidation = validateString(checkIn.notes, 'Notes', { maxLength: 2000 });
    if (!notesValidation.valid) {
      return { success: false, error: notesValidation.error };
    }

    if (![true, false, null].includes(checkIn.followedNutrition)) {
      return { success: false, error: 'Followed nutrition must be yes or no' };
    }

    if (!['yes', 'no', 'rest'].includes(checkIn.completedWorkout)) {
      return { success: false, error: 'Completed workout must be Yes, No, or Rest Day' };
    }

    if (![true, false, null].includes(checkIn.waterGoalReached)) {
      return { success: false, error: 'Water goal reached must be yes or no' };
    }

    if (checkIn.createdAt) {
      const createdAtValidation = validateDate(checkIn.createdAt, 'Created at');
      if (!createdAtValidation.valid) {
        return { success: false, error: createdAtValidation.error };
      }
    }

    return { success: true, data: checkIn };
  },

  /**
   * Derive a simple mood string for the existing recovery widget inputs
   * @param {object} checkIn
   * @returns {string}
   */
  getDerivedMood(checkIn) {
    const recoveryAverage = (checkIn.energyLevel + checkIn.motivation + (6 - checkIn.stressLevel)) / 3;

    if (recoveryAverage >= 4.4 && checkIn.sleepQuality >= 4) return 'great';
    if (recoveryAverage >= 3.4) return 'good';
    if (recoveryAverage >= 2.4) return 'okay';
    return 'bad';
  },

  /**
   * Get a single pain level for compatibility with existing recovery score logic
   * @param {object} checkIn
   * @returns {number}
   */
  getDerivedPainLevel(checkIn) {
    return Math.max(checkIn.shoulderPain || 0, checkIn.kneePain || 0);
  }
};

export { CHECK_IN_NAME };
export default CheckInModel;
