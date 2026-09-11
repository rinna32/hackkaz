<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    disabled?: boolean
    block?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { variant: 'primary', disabled: false, block: false, size: 'md' },
)
</script>

<template>
  <button
    class="pbtn"
    :class="[`v-${variant}`, `s-${size}`, { block, disabled }]"
    :disabled="disabled"
    type="button"
  >
    <span class="label"><slot /></span>
  </button>
</template>

<style scoped>
.pbtn {
  --btn: var(--theme, #ff5a4d);
  --btn-deep: var(--theme-deep, #b32d2d);
  position: relative;
  border: 3px solid var(--c-shadow);
  background: var(--btn);
  color: #10121b;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 0 var(--btn-deep), 0 6px 0 var(--c-shadow);
  transition: transform 0.05s, box-shadow 0.05s;
  text-transform: uppercase;
  image-rendering: pixelated;
}
.s-sm {
  padding: 6px 10px;
  font-size: 11px;
}
.s-md {
  padding: 10px 16px;
  font-size: 14px;
}
.s-lg {
  padding: 14px 22px;
  font-size: 18px;
}
.block {
  display: block;
  width: 100%;
}
.pbtn:not(.disabled):active {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--btn-deep), 0 2px 0 var(--c-shadow);
}
.v-ghost {
  --btn: var(--c-panel-2);
  color: var(--c-ink);
}
.v-danger {
  --btn: var(--c-red);
  --btn-deep: var(--c-red-deep);
  color: #fff;
}
.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.5);
}
</style>
