import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDateSelectionStore = defineStore('dateSelection', () => {
  const selectedDate = ref<Date | null>(null)

  function setSelectedDate(date: Date | null) {
    selectedDate.value = date
  }

  function getSelectedDateISO(): string | null {
    if (!selectedDate.value) return null
    return selectedDate.value.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }

  function clearSelectedDate() {
    selectedDate.value = null
  }

  return { selectedDate, setSelectedDate, getSelectedDateISO, clearSelectedDate }
})

