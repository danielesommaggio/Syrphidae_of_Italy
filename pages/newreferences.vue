<template>
  <RecentPage
    kind="sources"
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
  en: { title: 'References recently added', lede: 'Papers and books most recently added to the SoI bibliography, newest first.', aside: 'Need the PDF of one of these references, or know of a paper we are missing? Let us know.' },
  it: { title: 'Riferimenti aggiunti di recente', lede: 'Articoli e libri aggiunti più di recente alla bibliografia di SoI, dal più recente.', aside: 'Ti serve il PDF di uno di questi lavori, o conosci un articolo che manca? Scrivici.' }
})
</script>
