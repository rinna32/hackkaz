<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AdminScreen from '~/components/screens/AdminScreen.vue'

const auth = useAuthStore()

// Админ-панель доступна только роли admin — иначе на главную.
watch(
  () => auth.isAdmin,
  (ok) => {
    if (!ok) navigateTo('/')
  },
  { immediate: true },
)
</script>

<template>
  <AdminScreen v-if="auth.isAdmin" />
</template>
