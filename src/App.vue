<template>
  <component :is="currentLayout">
    <router-view />
  </component>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { loadUserLayouts } from './utils'
import ApplicationLayout from '@/layout/Application.vue'

const DEFAULT_LAYOUT = 'default'
const route = useRoute()
const userLayouts = loadUserLayouts()

const currentLayout = computed(() => {
  const layouts = {
    [DEFAULT_LAYOUT]: ApplicationLayout,
    ...userLayouts
  }

  return layouts[route.meta?.layout || DEFAULT_LAYOUT] || ApplicationLayout
})

useHead({
  title: __APP_ENV__.project_name,
  meta: __APP_ENV__.metadata,
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap'
    }
  ]
})
</script>
