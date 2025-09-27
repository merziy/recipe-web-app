<script lang="ts" setup>
  import { RouterLink, RouterView } from 'vue-router'
  import Header from './components/Header.vue'
  import Sidebar from './components/Sidebar.vue';
  import { ref } from 'vue';

  const sidebarOpen = ref(false);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }
</script>

<template>
  <header>
    <div class="wrapper">
      <Header @toggle-sidebar="toggleSidebar" />
      <Sidebar v-if="sidebarOpen"/>
      <RouterView v-else />
      <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->
    </div>
  </header>

</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    flex-direction: column;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
