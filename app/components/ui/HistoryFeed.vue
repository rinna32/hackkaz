<script setup lang="ts">
import type { HistoryItem } from '~/types/game'

const props = defineProps<{ items: HistoryItem[] }>()

function colorClass(m: number) {
  if (m >= 5) return 'hot'
  if (m >= 2) return 'warm'
  return 'cool'
}
const list = computed(() => props.items.slice(0, 20))
</script>

<template>
  <div class="feed" data-testid="history">
    <div class="title">ПРОШЛЫЕ ИГРЫ</div>
    <div class="strip">
      <div
        v-for="it in list"
        :key="it.id"
        class="chip"
        :class="[colorClass(it.crashMultiplier), { self: it.isSelf }]"
        :title="`${it.player}: крах ×${it.crashMultiplier}${it.exitMultiplier ? ', забрал ×' + it.exitMultiplier : ''}`"
      >
        <span class="mult">×{{ it.crashMultiplier.toFixed(2) }}</span>
        <span class="who">{{ it.isSelf ? 'Вы' : it.player }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed {
  background: var(--c-panel);
  border: 3px solid var(--c-shadow);
  padding: 6px;
}
.title {
  font-size: 9px;
  color: var(--c-ink-dim);
  margin-bottom: 4px;
}
.strip {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.chip {
  flex: 0 0 auto;
  min-width: 48px;
  padding: 4px 6px;
  text-align: center;
  border: 2px solid var(--c-shadow);
  background: var(--c-panel-2);
  line-height: 1.1;
}
.chip.self {
  outline: 2px solid var(--c-yellow);
}
.mult {
  display: block;
  font-size: 12px;
  font-weight: 700;
}
.who {
  display: block;
  font-size: 7px;
  color: var(--c-ink-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 44px;
}
.cool .mult {
  color: var(--c-ink);
}
.warm .mult {
  color: var(--c-yellow);
}
.hot .mult {
  color: var(--c-yellow-hot);
  text-shadow: 0 0 6px var(--c-yellow);
}
</style>
