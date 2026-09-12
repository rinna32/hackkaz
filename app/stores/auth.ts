import { defineStore } from 'pinia'

// Сессия хранится на клиенте: username — для профиля, token+role — для админ-эндпоинтов
// (бэкенд выдаёт JWT и роль в ответе login).
const KEY = 'balloon:username'
const TOKEN_KEY = 'balloon:token'
const ROLE_KEY = 'balloon:role'

export interface AdminUser {
  ID: number
  UserName: string
  UserEmail: string
  UserRole: string
}
export interface AdminGame {
  id: string
  user_name: string
  score: number
  played_at: string
}
export interface AdminReward {
  id: string
  name: string
  user_name: string
  claimed: boolean
}
export interface AdminTournament {
  // Бэкенд отдаёт поле как "ID" (как и в main.User), несмотря на "id" в swagger-схеме.
  ID: number
  name: string
  ends_at: string
}
export interface LeaderboardEntry {
  user_name: string
  score: number
}
export interface GameHistoryEntry {
  id: string
  user_name: string
  score: number
  played_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const username = ref<string | null>(null)
  const email = ref<string | null>(null)
  const token = ref<string | null>(null)
  const role = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loggedIn = computed(() => !!username.value)
  const isAdmin = computed(() => (role.value ?? '').toLowerCase() === 'admin')

  async function request(path: string, init?: RequestInit): Promise<any> {
    const base = useRuntimeConfig().public.userApiBase as string
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token.value) headers.Authorization = `Bearer ${token.value}`
    const res = await fetch(`${base}${path}`, { headers, ...init })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error((data && (data.error || data.message)) || `Ошибка ${res.status}`)
    }
    return data
  }

  async function loadProfile(name: string) {
    try {
      const data = await request(`/api/user/profile/${encodeURIComponent(name)}`)
      email.value = data?.user_email ?? null
    } catch {
      email.value = null
    }
  }

  function persistSession() {
    try {
      if (username.value) localStorage.setItem(KEY, username.value)
      if (token.value) localStorage.setItem(TOKEN_KEY, token.value)
      if (role.value) localStorage.setItem(ROLE_KEY, role.value)
    } catch {
      /* ignore */
    }
  }

  async function login(name: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await request('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({ user_name: name, user_password: password }),
      })
      username.value = name
      token.value = data?.token ?? null
      role.value = data?.role ?? null
      persistSession()
      await loadProfile(name)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка входа'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, mail: string, password: string) {
    loading.value = true
    error.value = null
    try {
      await request('/api/user/register', {
        method: 'POST',
        body: JSON.stringify({ user_name: name, user_email: mail, user_password: password }),
      })
    } catch (e) {
      loading.value = false
      error.value = e instanceof Error ? e.message : 'Ошибка регистрации'
      throw e
    }
    loading.value = false
    // После успешной регистрации сразу входим тем же паролем.
    await login(name, password)
  }

  function logout() {
    username.value = null
    email.value = null
    token.value = null
    role.value = null
    try {
      localStorage.removeItem(KEY)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
    } catch {
      /* ignore */
    }
  }

  function clearError() {
    error.value = null
  }

  /** Восстановление сессии из localStorage при загрузке приложения. */
  function init() {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(KEY)
      token.value = localStorage.getItem(TOKEN_KEY)
      role.value = localStorage.getItem(ROLE_KEY)
    } catch {
      /* ignore */
    }
    if (saved) {
      username.value = saved
      void loadProfile(saved)
    }
  }

  // --- админ-панель (только для role === 'admin') ---
  const adminUsers = ref<AdminUser[]>([])
  const adminGames = ref<AdminGame[]>([])
  const adminRewards = ref<AdminReward[]>([])
  const adminTournaments = ref<AdminTournament[]>([])
  const adminLoading = ref(false)
  const adminError = ref<string | null>(null)

  async function loadAdminData() {
    adminLoading.value = true
    adminError.value = null
    try {
      const [users, games, rewards, tournaments] = await Promise.all([
        request('/api/admin/users'),
        request('/api/admin/games'),
        request('/api/admin/rewards'),
        request('/api/admin/tournaments'),
      ])
      adminUsers.value = users ?? []
      adminGames.value = games ?? []
      adminRewards.value = rewards ?? []
      adminTournaments.value = tournaments ?? []
    } catch (e) {
      adminError.value = e instanceof Error ? e.message : 'Не удалось загрузить данные'
    } finally {
      adminLoading.value = false
    }
  }

  async function adminChangeRole(userName: string, newRole: string) {
    await request('/api/admin/users/role', {
      method: 'PUT',
      body: JSON.stringify({ user_name: userName, role: newRole }),
    })
    await loadAdminData()
  }

  async function adminDeleteUser(userName: string) {
    await request(`/api/admin/users/${encodeURIComponent(userName)}`, { method: 'DELETE' })
    await loadAdminData()
  }

  async function adminCreateReward(name: string, userName: string) {
    await request('/api/admin/rewards', {
      method: 'POST',
      body: JSON.stringify({ name, user_name: userName }),
    })
    await loadAdminData()
  }

  async function adminCreateTournament(name: string, endsAt: string) {
    await request('/api/admin/tournaments', {
      method: 'POST',
      body: JSON.stringify({ name, ends_at: endsAt }),
    })
    await loadAdminData()
  }

  async function adminDeleteTournament(id: number) {
    await request(`/api/admin/tournaments/${id}`, { method: 'DELETE' })
    await loadAdminData()
  }

  // --- турниры (публично, без токена) ---
  // Эндпоинт /api/tournament отдаёт СПИСОК всех активных турниров (массив), а не один.
  const tournaments = ref<AdminTournament[]>([])
  const tournamentLoading = ref(false)

  async function loadTournament() {
    tournamentLoading.value = true
    try {
      const data = await request('/api/tournament')
      // Бэкенд может вернуть массив либо (исторически) один объект — нормализуем в список.
      tournaments.value = Array.isArray(data) ? data : data ? [data] : []
    } catch {
      tournaments.value = []
    } finally {
      tournamentLoading.value = false
    }
  }

  // --- таблица лидеров: реальные игроки из БД (публично, без токена) ---
  const leaderboardLive = ref<LeaderboardEntry[]>([])
  const leaderboardTop = ref<LeaderboardEntry[]>([])
  const leaderboardLoading = ref(false)

  /** Оба запроса независимы: если один недоступен, второй всё равно отобразится. */
  async function loadLeaderboard() {
    leaderboardLoading.value = true
    const [live, top] = await Promise.allSettled([
      request('/api/tournament/live'),
      request('/api/tournament/top'),
    ])
    leaderboardLive.value = live.status === 'fulfilled' ? live.value ?? [] : []
    leaderboardTop.value = top.status === 'fulfilled' ? top.value ?? [] : []
    leaderboardLoading.value = false
  }

  // --- история игр пользователя (публично, без токена) ---
  // Бэкенд отдаёт общий список по всем игрокам — фильтруем на клиенте по имени.
  // null = запрос не удался (эндпоинт недоступен), [] = удался, но записей нет.
  const userGameHistory = ref<GameHistoryEntry[] | null>(null)

  async function loadUserGameHistory(userName: string) {
    try {
      const all = await request('/api/games/history/global')
      userGameHistory.value = Array.isArray(all)
        ? all.filter((g: GameHistoryEntry) => g.user_name === userName)
        : []
    } catch {
      userGameHistory.value = null
    }
  }

  return {
    username,
    email,
    token,
    loading,
    error,
    loggedIn,
    isAdmin,
    login,
    register,
    logout,
    clearError,
    init,
    adminUsers,
    adminGames,
    adminRewards,
    adminTournaments,
    adminLoading,
    adminError,
    loadAdminData,
    adminChangeRole,
    adminDeleteUser,
    adminCreateReward,
    adminCreateTournament,
    adminDeleteTournament,
    tournaments,
    tournamentLoading,
    loadTournament,
    leaderboardLive,
    leaderboardTop,
    leaderboardLoading,
    loadLeaderboard,
    userGameHistory,
    loadUserGameHistory,
  }
})
