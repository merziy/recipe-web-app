<template>
    <nav class="sidebar">
        <ul>
            <li>
                <RouterLink to="/settings" @click="close">Settings</RouterLink>
            </li>
        </ul>
    </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
const emit = defineEmits(['close'])
function close() {
    emit('close')
}
</script>

<style scoped>
    .sidebar {
        padding: 1em;
    }
    ul {
        list-style: none;
        padding: 0;
    }
    li {
        margin-bottom: 0.5em;
    }
</style>