import type {
  CashoutResult,
  GameConfig,
  HistoryItem,
  Round,
  RoundResult,
  ThemeId,
  TickResult,
} from '~/types/game'

/**
 * Контракт слоя данных. UI и стор зависят ТОЛЬКО от этого интерфейса и никогда
 * не считают исход раунда сами. Сейчас реализация — MockGameApi («сервер в
 * браузере»). Позже её заменит HttpGameApi/WsRealtimeChannel без правок UI.
 *
 * Модель авторитарна к «серверу»: crashPoint не отдаётся при создании раунда,
 * крах и выплату подтверждает реализация API (resolveTick / cashout).
 */
export interface GameApi {
  getConfig(): Promise<GameConfig>
  getBalance(): Promise<number>
  topUp(amount?: number): Promise<number>
  getHistory(): Promise<HistoryItem[]>

  /** Создаёт раунд и списывает ставку. Бросает, если баланса не хватает. */
  createRound(theme: ThemeId, betOptionId: string): Promise<Round>

  /**
   * Спрашивает у «сервера», лопнул ли шар к моменту elapsedMs.
   * Возвращает базовый коэффициент — истина о состоянии полёта.
   */
  resolveTick(roundId: string, elapsedMs: number): Promise<TickResult>

  /** Попытка забрать выигрыш на момент elapsedMs. */
  cashout(roundId: string, elapsedMs: number): Promise<CashoutResult>

  /**
   * Финализирует раунд (после краха) и возвращает итог: очки, награду, коэф. краха.
   * Пишет раунд в историю. Идемпотентна по roundId.
   */
  finalizeRound(roundId: string): Promise<RoundResult>
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super('Не хватает бонусов')
    this.name = 'InsufficientBalanceError'
  }
}
