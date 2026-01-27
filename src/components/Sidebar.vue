<template>
    <div class="sidebar-wrapper">
        <aside class="sidebar">
            <ul>
                <li>
                    <RouterLink to="/ingredient-search" @click="close">Ingredient Search</RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings" @click="close">Settings</RouterLink>
                </li>
                <li v-if="isSignedIn">
                    <span>Signed in as <b>{{ user?.email || 'user' }}</b></span>
                    <button @click="signOut">Sign out</button>
                </li>
                <li v-else>
                    <RouterLink to="/auth" @click="close">Sign In / Account</RouterLink>
                </li>
            </ul>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
const emit = defineEmits(['close'])
function close() {
        emit('close')
}

const user = ref<{ email?: string } | null>(null)
const isSignedIn = computed(() => !!user.value)
onMounted(async () => {
    try {
        const res = await fetch('/api/me')
        const data = await res.json()
        if (data.signedIn) user.value = { email: data.email }
        else user.value = null
    } catch {
        user.value = null
    }
})
async function signOut() {
    await fetch('/api/logout', { method: 'POST' })
    window.location.reload()
}
</script>

<style scoped>
.sidebar-wrapper {
    position: absolute;
    top: 47px;
    left: 0;
    width: 100vw;
    z-index: 1000;
}

aside.sidebar {
    padding: 1em;
    min-height: calc(100vh - 56px);
    width: 100vw;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: var(--color-background, #fff);
}

.sidebar ul {
    list-style: none;
    padding: 0;
}
.sidebar li {
    margin-bottom: 0.5em;
}
</style>