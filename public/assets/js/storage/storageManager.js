
/**
 * Storage Manager
 * Base class for all repositories, providing common CRUD operations
 */

import { getDB } from './database.js';

/**
 * Dispatch data changed event
 */
export function dispatchDataChanged() {
  const event = new CustomEvent('solidfit:data-changed', {
    bubbles: true,
    cancelable: false
  });
  window.dispatchEvent(event);
}

export class BaseRepository {
  constructor(storeName) {
    this.storeName = storeName;
  }

  /**
   * Get all records from the store
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getAll() {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve({ success: true, data: request.result });
        };

        request.onerror = () => {
          resolve({ success: false, error: request.error?.message || 'Failed to get all records' });
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get record by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async getById(id) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve({ success: true, data: request.result });
        };

        request.onerror = () => {
          resolve({ success: false, error: request.error?.message || 'Failed to get record' });
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get records by date
   * @param {string} date
   * @returns {Promise<{ success: boolean, data?: any[], error?: string }>}
   */
  async getByDate(date) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);

        // Check if date index exists
        if (!store.indexNames.contains('date')) {
          resolve({ success: false, error: 'Date index not available for this store' });
          return;
        }

        const index = store.index('date');
        const request = index.getAll(date);

        request.onsuccess = () => {
          resolve({ success: true, data: request.result });
        };

        request.onerror = () => {
          resolve({ success: false, error: request.error?.message || 'Failed to get records by date' });
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save a record
   * @param {any} data
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async save(data) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(data);

        request.onsuccess = () => {
          dispatchDataChanged();
          resolve({ success: true, data });
        };

        request.onerror = () => {
          resolve({ success: false, error: request.error?.message || 'Failed to save record' });
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a record
   * @param {any} data
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async update(data) {
    return this.save(data);
  }

  /**
   * Delete a record by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async delete(id) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          dispatchDataChanged();
          resolve({ success: true });
        };

        request.onerror = () => {
          resolve({ success: false, error: request.error?.message || 'Failed to delete record' });
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all records from the store
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async clear() {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          dispatchDataChanged();
          resolve({ success: true });
        };

        request.onerror = () => {
          resolve({ success: false, error: request.error?.message || 'Failed to clear store' });
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

