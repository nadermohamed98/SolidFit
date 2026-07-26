
/**
 * Database Schema Definition
 * Defines all object stores and indexes for SolidFitDB
 */

export const DB_SCHEMA = {
  dbName: 'SolidFitDB',
  version: 2,
  stores: [
    {
      name: 'profile',
      keyPath: 'id',
      indexes: []
    },
    {
      name: 'nutrition',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'mealType', keyPath: 'mealType', unique: false }
      ]
    },
    {
      name: 'workouts',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'type', keyPath: 'type', unique: false },
        { name: 'templateId', keyPath: 'templateId', unique: false }
      ]
    },
    {
      name: 'workoutTemplates',
      keyPath: 'id',
      indexes: [
        { name: 'category', keyPath: 'category', unique: false }
      ]
    },
    {
      name: 'journal',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'mood', keyPath: 'mood', unique: false }
      ]
    },
    {
      name: 'measurements',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false }
      ]
    },
    {
      name: 'inbody',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false }
      ]
    },
    {
      name: 'settings',
      keyPath: 'id',
      indexes: []
    },
    {
      name: 'coachReports',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false }
      ]
    },
    {
      name: 'habits',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'name', keyPath: 'name', unique: false }
      ]
    }
  ]
};

