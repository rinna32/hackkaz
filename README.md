# Воздушный Шар — игровой портал (кейс «Столото»)

Фронтенд-прототип в стиле [stoloto.ru](https://www.stoloto.ru/): каталог игр, вход/регистрация и две мини-игры.

- **Воздушный Шар** — crash-игра: успей «Забрать», пока шар не лопнул (уровни, бустеры, очки, история).
- **Ловец пазлов** — аркада на реакцию (canvas): лови фрагменты и золото, избегай бомб; счёт уходит в лидерборд.

Стек: **Nuxt 4 · Vue 3 · TypeScript · Pinia · Tailwind v4**, SPA (`ssr: false`).

## Запуск

```bash
npm install
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
