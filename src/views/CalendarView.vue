<script setup lang="ts">
import Calendar from '@/components/Calendar.vue';
import RecipeCardWrapper from '@/components/RecipeCardWrapper.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <main class="calendar-layout">
    <div class="left-pane">
      <RecipeCardWrapper />
    </div>
    <div class="right-pane">
      <Calendar />
    </div>
    <RouterView />
  </main>
</template>

<style scoped>
.calendar-layout {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  align-items: flex-start;
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.left-pane, .right-pane {
  flex: 1 1 0;
  min-width: 0;
  max-width: none;
  box-sizing: border-box;
  word-break: break-word;
  overflow-wrap: anywhere;
}
@media (max-width: 1100px) {
  .calendar-layout {
    flex-direction: column-reverse;
    gap: 1.2rem;
    width: 100vw;
    min-height: unset;
  }
  .left-pane, .right-pane {
    width: 100vw;
    max-width: none;
    min-width: 0;
    flex: none;
    margin: 0;
    padding: 0;
  }
}
main.calendar-layout {
  padding: 0;
  margin: 0;
}
</style>
