<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,6,11,0.8)] p-3"
    data-testid="rules-modal"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[88vh] w-[min(480px,100%)] flex-col border-4 border-shadow bg-panel shadow-[0_8px_0_var(--color-shadow)]"
    >
      <div
        class="flex items-center justify-between bg-[var(--theme,var(--color-red))] px-3 py-2.5 font-bold text-[#10121b]"
      >
        <span>КАК ИГРАТЬ</span>
        <button
          class="cursor-pointer border-none bg-transparent text-base text-[#10121b]"
          data-testid="rules-close"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
      <div class="overflow-y-auto p-3 text-sm leading-relaxed">
        <p class="mb-2.5">
          <b class="text-yellow">1. Ставка.</b> Выбери фрагмент пазла — это стоимость в бонусах и
          множитель бустера (×1…×4). Ставка списывается при старте.
        </p>
        <p class="mb-2.5">
          <b class="text-yellow">2. Полёт.</b> Шар взлетает, коэффициент растёт от ×1. Чем выше —
          тем больше выигрыш, но шар может лопнуть в любой момент.
        </p>
        <p class="mb-2.5">
          <b class="text-yellow">3. Уровни.</b> Горизонтальные линии — уровни. Красная тема — 12
          уровней, зелёная — 9. За каждый пройденный уровень начисляются очки.
        </p>
        <p class="mb-2.5">
          <b class="text-yellow">4. Забрать.</b> Раунд заканчивается сразу по нажатию кнопки
          «Забрать» (клавиша Space) — она активна сразу после взлёта шара. Выигрыш = ставка ×
          текущий коэффициент.
        </p>
        <p class="mb-2.5">
          <b class="text-yellow">5. Бустер.</b> При ставке ×2 и выше на одном из уровней стоит
          маркер бустера. Если шар прошёл этот уровень <i>до того, как ты забрал</i> — коэффициент
          умножается на бустер (скачок), плюс доп. очки.
        </p>
        <p class="mb-2.5">
          <b class="text-yellow">6. Крах.</b> Не успел забрать — ставка сгорает. Очки за пройденные
          уровни остаются.
        </p>
        <p class="mb-2.5">
          <b class="text-yellow">7. Награда.</b> За каждый раунд ты получаешь фрагмент пазла (4
          разных). Собрал все 4 — бонус <b class="text-yellow">+500</b> бонусов, и пазл начинается
          заново.
        </p>
      </div>
      <div class="border-t-[3px] border-shadow px-3 py-2.5">
        <PixelButton variant="ghost" block @click="emit('close')">Понятно</PixelButton>
      </div>
    </div>
  </div>
</template>
