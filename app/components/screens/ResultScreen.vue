<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import PixelButton from '~/components/ui/PixelButton.vue'
import BalanceBar from '~/components/BalanceBar.vue'

const store = useGameStore()
const res = computed(() => store.result)

let idleTimer: ReturnType<typeof setTimeout> | null = null
const secondsLeft = ref(10)
let countdown: ReturnType<typeof setInterval> | null = null

function armIdle() {
  const timeout = store.config?.resultIdleTimeout ?? 10000
  secondsLeft.value = Math.round(timeout / 1000)
  idleTimer = setTimeout(() => store.playAgain(), timeout)
  countdown = setInterval(() => {
    secondsLeft.value = Math.max(0, secondsLeft.value - 1)
  }, 1000)
}
function clearIdle() {
  if (idleTimer) clearTimeout(idleTimer)
  if (countdown) clearInterval(countdown)
}

onMounted(armIdle)
onBeforeUnmount(clearIdle)

const pieceNames = ['◤', '◥', '◣', '◢']
</script>

<template>
  <div v-if="res" class="screen" :class="[`theme-${store.theme}`, res.win ? 'win' : 'lose']">
    <BalanceBar />
    <div class="content">
      <div class="card" data-testid="result-card" :data-outcome="res.win ? 'win' : 'lose'">
        <div class="banner" :class="res.win ? 'win' : 'lose'">
          {{ res.win ? 'ВЫ ЗАБРАЛИ!' : 'ШАР ЛОПНУЛ' }}
        </div>

        <div v-if="res.win" class="big" data-testid="win-amount">
          +{{ res.winnings }} <small>бонусов</small>
        </div>
        <div v-else class="big lose" data-testid="lose-amount">
          Ставка сгорела: −{{ res.bet }}
        </div>

        <div class="rows">
          <div class="row">
            <span>Коэффициент краха</span>
            <b data-testid="crash-mult">×{{ res.crashMultiplier.toFixed(2) }}</b>
          </div>
          <div v-if="res.win" class="row">
            <span>Забрали на</span>
            <b>×{{ res.exitMultiplier!.toFixed(2) }}</b>
          </div>
          <div v-if="res.win" class="row hint">
            <span>Могли бы до</span>
            <b>×{{ res.crashMultiplier.toFixed(2) }}</b>
          </div>
          <div v-if="res.boosterApplied" class="row boost">
            <span>Бустер</span><b>×{{ res.boosterTier }} применён!</b>
          </div>
          <div class="row">
            <span>Очки за раунд</span>
            <b data-testid="round-points" class="pts">+{{ res.points }}</b>
          </div>
        </div>

        <div class="reward" data-testid="reward">
          <div class="reward-title">Награда: фрагмент пазла {{ pieceNames[res.puzzlePiece] }}</div>
          <div class="pieces">
            <span
              v-for="i in 4"
              :key="i"
              class="pc"
              :class="{ got: i - 1 < res.puzzleCollected || i - 1 === res.puzzlePiece }"
            >{{ pieceNames[i - 1] }}</span>
          </div>
          <div v-if="res.puzzleBonus > 0" class="bonus" data-testid="puzzle-bonus">
            Пазл собран! +{{ res.puzzleBonus }} бонусов
          </div>
        </div>

        <div class="actions">
          <PixelButton block size="lg" data-testid="again-btn" @click="store.playAgain()">
            Играть снова
          </PixelButton>
          <PixelButton variant="ghost" block data-testid="repeat-btn" @click="store.repeatSame()">
            Повторить ту же ставку
          </PixelButton>
        </div>
        <div class="idle">Автовозврат через {{ secondsLeft }} с</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow-y: auto;
}
.card {
  width: min(420px, 100%);
  background: var(--c-panel);
  border: 4px solid var(--c-shadow);
  box-shadow: 0 8px 0 var(--c-shadow);
  padding: 16px;
  text-align: center;
}
.banner {
  font-size: 22px;
  font-weight: 700;
  padding: 8px;
  margin: -16px -16px 12px;
  border-bottom: 3px solid var(--c-shadow);
}
.banner.win {
  background: var(--c-green);
  color: #10121b;
}
.banner.lose {
  background: var(--c-red);
  color: #fff;
}
.big {
  font-size: 34px;
  font-weight: 700;
  color: var(--c-yellow);
  margin-bottom: 12px;
}
.big small {
  font-size: 12px;
  color: var(--c-ink-dim);
}
.big.lose {
  font-size: 20px;
  color: var(--c-red);
}
.rows {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 8px;
  background: var(--c-panel-2);
  border: 2px solid var(--c-shadow);
}
.row b {
  color: var(--c-yellow);
}
.row.hint {
  opacity: 0.8;
}
.row.boost b {
  color: var(--c-yellow-hot);
}
.row .pts {
  color: var(--c-green);
}
.reward {
  background: var(--c-panel-2);
  border: 2px solid var(--c-shadow);
  padding: 8px;
  margin-bottom: 12px;
}
.reward-title {
  font-size: 11px;
  color: var(--c-ink-dim);
  margin-bottom: 6px;
}
.pieces {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.pc {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--c-shadow);
  background: #10121b;
  color: #444;
  font-size: 16px;
}
.pc.got {
  background: var(--theme, var(--c-red));
  color: #10121b;
}
.bonus {
  margin-top: 8px;
  color: var(--c-yellow-hot);
  font-weight: 700;
  font-size: 13px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.idle {
  margin-top: 10px;
  font-size: 9px;
  color: var(--c-ink-dim);
}
</style>
