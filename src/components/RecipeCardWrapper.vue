<template>
  <h2>{{ currentDate }}</h2>
  <div v-if="recipes.length === 0">
    <p style="text-align: center;">
      No recipes yet.
    </p>
  </div>
  <div v-else>
    <RecipeCard
      v-for="recipe in recipes"
      :key="recipe._id"
      :title="recipe.title"
      :description="recipe.description"
      :servings="recipe.servings"
      :prepTime="recipe.prepTime"
      :cookTime="recipe.cookTime"
      :handle="recipe.handle"
      :image="recipe.image"
      @click="goToArticle(recipe.handle)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import RecipeCard from './RecipeCard.vue';
import { useRouter } from 'vue-router';
import { useRecipesStore } from '@/stores/recipes';

const router = useRouter();
const currentDate = computed(() => {
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const getWeekday = weekday[new Date().getDay()];
  const day = new Date().getDate();
  const month = new Date().toLocaleString('default', { month: 'long' });
  const year = new Date().getFullYear();

  return `${getWeekday}, ${month} ${day}, ${year}`;
});

const store = useRecipesStore();
const recipes = computed(() => store.recipes);

onMounted(() => {
  store.load();
});

function goToArticle(handle: string) {
  router.push(`/article/${handle}`);
}
</script>

<style scoped>
  h2 {
    text-align: center;
  }
</style>
