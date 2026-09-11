<script setup lang="ts">
import type { HistoryItem } from '~/types/game'

const props = defineProps<{ items: HistoryItem[] }>()

const MULT_COLOR: Record<'cool' | 'warm' | 'hot', string> = {
  cool: 'text-ink',
  warm: 'text-yellow',
  hot: 'text-yellow-hot [text-shadow:0_0_6px_var(--color-yellow)]',
}
function colorKey(m: number): 'cool' | 'warm' | 'hot' {
  if (m >= 5) return 'hot'
  if (m >= 2) return 'warm'
  return 'cool'
}
function multClass(m: number) {
  return MULT_COLOR[colorKey(m)]
}
const list = computed(() => props.items.slice(0, 20))
</script>

<template>
  <div class="border-[3px] border-shadow bg-panel px-3 py-2.5" data-testid="history">
    <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
      <div class="text-[13px] font-bold text-ink-dim">ПРОШЛЫЕ ИГРЫ</div>
      <div class="flex items-center gap-2 text-[10px] text-ink-dim">
        <span class="mr-0.5 inline-block h-2 w-2 border border-shadow bg-ink" />&lt;×2
        <span class="mr-0.5 inline-block h-2 w-2 border border-shadow bg-yellow" />×2–5
        <span class="mr-0.5 inline-block h-2 w-2 border border-shadow bg-yellow-hot" />×5+
      </div>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-1">
      <div
        v-for="it in list"
        :key="it.id"
        class="flex-none min-w-[84px] border-2 border-l-4 border-shadow bg-panel-2 px-2.5 py-2 text-center leading-[1.3]"
        :class="[
          it.win ? 'border-l-green' : 'border-l-red',
          it.isSelf ? 'outline outline-2 outline-yellow' : '',
        ]"
        :title="`${it.player}: крах ×${it.crashMultiplier}${it.exitMultiplier ? ', забрал ×' + it.exitMultiplier : ''}`"
      >
        <span
          class="block text-[11px] font-bold"
          :class="it.win ? 'text-green' : 'text-red'"
          >{{ it.win ? '✓' : '✕' }}</span
        >
        <span class="block text-base font-bold" :class="multClass(it.crashMultiplier)"
          >×{{ it.crashMultiplier.toFixed(2) }}</span
        >
        <span v-if="it.win && it.exitMultiplier" class="block text-[10px] text-green">
          забрал ×{{ it.exitMultiplier.toFixed(2) }}
        </span>
        <span
          class="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[10px]"
          :class="it.isSelf ? 'font-bold text-yellow' : 'text-ink-dim'"
          style="max-width: 76px"
          >{{ it.isSelf ? 'ВЫ' : it.player }}</span
        >
      </div>
    </div>
  </div>
</template>
