import type { GameApi } from '~/services/GameApi'

/** Доступ к слою данных. Компоненты зависят только от интерфейса GameApi. */
export function useGameApi(): GameApi {
  return useNuxtApp().$gameApi as GameApi
}
