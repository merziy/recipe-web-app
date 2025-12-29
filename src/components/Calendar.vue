<template>
  <h2>{{ currentMonthAndYear }}</h2>
  <table>
    <thead>
      <tr>
        <th>S</th>
        <th>M</th>
        <th>T</th>
        <th>W</th>
        <th>T</th>
        <th>F</th>
        <th>S</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(week, index) in weeks" :key="index">
        <td
          v-for="(day, index) in week"
          :key="index"
          :class="getDayClass(day)"
          @click="day ? handleDateClick(day) : null"
        >
          <div class="date-cell-content">
            <span>{{ day ? day.getDate() : '' }}</span>
            <span v-if="day && hasRecipes(day)" class="recipe-indicator">•</span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <DateRecipesModal 
    :is-open="modalOpen" 
    :date="selectedDateForModal"
    @close="closeModal"
    @recipe-removed="fetchDatesWithRecipes"
  />
</template>

<script lang="ts" setup>
  import { useDateSelectionStore } from '@/stores/dateSelection';
import { useRecipesStore } from '@/stores/recipes';
import { computed, onMounted, ref, watch } from 'vue';
import DateRecipesModal from './DateRecipesModal.vue';

  const dateStore = useDateSelectionStore();
  const modalOpen = ref(false);
  const selectedDateForModal = ref<Date | null>(null);
  const datesWithRecipes = ref<Set<string>>(new Set());

  const currentMonthAndYear = computed(() => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    return `${month}, ${year}`;
  });

  const formatSelectedDate = computed(() => {
    if (!dateStore.selectedDate) return '';
    return dateStore.selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  const weeks = computed(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const date = new Date(year, month, 1);
    const daysInMonth = [];
    
    const firstDayOfWeek = date.getDay();

    const prevMonthDate = new Date(year, month - 1, 0);
    const totalDaysPrevMonth = prevMonthDate.getDate();

    const prevMonthDays = totalDaysPrevMonth - firstDayOfWeek + 1;

    for (let i = prevMonthDays; i <= totalDaysPrevMonth; i++) {
      daysInMonth.push(new Date(year, month - 1, i));
    }

    while (date.getMonth() === month) {
      daysInMonth.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    const totalDaysInMonth = daysInMonth.length;
    const remainingDaysInWeek = 7 - (totalDaysInMonth % 7);

    if (remainingDaysInWeek < 7) {
      for (let i = 1; i <= remainingDaysInWeek; i++) {
        daysInMonth.push(new Date(year, month + 1, i));
      }
    }

    const weeks = [];
    while (daysInMonth.length) {
      weeks.push(daysInMonth.splice(0, 7));
    }

    return weeks;
  });

  function getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function hasRecipes(day: Date): boolean {
    return datesWithRecipes.value.has(getDateKey(day));
  }

  function isSelected(day: Date): boolean {
    if (!dateStore.selectedDate) return false;
    return getDateKey(day) === getDateKey(dateStore.selectedDate);
  }

  const getDayClass = (day: Date | null) => {
    if (!day) return '';
    const classes: string[] = [];
    const currentMonth = new Date().getMonth();
    const dayMonth = day.getMonth();

    if (dayMonth !== currentMonth) {
      classes.push('gray-date');
    }
    if (isSelected(day)) {
      classes.push('selected-date');
    }

    return classes.join(' ');
  }

  async function fetchDatesWithRecipes() {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const dates = new Set<string>();
      const store = useRecipesStore();
      store.load();
      for (const r of store.recipes) {
        if (!r.dates || r.dates.length === 0) continue;
        for (const d of r.dates) {
          const dt = new Date(d);
          if (dt >= firstDay && dt <= lastDay) dates.add(d);
        }
      }
      datesWithRecipes.value = dates;
    } catch (err) {
      console.error('Error fetching dates with recipes:', err);
    }
  }

  function handleDateClick(day: Date) {
    const normalizedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    dateStore.setSelectedDate(normalizedDate);
    selectedDateForModal.value = normalizedDate;
    modalOpen.value = true;
  }

  function closeModal() {
    modalOpen.value = false;
    selectedDateForModal.value = null;
  }

  function clearSelection() {
    dateStore.clearSelectedDate();
  }

  onMounted(() => {
    fetchDatesWithRecipes();
  });

  watch(() => currentMonthAndYear.value, () => {
    fetchDatesWithRecipes();
  });
</script>

<style scoped>
  h2 {
    text-align: center;
    background-color: #9EBED6;
    margin: 0;
    padding: 0.5em;
  }

  .selected-date-banner {
    background-color: #e3f2fd;
    padding: 0.75em;
    margin: 0.5em 0;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 4px solid #9EBED6;
  }

  .clear-selection-btn {
    background: #666;
    color: white;
    border: none;
    padding: 0.4em 0.8em;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
  }

  .clear-selection-btn:hover {
    background: #555;
  }

  .gray-date {
    color: #5F5A5A;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
  }

  td {
    padding: 10px;
    border: 1px solid #ddd;
    cursor: pointer;
    position: relative;
  }

  td:hover {
    background-color: #f0f0f0;
  }

  .selected-date {
    background-color: #9EBED6 !important;
    font-weight: bold;
  }

  .date-cell-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .recipe-indicator {
    color: #4CAF50;
    font-size: 1.2em;
    line-height: 0.5;
  }

  thead {
    background-color: #9EBED6;
  }

  td {
    height: 40px;
  }
</style>
