import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG } from '~/shared/config/game.config'
import { MockGameApi } from '~/shared/api/mock/MockGameApi'
import { timeForMultiplier } from '~/shared/lib/game/engine'

function memoryKV() {
  const m = new Map<string, string>()
  return {
    get: (k: string) => (m.has(k) ? m.get(k)! : null),
    set: (k: string, v: string) => void m.set(k, v),
  }
}

function newApi(seed: string, startingBalance = 100_000) {
  const cfg = { ...structuredClone(DEFAULT_CONFIG), startingBalance }
  return new MockGameApi({ fixedSeed: seed, latency: 0, storage: memoryKV(), config: cfg })
}

/** Узнаём скрытую точку краха, спросив «сервер» на большом времени (крах уже случился). */
async function discoverCrash(api: MockGameApi, roundId: string) {
  const tick = await api.resolveTick(roundId, 1e12)
  expect(tick.crashed).toBe(true)
  return tick.baseMultiplier
}

const cfg = DEFAULT_CONFIG
const msFor = (m: number) => timeForMultiplier(m, cfg) * 1000

describe('MockGameApi — детерминизм', () => {
  it('одинаковый seed → одинаковая точка краха', async () => {
    const a = newApi('fixed')
    const b = newApi('fixed')
    const ra = await a.createRound('green', 'f1')
    const rb = await b.createRound('green', 'f1')
    expect(await discoverCrash(a, ra.id)).toBe(await discoverCrash(b, rb.id))
  })
})

describe('MockGameApi — баланс', () => {
  it('ставка списывается, выигрыш зачисляется', async () => {
    const api = newApi('bal', 1000)
    expect(await api.getBalance()).toBe(1000)
    const r = await api.createRound('green', 'f2') // cost 100
    expect(await api.getBalance()).toBe(900)

    const crash = await discoverCrash(api, r.id)
    // забираем чуть раньше краха
    const safe = Math.max(1.05, crash * 0.8)
    const res = await api.cashout(r.id, msFor(safe))
    expect(res.accepted).toBe(true)
    if (res.accepted) {
      expect(await api.getBalance()).toBe(900 + res.winnings)
    }
  })

  it('нехватка баланса → исключение, баланс не меняется', async () => {
    const api = newApi('poor', 30)
    await expect(api.createRound('green', 'f1')).rejects.toThrow() // cost 50 > 30
    expect(await api.getBalance()).toBe(30)
  })

  it('topUp увеличивает баланс', async () => {
    const api = newApi('top', 0)
    expect(await api.topUp(500)).toBe(500)
  })
})

describe('MockGameApi — cashout и уровни', () => {
  it('cashout до 1-го уровня: 0 пройденных уровней, только cashout-бонус', async () => {
    // Ищем раунд, где крах достаточно высок, чтобы успеть забрать ниже уровня 1
    const level1 = cfg.themes.green.levelThresholds[0]! // 1.2
    const api = newApi('below-l1')
    let roundId = ''
    for (let i = 0; i < 50; i++) {
      const r = await api.createRound('green', 'f1')
      const crash = await discoverCrash(api, r.id)
      if (crash > level1 + 0.1) {
        roundId = r.id
        break
      }
      await api.finalizeRound(r.id) // не подошёл — закрываем
    }
    expect(roundId).not.toBe('')
    // забираем на 1.1 (ниже 1.2)
    const res = await api.cashout(roundId, msFor(1.1))
    expect(res.accepted).toBe(true)
    const fin = await api.finalizeRound(roundId)
    expect(fin.levelsCrossed).toBe(0)
    expect(fin.points).toBe(cfg.pointsCashoutBonus)
    expect(fin.win).toBe(true)
  })

  it('cashout ровно в момент краха отклоняется (too_late)', async () => {
    const api = newApi('exact')
    const r = await api.createRound('green', 'f1')
    const crash = await discoverCrash(api, r.id)
    const res = await api.cashout(r.id, msFor(crash)) // ровно время краха
    expect(res.accepted).toBe(false)
    if (!res.accepted) expect(res.reason).toBe('too_late')
  })

  it('проигрыш: нет cashout → win=false, ставка не возвращается', async () => {
    const api = newApi('lose', 1000)
    const r = await api.createRound('green', 'f1')
    await discoverCrash(api, r.id)
    const fin = await api.finalizeRound(r.id)
    expect(fin.win).toBe(false)
    expect(fin.winnings).toBe(0)
    expect(await api.getBalance()).toBe(950) // 1000 - 50, без возврата
  })
})

describe('MockGameApi — бустер', () => {
  it('бустер после уровня: коэффициент умножается, начисляются доп. очки', async () => {
    const api = newApi('boost', 1_000_000)
    let roundId = ''
    let threshold = 0
    let crash = 0
    // Ищем раунд с бустером на достижимом уровне
    for (let i = 0; i < 200; i++) {
      const r = await api.createRound('red', 'f3') // tier 3, mult 3
      const c = await discoverCrash(api, r.id)
      if (r.boosterLevel !== null) {
        const th = r.levels[r.boosterLevel]!
        if (c > th * 1.05) {
          roundId = r.id
          threshold = th
          crash = c
          break
        }
      }
      await api.finalizeRound(r.id)
    }
    expect(roundId).not.toBe('')

    // Забираем ПОСЛЕ порога бустера, но ДО краха
    const cashBase = Math.min(crash * 0.95, threshold * 1.02)
    const res = await api.cashout(roundId, msFor(cashBase))
    expect(res.accepted).toBe(true)
    if (res.accepted) {
      expect(res.boosterApplied).toBe(true)
      // отображаемый ≈ базовый × 3
      expect(res.exitMultiplier).toBeCloseTo(res.baseExitMultiplier * 3, 1)
    }
    const fin = await api.finalizeRound(roundId)
    expect(fin.boosterApplied).toBe(true)
    expect(fin.points).toBeGreaterThanOrEqual(cfg.pointsBoosterBonus + cfg.pointsCashoutBonus)
  })

  it('cashout до уровня бустера: бустер не применяется', async () => {
    const api = newApi('boost2', 1_000_000)
    let roundId = ''
    let threshold = 0
    for (let i = 0; i < 200; i++) {
      const r = await api.createRound('red', 'f3')
      const c = await discoverCrash(api, r.id)
      if (r.boosterLevel !== null && r.boosterLevel > 0) {
        const th = r.levels[r.boosterLevel]!
        const prev = r.levels[r.boosterLevel - 1]!
        if (c > prev && th > prev + 0.1) {
          roundId = r.id
          threshold = th
          break
        }
      }
      await api.finalizeRound(r.id)
    }
    expect(roundId).not.toBe('')
    // Забираем ниже порога бустера
    const res = await api.cashout(roundId, msFor(threshold * 0.9))
    expect(res.accepted).toBe(true)
    if (res.accepted) {
      expect(res.boosterApplied).toBe(false)
      expect(res.exitMultiplier).toBeCloseTo(res.baseExitMultiplier, 2)
    }
  })
})

describe('MockGameApi — конфиг управляет начислением (сценарий 5)', () => {
  it('изменение pointsPerLine в конфиге меняет очки без правки логики', async () => {
    const mkApi = (pointsPerLine: number) => {
      const cfg = { ...structuredClone(DEFAULT_CONFIG), startingBalance: 1000, pointsPerLine }
      return new MockGameApi({ fixedSeed: 'cfg-test', latency: 0, storage: memoryKV(), config: cfg })
    }
    // Одинаковый seed → одинаковый крах и число пройденных уровней; отличается лишь очко-множитель
    const runLoss = async (pointsPerLine: number) => {
      const api = mkApi(pointsPerLine)
      const r = await api.createRound('green', 'f1')
      await discoverCrash(api, r.id)
      return api.finalizeRound(r.id)
    }
    const a = await runLoss(10)
    const b = await runLoss(30)
    expect(a.levelsCrossed).toBe(b.levelsCrossed)
    expect(a.points).toBe(a.levelsCrossed * 10)
    expect(b.points).toBe(b.levelsCrossed * 30)
  })
})

describe('MockGameApi — финализация и история', () => {
  it('finalizeRound идемпотентна и пишет историю', async () => {
    const api = newApi('hist')
    const before = (await api.getHistory()).length
    const r = await api.createRound('green', 'f1')
    await discoverCrash(api, r.id)
    const f1 = await api.finalizeRound(r.id)
    const f2 = await api.finalizeRound(r.id)
    expect(f2).toEqual(f1)
    const after = await api.getHistory()
    expect(after.length).toBeGreaterThan(before)
    expect(after.some((h) => h.isSelf)).toBe(true)
  })
})
