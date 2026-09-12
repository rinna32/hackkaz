<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import PixelButton from '~/components/ui/PixelButton.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = useGameStore()

const quickAmounts = [200, 500, 1000, 2000]

const cardNumber = ref('')
const amount = ref(store.config?.topUpAmount ?? 500)
const submitting = ref(false)

function onCardInput(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  cardNumber.value = digits.replace(/(.{4})(?=.)/g, '$1 ')
}

const canSubmit = computed(
  () => cardNumber.value.replace(/\s/g, '').length === 16 && Number(amount.value) > 0,
)

function reset() {
  cardNumber.value = ''
  amount.value = store.config?.topUpAmount ?? 500
}

watch(
  () => props.open,
  (v) => {
    if (!v) reset()
  },
)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    await store.topUp(Number(amount.value))
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,6,11,0.8)] p-3"
    data-testid="topup-modal"
    @click.self="emit('close')"
  >
    <div
      class="flex w-[min(360px,100%)] flex-col border-4 border-shadow bg-panel shadow-[0_8px_0_var(--color-shadow)]"
    >
      <div
        class="flex items-center justify-between bg-[var(--theme,var(--color-red))] px-3 py-2.5 font-bold text-[#10121b]"
      >
        <span>ПОПОЛНЕНИЕ</span>
        <button
          class="cursor-pointer border-none bg-transparent text-base text-[#10121b]"
          data-testid="topup-close"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <form class="flex flex-col gap-3 p-4" @submit.prevent="submit">
        <label class="flex flex-col gap-1 text-xs text-ink-dim">
          Номер карты
          <input
            :value="cardNumber"
            inputmode="numeric"
            placeholder="0000 0000 0000 0000"
            maxlength="19"
            required
            data-testid="topup-card"
            class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
            @input="onCardInput"
          />
        </label>

        <label class="flex flex-col gap-1 text-xs text-ink-dim">
          Сумма пополнения
          <input
            v-model.number="amount"
            type="number"
            min="1"
            step="1"
            required
            data-testid="topup-amount"
            class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
          />
        </label>

        <div class="flex gap-2">
          <button
            v-for="q in quickAmounts"
            :key="q"
            type="button"
            class="flex-1 cursor-pointer border-2 border-shadow bg-panel-2 py-1.5 text-xs text-ink-dim"
            :class="amount === q ? 'border-yellow text-yellow' : ''"
            :data-testid="`topup-quick-${q}`"
            @click="amount = q"
          >
            +{{ q }}
          </button>
        </div>

        <div class="text-[10px] text-ink-dim">Демо-пополнение — данные карты никуда не отправляются.</div>

        <PixelButton block :disabled="!canSubmit || submitting" type="submit" data-testid="topup-submit">
          {{ submitting ? 'Пополняем…' : 'Пополнить' }}
        </PixelButton>
      </form>
    </div>
  </div>
</template>
