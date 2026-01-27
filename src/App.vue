<script lang="ts" setup>

import { onMounted, ref } from 'vue';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';

  const sidebarOpen = ref(false);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

onMounted(() => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if (token) {
    localStorage.setItem('token', token);
    url.searchParams.delete('token');
    window.location.replace(url.pathname + url.search);
    return;
  }
  if (!localStorage.getItem('token')) {
    const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
    if (match) {
      try {
        const cookieToken = decodeURIComponent(match[1]);
        if (cookieToken) {
          localStorage.setItem('token', cookieToken);
        }
      } catch {}
    }
  }
});
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
