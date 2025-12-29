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
      <label class="file-input">
        <span class="file-label">Image:</span>
        <span class="file-button">Choose file</span>
        <input type="file" accept="image/*" @change="onImageChange" />
        <span class="file-name">{{ imageFile ? imageFile.name : (currentImageName || 'No file chosen') }}</span>
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
import { useRecipesStore } from '@/stores/recipes';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const title = ref('');
const description = ref('');
const servings = ref(1);
const prepTime = ref('');
const cookTime = ref('');
const instructionsText = ref('');
const imageFile = ref<File | null>(null);
const status = ref('');
const loading = ref(true);
const error = ref('');
const recipe = ref<any>(null);

const currentImageName = computed(() => {
  if (imageFile.value) return imageFile.value.name;
  const img = recipe.value && recipe.value.image;
  if (!img) return '';
  try {
    const u = new URL(img);
    const parts = u.pathname.split('/');
    return parts[parts.length - 1] || img;
  } catch (e) {
    return typeof img === 'string' ? img : '';
  }
});

const statusClass = ref('');

onMounted(async () => {
  const handle = route.params.handle as string;
  const store = useRecipesStore();
  try {
    await store.load();
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
    image: recipe.value.image,
  };

  try {
    const store = useRecipesStore();
    const API_BASE = import.meta.env.VITE_API_URL || ''
    if (imageFile.value) {
      const form = new FormData()
      form.append('file', imageFile.value)
      const upl = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: form })
      if (upl.ok) {
        const d = await upl.json()
        updatedRecipe.image = d.url
      }
    }

    const ok = await store.update(recipe.value.handle, updatedRecipe as any);
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

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  imageFile.value = file
  const reader = new FileReader()
  reader.readAsDataURL(file)
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

.file-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.file-input input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.file-button {
  background: #eee;
  border: 1px solid #ccc;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
}
.file-name {
  font-size: 0.9rem;
  color: #333;
}
.preview {
  display: block;
  max-width: 120px;
  max-height: 80px;
  object-fit: cover;
  margin-left: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
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

