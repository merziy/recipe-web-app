<script setup lang="ts">
  import { ArrowLeft, IconoirProvider, Menu, Plus } from '@iconoir/vue';
  import { RouterLink } from 'vue-router';
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
        <Menu />
      </div>
      <h1 class="logo">Recipe Web App</h1>
      <RouterLink to="/">
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

.logo {
  font-family: 'Playwrite CU', serif;
  font-weight: 500;
  font-size: 1.6rem;
  position: relative;
  top: -10px;
}
</style>
