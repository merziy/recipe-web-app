<template>
  <main>
    <h1>Edit Recipe</h1>
    <div v-if="loading">Loading recipe...</div>
    <div v-else-if="error">{{ error }}</div>
    <form v-else @submit.prevent="submitRecipe">
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
      <label v-if="recipe && recipe.instructions">
        Instructions:
        <textarea 
          v-model="instructionsText" 
          rows="5"
          placeholder="Enter instructions, one per line"
        ></textarea>
      </label>
      <div class="button-group">
        <button type="submit">Update Recipe</button>
        <button type="button" @click="cancel">Cancel</button>
      </div>
    </form>
    <p v-if="status" :class="statusClass">{{ status }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipesStore } from '@/stores/recipes';

const route = useRoute();
const router = useRouter();
const title = ref('');
const description = ref('');
const servings = ref(1);
const prepTime = ref('');
const cookTime = ref('');
const instructionsText = ref('');
const status = ref('');
const loading = ref(true);
const error = ref('');
const recipe = ref<any>(null);

const statusClass = ref('');

onMounted(async () => {
  const handle = route.params.handle as string;
  const store = useRecipesStore();
  try {
    store.load();
    recipe.value = store.getByHandle(handle) as any;
    if (recipe.value) {
      title.value = recipe.value.title || '';
      description.value = recipe.value.description || '';
      servings.value = recipe.value.servings || 1;
      prepTime.value = recipe.value.prepTime || '';
      cookTime.value = recipe.value.cookTime || '';
      if (recipe.value.instructions && Array.isArray(recipe.value.instructions)) {
        instructionsText.value = recipe.value.instructions.join('\n');
      } else {
        instructionsText.value = '';
      }
    } else {
      error.value = 'Recipe not found.';
    }
  } catch (err) {
    error.value = 'Error loading recipe.';
  } finally {
    loading.value = false;
  }
});

async function submitRecipe() {
  if (!recipe.value) return;

  const instructions = instructionsText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const updatedRecipe = {
    ...recipe.value,
    title: title.value,
    description: description.value,
    servings: servings.value,
    prepTime: prepTime.value,
    cookTime: cookTime.value,
    instructions: instructions.length > 0 ? instructions : recipe.value.instructions || [],
  };

  try {
    const store = useRecipesStore();
    const ok = store.update(recipe.value.handle, updatedRecipe as any);
    if (ok) {
      status.value = 'Recipe updated successfully!';
      statusClass.value = 'success';
      setTimeout(() => {
        router.push(`/article/${recipe.value.handle}`);
      }, 600);
    } else {
      status.value = 'Error: Failed to update recipe';
      statusClass.value = 'error';
    }
  } catch (err) {
    status.value = 'Error. Please try again.';
    statusClass.value = 'error';
  }
}

function cancel() {
  if (recipe.value) {
    router.push(`/article/${recipe.value.handle}`);
  } else {
    router.push('/');
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
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 1em;
  margin-top: 1em;
}

button {
  flex: 1;
  background: green;
  color: #fff;
  border: none;
  padding: 0.75em 1.5em;
  border-radius: 4px;
  cursor: pointer;
}

button[type="button"] {
  background: #666;
}

button:hover {
  opacity: 0.9;
}

p.success {
  color: #4CAF50;
  margin-top: 1em;
}

p.error {
  color: #ff4444;
  margin-top: 1em;
}
</style>

