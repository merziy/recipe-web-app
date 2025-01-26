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
        >
          {{ day ? day.getDate() : '' }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const currentMonthAndYear = computed(() => {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    return `${month}, ${year}`;
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

  const getDayClass = (day: Date) => {
    const currentMonth = new Date().getMonth();
    const dayMonth = day.getMonth();

    if (dayMonth !== currentMonth) {
      return 'gray-date';
    }
  }
</script>

<style scoped>
  h2 {
    text-align: center;
    background-color: #9EBED6;
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
  }

  thead {
    background-color: #9EBED6;
  }

  td {
    height: 40px;
  }
</style>
