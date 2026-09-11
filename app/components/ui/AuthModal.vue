<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import PixelButton from '~/components/ui/PixelButton.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const username = ref('')
const email = ref('')
const password = ref('')

async function submit() {
  try {
    if (mode.value === 'register') {
      await auth.register(username.value.trim(), email.value.trim(), password.value)
    } else {
      await auth.login(username.value.trim(), password.value)
    }
    password.value = ''
    emit('close')
  } catch {
    /* ошибка уже отражена в auth.error */
  }
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  auth.clearError()
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,6,11,0.8)] p-3"
    data-testid="auth-modal"
    @click.self="emit('close')"
  >
    <div
      class="flex w-[min(360px,100%)] flex-col border-4 border-shadow bg-panel shadow-[0_8px_0_var(--color-shadow)]"
    >
      <div
        class="flex items-center justify-between bg-[var(--theme,var(--color-red))] px-3 py-2.5 font-bold text-[#10121b]"
      >
        <span>{{ mode === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ' }}</span>
        <button
          class="cursor-pointer border-none bg-transparent text-base text-[#10121b]"
          data-testid="auth-close"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <form class="flex flex-col gap-3 p-4" @submit.prevent="submit">
        <label class="flex flex-col gap-1 text-xs text-ink-dim">
          Имя пользователя
          <input
            v-model="username"
            data-testid="auth-username"
            required
            class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
          />
        </label>
        <label v-if="mode === 'register'" class="flex flex-col gap-1 text-xs text-ink-dim">
          Email
          <input
            v-model="email"
            type="email"
            data-testid="auth-email"
            required
            class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs text-ink-dim">
          Пароль
          <input
            v-model="password"
            type="password"
            data-testid="auth-password"
            required
            class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
          />
        </label>

        <div v-if="auth.error" class="text-xs text-red" data-testid="auth-error">{{ auth.error }}</div>

        <PixelButton block :disabled="auth.loading" data-testid="auth-submit" type="submit">
          {{ auth.loading ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </PixelButton>

        <button
          type="button"
          class="cursor-pointer border-none bg-transparent text-xs text-ink-dim underline"
          data-testid="auth-toggle-mode"
          @click="toggleMode"
        >
          {{ mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>
