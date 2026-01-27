import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDateSelectionStore = defineStore('dateSelection', () => {
  const selectedDate = ref<Date | null>(null)

  function setSelectedDate(date: Date | null) {
    selectedDate.value = date
  }

  function getSelectedDateISO(): string | null {
    if (!selectedDate.value) return null
    return selectedDate.value.toISOString().split('T')[0]
  }

  function clearSelectedDate() {
    selectedDate.value = null
  }

  return { selectedDate, setSelectedDate, getSelectedDateISO, clearSelectedDate }
})

