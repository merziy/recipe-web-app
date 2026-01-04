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
            </ul>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
const emit = defineEmits(['close'])
function close() {
    emit('close')
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