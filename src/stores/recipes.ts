import { defineStore } from 'pinia';
import { ref } from 'vue';

type Recipe = {
  _id?: string;
  handle: string;
  title: string;
  description?: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  instructions?: string[];
  image?: string;
  dates?: string[];
};

const STORAGE_KEY = 'recipe_app_recipes_v1';

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([]);

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        recipes.value = JSON.parse(raw);
      } else {
        
        recipes.value = [
          {
            _id: generateId(),
            handle: 'chicken-and-rice',
            title: 'Chicken and Rice',
            description: 'Comforting chicken with seasoned rice',
            servings: 4,
            prepTime: '15m',
            cookTime: '40m',
            instructions: ['Season chicken', 'Cook rice', 'Combine and serve'],
            image: 'chicken-and-rice.jpg',
            dates: [],
          },
        ];
        persist();
      }
    } catch (err) {
      recipes.value = [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes.value));
  }

  function getAll() {
    return recipes.value;
  }

  function getByHandle(handle: string) {
    return recipes.value.find(r => r.handle === handle);
  }

  function add(recipe: Omit<Recipe, '_id'>) {
    let handle = recipe.handle;
    let i = 1;
    while (recipes.value.find(r => r.handle === handle)) {
      handle = `${recipe.handle}-${i++}`;
    }
    const newRecipe: Recipe = { ...recipe, handle, _id: generateId(), dates: recipe.dates || [] };
    recipes.value.push(newRecipe);
    persist();
    return newRecipe;
  }

  function update(handle: string, updated: Partial<Recipe>) {
    const idx = recipes.value.findIndex(r => r.handle === handle);
    if (idx === -1) return false;
    recipes.value[idx] = { ...recipes.value[idx], ...updated };
    persist();
    return true;
  }

  function remove(handle: string) {
    const idx = recipes.value.findIndex(r => r.handle === handle);
    if (idx === -1) return false;
    recipes.value.splice(idx, 1);
    persist();
    return true;
  }

  function saveToDate(handle: string, dateIso: string) {
    const r = getByHandle(handle);
    if (!r) return { ok: false, error: 'Recipe not found' };
    r.dates = r.dates || [];
    if (r.dates.includes(dateIso)) return { ok: false, error: 'Already saved for that date' };
    r.dates.push(dateIso);
    persist();
    return { ok: true };
  }

  function removeFromDate(handle: string, dateIso: string) {
    const r = getByHandle(handle);
    if (!r) return false;
    r.dates = (r.dates || []).filter(d => d !== dateIso);
    persist();
    return true;
  }

  return { recipes, load, persist, getAll, getByHandle, add, update, remove, saveToDate, removeFromDate };
});
