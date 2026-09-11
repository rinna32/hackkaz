import type { GameConfig } from '~/types/game'

/**
 * ЕДИНСТВЕННЫЙ источник числовых параметров игры.
 * Компоненты и стор читают конфиг ТОЛЬКО через GameApi.getConfig() — никаких
 * магических констант в UI. Позже эти же параметры будет отдавать бэкенд/админка.
 */
export const DEFAULT_CONFIG: GameConfig = {
  // --- Математическая модель ---
  // P(crash > x) = (minCrash / x)^alpha; crash = min(max, minCrash / U^(1/alpha))
  alpha: 1.15,
  maxMultiplier: 100,
  minCrashMultiplier: 1.0,
  // m(t) = startMultiplier * e^(growthRate * t), t в секундах
  multiplierGrowthRate: 0.16,
  startMultiplier: 1.0,

  themes: {
    red: {
      id: 'red',
      name: 'Красный шар',
      // 12 уровней — выше риск и потенциальная награда
      levelThresholds: [1.3, 1.7, 2.2, 2.8, 3.6, 4.6, 6.0, 8.0, 11.0, 15.0, 22.0, 35.0],
      // Вес появления маркера бустера на уровне (нормализуется при выборе)
      lootProbabilities: [0.2, 0.18, 0.16, 0.12, 0.1, 0.08, 0.06, 0.04, 0.03, 0.015, 0.01, 0.005],
    },
    green: {
      id: 'green',
      name: 'Зелёный шар',
      // 9 уровней — мягче
      levelThresholds: [1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 4.0, 5.0, 6.5],
      lootProbabilities: [0.22, 0.2, 0.16, 0.13, 0.1, 0.08, 0.06, 0.03, 0.02],
    },
  },

  // 4 фрагмента пазла: стоимость + множитель бустера
  betOptions: [
    { id: 'f1', cost: 50, boosterTier: 1, boosterMultiplier: 1 },
    { id: 'f2', cost: 100, boosterTier: 2, boosterMultiplier: 2 },
    { id: 'f3', cost: 150, boosterTier: 3, boosterMultiplier: 3 },
    { id: 'f4', cost: 200, boosterTier: 4, boosterMultiplier: 4 },
  ],

  // --- Очки ---
  pointsPerLine: 10,
  pointsCashoutBonus: 50,
  pointsBoosterBonus: 100,

  // --- Тайминги UI (мс) ---
  resultIdleTimeout: 10_000,
  onboardingDuration: 4_000,

  // --- Демо-кошелёк ---
  startingBalance: 1000,
  topUpAmount: 500,
}
