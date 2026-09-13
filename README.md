# Воздушный Шар — игровой портал (кейс «Столото»)

<<<<<<< HEAD
Фронтенд-прототип в стиле [stoloto.ru](https://www.stoloto.ru/): каталог игр, вход/регистрация и две мини-игры.

- **Воздушный Шар** — crash-игра: успей «Забрать», пока шар не лопнул (уровни, бустеры, очки, история).
- **Ловец пазлов** — аркада на реакцию (canvas): лови фрагменты и золото, избегай бомб; счёт уходит в лидерборд.

Стек: **Nuxt 4 · Vue 3 · TypeScript · Pinia · Tailwind v4**, SPA (`ssr: false`).

=======
- **Воздушный Шар** — crash-игра: коэффициент растёт, нужно успеть «Забрать» до того, как шар лопнет. Уровни (12 красный / 9 зелёный), бустеры, очки, история.
- **Ловец пазлов** — аркада на реакцию (canvas): лови фрагменты и золото, избегай бомб; счёт уходит в лидерборд.

Стек: **Nuxt 4 · Vue 3 · TypeScript · Pinia · Tailwind v4**, SPA (`ssr: false`). Игровая графика обеих игр рисуется на **HTML5 Canvas (2D-контекст)** — сцена шара с уровнями/бустерами и аркада «Ловец пазлов».

>>>>>>> 03dde77 (final)
## Запуск

```bash
npm install
<<<<<<< HEAD
npm run dev        # http://localhost:3000
```

«Воздушный Шар» играбелен без бэкенда (раунды считает мок-движок в браузере).
Для входа, турниров, лидербордов и «Ловца пазлов» нужен бэкенд User API.

### Переменные окружения

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `NUXT_PUBLIC_USER_API_BASE` | `http://localhost:8000` | Бэкенд: аккаунты, турниры, награды, лидерборд, сессии мини-игры. |
| `NUXT_PUBLIC_DEV_FIXED_SEED` | `""` | Фиксированный seed мок-движка «Шара» (воспроизводимые раунды). |

### Скрипты

`dev` · `build` · `generate` (статика) · `preview` · `test` (Vitest) · `test:e2e` (Playwright).

## Архитектура (Feature-Sliced Design)

Слои идут сверху вниз: `pages → widgets → features → entities → shared`. Верхний слой
использует нижние, обратных зависимостей нет. Кросс-слойные импорты — явные
(`import ... from '~/features/...'`); Nuxt авто-импортит только `components/` и `composables/`.

```
app/
  app.vue                 # тонкий корень: <NuxtLayout><NuxtPage/> + инициализация сторов
  layouts/default.vue     # общий каркас: шапка + контент страницы + тост
  pages/                  # роуты, тонкие обёртки над features (+ гарды доступа)
  widgets/                # крупные самостоятельные блоки UI
  features/               # экраны и сценарии (по одному на игру/действие)
  entities/               # доменные сущности и их отрисовка
  shared/                 # переиспользуемое ядро без привязки к экранам
  stores/                 # Pinia-сторы (состояние + доступ к данным)
  composables/            # useGameApi() — доступ к слою данных «Шара»
  plugins/                # gameApi.client.ts — внедряет MockGameApi как $gameApi
  assets/styles/main.css  # токены темы, классы .btn/.card, светлая/тёмная тема
public/img/               # картинки: логотип, баннеры игр, шары, пазлы, иконки
```

Подробнее по папкам:

- **pages/** — по файлу на URL: `index` (каталог), `balloon`, `puzzle`, `tournament`,
  `leaderboard`, `account`, `admin`. Логику не держат — импортируют нужную feature и
  проверяют доступ (редирект неавторизованных).
- **widgets/** — `AppHeader.vue` (шапка «Столото»: лого, меню, баланс, вход, переключатель темы),
  `HistoryFeed.vue` (лента «Прошлые игры»).
- **features/** — `HomeBoard` (каталог игр), `AuthModal`, `TopUpModal`, `RulesModal`,
  `ResultView` (итог раунда), `PuzzleCatcher.client` (canvas-аркада),
  `place-bet/` (экран ставки: `BetBoard` + `PuzzleFragment`),
  `play-round/` (игровой экран: `RoundView` + `GameCanvas.client`).
- **entities/balloon/** — чистая графика сцены «Шара»: `renderer` (сборка кадра),
  `sprites` (шар/облака/маркеры), `palette` (цвета тем).
- **shared/** — `ui/AppButton.vue`; `types/game.ts` (DTO); `config/game.config.ts`
  (все числовые параметры «Шара»); `api/GameApi.ts` (интерфейс данных) + `api/mock/`
  (реализация в браузере, боты); `lib/game/` (движок: `engine` + `prng`, чистые функции).
- **stores/** — `game` (раунд «Шара» поверх мок-`GameApi`), `auth` (сессия + бэкенд:
  аккаунты/турниры/лидерборд/награды/админка), `minigame` (сессии и лидерборд «Ловца пазлов»).

## Слой данных

- **Мок «Шара»** — `MockGameApi` (реализует `GameApi`), внедряется плагином как `$gameApi`,
  доступен через `useGameApi()`. Баланс/история в `localStorage`. Замена на реальный бэкенд —
  подмена реализации в `plugins/gameApi.client.ts`.
- **Бэкенд** — сторы `auth` и `minigame` ходят на `NUXT_PUBLIC_USER_API_BASE` с `Bearer`-токеном.
  Ключевые эндпоинты: `POST /api/user/login|register`, `GET /api/tournament`,
  `POST /api/minigame/start|finish`, `GET /api/minigame/leaderboard`, `…/api/admin/*`.

## Прочее

- Доступ: запуск игр и `/account` — только после входа, `/admin` — только `role=admin`.
- Тема: светлый стиль «Столото» (золото `#ffcd17`, шрифт Inter) + переключатель светлая/тёмная.
- Тесты: Vitest — математика движка и `MockGameApi`; Playwright — игровой цикл «Шара».
=======
npm run dev
```

## Архитектура (Feature-Sliced Design)

Слои идут сверху вниз: `pages → widgets → features → entities → shared`. Верхний слой использует нижние, обратных зависимостей нет; кросс-слойные импорты — явные (Nuxt авто-импортит только `components/` и `composables/`).

```
app/
  app.vue                 # <NuxtLayout><NuxtPage/> + инициализация сторов
  layouts/default.vue     # шапка + контент страницы + тост
  pages/                  # роуты-обёртки над features (+ гарды доступа)
  widgets/                # AppHeader (шапка), HistoryFeed
  features/               # экраны/сценарии: HomeBoard, place-bet/, play-round/,
                          # ResultView, PuzzleCatcher.client, Tournament/Leaderboard/
                          # Account/Admin, Auth/TopUp/Rules-модалки
  entities/balloon/       # графика сцены шара (renderer/sprites/palette)
  shared/
    ui/AppButton.vue      # базовая кнопка
    types/game.ts         # DTO
    config/game.config.ts # все числовые параметры «Шара»
    api/                  # GameApi (интерфейс) + mock/ (движок в браузере)
    lib/game/             # чистая математика: engine, prng, hash
  stores/                 # Pinia: game (Шар), auth (сессия+бэкенд+админка), minigame
  composables/useGameApi.ts
  plugins/gameApi.client.ts   # внедряет MockGameApi как $gameApi
public/img/               # логотип, баннеры игр, шары, пазлы, иконки
```

## Слой данных

- **Движок «Шара» — на клиенте** (как принято в crash-играх: раунд считается на фронте). Реализован за интерфейсом `GameApi` (`MockGameApi`), внедряется плагином как `$gameApi` и доступен через `useGameApi()`: генерирует точку краха/бустеры, считает очки и награды-пазлы, хранит баланс и историю в `localStorage`. Интерфейс `GameApi` позволяет при необходимости прозрачно подменить реализацию (например, серверную) в `plugins/gameApi.client.ts`.
- **Бэкенд** — сторы `auth` и `minigame` ходят на `NUXT_PUBLIC_USER_API_BASE` (единый `request()` с `Bearer`-токеном). Обе игры открывают мини-игровую сессию и шлют счёт:
  `POST /api/minigame/start` → `{ session_id, secret, duration }`,
  `POST /api/minigame/finish` c `{ session_id, score, hash }`, где `hash = SHA256(session_id + score + secret)` (provably-fair).
- Прочее: `POST /api/user/login|register`, `GET /api/tournament`, `GET /api/tournament/top`, `GET /api/minigame/leaderboard`, `GET /api/rewards?username=`, `…/api/admin/*` (пользователи, роли, турниры, награды, история игр, `game_config`).

## Ключевые моменты

- **Крах авторитетен к «серверу»**: UI не знает точку взрыва заранее, крах/выплату подтверждает реализация `GameApi`. «Забрать» фиксирует выигрыш, но шар долетает до взрыва — результат открывается после краха.
- **Награда-пазл**: за игру выдаётся один фрагмент (4 всего); при сборке 4 — бонус и алерт. Прогресс виден в личном кабинете.
- **Доступ**: игры и `/account` — только после входа, `/admin` — только для роли `admin`.
- **Тема**: светлый стиль «Столото» (золото `#ffcd17`, шрифт Inter) + переключатель светлая/тёмная.
- **Тесты**: Vitest — математика движка и `MockGameApi`; Playwright — игровой цикл «Шара».
>>>>>>> 03dde77 (final)
