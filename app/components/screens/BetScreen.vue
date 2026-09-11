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
  <div class="screen" :class="`theme-${store.theme}`">
    <BalanceBar show-top-up show-rules @rules="rulesOpen = true" />

    <div class="content">
      <div class="main">
        <div class="theme-switch" data-testid="theme-switch">
          <button
            class="tbtn red"
            :class="{ active: store.theme === 'red' }"
            data-testid="theme-red"
            @click="pick('red')"
          >
            <span class="ball" />Красный
            <small>12 уровней</small>
          </button>
          <button
            class="tbtn green"
            :class="{ active: store.theme === 'green' }"
            data-testid="theme-green"
            @click="pick('green')"
          >
            <span class="ball" />Зелёный
            <small>9 уровней</small>
          </button>
        </div>

        <div class="levels-note" data-testid="level-count">
          Тема: {{ store.themeConfig?.name }} · уровней: <b>{{ store.levelCount }}</b>
        </div>

        <div class="frags" :class="{ activating }">
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

        <div class="booster-hint">
          Бустер срабатывает, если шар пройдёт уровень с маркером
          <b>до того, как ты забрал</b>, и умножит коэффициент.
        </div>

        <PixelButton
          class="start"
          size="lg"
          block
          :disabled="!canStart || activating"
          data-testid="start-btn"
          @click="start"
        >
          {{ activating ? 'Запуск…' : 'Начать' }}
        </PixelButton>
      </div>

      <div class="side">
        <HistoryFeed :items="store.history" />
      </div>
    </div>

    <RulesModal :open="rulesOpen" @close="rulesOpen = false" />
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
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
  align-items: flex-start;
}
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 560px;
  margin: 0 auto;
}
.side {
  width: 260px;
  flex: 0 0 auto;
}
.theme-switch {
  display: flex;
  gap: 10px;
}
.tbtn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px;
  border: 3px solid var(--c-shadow);
  background: var(--c-panel);
  color: var(--c-ink);
  cursor: pointer;
  font-weight: 700;
}
.tbtn small {
  font-size: 8px;
  color: var(--c-ink-dim);
  font-weight: 400;
}
.tbtn .ball {
  width: 22px;
  height: 26px;
  border-radius: 50% 50% 45% 45%;
  border: 2px solid var(--c-shadow);
  display: block;
}
.tbtn.red .ball {
  background: var(--c-red);
}
.tbtn.green .ball {
  background: var(--c-green);
}
.tbtn.active {
  outline: 3px solid var(--c-yellow);
  transform: translateY(-2px);
}
.levels-note {
  font-size: 11px;
  color: var(--c-ink-dim);
  text-align: center;
}
.levels-note b {
  color: var(--c-yellow);
}
.frags {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.frags.activating {
  animation: pulse 0.6s;
}
@keyframes pulse {
  50% {
    filter: brightness(1.5);
  }
}
.booster-hint {
  font-size: 10px;
  color: var(--c-ink-dim);
  background: var(--c-panel);
  border: 2px solid var(--c-shadow);
  padding: 6px 8px;
  line-height: 1.4;
}
.booster-hint b {
  color: var(--c-yellow);
}
@media (max-width: 720px) {
  .content {
    flex-direction: column;
  }
  .side {
    width: 100%;
    order: -1;
  }
  .frags {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
