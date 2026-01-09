<script lang="ts" setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';

  const sidebarOpen = ref(false);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }
</script>

<template>
  <div class="app-shell">
    <Header @toggle-sidebar="toggleSidebar" />
    <main class="main-content">
      <RouterView />
    </main>
    <Sidebar v-if="sidebarOpen" @close="sidebarOpen = false" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.main-content {
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}
</style>
