<script setup lang="ts">
import type { BetOption } from '~/types/game'

const props = defineProps<{
  option: BetOption
  selected: boolean
  affordable: boolean
  index: number
}>()
const emit = defineEmits<{ select: [] }>()

const label = computed(() => (props.option.boosterTier === 1 ? 'Без бустера' : `Бустер ×${props.option.boosterTier}`))
</script>

<template>
  <button
    class="relative flex w-full max-w-[150px] cursor-pointer flex-col items-center gap-2 border-[3px] border-shadow bg-panel-2 px-2.5 pb-2.5 pt-3.5 text-ink transition-transform duration-75"
    :class="[
      selected && 'selected translate-y-[-3px] scale-[1.04] bg-panel outline outline-[3px] outline-yellow',
      !affordable && 'disabled cursor-not-allowed opacity-50 grayscale-[0.6]',
    ]"
    :data-testid="`bet-${option.id}`"
    :data-tier="option.boosterTier"
    type="button"
    @click="emit('select')"
  >
    <div
      class="flex h-[68px] w-[68px] items-center justify-center border-2 border-shadow bg-[var(--theme,var(--color-red))] shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.22),inset_3px_3px_0_rgba(255,255,255,0.18)] [clip-path:polygon(15%_15%,35%_15%,35%_0%,65%_0%,65%_15%,85%_15%,85%_85%,65%_85%,65%_65%,35%_65%,35%_85%,15%_85%)]"
      :data-idx="index"
    >
      <span class="text-[22px] font-bold text-[#10121b] [text-shadow:0_1px_0_rgba(255,255,255,0.25)]">
        ×{{ option.boosterTier }}
      </span>
    </div>
    <div class="flex flex-col items-center leading-[1.3]">
      <span class="text-base font-bold text-yellow"
        >{{ option.cost }} <small class="text-[10px] text-ink-dim">бонусов</small></span
      >
      <span class="text-[11px] text-ink-dim">{{ label }}</span>
    </div>
    <span v-if="!affordable" class="absolute right-2 top-1.5 text-sm">🔒</span>
  </button>
</template>
