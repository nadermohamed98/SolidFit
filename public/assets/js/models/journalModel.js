
/**
 * Journal Model
 * Represents journal log entries
 */

import { generateId, isValidId } from '../utils/idGenerator.js';
import { validateRequired, validateString, validateDate, validateObject } from '../utils/validator.js';
import { toISOString, toDateString } from '../utils/date.js';

const JournalModel = {
  /**
   * Create a new journal object
   * @param {object} data
   * @returns {object} journal
   */
  create(data) {
    return {
      id: data.id || generateId(),
      date: data.date || toDateString(),
      mood: data.mood || '',
      content: data.content || '',
      tags: data.tags || [],
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Validate journal data
   * @param {object} journal
   * @returns {object} { success: boolean, error?: string, data?: object }
   */
  validate(journal) {
    // Validate ID
    if (journal.id) {
      if (!isValidId(journal.id)) {
        return { success: false, error: 'Invalid journal ID' };
      }
    }

    // Validate date
    const dateValidation = validateRequired(journal.date, 'Date');
    if (!dateValidation.valid) {
      return { success: false, error: dateValidation.error };
    }

    // Validate mood
    const moodValidation = validateString(journal.mood, 'Mood', { maxLength: 50 });
    if (!moodValidation.valid) {
      return { success: false, error: moodValidation.error };
    }

    // Validate content
    const contentValidation = validateString(journal.content, 'Content', { maxLength: 10000 });
    if (!contentValidation.valid) {
      return { success: false, error: contentValidation.error };
    }

    // Validate tags
    if (!Array.isArray(journal.tags)) {
      return { success: false, error: 'Tags must be an array' };
    }

    // Validate dates
    if (journal.createdAt) {
      const createdAtValidation = validateDate(journal.createdAt, 'Created at');
      if (!createdAtValidation.valid) {
        return { success: false, error: createdAtValidation.error };
      }
    }

    return { success: true, data: journal };
  }
};

export default JournalModel;

