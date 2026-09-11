<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import BetScreen from '~/components/screens/BetScreen.vue'
import GameScreen from '~/components/screens/GameScreen.vue'
import ResultScreen from '~/components/screens/ResultScreen.vue'
import AccountScreen from '~/components/screens/AccountScreen.vue'
import AdminScreen from '~/components/screens/AdminScreen.vue'

const store = useGameStore()
const auth = useAuthStore()

onMounted(() => {
  store.init()
  auth.init()
})
</script>

<template>
  <div class="relative h-full w-full overflow-hidden" :class="`theme-${store.theme}`">
    <template v-if="store.ready">
      <BetScreen v-if="store.screen === 'bet'" />
      <GameScreen v-else-if="store.screen === 'game'" />
      <ResultScreen v-else-if="store.screen === 'result'" />
      <AccountScreen v-else-if="store.screen === 'account'" />
      <AdminScreen v-else-if="store.screen === 'admin'" />
    </template>
    <div v-else class="flex h-full items-center justify-center text-ink-dim">Загрузка…</div>

    <!-- Тост -->
    <transition name="toast">
      <div v-if="store.toast" :key="store.toast.id"
        class="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 border-[3px] border-shadow bg-yellow px-4 py-2.5 text-sm font-bold text-[#10121b] shadow-[0_4px_0_var(--color-shadow)]"
        data-testid="toast">
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
