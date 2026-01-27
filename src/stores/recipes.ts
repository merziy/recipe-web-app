import { defineStore } from 'pinia'
import { ref } from 'vue'

type Recipe = {
  _id?: string
  handle: string
  title: string
  description?: string
  servings?: number
  prepTime?: string
  cookTime?: string
  instructions?: string[]
  dates?: string[]
  image?: string
}

const API_BASE = import.meta.env.VITE_API_URL || ''

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])

  async function load() {
    try {
      const res = await fetch(`${API_BASE}/api/recipes`)
      if (res.ok) {
        recipes.value = await res.json()
      } else {
        recipes.value = []
      }
    } catch (err) {
      recipes.value = []
    }
  }

  function getAll() {
    return recipes.value
  }

  function getByHandle(handle: string) {
    return recipes.value.find((r) => r.handle === handle)
  }

  async function add(recipe: Omit<Recipe, '_id'>) {
    try {
      const res = await fetch(`${API_BASE}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      })
      if (res.ok) {
        await load()
        return getByHandle(recipe.handle)
      }
      throw new Error('Failed to add')
    } catch (err) {
      throw err
    }
  }

  async function update(handle: string, updated: Partial<Recipe>) {
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${handle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        await load()
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  async function remove(handle: string) {
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${handle}`, { method: 'DELETE' })
      if (res && res.ok) {
        await load()
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  async function saveToDate(handle: string, dateIso: string) {
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${handle}/date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateIso }),
      })
      if (res.ok) return { ok: true }
      const data = await res.json()
      return { ok: false, error: data.error }
    } catch (err) {
      return { ok: false, error: 'Network error' }
    }
  }

  async function removeFromDate(handle: string, dateIso: string) {
    try {
      const res = await fetch(`${API_BASE}/api/recipes/${handle}/date/${dateIso}`, { method: 'DELETE' })
      if (res.ok) return true
      return false
    } catch (err) {
      return false
    }
  }

  async function getRecipesForDate(dateIso: string) {
    try {
      const res = await fetch(`${API_BASE}/api/recipes/date/${dateIso}`)
      if (res.ok) return await res.json()
      return []
    } catch (err) {
      return []
    }
  }

  async function hasRecipesOnDate(dateIso: string) {
    try {
      const list = await getRecipesForDate(dateIso)
      return Array.isArray(list) && list.length > 0
    } catch (err) {
      return false
    }
  }

  return {
    recipes,
    load,
    getByHandle,
    add,
    update,
    remove,
    saveToDate,
    removeFromDate,
    getRecipesForDate,
    hasRecipesOnDate,
  }
})
