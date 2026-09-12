<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useAuthStore } from '~/stores/auth'
import BalanceBar from '~/components/BalanceBar.vue'
import PixelButton from '~/components/ui/PixelButton.vue'

const store = useGameStore()
const auth = useAuthStore()

onMounted(() => {
  auth.loadAdminData()
})

const newRewardName = ref('')
const newRewardUser = ref('')
async function createReward() {
  if (!newRewardName.value.trim() || !newRewardUser.value.trim()) return
  await auth.adminCreateReward(newRewardName.value.trim(), newRewardUser.value.trim())
  newRewardName.value = ''
  newRewardUser.value = ''
}

const newTournamentName = ref('')
const newTournamentEndsAt = ref('')
async function createTournament() {
  if (!newTournamentName.value.trim() || !newTournamentEndsAt.value) return
  const iso = new Date(newTournamentEndsAt.value).toISOString()
  await auth.adminCreateTournament(newTournamentName.value.trim(), iso)
  newTournamentName.value = ''
  newTournamentEndsAt.value = ''
}

function formatDate(s: string) {
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString('ru-RU')
}
</script>

<template>
  <div class="flex h-full flex-col" :class="`theme-${store.theme}`">
    <BalanceBar />

    <div class="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-5">
      <div class="flex w-full max-w-[860px] flex-col gap-4">
        <div class="flex items-center justify-between">
          <button
            class="flex w-fit cursor-pointer items-center gap-1 border-none bg-transparent text-sm text-ink-dim"
            data-testid="admin-back"
            @click="navigateTo('/')"
          >
            ← Назад
          </button>
          <PixelButton
            size="sm"
            variant="ghost"
            :disabled="auth.adminLoading"
            data-testid="admin-refresh"
            @click="auth.loadAdminData()"
          >
            {{ auth.adminLoading ? 'Обновление…' : '↻ Обновить' }}
          </PixelButton>
        </div>

        <div v-if="auth.adminError" class="border-2 border-shadow bg-panel-2 px-3 py-2 text-sm text-red" data-testid="admin-error">
          {{ auth.adminError }}
        </div>

        <!-- Пользователи -->
        <section class="border-[3px] border-shadow bg-panel p-4" data-testid="admin-users">
          <div class="mb-3 text-sm font-bold text-ink-dim">
            ПОЛЬЗОВАТЕЛИ <span class="text-ink">({{ auth.adminUsers.length }})</span>
          </div>
          <div v-if="auth.adminUsers.length === 0" class="py-4 text-center text-sm text-ink-dim">Нет данных</div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="u in auth.adminUsers"
              :key="u.ID"
              class="flex flex-wrap items-center justify-between gap-2 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <div class="flex flex-col leading-tight">
                <span class="text-sm font-bold text-ink">
                  {{ u.UserName }}
                  <span
                    class="ml-1 text-[10px] font-normal"
                    :class="u.UserRole.toLowerCase() === 'admin' ? 'text-yellow-hot' : 'text-ink-dim'"
                  >
                    {{ u.UserRole }}
                  </span>
                </span>
                <span class="text-[11px] text-ink-dim">{{ u.UserEmail }}</span>
              </div>
              <div v-if="u.UserName !== auth.username" class="flex gap-2">
                <PixelButton
                  size="sm"
                  variant="ghost"
                  :data-testid="`admin-role-${u.UserName}`"
                  @click="auth.adminChangeRole(u.UserName, u.UserRole.toLowerCase() === 'admin' ? 'User' : 'admin')"
                >
                  {{ u.UserRole.toLowerCase() === 'admin' ? 'Разжаловать' : 'Сделать админом' }}
                </PixelButton>
                <PixelButton
                  size="sm"
                  variant="danger"
                  :data-testid="`admin-delete-user-${u.UserName}`"
                  @click="auth.adminDeleteUser(u.UserName)"
                >
                  Удалить
                </PixelButton>
              </div>
              <span v-else class="text-[11px] text-ink-dim">это вы</span>
            </div>
          </div>
        </section>

        <!-- Турниры -->
        <section class="border-[3px] border-shadow bg-panel p-4" data-testid="admin-tournaments">
          <div class="mb-3 text-sm font-bold text-ink-dim">ТУРНИРЫ</div>
          <div v-if="auth.adminTournaments.length === 0" class="py-4 text-center text-sm text-ink-dim">
            Нет турниров
          </div>
          <div v-else class="mb-3 flex flex-col gap-2">
            <div
              v-for="t in auth.adminTournaments"
              :key="t.ID"
              class="flex items-center justify-between gap-2 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <div class="flex flex-col leading-tight">
                <span class="text-sm font-bold text-ink">{{ t.name }}</span>
                <span class="text-[11px] text-ink-dim">до {{ formatDate(t.ends_at) }}</span>
              </div>
              <PixelButton
                size="sm"
                variant="danger"
                :data-testid="`admin-delete-tournament-${t.ID}`"
                @click="auth.adminDeleteTournament(t.ID)"
              >
                Удалить
              </PixelButton>
            </div>
          </div>
          <form class="flex flex-wrap items-end gap-2" @submit.prevent="createTournament">
            <label class="flex flex-1 min-w-[160px] flex-col gap-1 text-xs text-ink-dim">
              Название
              <input
                v-model="newTournamentName"
                data-testid="admin-tournament-name"
                class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
              />
            </label>
            <label class="flex flex-col gap-1 text-xs text-ink-dim">
              Окончание
              <input
                v-model="newTournamentEndsAt"
                type="datetime-local"
                data-testid="admin-tournament-ends"
                class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
              />
            </label>
            <PixelButton size="sm" type="submit" data-testid="admin-tournament-create">Создать</PixelButton>
          </form>
        </section>

        <!-- Награды -->
        <section class="border-[3px] border-shadow bg-panel p-4" data-testid="admin-rewards">
          <div class="mb-3 text-sm font-bold text-ink-dim">НАГРАДЫ</div>
          <div v-if="auth.adminRewards.length === 0" class="py-4 text-center text-sm text-ink-dim">Нет наград</div>
          <div v-else class="mb-3 flex flex-col gap-2">
            <div
              v-for="(r, i) in auth.adminRewards"
              :key="`${r.user_name}-${r.name}-${r.id || i}`"
              class="flex items-center justify-between gap-2 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <div class="flex flex-col leading-tight">
                <span class="text-sm font-bold text-ink">{{ r.name }}</span>
                <span class="text-[11px] text-ink-dim">{{ r.user_name }}</span>
              </div>
              <span class="text-[11px]" :class="r.claimed ? 'text-green' : 'text-ink-dim'">
                {{ r.claimed ? 'получена' : 'не получена' }}
              </span>
            </div>
          </div>
          <form class="flex flex-wrap items-end gap-2" @submit.prevent="createReward">
            <label class="flex flex-1 min-w-[160px] flex-col gap-1 text-xs text-ink-dim">
              Название
              <input
                v-model="newRewardName"
                data-testid="admin-reward-name"
                class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
              />
            </label>
            <label class="flex flex-1 min-w-[160px] flex-col gap-1 text-xs text-ink-dim">
              Игрок (username)
              <input
                v-model="newRewardUser"
                data-testid="admin-reward-user"
                class="border-2 border-shadow bg-panel-2 px-2 py-1.5 text-sm text-ink outline-none focus:border-yellow"
              />
            </label>
            <PixelButton size="sm" type="submit" data-testid="admin-reward-create">Выдать</PixelButton>
          </form>
        </section>

        <!-- История игр -->
        <section class="border-[3px] border-shadow bg-panel p-4" data-testid="admin-games">
          <div class="mb-3 text-sm font-bold text-ink-dim">
            ИСТОРИЯ ИГР <span class="text-ink">({{ auth.adminGames.length }})</span>
          </div>
          <div v-if="auth.adminGames.length === 0" class="py-4 text-center text-sm text-ink-dim">Нет данных</div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="g in auth.adminGames"
              :key="g.id"
              class="flex items-center justify-between gap-2 border-2 border-shadow bg-panel-2 px-3 py-2"
            >
              <span class="text-sm font-bold text-ink">{{ g.user_name }}</span>
              <span class="text-sm text-yellow">{{ g.score }} очков</span>
              <span class="text-[11px] text-ink-dim">{{ formatDate(g.played_at) }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
