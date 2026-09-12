import type { ThemePalette } from './palette'
import { drawBalloon, drawBooster, drawCloud } from './sprites'

/** Виртуальное разрешение сцены (портрет). Масштабируется целочисленно. */
export const VW = 340
export const VH = 340

const BASE_SCREEN_Y = Math.round(VH * 0.68) // экранная позиция шара (камера следует за ним)
const LOG_SCALE = 90 // пикселей на единицу ln(коэффициента)

/** Мировая координата (px вверх от m=1) для коэффициента. */
function yForMultiplier(m: number): number {
  return LOG_SCALE * Math.log(Math.max(1, m))
}

export interface Cloud {
  worldY: number
  x: number
  scale: number
}

export interface SceneState {
  pal: ThemePalette
  baseMultiplier: number
  levels: number[]
  boosterLevel: number | null
  boosterTier: number
  boosterActive: boolean
  swayT: number
  clouds: Cloud[]
  crashed: boolean
}

/** Генерация набора облаков для фона. */
export function makeClouds(rand: () => number): Cloud[] {
  const clouds: Cloud[] = []
  for (let i = 0; i < 6; i++) {
    clouds.push({
      worldY: yForMultiplier(1) + i * 70 + rand() * 40,
      x: 10 + rand() * (VW - 40),
      scale: rand() < 0.5 ? 2 : 3,
    })
  }
  return clouds
}

function skyGradient(ctx: CanvasRenderingContext2D, pal: ThemePalette) {
  const g = ctx.createLinearGradient(0, 0, 0, VH)
  g.addColorStop(0, pal.skyTop)
  g.addColorStop(0.55, pal.skyMid)
  g.addColorStop(1, pal.skyBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, VW, VH)
  // лёгкий дизеринг — ряды точек на стыке
  ctx.fillStyle = pal.skyMid
  for (let x = 0; x < VW; x += 4) {
    ctx.fillRect(x, Math.round(VH * 0.55), 2, 2)
  }
}

export function drawScene(ctx: CanvasRenderingContext2D, st: SceneState) {
  ctx.imageSmoothingEnabled = false
  skyGradient(ctx, st.pal)

  const curY = yForMultiplier(st.baseMultiplier)

  // Облака (параллакс — уходят вниз по мере набора высоты)
  for (const c of st.clouds) {
    const screenY = BASE_SCREEN_Y - (c.worldY - curY) * 0.6
    if (screenY > -20 && screenY < VH + 20) {
      drawCloud(ctx, c.x, screenY, st.pal.cloud, c.scale)
    }
  }

  // Уровни (горизонтальные линии + маркеры слева)
  ctx.font = '700 8px ui-sans-serif, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < st.levels.length; i++) {
    const t = st.levels[i]!
    const screenY = Math.round(BASE_SCREEN_Y - (yForMultiplier(t) - curY))
    if (screenY < -10 || screenY > VH + 10) continue
    const passed = st.baseMultiplier >= t
    const isBooster = st.boosterLevel === i
    const col = isBooster ? st.pal.lineHot : passed ? st.pal.line : 'rgba(255,255,255,0.45)'
    // пунктир
    for (let x = 24; x < VW - 4; x += 8) {
      ctx.fillStyle = col
      ctx.fillRect(x, screenY, 4, 1)
    }
    // маркер уровня
    ctx.fillStyle = passed ? st.pal.lineHot : 'rgba(0,0,0,0.35)'
    ctx.fillRect(2, screenY - 5, 20, 10)
    ctx.fillStyle = passed ? '#2a1a05' : '#ffffff'
    ctx.fillText(`${t.toFixed(1)}`, 4, screenY + 1)

    // маркер бустера
    if (isBooster) {
      drawBooster(ctx, VW - 20, screenY - 12, st.boosterTier, st.boosterActive)
    }
  }

  // Шар (камера держит его на BASE_SCREEN_Y)
  if (!st.crashed) {
    const sway = Math.sin(st.swayT * 2) * 3
    drawBalloon(ctx, VW / 2, BASE_SCREEN_Y, st.pal, sway)
  }
}

/** Система частиц взрыва шара. */
export class Explosion {
  private parts: {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    max: number
    c: string
    s: number
  }[] = []

  spawn(x: number, y: number, pal: ThemePalette, rand: () => number) {
    const colors = [pal.balloonMain, pal.balloonDark, pal.balloonLight, '#ffffff']
    for (let i = 0; i < 40; i++) {
      const ang = rand() * Math.PI * 2
      const sp = 20 + rand() * 90
      this.parts.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 20,
        life: 0,
        max: 0.5 + rand() * 0.6,
        c: colors[Math.floor(rand() * colors.length)]!,
        s: rand() < 0.5 ? 2 : 3,
      })
    }
  }

  get active() {
    return this.parts.length > 0
  }

  update(dt: number) {
    for (const p of this.parts) {
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 120 * dt // гравитация
    }
    this.parts = this.parts.filter((p) => p.life < p.max)
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.parts) {
      const alpha = 1 - p.life / p.max
      ctx.globalAlpha = Math.max(0, alpha)
      ctx.fillStyle = p.c
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s)
    }
    ctx.globalAlpha = 1
  }
}

export const BALLOON_SCREEN = { x: VW / 2, y: BASE_SCREEN_Y }
