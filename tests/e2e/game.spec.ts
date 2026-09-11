import { test, expect, type Page } from '@playwright/test'

// Детерминированные seed подобраны под движок (см. scratchpad/find-seeds):
//  win2   — green, крах ×3.02
//  lose1  — green, крах ×1.13 (ниже 1-го уровня → гарантированный проигрыш)
//  boost8 — red f3, бустер на уровне 0 (порог 1.3), крах ×2.39

async function waitReady(page: Page) {
  await expect(page.getByTestId('start-btn')).toBeVisible()
}

function multValue(page: Page) {
  return page.getByTestId('multiplier').innerText().then((t) => parseFloat(t.replace('×', '')))
}

test.describe('Воздушный Шар — игровой цикл', () => {
  test('Сценарий 1–2: ставка ×2, cashout ~2.5, выигрыш, результат, история, играть снова', async ({
    page,
  }) => {
    await page.goto('/?seed=win2')
    await waitReady(page)

    // Тема зелёная → 9 уровней
    await page.getByTestId('theme-green').click()
    await expect(page.getByTestId('level-count')).toContainText('9')

    // Ставка ×2 (f2, 100 бонусов)
    await page.getByTestId('bet-f2').click()
    await expect(page.getByTestId('balance')).toHaveText(/01000/)

    await page.getByTestId('start-btn').click()

    // На игровом экране, ставка списана → 900
    await expect(page.getByTestId('multiplier')).toBeVisible()
    await expect(page.getByTestId('balance')).toHaveText(/00900/)

    // Ждём ~2.5 и забираем
    await expect.poll(() => multValue(page), { timeout: 15000 }).toBeGreaterThanOrEqual(2.4)
    await page.getByTestId('cashout-btn').click()

    // «Могли бы забрать больше» + баланс вырос (после зачисления выигрыша)
    await expect(page.getByTestId('could-more')).toBeVisible()
    await expect
      .poll(async () => {
        const t = await page.getByTestId('balance').innerText()
        return parseInt(t.replace(/\D/g, ''), 10)
      })
      .toBeGreaterThan(900)

    // Шар летит до краха → экран результата
    await expect(page.getByTestId('result-card')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('result-card')).toHaveAttribute('data-outcome', 'win')
    await expect(page.getByTestId('crash-mult')).toContainText('3.02')
    await expect(page.getByTestId('win-amount')).toBeVisible()
    await expect(page.getByTestId('round-points')).toBeVisible()
    await expect(page.getByTestId('reward')).toBeVisible()

    // Играть снова → экран ставки, тема сохранена (9 уровней)
    await page.getByTestId('again-btn').click()
    await expect(page.getByTestId('start-btn')).toBeVisible()
    await expect(page.getByTestId('level-count')).toContainText('9')
  })

  test('Сценарий 3: проигрыш — шар лопается, ставка сгорает', async ({ page }) => {
    await page.goto('/?seed=lose1')
    await waitReady(page)
    await page.getByTestId('theme-green').click()
    await page.getByTestId('bet-f1').click() // 50 бонусов
    await page.getByTestId('start-btn').click()

    await expect(page.getByTestId('balance')).toHaveText(/00950/)

    // Крах ниже 1-го уровня → результат-проигрыш
    await expect(page.getByTestId('result-card')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('result-card')).toHaveAttribute('data-outcome', 'lose')
    await expect(page.getByTestId('lose-amount')).toBeVisible()
    await expect(page.getByTestId('crash-mult')).toContainText('1.13')
    // Баланс не вернулся
    await expect(page.getByTestId('balance')).toHaveText(/00950/)
  })

  test('Сценарий 4: бустер ×3 срабатывает, коэффициент скачком растёт, доп. очки', async ({
    page,
  }) => {
    await page.goto('/?seed=boost8')
    await waitReady(page)
    // Красная тема по умолчанию → 12 уровней
    await expect(page.getByTestId('level-count')).toContainText('12')
    await page.getByTestId('bet-f3').click() // ×3, 150 бонусов
    await page.getByTestId('start-btn').click()

    await expect(page.getByTestId('balance')).toHaveText(/00850/)

    // Бустер активируется при прохождении уровня
    await expect(page.getByTestId('booster-active')).toBeVisible({ timeout: 15000 })
    // Забираем сразу после активации бустера (до краха ×2.39)
    await page.getByTestId('cashout-btn').click()

    await expect(page.getByTestId('result-card')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('result-card')).toHaveAttribute('data-outcome', 'win')
    // Бустер применён → доп. очки (>= бонус за бустер)
    await expect(page.getByTestId('reward')).toBeVisible()
    const pts = await page.getByTestId('round-points').innerText()
    expect(parseInt(pts.replace(/\D/g, ''), 10)).toBeGreaterThanOrEqual(100)
  })

  test('Сценарий 6: нехватка баланса блокирует фрагмент, «Пополнить» помогает', async ({
    page,
  }) => {
    await page.goto('/?seed=win2&balance=30')
    await waitReady(page)
    await page.getByTestId('theme-green').click()

    // 30 бонусов < 50 → f1 недоступен, «Начать» заблокирована
    await expect(page.getByTestId('bet-f1')).toHaveClass(/disabled/)
    await page.getByTestId('bet-f1').click()
    await expect(page.getByTestId('toast')).toContainText('Не хватает')
    await expect(page.getByTestId('start-btn')).toBeDisabled()

    // Пополнить (+500) → 530, теперь f1 доступен
    await page.getByTestId('topup').click()
    await expect(page.getByTestId('balance')).toHaveText(/00530/)
    await page.getByTestId('bet-f1').click()
    await expect(page.getByTestId('bet-f1')).toHaveClass(/selected/)
    await expect(page.getByTestId('start-btn')).toBeEnabled()
  })
})
