<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import BetScreen from '~/components/screens/BetScreen.vue'
import GameScreen from '~/components/screens/GameScreen.vue'
import ResultScreen from '~/components/screens/ResultScreen.vue'

const store = useGameStore()
</script>

<template>
  <BetScreen v-if="store.screen === 'bet'" />
  <GameScreen v-else-if="store.screen === 'game'" />
  <ResultScreen v-else-if="store.screen === 'result'" />
</template>
