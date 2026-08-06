<template>
    <Embed v-if="isEmbed" />
    <router-view v-else />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import Embed from './pages/embed.vue'
import { useAuthStore } from '#/store/authStore'
import { completeDesktopSignIn, type AuthCompletePayload } from '#/utils/desktopAuth'

const isEmbed = computed(() => (window as any).embed === true)

onMounted(async () => {
  if (!isTauri()) return

  console.log('[App] Tauri detected, registering cv-auth-complete listener')
  const authStore = useAuthStore()
  await listen<AuthCompletePayload>('cv-auth-complete', async (event) => {
    console.log('[App] cv-auth-complete event received from Rust side')
    const accessToken = await completeDesktopSignIn(event.payload)
    if (accessToken) {
      console.log('[App] setting auth token in authStore, user should now be signed in')
      authStore.setToken(accessToken)
    } else {
      console.error('[App] completeDesktopSignIn returned no access token; sign-in failed')
    }
  })
  console.log('[App] cv-auth-complete listener registered')
})
</script>
