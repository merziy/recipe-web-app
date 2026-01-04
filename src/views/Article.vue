<template>
  <article v-if="recipe" class="article-root">
    <div class="hero">
      <img v-if="imageSrc" :src="imageSrc" alt="" class="hero-image" />
    </div>

    <div class="content">
      <h1 class="title">{{ recipe.title }}</h1>

      <div class="actions" ref="actionsRef">
        <button class="action" @click="navigateToEdit">✏️<span>Edit</span></button>
        <button class="action" @click="openDatePicker">➕<span>Save to list</span></button>
        <button class="action" @click="openMore" ref="moreBtn">⋯<span>More</span></button>
      </div>

      <div class="meta-row">
        <div class="meta-item">🍽️ <span>{{ recipe.servings || '-' }} Servings</span></div>
        <div class="meta-item">⏱️ <span>Prep: {{ formattedPrepTime }}</span></div>
        <div class="meta-item">🔥 <span>Cook: {{ formattedCookTime }}</span></div>
      </div>

      <div v-if="ingredientChips.length" class="ingredient-chips">
        <span v-for="ingredient in ingredientChips" :key="ingredient.name" class="ingredient-chip">
          <span class="icon">{{ ingredient.icon }}</span>
          <span class="name">{{ ingredient.name }}</span>
        </span>
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
          <p v-for="(instruction, index) in recipe.instructions || []" :key="index">
            {{ instruction }}
          </p>
        </div>
      </section>
    </div>
  </article>
  <div v-else>
    <p>Recipe not found.</p>
  </div>

  <div v-if="moreOpen">
    <div class="popover-backdrop" @click.self="closeMore"></div>
    <div class="popover-modal" :style="modalStyle">
      <h3>Options</h3>
      <div v-if="!deleteConfirm">
        <button class="danger" @click="beginDelete">Delete recipe</button>
        <button @click="closeMore">Close</button>
      </div>
      <div v-else class="confirm-block">
        <p class="confirm-text">Are you sure? Click <strong>Confirm Delete</strong> to delete this recipe.</p>
        <button class="danger" @click="confirmDelete">Confirm Delete</button>
        <button @click="cancelDelete">Cancel</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import ingredientsList from '@/assets/ingredients.json';
import DatePickerModal from '@/components/DatePickerModal.vue';
import { useRecipesStore } from '@/stores/recipes';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const ingredientChips = computed(() => {
  if (!recipe.value || !Array.isArray(recipe.value.ingredients)) return [];
  return recipe.value.ingredients.map((name: string) => {
    const found = (ingredientsList as any[]).find((ing) => ing.name === name);
    return found ? found : { name, icon: '❓' };
  });
});

const route = useRoute();
const router = useRouter();
const recipe = ref<any>(null);
const saveMessage = ref('');
const datePickerOpen = ref(false);
const moreOpen = ref(false);
const deleteConfirm = ref(false);
const moreBtn = ref<HTMLElement | null>(null);
const modalStyle = ref<Record<string, string>>({});

const ASSET_MAP = import.meta.glob('../assets/*?url', { eager: true, import: 'default' }) as Record<string, string>;

const imageSrc = computed(() => {
  if (!recipe.value || !recipe.value.image) return null;
  const img = recipe.value.image;
  if (typeof img === 'string') {
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;

    const candidate = `../assets/${img}`;
    if (ASSET_MAP[candidate]) return ASSET_MAP[candidate];

    for (const key in ASSET_MAP) {
      if (key.endsWith(img)) return ASSET_MAP[key];
    }

    return null;
  }
  return null;
});

const formattedPrepTime = computed(() => formatMinutes(recipe.value?.prepTime));
const formattedCookTime = computed(() => formatMinutes(recipe.value?.cookTime));

function formatMinutes(val: string | number | undefined): string {
  if (!val && val !== 0) return '-';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return `${n}:00 min`;
}

const saveMessageClass = computed(() => {
  return saveMessage.value.includes('Error') || saveMessage.value.includes('Please')
    ? 'error-message'
    : 'success-message';
});

onMounted(async () => {
  const handle = route.params.handle as string;
  const store = useRecipesStore();
  await store.load();
  recipe.value = store.getByHandle(handle) as any;
});

function openMore() {
  moreOpen.value = true;
  requestAnimationFrame(() => {
    const btn = moreBtn.value as HTMLElement | null;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const left = rect.left + window.scrollX;
    modalStyle.value = {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: '1001',
      minWidth: `${rect.width + 40}px`,
    };
  });
}

function closeMore() {
  moreOpen.value = false;
  deleteConfirm.value = false;
}

async function confirmDelete() {
  if (!recipe.value) return;
  const store = useRecipesStore();
  const removed = await store.remove(recipe.value.handle);
  deleteConfirm.value = false;
  moreOpen.value = false;
  if (removed) {
    router.push('/');
  } else {
    saveMessage.value = 'Error deleting recipe.';
    setTimeout(() => (saveMessage.value = ''), 3000);
  }
}

function beginDelete() {
  deleteConfirm.value = true;
}

function cancelDelete() {
  deleteConfirm.value = false;
}

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
    day: 'numeric',
  });

  saveRecipeToDate(selectedDate, formattedDate);
}

async function saveRecipeToDate(dateStr: string, formattedDate: string) {
  if (!recipe.value) return;
  const store = useRecipesStore();
  const res = await store.saveToDate(recipe.value.handle, dateStr);
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

<style>
.popover-backdrop {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 1000;
}

.popover-modal {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 6px 30px rgba(0,0,0,0.3);
  min-width: 200px;
  position: absolute;
  z-index: 1001;
}

.popover-modal .danger {
  background: #c62828;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background 0.15s;
}
.popover-modal .danger:hover {
  background: #a31515;
}

.popover-modal button {
  background: #eee;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.popover-modal button:hover {
  background: #ddd;
}

.confirm-text {
  margin: 0 0 0.75rem 0;
  color: #333;
}

.confirm-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
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

.ingredient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin: 1em 0 0.5em 0;
}
.ingredient-chip {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 16px;
  padding: 0.2em 0.7em 0.2em 0.4em;
  font-size: 1em;
  border: 1px solid #eee;
}
.ingredient-chip .icon {
  font-size: 1.2em;
  margin-right: 0.3em;
}
.ingredient-chip .name {
  margin-right: 0.1em;
}
</style>