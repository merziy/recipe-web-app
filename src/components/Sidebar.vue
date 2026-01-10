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
                    <span>Signed in</span>
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
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
const emit = defineEmits(['close'])
function close() {
        emit('close')
}

const isSignedIn = computed(() => !!localStorage.getItem('token'))
function signOut() {
    localStorage.removeItem('token')
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