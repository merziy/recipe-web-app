<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import Calendar from '@/components/Calendar.vue';
  import RecipeCardWrapper from '@/components/RecipeCardWrapper.vue';
</script>

<template>
  <main>
    <Calendar />
    <RecipeCardWrapper />
    <RouterView />
  </main>
</template>
