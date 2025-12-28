<template>
  <article v-if="recipe">
    <image :src="`@/assets/${recipe.image}`" alt="" />
    <h1>{{ recipe.title }}</h1>
    <ul>
      <li>
        <button @click="navigateToEdit">
          <p>Edit</p>
        </button>
      </li>
      <li>
        <button @click="openDatePicker">
          <p>Add recipe to date</p>
        </button>
      </li>
      <li>
        <button>
          <p>More</p>
        </button>
      </li>
    </ul>
    <div v-if="saveMessage" :class="saveMessageClass">
      {{ saveMessage }}
    </div>
    <DatePickerModal 
      :is-open="datePickerOpen" 
      @close="closeDatePicker"
      @date-selected="handleDateSelected"
    />
    <ul>
      <li>
        <p>Servings: {{ recipe.servings }}</p>
      </li>
      <li>
        <p>Prep: {{ recipe.prepTime }}</p>
      </li>
      <li>
        <p>Cook: {{ recipe.cookTime }}</p>
      </li>
    </ul>
    <p v-for="(instruction, index) in recipe.instructions" :key="index">
      {{ instruction }}
    </p>
  </article>
  <div v-else>
    <p>Recipe not found.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DatePickerModal from '@/components/DatePickerModal.vue';

const route = useRoute();
const router = useRouter();
const recipe = ref<any>(null);
const saveMessage = ref('');
const datePickerOpen = ref(false);
const saveMessageClass = computed(() => {
  return saveMessage.value.includes('Error') || saveMessage.value.includes('Please') 
    ? 'error-message' 
    : 'success-message';
});

onMounted(async () => {
  const handle = route.params.handle;
  const res = await fetch(`/api/recipes`);
  if (res.ok) {
    const recipes = await res.json();
    recipe.value = recipes.find((r: { handle: string }) => r.handle === handle);
  }
});

function navigateToEdit() {
  if (recipe.value) {
    router.push(`/article/${recipe.value.handle}/edit`);
  }
}

function openDatePicker() {
  datePickerOpen.value = true;
}

function closeDatePicker() {
  datePickerOpen.value = false;
}

function handleDateSelected(date: Date) {
  if (!recipe.value) return;

  const selectedDate = date.toISOString().split('T')[0];
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  saveRecipeToDate(selectedDate, formattedDate);
}

async function saveRecipeToDate(dateStr: string, formattedDate: string) {
  if (!recipe.value) return;

  try {
    const res = await fetch(`/api/recipes/${recipe.value.handle}/date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr }),
    });

    if (res.ok) {
      saveMessage.value = `Recipe saved to ${formattedDate} successfully!`;
      setTimeout(() => {
        saveMessage.value = '';
      }, 3000);
    } else {
      const error = await res.json();
      saveMessage.value = `Error: ${error.error || 'Failed to save recipe to date'}`;
      setTimeout(() => {
        saveMessage.value = '';
      }, 3000);
    }
  } catch (err) {
    saveMessage.value = 'Network error. Please try again.';
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  }
}
</script>

<style scoped>
.error-message {
  color: #ff4444;
  padding: 0.5em;
  margin: 0.5em 0;
  background-color: #ffe6e6;
  border-radius: 4px;
}

.success-message {
  color: #4CAF50;
  padding: 0.5em;
  margin: 0.5em 0;
  background-color: #e6ffe6;
  border-radius: 4px;
}
</style>