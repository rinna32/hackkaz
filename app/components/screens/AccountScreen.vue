<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import BalanceBar from '~/components/BalanceBar.vue'
import PixelButton from '~/components/ui/PixelButton.vue'

const store = useGameStore()
const auth = useAuthStore()

const myHistory = computed(() => store.history.filter((h) => h.isSelf))

// Пробуем реальную историю с бэкенда (по игроку); пока там пусто/недоступно —
// показываем локальную историю раундов этого шара как есть.
const useBackendHistory = computed(() => (auth.userGameHistory?.length ?? 0) > 0)

onMounted(() => {
  if (auth.username) auth.loadUserGameHistory(auth.username)
})

function formatDate(ts: number | string) {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return Number.isNaN(d.getTime())
    ? String(ts)
    : d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function logout() {
  auth.logout()
  navigateTo('/')
}
</script>

<template>
  <div class="flex h-full flex-col" :class="`theme-${store.theme}`">
    <BalanceBar />

    <div class="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-5">
      <div class="flex w-full max-w-[560px] flex-col gap-4">
        <button
          class="flex w-fit cursor-pointer items-center gap-1 border-none bg-transparent text-sm text-ink-dim"
          data-testid="account-back"
          @click="navigateTo('/')"
        >
          ← Назад
        </button>

        <div
          class="flex flex-col items-center gap-2 border-[3px] border-shadow bg-panel p-5 text-center"
          data-testid="account-profile"
        >
          <div
            class="flex h-14 w-14 items-center justify-center border-2 border-shadow bg-[var(--theme,var(--color-red))] text-2xl"
          >
            👤
          </div>
          <div class="text-xl font-bold text-yellow" data-testid="account-username">
            {{ auth.username }}
          </div>
          <div v-if="auth.email" class="text-xs text-ink-dim">{{ auth.email }}</div>
          <PixelButton variant="ghost" size="sm" data-testid="account-logout" @click="logout">
            Выйти
          </PixelButton>
        </div>

        <div class="border-[3px] border-shadow bg-panel p-4" data-testid="account-history">
          <div class="mb-3 text-sm font-bold text-ink-dim">ИСТОРИЯ ИГР</div>

          <!-- Реальные записи с бэкена по этому игроку, когда они есть -->
          <div v-if="useBackendHistory" class="flex flex-col gap-2">
            <div
              v-for="it in auth.userGameHistory"
              :key="it.id"
              class="flex items-center justify-between gap-3 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <span class="text-sm text-yellow">{{ it.score }} очков</span>
              <span class="text-[11px] text-ink-dim">{{ formatDate(it.played_at) }}</span>
            </div>
          </div>

          <!-- Иначе — локальная история раундов шара -->
          <div v-else-if="myHistory.length === 0" class="py-6 text-center text-sm text-ink-dim">
            Вы ещё не сыграли ни одного раунда
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="it in myHistory"
              :key="it.id"
              class="flex items-center justify-between gap-3 border-2 border-l-4 border-shadow bg-panel-2 px-3 py-2"
              :class="it.win ? 'border-l-green' : 'border-l-red'"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold" :class="it.win ? 'text-green' : 'text-red'">
                  {{ it.win ? '✓' : '✕' }}
                </span>
                <div class="flex flex-col leading-tight">
                  <span class="text-base font-bold text-ink">×{{ it.crashMultiplier.toFixed(2) }}</span>
                  <span v-if="it.win && it.exitMultiplier" class="text-[11px] text-green">
                    забрал ×{{ it.exitMultiplier.toFixed(2) }}
                  </span>
                </div>
              </div>
              <span class="text-[11px] text-ink-dim">{{ formatDate(it.at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
