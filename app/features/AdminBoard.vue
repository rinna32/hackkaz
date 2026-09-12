<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AppButton from '~/shared/ui/AppButton.vue'

const auth = useAuthStore()

onMounted(() => {
  auth.loadAdminData()
})

const inputClass =
  'w-full rounded-2xl border border-line px-3 py-2 text-sm outline-none transition-colors focus:border-accent'

const newRewardName = ref('')
const newRewardUser = ref('')
const createReward = async () => {
  if (!newRewardName.value.trim() || !newRewardUser.value.trim()) return
  await auth.adminCreateReward(newRewardName.value.trim(), newRewardUser.value.trim())
  newRewardName.value = ''
  newRewardUser.value = ''
}

const newTournamentName = ref('')
const newTournamentEndsAt = ref('')
const createTournament = async () => {
  if (!newTournamentName.value.trim() || !newTournamentEndsAt.value) return
  const iso = new Date(newTournamentEndsAt.value).toISOString()
  await auth.adminCreateTournament(newTournamentName.value.trim(), iso)
  newTournamentName.value = ''
  newTournamentEndsAt.value = ''
}

const formatDate = (s: string) => {
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString('ru-RU')
}
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <div class="flex items-center justify-between">
        <button
          class="cursor-pointer text-sm text-muted transition-colors hover:text-ink"
          data-testid="admin-back"
          @click="navigateTo('/')"
        >
          ← Назад
        </button>
        <AppButton size="sm" variant="ghost" :disabled="auth.adminLoading" data-testid="admin-refresh" @click="auth.loadAdminData()">
          {{ auth.adminLoading ? 'Обновление…' : '↻ Обновить' }}
        </AppButton>
      </div>

      <h1 class="text-2xl font-extrabold">Админ-панель</h1>

      <div v-if="auth.adminError" class="card px-4 py-3 text-sm text-[#c0362c]" data-testid="admin-error">
        {{ auth.adminError }}
      </div>

      <!-- Пользователи -->
      <section class="card p-4" data-testid="admin-users">
        <div class="mb-3 text-sm font-semibold text-muted">
          Пользователи <span class="text-ink">({{ auth.adminUsers.length }})</span>
        </div>
        <div v-if="auth.adminUsers.length === 0" class="py-4 text-center text-sm text-muted">Нет данных</div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="u in auth.adminUsers"
            :key="u.ID"
            class="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-2.5"
          >
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-bold">
                {{ u.UserName }}
                <span class="ml-1 text-[10px] font-normal text-muted">{{ u.UserRole }}</span>
              </span>
              <span class="text-[11px] text-muted">{{ u.UserEmail }}</span>
            </div>
            <div v-if="u.UserName !== auth.username" class="flex gap-2">
              <AppButton
                size="sm"
                variant="ghost"
                :data-testid="`admin-role-${u.UserName}`"
                @click="auth.adminChangeRole(u.UserName, u.UserRole.toLowerCase() === 'admin' ? 'User' : 'admin')"
              >
                {{ u.UserRole.toLowerCase() === 'admin' ? 'Разжаловать' : 'Сделать админом' }}
              </AppButton>
              <AppButton size="sm" variant="danger" :data-testid="`admin-delete-user-${u.UserName}`" @click="auth.adminDeleteUser(u.UserName)">
                Удалить
              </AppButton>
            </div>
            <span v-else class="text-[11px] text-muted">это вы</span>
          </div>
        </div>
      </section>

      <!-- Турниры -->
      <section class="card p-4" data-testid="admin-tournaments">
        <div class="mb-3 text-sm font-semibold text-muted">Турниры</div>
        <div v-if="auth.adminTournaments.length === 0" class="py-4 text-center text-sm text-muted">Нет турниров</div>
        <div v-else class="mb-3 flex flex-col gap-2">
          <div
            v-for="t in auth.adminTournaments"
            :key="t.ID"
            class="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-2.5"
          >
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-bold">{{ t.name }}</span>
              <span class="text-[11px] text-muted">до {{ formatDate(t.ends_at) }}</span>
            </div>
            <AppButton size="sm" variant="danger" :data-testid="`admin-delete-tournament-${t.ID}`" @click="auth.adminDeleteTournament(t.ID)">
              Удалить
            </AppButton>
          </div>
        </div>
        <form class="flex flex-wrap items-end gap-2" @submit.prevent="createTournament">
          <label class="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-muted">
            Название
            <input v-model="newTournamentName" data-testid="admin-tournament-name" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1 text-xs text-muted">
            Окончание
            <input v-model="newTournamentEndsAt" type="datetime-local" data-testid="admin-tournament-ends" :class="inputClass" />
          </label>
          <AppButton size="sm" data-testid="admin-tournament-create" @click="createTournament">Создать</AppButton>
        </form>
      </section>

      <!-- Награды -->
      <section class="card p-4" data-testid="admin-rewards">
        <div class="mb-3 text-sm font-semibold text-muted">Награды</div>
        <div v-if="auth.adminRewards.length === 0" class="py-4 text-center text-sm text-muted">Нет наград</div>
        <div v-else class="mb-3 flex flex-col gap-2">
          <div
            v-for="(r, i) in auth.adminRewards"
            :key="`${r.user_name}-${r.name}-${r.id || i}`"
            class="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-2.5"
          >
            <div class="flex flex-col leading-tight">
              <span class="text-sm font-bold">{{ r.name }}</span>
              <span class="text-[11px] text-muted">{{ r.user_name }}</span>
            </div>
            <span class="text-[11px] text-muted">{{ r.claimed ? 'получена' : 'не получена' }}</span>
          </div>
        </div>
        <form class="flex flex-wrap items-end gap-2" @submit.prevent="createReward">
          <label class="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-muted">
            Название
            <input v-model="newRewardName" data-testid="admin-reward-name" :class="inputClass" />
          </label>
          <label class="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-muted">
            Игрок (username)
            <input v-model="newRewardUser" data-testid="admin-reward-user" :class="inputClass" />
          </label>
          <AppButton size="sm" data-testid="admin-reward-create" @click="createReward">Выдать</AppButton>
        </form>
      </section>

      <!-- История игр -->
      <section class="card p-4" data-testid="admin-games">
        <div class="mb-3 text-sm font-semibold text-muted">
          История игр <span class="text-ink">({{ auth.adminGames.length }})</span>
        </div>
        <div v-if="auth.adminGames.length === 0" class="py-4 text-center text-sm text-muted">Нет данных</div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="g in auth.adminGames"
            :key="g.id"
            class="flex items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-2.5"
          >
            <span class="text-sm font-bold">{{ g.user_name }}</span>
            <span class="text-sm">{{ g.score }} очков</span>
            <span class="text-[11px] text-muted">{{ formatDate(g.played_at) }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
