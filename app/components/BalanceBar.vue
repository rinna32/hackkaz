<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import PixelButton from '~/components/ui/PixelButton.vue'

const store = useGameStore()

defineProps<{ showTopUp?: boolean; showRules?: boolean }>()
const emit = defineEmits<{ rules: [] }>()

const padded = computed(() => String(store.balance).padStart(5, '0'))
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-shadow bg-panel px-2.5 py-2"
  >
    <div class="flex items-center gap-1.5 text-[15px] font-bold text-yellow">
      <span
        class="inline-block h-2.5 w-2.5 bg-[var(--theme,var(--color-red))] shadow-[0_0_0_2px_var(--color-shadow)]"
      />ВОЗДУШНЫЙ ШАР
    </div>
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-end leading-none" data-testid="balance">
        <span class="text-[11px] tracking-wide text-ink-dim">БОНУСЫ</span>
        <span class="text-xl font-bold text-yellow">{{ padded }}</span>
      </div>
      <PixelButton v-if="showTopUp" size="sm" variant="ghost" data-testid="topup" @click="store.topUp()">
        + Пополнить
      </PixelButton>
      <PixelButton v-if="showRules" size="sm" variant="ghost" data-testid="rules-btn" @click="emit('rules')">
        ?
      </PixelButton>
    </div>
  </div>
</template>
