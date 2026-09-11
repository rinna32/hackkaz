<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import GameCanvas from '~/components/game/GameCanvas.vue'
import PixelButton from '~/components/ui/PixelButton.vue'
import BalanceBar from '~/components/BalanceBar.vue'

const store = useGameStore()

const multClass = computed(() => {
  const m = store.displayMultiplier
  if (m < 1) return 'text-[#111]'
  if (m < 2) return 'text-yellow [text-shadow:0_3px_0_var(--color-shadow)]'
  const glow = '[text-shadow:0_0_12px_var(--color-yellow),0_3px_0_var(--color-shadow)]'
  if (m < 3) return `text-yellow-hot ${glow}`
  return `text-yellow-hot text-[58px] ${glow}`
})

// Живые очки за раунд (оценка для HUD)
const livePoints = computed(() => {
  const cfg = store.config
  if (!cfg) return 0
  let p = store.currentLevels * cfg.pointsPerLine
  if (store.cashoutInfo) {
    p += cfg.pointsCashoutBonus
    if (store.cashoutInfo.boosterApplied) p += cfg.pointsBoosterBonus
  }
  return p
})

const boostFlash = ref(false)
watch(
  () => store.boosterActive,
  (v, old) => {
    if (v && !old) {
      boostFlash.value = true
      setTimeout(() => (boostFlash.value = false), 500)
    }
  },
)

function onKey(e: KeyboardEvent) {
  if ((e.code === 'Space' || e.code === 'Enter') && store.canCashout) {
    e.preventDefault()
    store.cashout()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="flex h-full flex-col" :class="`theme-${store.theme}`">
    <BalanceBar />

    <div class="relative flex-1 overflow-hidden bg-black">
      <GameCanvas />

      <!-- HUD поверх канваса -->
      <div class="pointer-events-none absolute inset-0 flex flex-col p-2.5">
        <div class="mt-1.5 text-center">
          <div
            class="text-[40px] font-bold leading-none transition-[font-size] duration-150"
            :class="multClass"
            data-testid="multiplier"
          >
            ×{{ store.displayMultiplier.toFixed(2) }}
          </div>
          <div
            v-if="store.boosterActive"
            class="mt-1 inline-block animate-bpop border-2 border-shadow bg-yellow-hot px-2 py-0.5 text-xs font-bold text-[#10121b]"
            data-testid="booster-active"
          >
            БУСТЕР ×{{ store.round?.boosterTier }}!
          </div>
        </div>

        <!-- всплывающие очки -->
        <div class="relative flex-1">
          <transition-group name="floater">
            <div
              v-for="f in store.floaters"
              :key="f.id"
              class="absolute left-1/2 top-[30%] -translate-x-1/2 text-lg font-bold text-yellow-hot [text-shadow:0_2px_0_var(--color-shadow)]"
            >
              {{ f.text }}
            </div>
          </transition-group>
        </div>

        <div class="mt-auto flex items-end justify-between gap-2.5">
          <div
            class="pointer-events-none flex flex-col border-2 border-shadow bg-[rgba(16,18,27,0.82)] px-2.5 py-2 leading-[1.3]"
            data-testid="live-win"
          >
            <span class="text-[11px] text-ink-dim">Выигрыш</span>
            <span class="text-lg font-bold text-yellow"
              >{{ store.liveWinnings }} <small class="text-[10px] text-ink-dim">бонусов</small></span
            >
            <span class="text-[11px] text-green">{{ livePoints }} очков</span>
          </div>

          <div class="pointer-events-auto relative">
            <div
              v-if="store.showOnboarding"
              class="absolute bottom-full right-0 mb-2 w-[190px] animate-bob border-2 border-shadow bg-yellow px-2.5 py-[7px] text-xs font-bold text-[#10121b]"
              data-testid="onboarding"
            >
              Нажми «Забрать» до того, как шар лопнет ↓
            </div>
            <PixelButton
              variant="danger"
              size="lg"
              class="min-w-[140px]"
              :disabled="!store.canCashout"
              data-testid="cashout-btn"
              @click="store.cashout()"
            >
              {{ store.cashoutInfo ? `Забрано ×${store.cashoutInfo.exitMultiplier.toFixed(2)}` : 'Забрать' }}
            </PixelButton>
          </div>
        </div>
      </div>

      <div v-if="boostFlash" class="pointer-events-none absolute inset-0 animate-fade-out bg-yellow-hot opacity-35" />
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/styles/main.css';

.floater-enter-active {
  @apply transition-all duration-[1100ms] ease-out;
}
.floater-enter-from {
  @apply opacity-100;
}
.floater-leave-to,
.floater-enter-to {
  opacity: 0;
  transform: translate(-50%, -60px);
}
</style>
