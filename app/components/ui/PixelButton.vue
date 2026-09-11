<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    disabled?: boolean
    block?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { variant: 'primary', disabled: false, block: false, size: 'md' },
)

const sizeClasses: Record<string, string> = {
  sm: 'px-2.5 py-1.5 text-[11px]',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-[22px] py-3.5 text-lg',
}
const variantClasses: Record<string, string> = {
  primary: 'text-[#10121b] [--btn:var(--theme,#ff5a4d)] [--btn-deep:var(--theme-deep,#b32d2d)]',
  ghost: 'text-ink [--btn:var(--color-panel-2)] [--btn-deep:var(--theme-deep,#b32d2d)]',
  danger: 'text-white [--btn:var(--color-red)] [--btn-deep:var(--color-red-deep)]',
}
</script>

<template>
  <button
    class="relative border-[3px] border-shadow bg-[var(--btn)] font-bold uppercase tracking-wide shadow-[0_4px_0_var(--btn-deep),0_6px_0_var(--color-shadow)] transition-[transform,box-shadow] duration-75 [image-rendering:pixelated]"
    :class="[
      sizeClasses[props.size],
      variantClasses[props.variant],
      props.block ? 'block w-full' : '',
      props.disabled
        ? 'cursor-not-allowed opacity-45 grayscale-[0.5]'
        : 'cursor-pointer active:translate-y-1 active:shadow-[0_0_0_var(--btn-deep),0_2px_0_var(--color-shadow)]',
    ]"
    :disabled="disabled"
    type="button"
  >
    <span><slot /></span>
  </button>
</template>
