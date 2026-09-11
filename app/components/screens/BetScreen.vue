<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import BalanceBar from '~/components/BalanceBar.vue'
import PixelButton from '~/components/ui/PixelButton.vue'
import PuzzleFragment from '~/components/ui/PuzzleFragment.vue'
import HistoryFeed from '~/components/ui/HistoryFeed.vue'
import RulesModal from '~/components/ui/RulesModal.vue'
import type { ThemeId } from '~/types/game'

const store = useGameStore()
const rulesOpen = ref(false)
const activating = ref(false)

const canStart = computed(
  () => !!store.selectedBet && store.balance >= (store.selectedBet?.cost ?? Infinity),
)

function pick(t: ThemeId) {
  store.setTheme(t)
}

async function start() {
  if (!canStart.value || activating.value) return
  activating.value = true
  // короткая анимация активации фрагмента
  await new Promise((r) => setTimeout(r, 600))
  const ok = await store.startRound()
  activating.value = false
  if (!ok) {
    /* тост уже показан стором */
  }
}
</script>

<template>
  <div class="flex h-full flex-col" :class="`theme-${store.theme}`">
    <BalanceBar show-top-up show-rules @rules="rulesOpen = true" />

    <div class="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-5">
      <div class="mx-auto flex w-full max-w-[640px] min-w-0 flex-col items-center gap-4">
        <div class="flex w-full justify-center gap-4" data-testid="theme-switch">
          <button
            class="flex max-w-[260px] flex-1 cursor-pointer flex-col items-center gap-1.5 border-[3px] border-shadow bg-panel p-4 text-[15px] font-bold text-ink transition-transform duration-75"
            :class="
              store.theme === 'red' ? 'outline outline-[3px] outline-yellow -translate-y-[3px] scale-[1.03]' : ''
            "
            data-testid="theme-red"
            @click="pick('red')"
          >
            <span class="block h-10 w-[34px] rounded-[50%_50%_45%_45%] border-2 border-shadow bg-red" />
            Красный
            <small class="text-[11px] font-normal text-ink-dim">12 уровней</small>
          </button>
          <button
            class="flex max-w-[260px] flex-1 cursor-pointer flex-col items-center gap-1.5 border-[3px] border-shadow bg-panel p-4 text-[15px] font-bold text-ink transition-transform duration-75"
            :class="
              store.theme === 'green'
                ? 'outline outline-[3px] outline-yellow -translate-y-[3px] scale-[1.03]'
                : ''
            "
            data-testid="theme-green"
            @click="pick('green')"
          >
            <span class="block h-10 w-[34px] rounded-[50%_50%_45%_45%] border-2 border-shadow bg-green" />
            Зелёный
            <small class="text-[11px] font-normal text-ink-dim">9 уровней</small>
          </button>
        </div>

        <div class="text-center text-[13px] text-ink-dim" data-testid="level-count">
          Тема: {{ store.themeConfig?.name }} · уровней: <b class="text-yellow">{{ store.levelCount }}</b>
        </div>

        <div
          class="grid w-full grid-cols-2 justify-items-center gap-3 md:grid-cols-4"
          :class="activating ? 'animate-pulse-fast' : ''"
        >
          <PuzzleFragment
            v-for="(opt, i) in store.betOptions"
            :key="opt.id"
            :option="opt"
            :index="i"
            :selected="store.selectedBetId === opt.id"
            :affordable="store.balance >= opt.cost"
            @select="store.selectBet(opt.id)"
          />
        </div>

        <div
          class="w-full border-2 border-shadow bg-panel px-3 py-2.5 text-center text-xs leading-relaxed text-ink-dim"
        >
          Бустер срабатывает, если шар пройдёт уровень с маркером
          <b class="text-yellow">до того, как ты забрал</b>, и умножит коэффициент.
        </div>

        <PixelButton
          class="max-w-[420px]"
          size="lg"
          block
          :disabled="!canStart || activating"
          data-testid="start-btn"
          @click="start"
        >
          {{ activating ? 'Запуск…' : 'Начать' }}
        </PixelButton>
      </div>

      <div class="w-full max-w-[640px] flex-none">
        <HistoryFeed :items="store.history" />
      </div>
    </div>

    <RulesModal :open="rulesOpen" @close="rulesOpen = false" />
  </div>
</template>
