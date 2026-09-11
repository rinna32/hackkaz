// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Игра работает целиком на клиенте: Canvas, таймеры, localStorage, WebAudio (позже).
  ssr: false,

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      // Фиксированный seed для воспроизводимых демо/проверок. Пусто = случайный seed.
      devFixedSeed: process.env.NUXT_PUBLIC_DEV_FIXED_SEED || '',
    },
  },

  app: {
    head: {
      title: 'Воздушный Шар',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
        },
      ],
    },
  },

  css: ['~/assets/styles/main.css'],
})
