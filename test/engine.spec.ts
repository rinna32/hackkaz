import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG } from '~/shared/config/game.config'
import { createPrng } from '~/shared/lib/game/prng'
import {
  boosterTriggered,
  computeRoundPoints,
  computeWinnings,
  displayedMultiplier,
  generateCrashPoint,
  levelsCrossed,
  multiplierAt,
  pickBoosterLevel,
  round2,
  timeForMultiplier,
} from '~/shared/lib/game/engine'

const cfg = DEFAULT_CONFIG

describe('PRNG', () => {
  it('детерминирован по seed', () => {
    const a = createPrng('seed-1')
    const b = createPrng('seed-1')
    const seqA = Array.from({ length: 8 }, () => a.next())
    const seqB = Array.from({ length: 8 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('разные seed → разные последовательности', () => {
    const a = createPrng('seed-1')
    const b = createPrng('seed-2')
    expect(a.next()).not.toEqual(b.next())
  })

  it('nextOpen в диапазоне (0, 1]', () => {
    const p = createPrng('x')
    for (let i = 0; i < 1000; i++) {
      const u = p.nextOpen()
      expect(u).toBeGreaterThan(0)
      expect(u).toBeLessThanOrEqual(1)
    }
  })
})

describe('generateCrashPoint', () => {
  it('никогда не ниже minCrash и не выше maxMultiplier', () => {
    const p = createPrng('crash')
    for (let i = 0; i < 5000; i++) {
      const c = generateCrashPoint(p.nextOpen(), cfg)
      expect(c).toBeGreaterThanOrEqual(cfg.minCrashMultiplier)
      expect(c).toBeLessThanOrEqual(cfg.maxMultiplier)
    }
  })

  it('U=1 даёт минимальный крах', () => {
    expect(generateCrashPoint(1, cfg)).toBeCloseTo(cfg.minCrashMultiplier, 2)
  })

  it('малое U даёт крупный (обрезанный) крах', () => {
    expect(generateCrashPoint(1e-9, cfg)).toBe(cfg.maxMultiplier)
  })

  it('распределение: медиана краха разумна (P(crash>x) ~ x^-alpha)', () => {
    const p = createPrng('dist')
    const N = 20000
    let above2 = 0
    for (let i = 0; i < N; i++) {
      if (generateCrashPoint(p.nextOpen(), cfg) > 2) above2++
    }
    // Теоретически P(crash>2) = (1/2)^alpha ≈ 0.45 при alpha=1.15
    const expected = Math.pow(1 / 2, cfg.alpha)
    expect(above2 / N).toBeGreaterThan(expected - 0.05)
    expect(above2 / N).toBeLessThan(expected + 0.05)
  })
})

describe('multiplierAt / timeForMultiplier', () => {
  it('в t=0 равен start', () => {
    expect(multiplierAt(0, cfg)).toBe(cfg.startMultiplier)
  })

  it('монотонно растёт', () => {
    expect(multiplierAt(2, cfg)).toBeGreaterThan(multiplierAt(1, cfg))
  })

  it('timeForMultiplier — обратная к multiplierAt', () => {
    for (const m of [1.5, 2, 5, 10]) {
      const t = timeForMultiplier(m, cfg)
      expect(multiplierAt(t, cfg)).toBeCloseTo(m, 4)
    }
  })
})

describe('levelsCrossed', () => {
  const th = cfg.themes.green.levelThresholds // [1.2, 1.5, 1.8, ...]
  it('до первого уровня — 0', () => {
    expect(levelsCrossed(1.1, th)).toBe(0)
  })
  it('ровно на пороге — засчитан', () => {
    expect(levelsCrossed(1.2, th)).toBe(1)
    expect(levelsCrossed(1.8, th)).toBe(3)
  })
  it('выше всех — все', () => {
    expect(levelsCrossed(999, th)).toBe(th.length)
  })
})

describe('pickBoosterLevel', () => {
  it('null при нулевых весах', () => {
    expect(pickBoosterLevel(0.5, [0, 0, 0])).toBeNull()
  })
  it('всегда валидный индекс при положительных весах', () => {
    const w = cfg.themes.red.lootProbabilities
    for (let i = 0; i < 100; i++) {
      const idx = pickBoosterLevel(i / 100, w)
      expect(idx).not.toBeNull()
      expect(idx!).toBeGreaterThanOrEqual(0)
      expect(idx!).toBeLessThan(w.length)
    }
  })
  it('u=0 → первый ненулевой уровень', () => {
    expect(pickBoosterLevel(0, [0.5, 0.5])).toBe(0)
  })
})

describe('displayedMultiplier / boosterTriggered', () => {
  const th = [1.2, 1.5, 2.0] // уровни
  it('без бустера равен базовому', () => {
    expect(displayedMultiplier(1.8, { boosterLevel: null, boosterMultiplier: 1, thresholds: th })).toBe(1.8)
  })
  it('до уровня бустера бустер не влияет', () => {
    // бустер на уровне 2 (порог 2.0), база 1.8 < 2.0
    expect(displayedMultiplier(1.8, { boosterLevel: 2, boosterMultiplier: 3, thresholds: th })).toBe(1.8)
    expect(boosterTriggered(1.8, 2, th)).toBe(false)
  })
  it('на уровне бустера — умножение (скачок)', () => {
    // база 2.0 достигла порога уровня 2 → 2.0 * 3 = 6.0
    expect(displayedMultiplier(2.0, { boosterLevel: 2, boosterMultiplier: 3, thresholds: th })).toBe(6.0)
    expect(boosterTriggered(2.0, 2, th)).toBe(true)
  })
})

describe('computeWinnings / computeRoundPoints', () => {
  it('выигрыш = ставка × коэффициент', () => {
    expect(computeWinnings(100, 2.5)).toBe(250)
  })
  it('очки: уровни + cashout-бонус + бустер', () => {
    const pts = computeRoundPoints({ levelsCrossed: 3, didCashout: true, boosterApplied: true }, cfg)
    expect(pts).toBe(3 * cfg.pointsPerLine + cfg.pointsCashoutBonus + cfg.pointsBoosterBonus)
  })
  it('проигрыш: только очки за уровни, без cashout-бонуса', () => {
    const pts = computeRoundPoints({ levelsCrossed: 2, didCashout: false, boosterApplied: false }, cfg)
    expect(pts).toBe(2 * cfg.pointsPerLine)
  })
})

describe('round2', () => {
  it('округляет до 2 знаков', () => {
    expect(round2(2.005)).toBe(2.01)
    expect(round2(1.2349)).toBe(1.23)
  })
})
