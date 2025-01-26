<template>
  <h2>{{ currentMonth }}</h2>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const currentMonth = computed(() => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();

    return `${month}, ${year}`;
  });
</script>
