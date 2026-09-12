<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import AccountScreen from '~/components/screens/AccountScreen.vue'

const auth = useAuthStore()

// Личный кабинет доступен только вошедшим — иначе на главную.
watch(
  () => auth.loggedIn,
  (ok) => {
    if (!ok) navigateTo('/')
  },
  { immediate: true },
)
</script>

<template>
  <AccountScreen v-if="auth.loggedIn" />
</template>
