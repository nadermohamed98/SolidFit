/**
 * Food Preferences Page
 */

import foodPreferenceRepository from '../repositories/foodPreferenceRepository.js';

const INDEX_URL = './assets/data/catalog/foods/index.json';
const FOODS_BASE_URL = './assets/data/catalog/foods/';

let categoriesCache = null;
const foodFileCache = new Map();

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadCategories() {
  if (categoriesCache) {
    return categoriesCache;
  }

  const response = await fetch(INDEX_URL);
  if (!response.ok) {
    throw new Error('Failed to load food categories');
  }

  const data = await response.json();
  categoriesCache = data.categories || [];
  return categoriesCache;
}

async function loadFoodsByCategory(category) {
  if (foodFileCache.has(category.id)) {
    return foodFileCache.get(category.id);
  }

  const response = await fetch(`${FOODS_BASE_URL}${category.file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${category.name}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items.filter(item => item.enabled !== false) : [];
  foodFileCache.set(category.id, items);
  return items;
}

function renderFilterChip(label, value, currentValue) {
  const active = value === currentValue;
  return `
    <button
      type="button"
      class="btn ${active ? 'btn-primary' : 'btn-secondary'}"
      data-pref-filter="${value}"
      aria-pressed="${active ? 'true' : 'false'}"
      style="min-width: 84px;"
    >
      ${label}
    </button>
  `;
}

function renderPreferenceButton(foodId, preference, currentPreference, label) {
  const active = currentPreference === preference;
  return `
    <button
      type="button"
      class="btn ${active ? 'btn-primary' : 'btn-secondary'}"
      data-food-preference="${preference}"
      data-food-id="${foodId}"
      aria-pressed="${active ? 'true' : 'false'}"
      style="flex: 1; transition: all var(--duration-fast) var(--easing-default);"
    >
      ${label}
    </button>
  `;
}

function matchesSearch(food, query) {
  if (!query) return true;
  const normalizedQuery = query.trim().toLowerCase();
  return (
    food.name?.toLowerCase().includes(normalizedQuery) ||
    food.arabicName?.toLowerCase().includes(normalizedQuery)
  );
}

function filterFoods(foods, preferences, searchQuery, activeFilter) {
  return foods.filter(food => {
    const preference = preferences[food.id] || null;
    const passesSearch = matchesSearch(food, searchQuery);
    const passesFilter = activeFilter === 'all' ? true : preference === activeFilter;
    return passesSearch && passesFilter;
  });
}

/**
 * Render food preferences page
 * @returns {HTMLElement}
 */
export function renderFoodPreferences() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Food Preferences</h1>
      <p class="page-subtitle">Select the foods you like so SolidFit can generate better meal plans.</p>
    </div>
  `;

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '16px';
  page.appendChild(content);

  const state = {
    categories: [],
    activeCategoryId: null,
    searchQuery: '',
    activeFilter: 'all',
    preferences: {},
    foods: []
  };

  async function renderCards() {
    const category = state.categories.find(item => item.id === state.activeCategoryId);
    if (!category) return;

    const cardsHost = content.querySelector('[data-food-cards]');
    if (!cardsHost) return;

    cardsHost.innerHTML = `
      <div class="card" style="padding: 24px;">
        <div class="skeleton" style="height: 18px; width: 160px; margin-bottom: 12px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 8px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 72%; border-radius: 6px;"></div>
      </div>
    `;

    try {
      state.foods = await loadFoodsByCategory(category);
    } catch (error) {
      cardsHost.innerHTML = `
        <div class="card" style="padding: 24px; color: var(--color-danger);">
          ${escapeHtml(error.message)}
        </div>
      `;
      return;
    }

    const foodsToRender = filterFoods(state.foods, state.preferences, state.searchQuery, state.activeFilter);

    if (!foodsToRender.length) {
      cardsHost.innerHTML = `
        <div class="card" style="padding: 32px; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 12px;">🍽️</div>
          <h3 style="margin: 0 0 6px 0;">No foods found</h3>
          <p style="margin: 0; color: var(--color-text-muted);">Try another search or filter.</p>
        </div>
      `;
      return;
    }

    cardsHost.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
        ${foodsToRender.map(food => {
          const preference = state.preferences[food.id] || null;
          return `
            <article class="card" style="padding: 18px; margin: 0;">
              <div style="display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 14px;">
                <div>
                  <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${escapeHtml(food.arabicName || '')}</div>
                  <div style="font-size: 14px; color: var(--color-text-muted);">${escapeHtml(food.name || '')}</div>
                </div>
                <div style="padding: 6px 10px; border-radius: 9999px; background: var(--color-card-hover); color: var(--color-text-secondary); font-size: 12px; font-weight: 600;">
                  ${Number(food.calories || 0)} kcal
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
                <div style="padding: 10px; border-radius: 12px; background: var(--color-card-hover); text-align: center;">
                  <div style="font-size: 12px; color: var(--color-text-muted);">Protein</div>
                  <div style="font-weight: 700;">${Number(food.protein || 0)}g</div>
                </div>
                <div style="padding: 10px; border-radius: 12px; background: var(--color-card-hover); text-align: center;">
                  <div style="font-size: 12px; color: var(--color-text-muted);">Carbs</div>
                  <div style="font-weight: 700;">${Number(food.carbs || 0)}g</div>
                </div>
                <div style="padding: 10px; border-radius: 12px; background: var(--color-card-hover); text-align: center;">
                  <div style="font-size: 12px; color: var(--color-text-muted);">Fat</div>
                  <div style="font-weight: 700;">${Number(food.fat || 0)}g</div>
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                ${renderPreferenceButton(food.id, 'love', preference, '❤️ Love')}
                ${renderPreferenceButton(food.id, 'okay', preference, '👍 Okay')}
                ${renderPreferenceButton(food.id, 'dislike', preference, '❌ Dislike')}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    cardsHost.querySelectorAll('[data-food-preference]').forEach(button => {
      button.addEventListener('click', async () => {
        const foodId = button.dataset.foodId;
        const preference = button.dataset.foodPreference;
        const saveResult = await foodPreferenceRepository.setPreference(foodId, preference);
        if (!saveResult.success) {
          return;
        }

        state.preferences[foodId] = preference;
        renderCards();
      });
    });
  }

  function renderShell() {
    content.innerHTML = `
      <section class="card" style="padding: 20px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px;" data-category-tabs></div>
          <div style="display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px;">
            <div class="input-group" style="margin-bottom: 0;">
              <label class="input-label" for="food-search">Search</label>
              <input id="food-search" class="input-field" type="search" placeholder="Search by English or Arabic name">
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;" data-filter-chips>
              ${renderFilterChip('All', 'all', state.activeFilter)}
              ${renderFilterChip('Loved', 'love', state.activeFilter)}
              ${renderFilterChip('Okay', 'okay', state.activeFilter)}
              ${renderFilterChip('Disliked', 'dislike', state.activeFilter)}
            </div>
          </div>
        </div>
      </section>
      <div data-food-cards></div>
    `;

    const tabsHost = content.querySelector('[data-category-tabs]');
    tabsHost.innerHTML = state.categories.map(category => {
      const active = category.id === state.activeCategoryId;
      return `
        <button
          type="button"
          class="btn ${active ? 'btn-primary' : 'btn-secondary'}"
          data-category-id="${category.id}"
          aria-pressed="${active ? 'true' : 'false'}"
          style="transition: all var(--duration-fast) var(--easing-default);"
        >
          ${escapeHtml(category.icon || '🍽️')} ${escapeHtml(category.name || category.id)}
        </button>
      `;
    }).join('');

    tabsHost.querySelectorAll('[data-category-id]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeCategoryId = button.dataset.categoryId;
        renderShell();
        renderCards();
      });
    });

    const searchInput = content.querySelector('#food-search');
    searchInput.value = state.searchQuery;
    searchInput.addEventListener('input', () => {
      state.searchQuery = searchInput.value;
      renderCards();
    });

    content.querySelectorAll('[data-pref-filter]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeFilter = button.dataset.prefFilter;
        renderShell();
        renderCards();
      });
    });
  }

  async function init() {
    content.innerHTML = `
      <div class="card" style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 220px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 8px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 70%; border-radius: 6px;"></div>
      </div>
    `;

    try {
      const [categories, preferenceResult] = await Promise.all([
        loadCategories(),
        foodPreferenceRepository.getPreferenceMap()
      ]);

      state.categories = categories;
      state.activeCategoryId = categories[0]?.id || null;
      state.preferences = preferenceResult.success ? preferenceResult.data : {};

      if (!state.categories.length) {
        content.innerHTML = `
          <div class="card" style="padding: 32px; text-align: center;">
            <div style="font-size: 52px; margin-bottom: 12px;">🍽️</div>
            <h2 style="margin: 0 0 6px 0; font-size: 20px;">No food catalog available.</h2>
            <p style="margin: 0; color: var(--color-text-muted);">Add catalog files to start managing food preferences.</p>
          </div>
        `;
        return;
      }

      renderShell();
      renderCards();
    } catch (error) {
      content.innerHTML = `
        <div class="card" style="padding: 24px; color: var(--color-danger);">
          ${escapeHtml(error.message)}
        </div>
      `;
    }
  }

  init();

  return page;
}
