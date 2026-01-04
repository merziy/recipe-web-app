<template>
  <main>
    <h1>Add a New Recipe</h1>
    <form @submit.prevent="submitRecipe">
      <label>
        Title:
        <input v-model="title" required />
      </label>
      <label>
        Image:
        <input type="file" accept="image/*" @change="onImageChange" />
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
        Prep Time (minutes):
        <input v-model="prepTime" required placeholder="e.g. 4 for 4:00, 180 for 180:00" />
      </label>
      <label>
        Cook Time (minutes):
        <input v-model="cookTime" required placeholder="e.g. 4 for 4:00, 180 for 180:00" />
      </label>
      <label>
        Ingredients:
        <IngredientSelector v-model="ingredients" />
      </label>
      <label>
        Instructions:
        <textarea
          v-model="instructionsText"
          rows="5"
          placeholder="Enter instructions, one per line"
        ></textarea>
      </label>
      <div class="button-group">
        <button type="submit">Add Recipe</button>
        <button type="button" @click="cancel">Cancel</button>
      </div>
    </form>

    <p v-if="status" :class="statusClass">{{ status }}</p>
  </main>
</template>

<script setup lang="ts">

import IngredientSelector from '@/components/IngredientSelector.vue'
import { useRecipesStore } from '@/stores/recipes'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const title = ref('')
const description = ref('')
const servings = ref(1)
const prepTime = ref('')
const cookTime = ref('')
const instructionsText = ref('')
const ingredients = ref<string[]>([])
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const status = ref('')
const statusClass = ref('')

const router = useRouter()
const store = useRecipesStore()

function cancel() {
  router.push('/')
}

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

async function submitRecipe() {
  const handleBase = title.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const instructions = instructionsText.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const recipe = {
    title: title.value,
    description: description.value,
    servings: servings.value,
    prepTime: prepTime.value,
    cookTime: cookTime.value,
    handle: handleBase,
    instructions,
    ingredients: ingredients.value,
    image: 'chicken-and-rice.jpg',
  }

  try {
    const API_BASE = import.meta.env.VITE_API_URL || ''
    if (imageFile.value) {
      const form = new FormData()
      form.append('file', imageFile.value)
      const upl = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: form })
      if (upl.ok) {
        const d = await upl.json()
        recipe.image = d.url
      }
    }

    const saved = await store.add(recipe)
    status.value = 'Recipe saved!'
    statusClass.value = 'success'
    title.value = ''
    description.value = ''
    servings.value = 1
    prepTime.value = ''
    cookTime.value = ''
    instructionsText.value = ''
    ingredients.value = []
    imageFile.value = null
    imagePreview.value = null
    if (saved && (saved as any).handle) {
      router.push(`/article/${(saved as any).handle}`)
    } else {
      router.push('/')
    }
  } catch (err) {
    status.value = 'Error saving recipe.'
    statusClass.value = 'error'
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
