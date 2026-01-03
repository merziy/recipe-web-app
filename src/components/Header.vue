<script setup lang="ts">
import { ArrowLeft, IconoirProvider, Menu, Plus } from '@iconoir/vue';
import { RouterLink } from 'vue-router';

const emit = defineEmits(['toggle-sidebar']);
</script>

<template>
  <IconoirProvider
    :icon-props="{
      'color': '#000',
      'stroke-width': 1,
      'width': '1.5em',
      'height': '1.5em'
    }"
  >
    <nav>
      <div>
        <RouterLink to="/">
          <ArrowLeft />
        </RouterLink>
        <button @click="$emit('toggle-sidebar')">
          <Menu />
        </button>
      </div>
      <RouterLink to="/">
        <h1 class="logo">Recipe Web App</h1>
      </RouterLink>
      <RouterLink to="/add-recipe">
        <Plus />
      </RouterLink>
    </nav>
  </IconoirProvider>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  justify-self: center;
  align-items: center;
  width: 100%;
}

button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.logo {
  font-family: 'Playwrite CU', serif;
  font-weight: 500;
  font-size: 1.6rem;
  position: relative;
}
</style>
