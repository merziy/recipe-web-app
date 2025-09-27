<template>
  <main>
    <h1>Add a New Recipe</h1>
    <form @submit.prevent="submitRecipe">
      <label>
        Title:
        <input v-model="title" required />
      </label>
      <label>
        Description:
        <textarea v-model="description" required></textarea>
      </label>
      <label>
        Servings:
        <input v-model.number="servings" type="number" min="1" required />
      </label>
      <label>
        Prep Time:
        <input v-model="prepTime" required />
      </label>
      <label>
        Cook Time:
        <input v-model="cookTime" required />
      </label>
      <button type="submit">Add Recipe</button>
    </form>
    <p v-if="status">{{ status }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const title = ref('');
const description = ref('');
const servings = ref(1);
const prepTime = ref('');
const cookTime = ref('');
const status = ref('');

async function submitRecipe() {
  const recipe = {
    title: title.value,
    description: description.value,
    servings: servings.value,
    prepTime: prepTime.value,
    cookTime: cookTime.value,
  };
  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    if (res.ok) {
      status.value = 'Recipe saved!';
      title.value = '';
      description.value = '';
      servings.value = 1;
      prepTime.value = '';
      cookTime.value = '';
    } else {
      status.value = 'Error saving recipe.';
    }
  } catch (err) {
    status.value = 'Network error.';
  }
}
</script>

<style scoped>
main {
  max-width: 500px;
  margin: 2em auto;
  padding: 2em;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
form label {
  display: block;
  margin-bottom: 1em;
}
form input, form textarea {
  width: 100%;
  padding: 0.5em;
  margin-top: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: green;
  color: #fff;
  border: none;
  padding: 0.75em 1.5em;
  border-radius: 4px;
  cursor: pointer;
}
</style>
