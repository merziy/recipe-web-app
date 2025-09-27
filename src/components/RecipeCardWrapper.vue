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
      @click="goToArticle(recipe.handle)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import RecipeCard from './RecipeCard.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentDate = computed(() => {
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const getWeekday = weekday[new Date().getDay()];
  const day = new Date().getDate();
  const month = new Date().toLocaleString('default', { month: 'long' });
  const year = new Date().getFullYear();

  return `${getWeekday}, ${month} ${day}, ${year}`;
});

const recipes = ref([]);

onMounted(async () => {
  const res = await fetch('/api/recipes');
  if (res.ok) {
    recipes.value = await res.json();
  }
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
