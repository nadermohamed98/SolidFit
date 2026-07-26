
/**
 * Backup Service
 * Handles export, import, reset, and clear database
 */

import { getDB, closeDB } from '../storage/database.js';
import { DB_SCHEMA } from '../storage/schema.js';
import { dispatchDataChanged } from '../storage/storageManager.js';

/**
 * Export entire database
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function exportDatabase() {
  try {
    const db = await getDB();
    const exportData = {
      app: 'SolidFit',
      version: DB_SCHEMA.version,
      exportedAt: new Date().toISOString(),
      database: {}
    };

    // Get all data from each store
    for (const storeConfig of DB_SCHEMA.stores) {
      const storeName = storeConfig.name;
      const data = await new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      exportData.database[storeName] = data;
    }

    // Download as JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solidfit-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, data: exportData };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Import database from file
 * @param {File} file
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function importDatabase(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate import data
    if (!data.app || data.app !== 'SolidFit') {
      return { success: false, error: 'Invalid backup file' };
    }

    const db = await getDB();

    // Clear and import each store
    for (const storeName of Object.keys(data.database)) {
      if (!db.objectStoreNames.contains(storeName)) continue;

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Clear existing data
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Import new data
      for (const item of data.database[storeName]) {
        await new Promise((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    dispatchDataChanged();
    return { success: true };
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset entire database (delete and re-create)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function resetDatabase() {
  try {
    // Close current DB
    closeDB();

    // Delete database
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_SCHEMA.dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Database blocked'));
    });

    // Re-open to re-create
    await getDB();

    dispatchDataChanged();
    return { success: true };
  } catch (error) {
    console.error('Reset failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear all data but keep schema
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function clearDatabase() {
  try {
    const db = await getDB();

    for (const storeConfig of DB_SCHEMA.stores) {
      const storeName = storeConfig.name;
      await new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    dispatchDataChanged();
    return { success: true };
  } catch (error) {
    console.error('Clear failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all database data (for viewing)
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getDatabaseData() {
  try {
    const db = await getDB();
    const exportData = {
      app: 'SolidFit',
      version: DB_SCHEMA.version,
      exportedAt: new Date().toISOString(),
      database: {}
    };

    // Get all data from each store
    for (const storeConfig of DB_SCHEMA.stores) {
      const storeName = storeConfig.name;
      const data = await new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      exportData.database[storeName] = data;
    }

    return { success: true, data: exportData };
  } catch (error) {
    console.error('Get database data failed:', error);
    return { success: false, error: error.message };
  }
}

