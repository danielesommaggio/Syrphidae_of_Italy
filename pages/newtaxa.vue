<template>
  <RecentPage
    kind="taxa"
    :title="t('title')"
  >
    <template #lede>
      {{ t('lede') }}
    </template>
    <template #aside>
      {{ t('aside') }}
    </template>
  </RecentPage>
</template>

<script setup>
import RecentPage from './components/Recent/RecentPage.vue'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: { title: 'Names recently added', lede: 'Valid genera, species and subspecies entered most recently in the SoI catalogue, newest first.', aside: 'Have images, records or corrections for one of these taxa? We’d be glad to hear from you.' },
  it: { title: 'Nomi aggiunti di recente', lede: 'Generi, specie e sottospecie valide inserite più di recente nel catalogo SoI, dalla più recente.', aside: 'Hai immagini, record o correzioni per uno di questi taxa? Saremo felici di sentirti.' }
})
</script>
