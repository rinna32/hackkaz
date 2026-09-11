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
  <div v-if="res" class="flex h-full flex-col" :class="`theme-${store.theme}`">
    <BalanceBar />
    <div class="flex flex-1 items-center justify-center overflow-y-auto p-3">
      <div
        class="w-[min(420px,100%)] border-4 border-shadow bg-panel p-4 text-center shadow-[0_8px_0_var(--color-shadow)]"
        data-testid="result-card"
        :data-outcome="res.win ? 'win' : 'lose'"
      >
        <div
          class="-mx-4 -mt-4 mb-3 border-b-[3px] border-shadow px-2 py-2 text-xl font-bold"
          :class="res.win ? 'bg-green text-[#10121b]' : 'bg-red text-white'"
        >
          {{ res.win ? 'ВЫ ЗАБРАЛИ!' : 'ШАР ЛОПНУЛ' }}
        </div>

        <div v-if="res.win" class="mb-3 text-[34px] font-bold text-yellow" data-testid="win-amount">
          +{{ res.winnings }} <small class="text-xs text-ink-dim">бонусов</small>
        </div>
        <div v-else class="mb-3 text-xl font-bold text-red" data-testid="lose-amount">
          Ставка сгорела: −{{ res.bet }}
        </div>

        <div class="mb-3 flex flex-col gap-1.5">
          <div class="flex justify-between border-2 border-shadow bg-panel-2 px-2 py-1 text-xs">
            <span>Коэффициент краха</span>
            <b class="text-yellow" data-testid="crash-mult">×{{ res.crashMultiplier.toFixed(2) }}</b>
          </div>
          <div v-if="res.win" class="flex justify-between border-2 border-shadow bg-panel-2 px-2 py-1 text-xs">
            <span>Забрали на</span>
            <b class="text-yellow">×{{ res.exitMultiplier!.toFixed(2) }}</b>
          </div>
          <div
            v-if="res.win"
            class="flex justify-between border-2 border-shadow bg-panel-2 px-2 py-1 text-xs opacity-80"
          >
            <span>Могли бы до</span>
            <b class="text-yellow">×{{ res.crashMultiplier.toFixed(2) }}</b>
          </div>
          <div v-if="res.boosterApplied" class="flex justify-between border-2 border-shadow bg-panel-2 px-2 py-1 text-xs">
            <span>Бустер</span><b class="text-yellow-hot">×{{ res.boosterTier }} применён!</b>
          </div>
          <div class="flex justify-between border-2 border-shadow bg-panel-2 px-2 py-1 text-xs">
            <span>Очки за раунд</span>
            <b class="text-green" data-testid="round-points">+{{ res.points }}</b>
          </div>
        </div>

        <div class="mb-3 border-2 border-shadow bg-panel-2 p-2" data-testid="reward">
          <div class="mb-1.5 text-[11px] text-ink-dim">
            Награда: фрагмент пазла {{ pieceNames[res.puzzlePiece] }}
          </div>
          <div class="flex justify-center gap-1.5">
            <span
              v-for="i in 4"
              :key="i"
              class="flex h-[38px] w-[38px] items-center justify-center border-2 border-shadow bg-[#10121b] text-[17px] text-[#444] [clip-path:polygon(15%_15%,35%_15%,35%_0%,65%_0%,65%_15%,85%_15%,85%_85%,65%_85%,65%_65%,35%_65%,35%_85%,15%_85%)]"
              :class="
                i - 1 < res.puzzleCollected || i - 1 === res.puzzlePiece
                  ? 'bg-[var(--theme,var(--color-red))] text-[#10121b]'
                  : ''
              "
              >{{ pieceNames[i - 1] }}</span
            >
          </div>
          <div v-if="res.puzzleBonus > 0" class="mt-2 text-sm font-bold text-yellow-hot" data-testid="puzzle-bonus">
            Пазл собран! +{{ res.puzzleBonus }} бонусов
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <PixelButton block size="lg" data-testid="again-btn" @click="store.playAgain()">
            Играть снова
          </PixelButton>
          <PixelButton variant="ghost" block data-testid="repeat-btn" @click="store.repeatSame()">
            Повторить ту же ставку
          </PixelButton>
        </div>
        <div class="mt-2.5 text-[11px] text-ink-dim">Автовозврат через {{ secondsLeft }} с</div>
      </div>
    </div>
  </div>
</template>
