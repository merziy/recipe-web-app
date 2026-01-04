<template>
  <main class="settings">
    <h1>Settings</h1>
    <section>
      <h2>Ingredient Search</h2>
      <p>Select or type ingredients to find recipes containing all of them.</p>
      <IngredientSelector v-model="selectedIngredients" />
      <input
        v-model="manualIngredient"
        type="text"
        placeholder="Type ingredient and press Enter"
        @keyup.enter="addManualIngredient"
        class="manual-ingredient-input"
      />
      <div class="manual-ingredients" v-if="manualIngredients.length">
        <span v-for="(ing, idx) in manualIngredients" :key="ing + idx" class="manual-chip">
          {{ ing }}
          <span class="remove" @click="removeManualIngredient(idx)">&times;</span>
        </span>
      </div>
      <div v-if="filteredRecipes.length" class="search-results">
        <h3>Matching Recipes</h3>
        <ul>
          <li v-for="recipe in filteredRecipes" :key="recipe.handle">
            <router-link :to="`/article/${recipe.handle}`">{{ recipe.title }}</router-link>
          </li>
        </ul>
      </div>
      <div v-else-if="selectedIngredients.length || manualIngredients.length">
        <p>No recipes found with all selected ingredients.</p>
      </div>
    </section>
    <section>
      <h2>Data</h2>
      <button @click="clearData">Clear all recipes (local)</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import IngredientSelector from '@/components/IngredientSelector.vue';
import { useRecipesStore } from '@/stores/recipes';
import { computed, ref } from 'vue';

const store = useRecipesStore();
const clearing = ref(false);

const selectedIngredients = ref<string[]>([]);
const manualIngredient = ref('');
const manualIngredients = ref<string[]>([]);

function addManualIngredient() {
  const val = manualIngredient.value.trim();
  if (val && !manualIngredients.value.includes(val)) {
    manualIngredients.value.push(val);
  }
  manualIngredient.value = '';
}
function removeManualIngredient(idx: number) {
  manualIngredients.value.splice(idx, 1);
}

const filteredRecipes = computed(() => {
  const all = store.getAll ? store.getAll() : store.recipes;
  const allIngredients = [...selectedIngredients.value, ...manualIngredients.value].map(i => i.toLowerCase());
  if (!allIngredients.length) return [];
  return all.filter((recipe: any) => {
    if (!Array.isArray(recipe.ingredients)) return false;
    const recipeIngredients = recipe.ingredients.map((i: string) => i.toLowerCase());
    return allIngredients.every(ing => recipeIngredients.includes(ing));
  });
});

function clearData() {
  if (!confirm('Clear all local recipes? This cannot be undone.')) return;
  clearing.value = true;
  try {
    localStorage.removeItem('recipe_app_recipes_v1');
    store.recipes.length = 0;
  } finally {
    clearing.value = false;
  }
}
</script>

<style scoped>
main.settings {
  max-width: 700px;
  margin: 0 auto;
  padding: 1em;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
}
/* Ingredient search styles */
.manual-ingredient-input {
  width: 100%;
  max-width: 500px;
  margin-bottom: 0.5em;
  padding: 0.5em;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1em;
  box-sizing: border-box;
}
.manual-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin-bottom: 0.5em;
}
.manual-chip {
  background: #e0e0e0;
  border-radius: 12px;
  padding: 0.2em 0.7em 0.2em 0.4em;
  font-size: 1em;
  display: flex;
  align-items: center;
}
.manual-chip .remove {
  cursor: pointer;
  color: #888;
  margin-left: 0.2em;
  font-size: 1.1em;
}
.search-results {
  margin-top: 1em;
}
.search-results ul {
  list-style: none;
  padding: 0;
}
.search-results li {
  margin-bottom: 0.3em;
}
</style>
