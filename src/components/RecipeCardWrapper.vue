<template>
  <h2>{{ currentDate }}</h2>
  <RecipeCard />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import RecipeCard from './RecipeCard.vue';

  const currentDate = computed(() => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const getWeekday = weekday[new Date().getDay()];
    const day = new Date().getDate();
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();

    return `${getWeekday}, ${month} ${day}, ${year}`;
  });
</script>

<style scoped>
  h2 {
    text-align: center;
  }
</style>
