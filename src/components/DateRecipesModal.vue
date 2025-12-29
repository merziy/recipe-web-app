<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Recipes for {{ formattedDate }}</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="loading" class="loading">Loading recipes...</div>
        <div v-else-if="recipes.length === 0" class="empty">
          <p>No recipes saved for this date.</p>
        </div>
        <ul v-else class="recipe-list">
          <li v-for="recipe in recipes" :key="recipe.handle" class="recipe-item">
            <router-link :to="`/article/${recipe.handle}`" class="recipe-link">
              {{ recipe.title }}
            </router-link>
            <button class="remove-button" @click="removeRecipe(recipe.handle)">Remove</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecipesStore } from '@/stores/recipes';
import { computed, ref, watch } from 'vue';

interface Recipe {
  handle: string
  title: string
  [key: string]: any
}

const props = defineProps<{
  isOpen: boolean
  date: Date | null
}>()

const emit = defineEmits<{
  close: []
  recipeRemoved: []
}>()

const recipes = ref<Recipe[]>([])
const loading = ref(false)

const formattedDate = computed(() => {
  if (!props.date) return ''
  return props.date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

async function fetchRecipes() {
  if (!props.date) return;
  loading.value = true;
  try {
    const dateStr = props.date.toISOString().split('T')[0];
    const store = useRecipesStore();
    const list = await store.getRecipesForDate(dateStr);
    recipes.value = list;
  } catch (err) {
    console.error('Error fetching recipes:', err);
    recipes.value = [];
  } finally {
    loading.value = false;
  }
}

async function removeRecipe(handle: string) {
  if (!props.date) return;
  try {
    const dateStr = props.date.toISOString().split('T')[0];
    const store = useRecipesStore();
    const ok = await store.removeFromDate(handle, dateStr);
    if (ok) {
      recipes.value = recipes.value.filter(r => r.handle !== handle);
      emit('recipeRemoved');
    } else {
      console.error('Error removing recipe from date')
    }
  } catch (err) {
    console.error('Error removing recipe:', err);
  }
}

function close() {
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.date) {
    fetchRecipes()
  }
})

watch(() => props.date, () => {
  if (props.isOpen && props.date) {
    fetchRecipes()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5em;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5em;
}

.close-button {
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-button:hover {
  color: #000;
}

.modal-body {
  padding: 1.5em;
  overflow-y: auto;
  flex: 1;
}

.loading, .empty {
  text-align: center;
  padding: 2em;
  color: #666;
}

.recipe-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recipe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75em;
  border-bottom: 1px solid #eee;
}

.recipe-item:last-child {
  border-bottom: none;
}

.recipe-link {
  flex: 1;
  text-decoration: none;
  color: #333;
  font-size: 1.1em;
}

.recipe-link:hover {
  color: #9EBED6;
  text-decoration: underline;
}

.remove-button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.remove-button:hover {
  background: #cc0000;
}
</style>

