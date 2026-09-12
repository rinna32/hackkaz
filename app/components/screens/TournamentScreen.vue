<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import BalanceBar from '~/components/BalanceBar.vue'
import PixelButton from '~/components/ui/PixelButton.vue'

const store = useGameStore()
const auth = useAuthStore()

onMounted(() => {
  auth.loadTournament()
})

function formatDate(s: string) {
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString('ru-RU')
}
</script>

<template>
  <div class="flex h-full flex-col" :class="`theme-${store.theme}`">
    <BalanceBar />

    <div class="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-5">
      <div class="flex w-full max-w-[560px] flex-col gap-4">
        <div class="flex items-center justify-between">
          <button
            class="flex w-fit cursor-pointer items-center gap-1 border-none bg-transparent text-sm text-ink-dim"
            data-testid="tournament-back"
            @click="navigateTo('/')"
          >
            ← Назад
          </button>
          <PixelButton
            size="sm"
            variant="ghost"
            :disabled="auth.tournamentLoading"
            data-testid="tournament-refresh"
            @click="auth.loadTournament()"
          >
            {{ auth.tournamentLoading ? 'Обновление…' : '↻ Обновить' }}
          </PixelButton>
        </div>

        <div class="border-[3px] border-shadow bg-panel p-4 text-center" data-testid="tournament-info">
          <template v-if="auth.tournament">
            <div class="text-lg font-bold text-yellow">{{ auth.tournament.name }}</div>
            <div class="text-xs text-ink-dim">до {{ formatDate(auth.tournament.ends_at) }}</div>
          </template>
          <div v-else class="text-sm text-ink-dim">Турнир сейчас не проводится</div>
        </div>
      </div>
    </div>
  </div>
</template>
