<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import Calendar from '@/components/Calendar.vue';
</script>

<template>
  <main>
    <Calendar />
    <RouterView />
  </main>
</template>
