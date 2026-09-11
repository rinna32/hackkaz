import type { ThemePalette } from './palette'

/**
 * Пиксельные спрайты рисуются кодом прямоугольниками в целочисленных координатах.
 * Никаких внешних ассетов. Всё выравнивается по целым пикселям виртуального холста.
 */

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

/**
 * Воздушный шар с корзиной. Центр — (cx, cy) на уровне корзины.
 * scale — целочисленный пиксель-размер (2 = каждый «пиксель» 2×2 внутри спрайта).
 */
export function drawBalloon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pal: ThemePalette,
  sway = 0,
) {
  const s = 2 // размер условного пикселя внутри спрайта
  const ox = Math.round(cx + sway)
  const oy = Math.round(cy)

  // Оболочка шара (16x16 условных пикселей), рисуем по строкам маской
  // 0 = пусто, 1 = основной, 2 = тень, 3 = блик
  const dome = [
    '0001111111110000',
    '0011111111111000',
    '0111112111113100',
    '1111112111111310',
    '1111122111111131',
    '1111222111111113',
    '1112221111111113',
    '1122211111111113',
    '1122111111111113',
    '1122111111111131',
    '0112111111111310',
    '0111211111113100',
    '0011111111111000',
    '0001111111110000',
    '0000111111100000',
    '0000011111000000',
  ]
  const w = dome[0]!.length
  const startX = ox - (w * s) / 2
  const startY = oy - w * s - 8 * s
  for (let row = 0; row < dome.length; row++) {
    const line = dome[row]!
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]
      if (ch === '0') continue
      const color = ch === '2' ? pal.balloonDark : ch === '3' ? pal.balloonLight : pal.balloonMain
      px(ctx, startX + col * s, startY + row * s, s, s, color)
    }
  }

  // Стропы
  px(ctx, ox - 4 * s, startY + dome.length * s, s, 4 * s, pal.balloonDark)
  px(ctx, ox + 3 * s, startY + dome.length * s, s, 4 * s, pal.balloonDark)

  // Корзина (6x5)
  const bw = 6 * s
  const bh = 5 * s
  px(ctx, ox - bw / 2, oy - bh, bw, bh, pal.basket)
  px(ctx, ox - bw / 2, oy - bh, bw, s, '#a06a34') // светлый край
}

/** Иконка бустера — сундук/подарок с ×N. */
export function drawBooster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tier: number,
  active: boolean,
) {
  const s = 2
  const box = active ? '#ffd23f' : '#c9a24b'
  const dark = active ? '#b8860b' : '#7a5a1a'
  px(ctx, x - 6 * s, y - 6 * s, 12 * s, 10 * s, box)
  px(ctx, x - 6 * s, y - 6 * s, 12 * s, 2 * s, dark)
  // лента
  px(ctx, x - s, y - 6 * s, 2 * s, 10 * s, dark)
  // подпись ×N
  ctx.fillStyle = '#2a1a05'
  ctx.font = '700 9px "Pixelify Sans", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`×${tier}`, x, y + s)
}

/** Простое пиксельное облако. */
export function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, c: string, scale = 2) {
  const s = scale
  const rows = ['00111100', '01111110', '11111111', '01111100']
  for (let r = 0; r < rows.length; r++) {
    for (let col = 0; col < rows[r]!.length; col++) {
      if (rows[r]![col] === '1') px(ctx, x + col * s, y + r * s, s, s, c)
    }
  }
}
