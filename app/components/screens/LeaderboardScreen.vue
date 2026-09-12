<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import BalanceBar from '~/components/BalanceBar.vue'
import PixelButton from '~/components/ui/PixelButton.vue'
import type { LeaderboardEntry } from '~/stores/auth'

const store = useGameStore()
const auth = useAuthStore()

onMounted(() => {
  auth.loadLeaderboard()
})

function sorted(list: LeaderboardEntry[]) {
  return [...list].sort((a, b) => b.score - a.score)
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
            data-testid="leaderboard-back"
            @click="navigateTo('/')"
          >
            ← Назад
          </button>
          <PixelButton
            size="sm"
            variant="ghost"
            :disabled="auth.leaderboardLoading"
            data-testid="leaderboard-refresh"
            @click="auth.loadLeaderboard()"
          >
            {{ auth.leaderboardLoading ? 'Обновление…' : '↻ Обновить' }}
          </PixelButton>
        </div>

        <section class="border-[3px] border-shadow bg-panel p-4" data-testid="leaderboard-live">
          <div class="mb-3 text-sm font-bold text-ink-dim">LIVE РЕЙТИНГ</div>
          <div v-if="auth.leaderboardLive.length === 0" class="py-4 text-center text-sm text-ink-dim">
            Пока нет участников
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="(e, i) in sorted(auth.leaderboardLive)"
              :key="`${e.user_name}-${i}`"
              class="flex items-center justify-between gap-2 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 text-sm font-bold text-ink-dim">#{{ i + 1 }}</span>
                <span class="text-sm font-bold text-ink">{{ e.user_name }}</span>
              </div>
              <span class="text-sm text-yellow">{{ e.score }} очков</span>
            </div>
          </div>
        </section>

        <section class="border-[3px] border-shadow bg-panel p-4" data-testid="leaderboard-top">
          <div class="mb-3 text-sm font-bold text-ink-dim">ТОП ИГРОКОВ</div>
          <div v-if="auth.leaderboardTop.length === 0" class="py-4 text-center text-sm text-ink-dim">
            Пока нет данных
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="(e, i) in sorted(auth.leaderboardTop)"
              :key="`${e.user_name}-${i}`"
              class="flex items-center justify-between gap-2 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 text-sm font-bold text-ink-dim">#{{ i + 1 }}</span>
                <span class="text-sm font-bold text-ink">{{ e.user_name }}</span>
              </div>
              <span class="text-sm text-yellow">{{ e.score }} очков</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
