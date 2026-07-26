
/**
 * Developer Test Page
 */

import workoutRepository from '../repositories/workoutRepository.js';
import nutritionRepository from '../repositories/nutritionRepository.js';
import journalRepository from '../repositories/journalRepository.js';
import progressRepository from '../repositories/progressRepository.js';
import settingsRepository from '../repositories/settingsRepository.js';
import profileRepository from '../repositories/profileRepository.js';
import workoutTemplateRepository from '../repositories/workoutTemplateRepository.js';
import checkInRepository from '../repositories/checkInRepository.js';
import foodPreferenceRepository from '../repositories/foodPreferenceRepository.js';
import WorkoutTemplateModel from '../models/workoutTemplateModel.js';
import WorkoutModel from '../models/workoutModel.js';
import { exportDatabase, importDatabase, resetDatabase, clearDatabase, getDatabaseData } from '../services/backupService.js';
import { generateId } from '../utils/idGenerator.js';
import { toDateString, addDays } from '../utils/date.js';

/**
 * Render developer test page
 * @returns {HTMLElement}
 */
export function renderDevTestPage() {
  const page = document.createElement('div');
  page.className = 'page';
  page.style.padding = '24px';
  page.style.maxWidth = '1000px';
  page.style.margin = '0 auto';

  page.innerHTML = `
    <h1 style="margin-bottom: 24px;">⚙️ Developer Test Page</h1>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
      <!-- Data Generation -->
      <div class="card" style="padding: 16px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Data Generation</h3>
        <button id="btn-add-dummy-workout" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Add Dummy Workout</button>
        <button id="btn-add-dummy-meal" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Add Dummy Meal</button>
        <button id="btn-add-dummy-journal" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Add Dummy Journal</button>
        <button id="btn-gen-week-data" class="btn" style="width: 100%; margin-bottom: 8px;">Generate Week of Dummy Data</button>
        <button id="btn-gen-nutrition-day" class="btn" style="width: 100%; margin-bottom: 8px;">Generate Nutrition Day</button>
        <hr style="border-color: var(--color-border); margin: 12px 0;">
        <button id="btn-gen-workout-template" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Generate Workout Template</button>
        <button id="btn-gen-workout-session" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Generate Workout Session</button>
        <button id="btn-gen-workout-history" class="btn" style="width: 100%; margin-bottom: 8px;">Generate Workout History</button>
        <button id="btn-gen-dummy-checkin" class="btn" style="width: 100%; margin-bottom: 8px;">Generate Dummy Check-in</button>
        <button id="btn-gen-random-food-preferences" class="btn" style="width: 100%; margin-bottom: 8px;">Generate Random Preferences</button>
        <button id="btn-gen-sample-nutrition-goals" class="btn" style="width: 100%; margin-bottom: 8px;">Generate Sample Nutrition Goals</button>
      </div>

      <!-- Database Operations -->
      <div class="card" style="padding: 16px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Database Operations</h3>
        <button id="btn-export" class="btn" style="width: 100%; margin-bottom: 8px;">Export Database</button>
        <label class="btn" style="width: 100%; margin-bottom: 8px; cursor: pointer; display: inline-flex; justify-content: center;">
          Import Database
          <input type="file" id="file-import" accept=".json" style="display: none;">
        </label>
        <button id="btn-clear" class="btn" style="width: 100%; margin-bottom: 8px; background-color: var(--color-warning);">Clear Database</button>
        <button id="btn-reset" class="btn" style="width: 100%; background-color: var(--color-danger); color: white;">Reset Database</button>
        <hr style="border-color: var(--color-border); margin: 12px 0;">
        <button id="btn-clear-today-nutrition" class="btn" style="width: 100%; margin-bottom: 8px;">Clear Today's Nutrition</button>
        <button id="btn-clear-workout-data" class="btn" style="width: 100%; background-color: var(--color-warning);">Clear Workout Data</button>
        <button id="btn-clear-today-checkin" class="btn" style="width: 100%; margin-top: 8px;">Clear Today's Check-in</button>
      </div>

      <!-- Profile & Settings -->
      <div class="card" style="padding: 16px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Profile & Settings</h3>
        <button id="btn-set-profile" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Set Dummy Profile</button>
        <button id="btn-set-settings" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">Set Dummy Settings</button>
      </div>

      <!-- Trigger Actions -->
      <div class="card" style="padding: 16px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Trigger Actions</h3>
        <button id="btn-trigger-refresh" class="btn" style="width: 100%; margin-bottom: 8px;">Trigger Data Changed</button>
      </div>
    </div>

    <div class="card" style="padding: 16px; margin-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0;">Database Content</h3>
        <button id="btn-view-db" class="btn btn-small">View</button>
      </div>
      <pre id="db-content" style="background-color: var(--color-card); padding: 12px; border-radius: 8px; overflow-x: auto; max-height: 400px; display: none; white-space: pre-wrap;"></pre>
    </div>

    <div id="message" style="margin-top: 24px; padding: 12px; border-radius: 8px; display: none;"></div>
  `;

  // Data Generation
  page.querySelector('#btn-add-dummy-workout').addEventListener('click', async () => {
    const result = await workoutRepository.save(WorkoutModel.create({
      name: 'Upper Body Strength',
      type: 'strength',
      startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      completed: true,
      duration: 45,
      exercises: [
        { exerciseId: generateId(), name: 'Bench Press', sets: [{ weight: 100, reps: 8, rpe: 8, completedAt: new Date().toISOString() }] },
        { exerciseId: generateId(), name: 'Rows', sets: [{ weight: 80, reps: 10, rpe: 7, completedAt: new Date().toISOString() }] },
        { exerciseId: generateId(), name: 'Shoulder Press', sets: [{ weight: 50, reps: 12, rpe: 8, completedAt: new Date().toISOString() }] }
      ]
    }));
    showMessage(page, result);
  });

  page.querySelector('#btn-add-dummy-meal').addEventListener('click', async () => {
    const result = await nutritionRepository.addMeal({
      mealName: ['Breakfast', 'Lunch', 'Dinner', 'Snack'][Math.floor(Math.random() * 4)],
      time: new Date().toTimeString().slice(0, 5),
      calories: Math.floor(Math.random() * 500) + 300,
      protein: Math.floor(Math.random() * 30) + 10,
      carbs: Math.floor(Math.random() * 50) + 20,
      fat: Math.floor(Math.random() * 20) + 5,
      fiber: Math.floor(Math.random() * 10) + 2,
      water: Math.random() * 0.5,
      notes: 'Quick meal!'
    });
    showMessage(page, result);
  });

  page.querySelector('#btn-add-dummy-journal').addEventListener('click', async () => {
    const result = await journalRepository.save({
      mood: ['great', 'good', 'okay', 'bad'][Math.floor(Math.random() * 4)],
      content: 'Today was a great day! Had a solid workout and hit my protein goals.'
    });
    showMessage(page, result);
  });

  page.querySelector('#btn-gen-nutrition-day').addEventListener('click', async () => {
    // Generate a full day of meals
    const meals = [
      { mealName: 'Breakfast', time: '08:00', calories: 550, protein: 30, carbs: 60, fat: 15, fiber: 8, water: 0.5, notes: 'Oatmeal with protein powder and banana' },
      { mealName: 'Lunch', time: '12:30', calories: 700, protein: 40, carbs: 80, fat: 20, fiber: 12, water: 0.3 },
      { mealName: 'Snack', time: '16:00', calories: 250, protein: 15, carbs: 25, fat: 10, fiber: 5 },
      { mealName: 'Dinner', time: '19:00', calories: 650, protein: 35, carbs: 70, fat: 18, fiber: 10, water: 0.2 }
    ];

    for (const meal of meals) {
      await nutritionRepository.addMeal(meal);
    }

    showMessage(page, { success: true, message: 'Full nutrition day generated!' });
  });

  page.querySelector('#btn-gen-week-data').addEventListener('click', async () => {
    for (let i = 0; i < 7; i++) {
      const date = toDateString(addDays(new Date(), -i));
      // Add workout
      await workoutRepository.save({
        date,
        name: i === 0 ? 'Rest Day' : `Workout Day ${7 - i}`,
        type: i === 0 ? 'recovery' : 'strength',
        startTime: new Date(Date.now() - (45 + i * 5) * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        duration: i === 0 ? 0 : 45,
        completed: true
      });

      // Add a couple of meals per day
      const meals = [
        { mealName: 'Breakfast', time: '08:00', calories: 500 - i * 10, protein: 25 - i * 0.5, carbs: 55 - i, fat: 12, fiber: 7, water: 0.4 },
        { mealName: 'Dinner', time: '19:00', calories: 600 - i * 15, protein: 30 - i, carbs: 65 - i, fat: 16, fiber: 9, water: 0.3 }
      ];

      for (const meal of meals) {
        await nutritionRepository.addMeal(meal, date);
      }
    }

    // Add progress entries
    for (let i = 0; i < 3; i++) {
      const date = toDateString(addDays(new Date(), -i * 7));
      await progressRepository.save({
        date,
        weight: 80 - i * 0.5,
        bodyFat: 15 - i * 0.5,
        muscle: 35 + i * 0.3
      });
    }

    showMessage(page, { success: true, message: 'Week of data generated!' });
  });

  page.querySelector('#btn-gen-workout-template').addEventListener('click', async () => {
    const template = WorkoutTemplateModel.create({
      name: ['Upper Body', 'Lower Body', 'Push', 'Pull', 'Full Body'][Math.floor(Math.random() * 5)],
      category: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body'][Math.floor(Math.random() * 6)],
      exercises: [
        WorkoutTemplateModel.createExercise(),
        WorkoutTemplateModel.createExercise(),
        WorkoutTemplateModel.createExercise()
      ]
    });
    template.exercises[0].name = 'Bench Press';
    template.exercises[0].targetMuscle = 'Chest';
    template.exercises[0].sets = 4;
    template.exercises[0].repsTarget = 8;
    template.exercises[1].name = 'Barbell Rows';
    template.exercises[1].targetMuscle = 'Back';
    template.exercises[1].sets = 4;
    template.exercises[1].repsTarget = 10;
    template.exercises[2].name = 'Overhead Press';
    template.exercises[2].targetMuscle = 'Shoulders';
    template.exercises[2].sets = 3;
    template.exercises[2].repsTarget = 12;
    const result = await workoutTemplateRepository.save(template);
    showMessage(page, result);
  });

  page.querySelector('#btn-gen-workout-session').addEventListener('click', async () => {
    const session = WorkoutModel.create({
      name: 'Upper Body Strength',
      type: 'strength',
      startTime: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      completed: true,
      duration: 50,
      exercises: [
        {
          exerciseId: generateId(),
          name: 'Bench Press',
          sets: [
            { weight: 100, reps: 8, rpe: 7, completedAt: new Date().toISOString() },
            { weight: 100, reps: 8, rpe: 8, completedAt: new Date().toISOString() },
            { weight: 105, reps: 7, rpe: 9, completedAt: new Date().toISOString() }
          ]
        },
        {
          exerciseId: generateId(),
          name: 'Rows',
          sets: [
            { weight: 80, reps: 10, rpe: 7, completedAt: new Date().toISOString() },
            { weight: 80, reps: 10, rpe: 8, completedAt: new Date().toISOString() }
          ]
        }
      ],
      summary: {
        exercisesCompleted: 2,
        totalSets: 5,
        estimatedVolume: 100*8 + 100*8 + 105*7 + 80*10 +80*10,
        averageRPE: 7.8,
        notes: 'Great session!',
        shoulderPain: 1,
        kneePain: 0,
        overallFeeling: 'Great'
      }
    });
    const result = await workoutRepository.save(session);
    showMessage(page, result);
  });

  page.querySelector('#btn-gen-workout-history').addEventListener('click', async () => {
    for (let i = 0; i < 5; i++) {
      const date = toDateString(addDays(new Date(), -(i + 1)));
      const session = WorkoutModel.create({
        date,
        name: ['Upper Day', 'Lower Day', 'Push Day', 'Pull Day', 'Full Body'][i % 5],
        type: 'strength',
        startTime: new Date(Date.now() - (45 + i * 5) * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        duration: 45 + i * 5,
        exercises: [
          { exerciseId: generateId(), name: 'Exercise 1', sets: [{ weight: 100 - i*5, reps: 10, rpe: 7, completedAt: new Date().toISOString() }] }
        ]
      });
      session.summary = WorkoutModel.calculateSummary(session);
      await workoutRepository.save(session);
    }
    showMessage(page, { success: true, message: 'Workout history generated!' });
  });

  page.querySelector('#btn-gen-dummy-checkin').addEventListener('click', async () => {
    const result = await checkInRepository.save({
      sleepHours: 7.5,
      sleepQuality: 4,
      energyLevel: 4,
      motivation: 4,
      stressLevel: 2,
      shoulderPain: 1,
      kneePain: 0,
      otherPain: '',
      followedNutrition: true,
      completedWorkout: 'yes',
      waterGoalReached: true,
      notes: 'Felt solid overall. Slight shoulder tightness after training.'
    });
    showMessage(page, result.success ? { success: true, message: 'Dummy check-in generated!' } : result);
  });

  page.querySelector('#btn-gen-random-food-preferences').addEventListener('click', async () => {
    try {
      const indexResponse = await fetch('./assets/data/catalog/foods/index.json');
      if (!indexResponse.ok) {
        throw new Error('Failed to load food catalog index');
      }

      const indexData = await indexResponse.json();
      const categories = Array.isArray(indexData.categories) ? indexData.categories : [];
      const preferenceValues = ['love', 'okay', 'dislike'];

      for (const category of categories) {
        const categoryResponse = await fetch(`./assets/data/catalog/foods/${category.file}`);
        if (!categoryResponse.ok) {
          throw new Error(`Failed to load ${category.name}`);
        }

        const categoryData = await categoryResponse.json();
        const items = Array.isArray(categoryData.items) ? categoryData.items.filter(item => item.enabled !== false) : [];

        for (const item of items) {
          const preference = preferenceValues[Math.floor(Math.random() * preferenceValues.length)];
          await foodPreferenceRepository.setPreference(item.id, preference);
        }
      }

      showMessage(page, { success: true, message: 'Random food preferences generated!' });
    } catch (error) {
      showMessage(page, { success: false, error: error.message });
    }
  });

  page.querySelector('#btn-gen-sample-nutrition-goals').addEventListener('click', async () => {
    const currentSettings = await settingsRepository.getSettings();
    const result = await settingsRepository.saveSettings({
      ...(currentSettings.success ? currentSettings.data : {}),
      nutritionGoals: {
        calories: 2300,
        protein: 170,
        carbs: 240,
        fat: 70,
        water: 3,
        updatedAt: new Date().toISOString()
      },
      caloriesGoal: 2300,
      proteinGoal: 170,
      carbsGoal: 240,
      fatGoal: 70,
      waterGoal: 3
    });
    showMessage(page, result.success ? { success: true, message: 'Sample nutrition goals generated!' } : result);
  });

  // Profile & Settings
  page.querySelector('#btn-set-profile').addEventListener('click', async () => {
    const result = await profileRepository.save({
      name: 'John Doe',
      age: 30,
      height: 180,
      goalWeight: 75
    });
    showMessage(page, result);
  });

  page.querySelector('#btn-set-settings').addEventListener('click', async () => {
    const result = await settingsRepository.saveSettings({
      caloriesGoal: 2200,
      proteinGoal: 160,
      carbsGoal: 250,
      waterGoal: 2.5,
      sleepGoal: 8,
      sleepHours: 7.5,
      painLevel: 2,
      waterConsumed: 1.8
    });
    showMessage(page, result);
  });

  page.querySelector('#btn-clear-today-nutrition').addEventListener('click', async () => {
    const today = toDateString();
    const nutritionResult = await nutritionRepository.getByDate(today);
    if (nutritionResult.success && nutritionResult.data) {
      nutritionResult.data.meals = [];
      nutritionResult.data.totals = nutritionRepository.calculateTotals([]);
      nutritionResult.data.updatedAt = new Date().toISOString();
      const result = await nutritionRepository.save(nutritionResult.data);
      showMessage(page, result);
    } else {
      showMessage(page, { success: true, message: 'No nutrition data for today' });
    }
  });

  page.querySelector('#btn-clear-workout-data').addEventListener('click', async () => {
    if (confirm('Clear all workout templates and sessions? This cannot be undone!')) {
      await workoutTemplateRepository.clear();
      await workoutRepository.clear();
      showMessage(page, { success: true, message: 'Workout data cleared!' });
    }
  });

  page.querySelector('#btn-clear-today-checkin').addEventListener('click', async () => {
    const result = await checkInRepository.clearByDate(toDateString());
    showMessage(page, result.success ? { success: true, message: 'Today\'s check-in cleared!' } : result);
  });

  // Trigger Actions
  page.querySelector('#btn-trigger-refresh').addEventListener('click', () => {
    const event = new CustomEvent('solidfit:data-changed', { bubbles: true, cancelable: false });
    window.dispatchEvent(event);
    showMessage(page, { success: true, message: 'Data changed event triggered!' });
  });

  // Database Operations
  page.querySelector('#btn-export').addEventListener('click', async () => {
    const result = await exportDatabase();
    showMessage(page, result);
  });

  page.querySelector('#file-import').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
      const result = await importDatabase(e.target.files[0]);
      showMessage(page, result);
      e.target.value = '';
    }
  });

  page.querySelector('#btn-clear').addEventListener('click', async () => {
    if (confirm('Clear all data?')) {
      const result = await clearDatabase();
      showMessage(page, result);
    }
  });

  page.querySelector('#btn-reset').addEventListener('click', async () => {
    if (confirm('Reset entire database? This cannot be undone!')) {
      const result = await resetDatabase();
      showMessage(page, result);
    }
  });

  page.querySelector('#btn-view-db').addEventListener('click', async () => {
    const contentEl = page.querySelector('#db-content');
    if (contentEl.style.display === 'none') {
      const result = await getDatabaseData();
      if (result.success) {
        contentEl.textContent = JSON.stringify(result.data, null, 2);
        contentEl.style.display = 'block';
      } else {
        showMessage(page, result);
      }
    } else {
      contentEl.style.display = 'none';
    }
  });

  return page;
}

/**
 * Show message
 */
function showMessage(page, result) {
  const messageEl = page.querySelector('#message');
  messageEl.style.display = 'block';
  if (result.success) {
    messageEl.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
    messageEl.style.color = 'var(--color-success)';
    messageEl.textContent = result.message || 'Success!';
  } else {
    messageEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
    messageEl.style.color = 'var(--color-danger)';
    messageEl.textContent = result.error || 'Error!';
  }
  setTimeout(() => { messageEl.style.display = 'none'; }, 4000);
}
