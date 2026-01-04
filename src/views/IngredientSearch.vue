<template>
  <main class="ingredient-search">
    <h1>Ingredient Search</h1>
    <p>Select ingredients to find recipes containing all of them.</p>
    <IngredientSelector v-model="selectedIngredients" />
    <div v-if="filteredRecipes.length" class="search-results">
      <h3>Matching Recipes</h3>
      <ul>
        <li v-for="recipe in filteredRecipes" :key="recipe.handle">
          <router-link :to="`/article/${recipe.handle}`">{{ recipe.title }}</router-link>
        </li>
      </ul>
    </div>
    <div v-else-if="selectedIngredients.length">
      <p>No recipes found with selected ingredients.</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import IngredientSelector from '@/components/IngredientSelector.vue';
import { useRecipesStore } from '@/stores/recipes';
import { computed, ref } from 'vue';

const store = useRecipesStore();

const selectedIngredients = ref<string[]>([]);

const filteredRecipes = computed(() => {
  const all = store.getAll ? store.getAll() : store.recipes;
  const selected = selectedIngredients.value.map(i => i.toLowerCase());
  if (!selected.length) return [];
  return all.filter((recipe: any) => {
    if (!Array.isArray(recipe.ingredients)) return false;
    const recipeIngredients = recipe.ingredients.map((i: string) => i.toLowerCase());
    if (selected.length === 1) {
      return recipeIngredients.includes(selected[0]);
    } else {
      return selected.every(ing => recipeIngredients.includes(ing));
    }
  });
});
</script>

<style scoped>
.ingredient-search {
  max-width: 700px;
  margin: 0 auto;
  padding: 1em;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
