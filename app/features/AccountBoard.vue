<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import AppButton from '~/shared/ui/AppButton.vue'

const store = useGameStore()
const auth = useAuthStore()

const myHistory = computed(() => store.history.filter((h) => h.isSelf))

// Пробуем реальную историю с бэкенда (по игроку); пока там пусто/недоступно —
// показываем локальную историю раундов этого шара как есть.
const useBackendHistory = computed(() => (auth.userGameHistory?.length ?? 0) > 0)

onMounted(() => {
  if (auth.username) auth.loadUserGameHistory(auth.username)
})

const formatDate = (ts: number | string) => {
  const d = new Date(ts)
  return Number.isNaN(d.getTime())
    ? String(ts)
    : d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const logout = () => {
  auth.logout()
  navigateTo('/')
}
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <button
        class="w-fit cursor-pointer text-sm text-muted transition-colors hover:text-ink"
        data-testid="account-back"
        @click="navigateTo('/')"
      >
        ← Назад
      </button>

      <!-- Профиль -->
      <div class="card flex flex-col items-center gap-2 p-6 text-center" data-testid="account-profile">
        <img src="/img/user.png" alt="Аватар" class="h-16 w-16 rounded-full object-contain" />
        <div class="text-xl font-extrabold" data-testid="account-username">{{ auth.username }}</div>
        <div v-if="auth.email" class="text-xs text-muted">{{ auth.email }}</div>
        <AppButton variant="ghost" size="sm" data-testid="account-logout" @click="logout">Выйти</AppButton>
      </div>

      <!-- История игр -->
      <div class="card p-4" data-testid="account-history">
        <div class="mb-3 text-sm font-semibold text-muted">История игр</div>

        <!-- Реальные записи с бэкенда по этому игроку, когда они есть -->
        <div v-if="useBackendHistory" class="flex flex-col divide-y divide-line">
          <div v-for="it in auth.userGameHistory" :key="it.id" class="flex items-center justify-between gap-3 py-3">
            <span class="font-semibold">{{ it.score }} <span class="text-sm font-normal text-muted">очков</span></span>
            <span class="text-xs text-muted">{{ formatDate(it.played_at) }}</span>
          </div>
        </div>

        <!-- Иначе — локальная история раундов шара -->
        <div v-else-if="myHistory.length === 0" class="py-6 text-center text-sm text-muted">
          Вы ещё не сыграли ни одного раунда
        </div>
        <div v-else class="flex flex-col divide-y divide-line">
          <div v-for="it in myHistory" :key="it.id" class="flex items-center justify-between gap-3 py-3">
            <div class="flex items-center gap-2.5">
              <span class="text-sm" :class="it.win ? 'text-ink' : 'text-muted'">{{ it.win ? '✓' : '✕' }}</span>
              <div class="flex flex-col leading-tight">
                <span class="text-base font-bold">×{{ it.crashMultiplier.toFixed(2) }}</span>
                <span v-if="it.win && it.exitMultiplier" class="text-[11px] text-muted">
                  забрал ×{{ it.exitMultiplier.toFixed(2) }}
                </span>
              </div>
            </div>
            <span class="text-xs text-muted">{{ formatDate(it.at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
