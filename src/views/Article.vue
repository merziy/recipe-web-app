<template>
  <article v-if="recipe">
    <image :src="`@/assets/${recipe.image}`" alt="" />
    <h1>{{ recipe.title }}</h1>
    <ul>
      <li>
        <button>
          <p>Edit</p>
        </button>
      </li>
      <li>
        <button>
          <p>Save to list</p>
        </button>
      </li>
      <li>
        <button>
          <p>More</p>
        </button>
      </li>
    </ul>
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const recipe = ref(null);

onMounted(async () => {
  const handle = route.params.handle;
  const res = await fetch(`/api/recipes`);
  if (res.ok) {
    const recipes = await res.json();
    recipe.value = recipes.find((r: { handle: string }) => r.handle === handle);
  }
});
</script>