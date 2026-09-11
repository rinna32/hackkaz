<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import BetScreen from '~/components/screens/BetScreen.vue'
import GameScreen from '~/components/screens/GameScreen.vue'
import ResultScreen from '~/components/screens/ResultScreen.vue'

const store = useGameStore()

onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="game-root" :class="`theme-${store.theme}`">
    <template v-if="store.ready">
      <BetScreen v-if="store.screen === 'bet'" />
      <GameScreen v-else-if="store.screen === 'game'" />
      <ResultScreen v-else-if="store.screen === 'result'" />
    </template>
    <div v-else class="loading">Загрузка…</div>

    <!-- Тост -->
    <transition name="toast">
      <div v-if="store.toast" :key="store.toast.id" class="toast" data-testid="toast">
        {{ store.toast.text }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.game-root {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-ink-dim);
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: var(--c-yellow);
  color: #10121b;
  font-weight: 700;
  font-size: 13px;
  padding: 10px 16px;
  border: 3px solid var(--c-shadow);
  box-shadow: 0 4px 0 var(--c-shadow);
  z-index: 100;
  pointer-events: none;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
