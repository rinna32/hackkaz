<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import PixelButton from '~/components/ui/PixelButton.vue'

const store = useGameStore()

defineProps<{ showTopUp?: boolean; showRules?: boolean }>()
const emit = defineEmits<{ rules: [] }>()

const padded = computed(() => String(store.balance).padStart(5, '0'))
</script>

<template>
  <div class="bar">
    <div class="brand">
      <span class="dot" />ВОЗДУШНЫЙ ШАР
    </div>
    <div class="right">
      <div class="balance" data-testid="balance">
        <span class="lbl">БОНУСЫ</span>
        <span class="val">{{ padded }}</span>
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

<style scoped>
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: var(--c-panel);
  border-bottom: 3px solid var(--c-shadow);
  flex-wrap: wrap;
}
.brand {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-yellow);
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  background: var(--theme, var(--c-red));
  display: inline-block;
  box-shadow: 0 0 0 2px var(--c-shadow);
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;
}
.lbl {
  font-size: 8px;
  color: var(--c-ink-dim);
}
.val {
  font-size: 18px;
  color: var(--c-yellow);
  font-weight: 700;
}
</style>
