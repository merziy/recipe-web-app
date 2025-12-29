<template>
  <article v-if="recipe" class="article-root">
    <div class="hero">
      <img v-if="imageSrc" :src="imageSrc" alt="" class="hero-image" />
    </div>

    <div class="content">
      <h1 class="title">{{ recipe.title }}</h1>

      <div class="actions">
        <button class="action" @click="navigateToEdit">✏️<span>Edit</span></button>
        <button class="action" @click="openDatePicker">➕<span>Save to list</span></button>
        <button class="action">⋯<span>More</span></button>
      </div>

      <div class="meta-row">
        <div class="meta-item">🍽️ <span>{{ recipe.servings || '-' }} Servings</span></div>
        <div class="meta-item">⏱️ <span>Prep: {{ recipe.prepTime || '-' }}</span></div>
        <div class="meta-item">🔥 <span>Cook: {{ recipe.cookTime || '-' }}</span></div>
      </div>

      <div v-if="saveMessage" :class="saveMessageClass">
        {{ saveMessage }}
      </div>

      <DatePickerModal
        :is-open="datePickerOpen"
        @close="closeDatePicker"
        @date-selected="handleDateSelected"
      />

      <section class="description">
        <p v-if="recipe.description" class="lead">{{ recipe.description }}</p>
        <div class="instructions">
          <p v-for="(instruction, index) in recipe.instructions" :key="index">
            {{ instruction }}
          </p>
        </div>
      </section>
    </div>
  </article>
  <div v-else>
    <p>Recipe not found.</p>
  </div>
</template>

<script setup lang="ts">
import DatePickerModal from '@/components/DatePickerModal.vue';
import { useRecipesStore } from '@/stores/recipes';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const recipe = ref<any>(null);
const saveMessage = ref('');
const datePickerOpen = ref(false);
const imageSrc = computed(() => {
  if (!recipe.value || !recipe.value.image) return null;
  try {
    return new URL(`../assets/${recipe.value.image}`, import.meta.url).href;
  } catch (err) {
    return null;
  }
});
const saveMessageClass = computed(() => {
  return saveMessage.value.includes('Error') || saveMessage.value.includes('Please') 
    ? 'error-message' 
    : 'success-message';
});

onMounted(() => {
  const handle = route.params.handle as string;
  const store = useRecipesStore();
  store.load();
  recipe.value = store.getByHandle(handle) as any;
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

function saveRecipeToDate(dateStr: string, formattedDate: string) {
  if (!recipe.value) return;
  const store = useRecipesStore();
  const res = store.saveToDate(recipe.value.handle, dateStr);
  if (res.ok) {
    saveMessage.value = `Recipe saved to ${formattedDate} successfully!`;
  } else {
    saveMessage.value = `Error: ${res.error || 'Failed to save recipe to date'}`;
  }
  setTimeout(() => {
    saveMessage.value = '';
  }, 3000);
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

article img {
  width: 100%;
  height: auto;
  max-width: 100%;
  display: block;
  margin-bottom: 1rem;
}

.article-root {
  display: block;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.content {
  padding: 0 1rem 2rem;
  max-width: 760px;
  margin: 0 auto;
  box-sizing: border-box;
}

.title {
  text-align: center;
  font-size: 1.6rem;
  margin: 0.75rem 0 0.5rem;
  line-height: 1.1;
  font-weight: 800;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0 0.75rem;
}

.action {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.action span {
  font-size: 0.8rem;
}

.meta-row {
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-top: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
}

.description {
  margin-top: 1rem;
  background: #fff;
  border-radius: 18px 18px 6px 6px;
  padding: 1rem;
  box-shadow: 0 -6px 20px rgba(0,0,0,0.06);
}

.lead {
  color: #444;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.instructions p {
  margin: 0.5rem 0;
  color: #333;
  line-height: 1.5;
}
</style>