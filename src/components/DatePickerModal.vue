<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Select a Date</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="calendar-mini">
          <div class="calendar-header">
            <button @click="previousMonth" class="nav-button">‹</button>
            <h3>{{ currentMonthAndYear }}</h3>
            <button @click="nextMonth" class="nav-button">›</button>
          </div>
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
                  @click="day ? selectDate(day) : null"
                >
                  <div class="date-cell-content">
                    <span>{{ day ? day.getDate() : '' }}</span>
                    <span v-if="day && hasRecipes(day)" class="recipe-indicator">•</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  dateSelected: [date: Date]
}>()

const currentDate = ref(new Date())
const datesWithRecipes = ref<Set<string>>(new Set())

const currentMonthAndYear = computed(() => {
  const month = currentDate.value.toLocaleString('default', { month: 'long' })
  const year = currentDate.value.getFullYear()
  return `${month}, ${year}`
})

const weeks = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const date = new Date(year, month, 1)
  const daysInMonth = []
  
  const firstDayOfWeek = date.getDay()

  const prevMonthDate = new Date(year, month - 1, 0)
  const totalDaysPrevMonth = prevMonthDate.getDate()

  const prevMonthDays = totalDaysPrevMonth - firstDayOfWeek + 1

  for (let i = prevMonthDays; i <= totalDaysPrevMonth; i++) {
    daysInMonth.push(new Date(year, month - 1, i))
  }

  while (date.getMonth() === month) {
    daysInMonth.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  const totalDaysInMonth = daysInMonth.length
  const remainingDaysInWeek = 7 - (totalDaysInMonth % 7)

  if (remainingDaysInWeek < 7) {
    for (let i = 1; i <= remainingDaysInWeek; i++) {
      daysInMonth.push(new Date(year, month + 1, i))
    }
  }

  const weeks = []
  while (daysInMonth.length) {
    weeks.push(daysInMonth.splice(0, 7))
  }

  return weeks
})

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

function hasRecipes(day: Date): boolean {
  return datesWithRecipes.value.has(getDateKey(day))
}

const getDayClass = (day: Date | null) => {
  if (!day) return ''
  const classes: string[] = []
  const currentMonth = currentDate.value.getMonth()
  const dayMonth = day.getMonth()

  if (dayMonth !== currentMonth) {
    classes.push('gray-date')
  }

  return classes.join(' ')
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  fetchDatesWithRecipes()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  fetchDatesWithRecipes()
}

async function fetchDatesWithRecipes() {
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const dates = new Set<string>()
    const promises: Promise<void>[] = []
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = getDateKey(d)
      promises.push(
        fetch(`/api/recipes/date/${dateStr}`)
          .then(res => res.ok ? res.json() : [])
          .then(recipes => {
            if (recipes && recipes.length > 0) {
              dates.add(dateStr)
            }
          })
          .catch(() => {})
      )
    }
    
    await Promise.all(promises)
    datesWithRecipes.value = dates
  } catch (err) {
    console.error('Error fetching dates with recipes:', err)
  }
}

function selectDate(day: Date) {
  const normalizedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  emit('dateSelected', normalizedDate)
  close()
}

function close() {
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    currentDate.value = new Date()
    fetchDatesWithRecipes()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5em;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5em;
}

.close-button {
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-button:hover {
  color: #000;
}

.modal-body {
  padding: 1.5em;
}

.calendar-mini {
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.2em;
}

.nav-button {
  background: #9EBED6;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.nav-button:hover {
  background: #7ea8c4;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

thead {
  background-color: #9EBED6;
}

th {
  padding: 0.5em;
  font-size: 0.9em;
  font-weight: bold;
}

td {
  padding: 0.5em;
  border: 1px solid #ddd;
  cursor: pointer;
  position: relative;
  height: 35px;
}

td:hover {
  background-color: #f0f0f0;
}

.gray-date {
  color: #5F5A5A;
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
</style>

