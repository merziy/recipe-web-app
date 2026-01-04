import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CalendarView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/article/:handle',
      name: 'article',
      component: () => import('../views/Article.vue'),
    },
    {
      path: '/article/:handle/edit',
      name: 'edit-recipe',
      component: () => import('../views/EditRecipe.vue'),
    },
    {
      path: '/add-recipe',
      name: 'add-recipe',
      component: () => import('../views/AddRecipe.vue'),
    },
    {
      path: '/ingredient-search',
      name: 'ingredient-search',
      component: () => import('../views/IngredientSearch.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
    },
  ],
})

export default router
