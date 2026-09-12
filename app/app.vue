<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'

const store = useGameStore()
const auth = useAuthStore()

// Инициализация до монтирования страниц — чтобы гварды на /account и /admin
// уже видели актуальную сессию при первом рендере.
store.init()
auth.init()
</script>

<template>
  <div class="relative h-full w-full overflow-hidden" :class="`theme-${store.theme}`">
    <NuxtRouteAnnouncer />
    <NuxtPage v-if="store.ready" />
    <div v-else class="flex h-full items-center justify-center text-ink-dim">Загрузка…</div>

    <!-- Тост -->
    <transition name="toast">
      <div
        v-if="store.toast"
        :key="store.toast.id"
        class="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 border-[3px] border-shadow bg-yellow px-4 py-2.5 text-sm font-bold text-[#10121b] shadow-[0_4px_0_var(--color-shadow)]"
        data-testid="toast"
      >
        {{ store.toast.text }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
@reference '~/assets/styles/main.css';

.toast-enter-active,
.toast-leave-active {
  @apply transition-all duration-200;
}

.toast-enter-from,
.toast-leave-to {
  @apply opacity-0;
  transform: translate(-50%, 12px);
}
</style>
