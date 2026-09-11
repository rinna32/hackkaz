<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div v-if="open" class="overlay" data-testid="rules-modal" @click.self="emit('close')">
    <div class="modal">
      <div class="head">
        <span>КАК ИГРАТЬ</span>
        <button class="x" data-testid="rules-close" @click="emit('close')">✕</button>
      </div>
      <div class="body">
        <p><b>1. Ставка.</b> Выбери фрагмент пазла — это стоимость в бонусах и множитель бустера (×1…×4). Ставка списывается при старте.</p>
        <p><b>2. Полёт.</b> Шар взлетает, коэффициент растёт от ×1. Чем выше — тем больше выигрыш, но шар может лопнуть в любой момент.</p>
        <p><b>3. Уровни.</b> Горизонтальные линии — уровни. Красная тема — 12 уровней, зелёная — 9. За каждый пройденный уровень начисляются очки.</p>
        <p><b>4. Забрать.</b> Кнопка «Забрать» активна после 1-го уровня (клавиша Space). Выигрыш = ставка × текущий коэффициент.</p>
        <p><b>5. Бустер.</b> При ставке ×2 и выше на одном из уровней стоит маркер бустера. Если шар прошёл этот уровень <i>до того, как ты забрал</i> — коэффициент умножается на бустер (скачок), плюс доп. очки.</p>
        <p><b>6. Крах.</b> Не успел забрать — ставка сгорает. Очки за пройденные уровни остаются.</p>
        <p><b>7. Награда.</b> За каждый раунд ты получаешь фрагмент пазла (4 разных). Собрал все 4 — бонус <b>+500</b> бонусов, и пазл начинается заново.</p>
      </div>
      <div class="foot">
        <PixelButton variant="ghost" block @click="emit('close')">Понятно</PixelButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 11, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 12px;
}
.modal {
  width: min(480px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--c-panel);
  border: 4px solid var(--c-shadow);
  box-shadow: 0 8px 0 var(--c-shadow);
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--theme, var(--c-red));
  color: #10121b;
  font-weight: 700;
}
.x {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #10121b;
}
.body {
  padding: 12px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.5;
}
.body p {
  margin: 0 0 10px;
}
.body b {
  color: var(--c-yellow);
}
.foot {
  padding: 10px 12px;
  border-top: 3px solid var(--c-shadow);
}
</style>
