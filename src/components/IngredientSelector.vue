
<template>
  <div class="ingredient-selector">
    <div class="selected-ingredients">
      <span
        v-for="ingredient in selectedIngredients"
        :key="ingredient.name"
        class="selected-chip"
      >
        <span class="icon">{{ ingredient.icon }}</span>
        <span class="name">{{ ingredient.name }}</span>
        <span class="remove" @click="removeIngredient(ingredient.name)">&times;</span>
      </span>
    </div>
    <input
      v-model="search"
      @focus="showSuggestions = true"
      @blur="onBlur"
      @input="onInput"
      type="text"
      placeholder="Type to search ingredients..."
      class="ingredient-input"
    />
    <ul v-if="showSuggestions && filteredIngredients.length" class="suggestions">
      <li
        v-for="ingredient in filteredIngredients"
        :key="ingredient.name"
        @mousedown.prevent="selectIngredient(ingredient)"
        class="suggestion-item"
      >
        <span class="icon">{{ ingredient.icon }}</span>
        <span class="name">{{ ingredient.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import ingredientsList from '@/assets/ingredients.json';
import { computed, ref } from 'vue';

const props = defineProps<{ modelValue: string[] }>();
const emit = defineEmits(['update:modelValue']);

const search = ref('');
const showSuggestions = ref(false);
const ingredients = ref<{ name: string; icon: string }[]>(ingredientsList);

const selectedIngredients = computed(() => {
  return ingredients.value.filter(ing => props.modelValue.includes(ing.name));
});

const filteredIngredients = computed(() => {
  if (!search.value) {
    return ingredients.value.filter(ing => !props.modelValue.includes(ing.name));
  }
  const lower = search.value.toLowerCase();
  return ingredients.value.filter(
    ing =>
      !props.modelValue.includes(ing.name) &&
      (ing.name.toLowerCase().includes(lower) || ing.icon.includes(lower))
  );
});

function selectIngredient(ingredient: { name: string; icon: string }) {
  if (!props.modelValue.includes(ingredient.name)) {
    emit('update:modelValue', [...props.modelValue, ingredient.name]);
  }
  search.value = '';
  showSuggestions.value = false;
}

function removeIngredient(name: string) {
  emit('update:modelValue', props.modelValue.filter(n => n !== name));
}

function onInput() {
  showSuggestions.value = true;
}

function onBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 100);
}
</script>


<style scoped>
.ingredient-selector {
  width: 100%;
  max-width: 500px;
  position: relative;
  margin-bottom: 1em;
}
.selected-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin-bottom: 0.3em;
}
.selected-chip {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 16px;
  padding: 0.2em 0.7em 0.2em 0.4em;
  font-size: 1em;
  border: 1px solid #eee;
  margin-right: 0.2em;
}
.selected-chip .icon {
  font-size: 1.2em;
  margin-right: 0.3em;
}
.selected-chip .name {
  margin-right: 0.3em;
}
.selected-chip .remove {
  cursor: pointer;
  color: #888;
  margin-left: 0.2em;
  font-size: 1.1em;
}
.ingredient-input {
  width: 100%;
  padding: 0.5em;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1em;
  box-sizing: border-box;
}
.suggestions {
  position: absolute;
  z-index: 10;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 0 0 6px 6px;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.5em 0.7em;
  cursor: pointer;
  transition: background 0.2s;
}
.suggestion-item .icon {
  font-size: 1.2em;
  margin-right: 0.3em;
}
.suggestion-item .name {
  font-size: 1em;
}
.suggestion-item:hover {
  background: #f0f0f0;
}
</style>
