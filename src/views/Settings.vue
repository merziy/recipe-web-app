<template>
  <main class="settings">
    <h1>Settings</h1>
    <section>
      <h2>App</h2>
      <p>This is a minimal settings page. Future options can be added here.</p>
    </section>
    <section>
      <h2>Data</h2>
      <button @click="clearData">Clear all recipes (local)</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRecipesStore } from '@/stores/recipes';
import { ref } from 'vue';

const store = useRecipesStore();
const clearing = ref(false);

function clearData() {
  if (!confirm('Clear all local recipes? This cannot be undone.')) return;
  clearing.value = true;
  try {
    localStorage.removeItem('recipe_app_recipes_v1');
    store.recipes.length = 0;
    store.persist();
  } finally {
    clearing.value = false;
  }
}
</script>

<style scoped>
main.settings {
  max-width: 700px;
  margin: 2em auto;
  padding: 1em;
}
button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
}
</style>
