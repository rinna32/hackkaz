<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import GameCanvas from '~/components/game/GameCanvas.vue'
import PixelButton from '~/components/ui/PixelButton.vue'
import BalanceBar from '~/components/BalanceBar.vue'

const store = useGameStore()

const multClass = computed(() => {
  const m = store.displayMultiplier
  if (m < 1) return 'c-black'
  if (m < 2) return 'c-yellow'
  if (m < 3) return 'c-yellow hot'
  return 'c-yellow hot big'
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
  <div class="screen" :class="`theme-${store.theme}`">
    <BalanceBar />

    <div class="stage">
      <GameCanvas />

      <!-- HUD поверх канваса -->
      <div class="hud">
        <div class="mult-wrap">
          <div class="mult" :class="multClass" data-testid="multiplier">
            ×{{ store.displayMultiplier.toFixed(2) }}
          </div>
          <div v-if="store.boosterActive" class="booster-tag" data-testid="booster-active">
            БУСТЕР ×{{ store.round?.boosterTier }}!
          </div>
        </div>

        <!-- всплывающие очки -->
        <div class="floaters">
          <transition-group name="floater">
            <div v-for="f in store.floaters" :key="f.id" class="floater">{{ f.text }}</div>
          </transition-group>
        </div>

        <div class="bottom">
          <div class="winbox" data-testid="live-win">
            <span class="l">Выигрыш</span>
            <span class="v">{{ store.liveWinnings }} <small>бонусов</small></span>
            <span class="pts">{{ livePoints }} очков</span>
          </div>

          <div class="cashout-area">
            <div v-if="store.showOnboarding" class="onboard" data-testid="onboarding">
              Нажми «Забрать» до того, как шар лопнет ↓
            </div>
            <PixelButton
              variant="danger"
              size="lg"
              class="cashout"
              :disabled="!store.canCashout"
              data-testid="cashout-btn"
              @click="store.cashout()"
            >
              {{ store.cashoutInfo ? `Забрано ×${store.cashoutInfo.exitMultiplier.toFixed(2)}` : 'Забрать' }}
            </PixelButton>
            <div v-if="store.cashoutInfo" class="more" data-testid="could-more">
              Могли бы забрать больше — шар ещё летит!
            </div>
          </div>
        </div>
      </div>

      <div v-if="boostFlash" class="flash" />
    </div>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.stage {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: #000;
}
.hud {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  padding: 10px;
}
.mult-wrap {
  text-align: center;
  margin-top: 6px;
}
.mult {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  transition: font-size 0.15s;
  text-shadow: 0 3px 0 var(--c-shadow);
}
.c-black {
  color: #111;
}
.c-yellow {
  color: var(--c-yellow);
}
.c-yellow.hot {
  color: var(--c-yellow-hot);
  text-shadow: 0 0 12px var(--c-yellow), 0 3px 0 var(--c-shadow);
}
.c-yellow.hot.big {
  font-size: 58px;
}
.booster-tag {
  margin-top: 4px;
  display: inline-block;
  color: #10121b;
  background: var(--c-yellow-hot);
  padding: 3px 8px;
  font-weight: 700;
  font-size: 12px;
  border: 2px solid var(--c-shadow);
  animation: bpop 0.4s;
}
@keyframes bpop {
  0% {
    transform: scale(0.5);
  }
  60% {
    transform: scale(1.2);
  }
}
.floaters {
  flex: 1;
  position: relative;
}
.floater {
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translateX(-50%);
  color: var(--c-yellow-hot);
  font-weight: 700;
  font-size: 18px;
  text-shadow: 0 2px 0 var(--c-shadow);
}
.floater-enter-active {
  transition: all 1.1s ease-out;
}
.floater-enter-from {
  opacity: 1;
}
.floater-leave-to,
.floater-enter-to {
  opacity: 0;
  transform: translate(-50%, -60px);
}
.bottom {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}
.winbox {
  pointer-events: none;
  background: rgba(16, 18, 27, 0.82);
  border: 2px solid var(--c-shadow);
  padding: 6px 8px;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
}
.winbox .l {
  font-size: 8px;
  color: var(--c-ink-dim);
}
.winbox .v {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-yellow);
}
.winbox .v small {
  font-size: 8px;
  color: var(--c-ink-dim);
}
.winbox .pts {
  font-size: 9px;
  color: var(--c-green);
}
.cashout-area {
  position: relative;
  pointer-events: auto;
}
.cashout {
  min-width: 140px;
}
.onboard {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  width: 180px;
  background: var(--c-yellow);
  color: #10121b;
  font-size: 10px;
  font-weight: 700;
  padding: 6px 8px;
  border: 2px solid var(--c-shadow);
  animation: bob 0.8s infinite alternate;
}
@keyframes bob {
  to {
    transform: translateY(4px);
  }
}
.more {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  width: 160px;
  font-size: 10px;
  color: var(--c-yellow-hot);
  text-align: right;
}
.flash {
  position: absolute;
  inset: 0;
  background: var(--c-yellow-hot);
  opacity: 0.35;
  pointer-events: none;
  animation: fade 0.5s forwards;
}
@keyframes fade {
  to {
    opacity: 0;
  }
}
</style>
