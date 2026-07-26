
/**
 * Validation Utility Functions
 */

/**
 * Validate required field
 * @param {any} value
 * @param {string} fieldName
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Validate string
 * @param {any} value
 * @param {string} fieldName
 * @param {object} [options]
 * @param {number} [options.minLength]
 * @param {number} [options.maxLength]
 * @returns {object}
 */
export function validateString(value, fieldName, options = {}) {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (options.minLength && value.length < options.minLength) {
    return { valid: false, error: `${fieldName} must be at least ${options.minLength} characters` };
  }
  if (options.maxLength && value.length > options.maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${options.maxLength} characters` };
  }
  return { valid: true };
}

/**
 * Validate number
 * @param {any} value
 * @param {string} fieldName
 * @param {object} [options]
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @returns {object}
 */
export function validateNumber(value, fieldName, options = {}) {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  if (options.min !== undefined && value < options.min) {
    return { valid: false, error: `${fieldName} must be at least ${options.min}` };
  }
  if (options.max !== undefined && value > options.max) {
    return { valid: false, error: `${fieldName} must be at most ${options.max}` };
  }
  return { valid: true };
}

/**
 * Validate date
 * @param {any} value
 * @param {string} fieldName
 * @returns {object}
 */
export function validateDate(value, fieldName) {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return { valid: false, error: `${fieldName} must be a valid date` };
  }
  return { valid: true };
}

/**
 * Validate array
 * @param {any} value
 * @param {string} fieldName
 * @returns {object}
 */
export function validateArray(value, fieldName) {
  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }
  return { valid: true };
}

/**
 * Validate object
 * @param {any} value
 * @param {string} fieldName
 * @returns {object}
 */
export function validateObject(value, fieldName) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an object` };
  }
  return { valid: true };
}

