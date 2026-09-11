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
    class="frag"
    :class="{ selected, disabled: !affordable }"
    :data-testid="`bet-${option.id}`"
    :data-tier="option.boosterTier"
    type="button"
    @click="emit('select')"
  >
    <div class="piece" :data-idx="index">
      <span class="tier">×{{ option.boosterTier }}</span>
    </div>
    <div class="info">
      <span class="cost">{{ option.cost }} <small>бонусов</small></span>
      <span class="boost">{{ label }}</span>
    </div>
    <span v-if="!affordable" class="lock">🔒</span>
  </button>
</template>

<style scoped>
.frag {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  background: var(--c-panel-2);
  border: 3px solid var(--c-shadow);
  cursor: pointer;
  color: var(--c-ink);
  transition: transform 0.08s;
}
.frag.selected {
  outline: 3px solid var(--c-yellow);
  transform: translateY(-3px) scale(1.03);
  background: var(--c-panel);
}
.frag.disabled {
  opacity: 0.5;
  filter: grayscale(0.6);
  cursor: not-allowed;
}
.piece {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme, var(--c-red));
  border: 2px solid var(--c-shadow);
  clip-path: polygon(0 0, 70% 0, 70% 15%, 100% 15%, 100% 100%, 30% 100%, 30% 85%, 0 85%);
}
.tier {
  font-size: 18px;
  font-weight: 700;
  color: #10121b;
}
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}
.cost {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-yellow);
}
.cost small {
  font-size: 8px;
  color: var(--c-ink-dim);
}
.boost {
  font-size: 9px;
  color: var(--c-ink-dim);
}
.lock {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 12px;
}
</style>
