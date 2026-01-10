<template>
  <div class="auth-form">
    <template v-if="isSignedIn">
      <div class="signed-in-msg">Signed in</div>
      <button @click="signOut">Sign out</button>
    </template>
    <template v-else>
      <form v-if="mode === 'signup'" @submit.prevent="signup">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <form v-else @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
      <button @click="googleSignIn">Sign in with Google</button>
      <button @click="toggleMode">Switch to {{ mode === 'signup' ? 'Login' : 'Signup' }}</button>
      <div v-if="error" class="error">{{ error }}</div>
    </template>
  </div>
</template>

<script setup>

import { computed, ref } from 'vue'
const mode = ref('login')
const email = ref('')
const password = ref('')
const error = ref('')

const isSignedIn = computed(() => !!localStorage.getItem('token'))

function toggleMode() {
  function signOut() {
    localStorage.removeItem('token')
    window.location.reload()
  }
  mode.value = mode.value === 'signup' ? 'login' : 'signup'
  error.value = ''
}

async function signup() {
  error.value = ''
  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    mode.value = 'login'
  } catch (e) {
    error.value = e.message
  }
}

async function login() {
  error.value = ''
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    localStorage.setItem('token', data.token)
    window.location.reload()
  } catch (e) {
    error.value = e.message
  }
}

function googleSignIn() {
  window.location.href = '/auth/google'
}
</script>

<style scoped>
.auth-form { max-width: 300px; margin: 2rem auto; display: flex; flex-direction: column; gap: 1rem; }
.error { color: red; }
</style>
