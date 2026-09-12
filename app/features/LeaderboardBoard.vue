<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AppButton from '~/shared/ui/AppButton.vue'
import type { LeaderboardEntry } from '~/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.loadLeaderboard()
})

const sorted = (list: LeaderboardEntry[]) => [...list].sort((a, b) => b.score - a.score)

// Медали для первых трёх мест.
const medal = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <div class="flex items-center justify-between">
        <button
          class="cursor-pointer text-sm text-muted transition-colors hover:text-ink"
          data-testid="leaderboard-back"
          @click="navigateTo('/')"
        >
          ← Назад
        </button>
        <AppButton
          size="sm"
          variant="ghost"
          :disabled="auth.leaderboardLoading"
          data-testid="leaderboard-refresh"
          @click="auth.loadLeaderboard()"
        >
          {{ auth.leaderboardLoading ? 'Обновление…' : '↻ Обновить' }}
        </AppButton>
      </div>

      <h1 class="text-2xl font-extrabold">Топ игроков</h1>

      <section class="card p-4" data-testid="leaderboard-top">
        <div v-if="auth.leaderboardTop.length === 0" class="py-8 text-center text-sm text-muted">
          Пока нет данных
        </div>
        <div v-else class="flex flex-col divide-y divide-line">
          <div
            v-for="(e, i) in sorted(auth.leaderboardTop)"
            :key="`${e.user_name}-${i}`"
            class="flex items-center justify-between gap-3 py-3"
          >
            <div class="flex items-center gap-3">
              <img v-if="i === 0" src="/img/One1.jpg" alt="1 место" class="h-7 w-7 object-contain dark:invert" />
              <img v-else-if="i === 1" src="/img/Two2.jpg" alt="2 место" class="h-7 w-7 object-contain dark:invert" />
              <span v-else class="w-7 text-center text-lg">{{ medal(i) }}</span>
              <span class="font-semibold">{{ e.user_name }}</span>
            </div>
            <span class="font-bold text-accent-deep">{{ e.score }} <span class="text-sm font-normal text-muted">очков</span></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
