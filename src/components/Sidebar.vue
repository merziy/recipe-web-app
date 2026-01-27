<template>
    <div class="sidebar-wrapper" @click.self="close">
        <aside class="sidebar">
            <header class="sidebar-header">
                <h2 class="sidebar-title">Menu</h2>
            </header>

            <nav class="sidebar-nav">
                <ul>
                    <li>
                        <RouterLink
                          :class="['nav-link', isActive('/ingredient-search') && 'active']"
                          to="/ingredient-search"
                          @click="close"
                        >
                          <IconTooling class="nav-icon" />
                          <span>Ingredient Search</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink
                          :class="['nav-link', isActive('/settings') && 'active']"
                          to="/settings"
                          @click="close"
                        >
                          <IconSupport class="nav-icon" />
                          <span>Settings</span>
                        </RouterLink>
                    </li>
                    <li v-if="!isSignedIn">
                        <RouterLink
                          :class="['nav-link', isActive('/auth') && 'active']"
                          to="/auth"
                          @click="close"
                        >
                          <IconCommunity class="nav-icon" />
                          <span>Sign In / Account</span>
                        </RouterLink>
                    </li>
                </ul>
            </nav>

            <footer class="sidebar-footer" v-if="isSignedIn">
                <div class="user-card">
                    <div class="avatar" aria-hidden="true">🍳</div>
                    <div class="user-meta">
                        <div class="user-label">Signed in as</div>
                        <div class="user-email">{{ user?.email || 'user' }}</div>
                    </div>
                </div>
                <button class="signout-btn" @click="signOut">Sign out</button>
            </footer>
        </aside>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import IconTooling from './icons/IconTooling.vue'
import IconSupport from './icons/IconSupport.vue'
import IconCommunity from './icons/IconCommunity.vue'

const emit = defineEmits(['close'])
function close() {
    emit('close')
}

const route = useRoute()
function isActive(path: string) {
    return route.path === path
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
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(2px);
}

aside.sidebar {
    padding: 16px 16px 20px;
    width: 88vw;
    max-width: 320px;
    min-height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--color-background);
    border-right: 1px solid var(--color-border);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
}

.sidebar-header {
    padding: 4px 4px 12px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 8px;
}
.sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-heading);
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    color: var(--color-text);
    text-decoration: none;
    border: 1px solid transparent;
    transition: background-color 0.22s, color 0.22s, border-color 0.22s, transform 0.08s ease;
}
.nav-link:hover {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    border-color: var(--color-border-hover);
}
.nav-link.active {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary-dark);
}
.nav-icon {
    width: 18px;
    height: 18px;
    opacity: 0.8;
}

.sidebar-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.user-card {
    display: flex;
    align-items: center;
    gap: 10px;
}
.avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--color-background-soft);
    border: 1px solid var(--color-border);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
    font-size: 16px;
}
.user-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.user-label {
    font-size: 12px;
    color: var(--vt-c-text-light-2);
}
.user-email {
    font-size: 14px;
    font-weight: 600;
}

.signout-btn {
    align-self: flex-start;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-background-soft);
    color: var(--color-text);
    cursor: pointer;
    transition: background-color 0.22s, border-color 0.22s, color 0.22s;
}
.signout-btn:hover {
    background: var(--color-accent-light);
    color: var(--color-accent-dark);
    border-color: var(--color-border-hover);
}

@media (min-width: 768px) {
    aside.sidebar {
        width: 320px;
    }
}
</style>