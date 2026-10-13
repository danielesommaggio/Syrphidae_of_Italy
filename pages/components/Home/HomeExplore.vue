<template>
  <section class="soi-explore">
    <div class="container mx-auto px-4 py-14 sm:py-20">
      <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
      <h2 class="soi-serif mt-3 text-3xl sm:text-[2.6rem] leading-tight font-semibold">{{ t('title') }}</h2>

      <ol class="mt-10 border-t soi-rule">
        <li
          v-for="(e, i) in entries"
          :key="e.title"
          class="border-b soi-rule"
        >
          <RouterLink
            :to="e.to"
            class="soi-toc group !text-[color:var(--soi-ink)] grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[5rem_16rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 sm:py-6"
          >
            <span class="soi-serif italic text-xl sm:text-2xl soi-muted">{{ roman[i] }}.</span>
            <span class="soi-serif text-xl sm:text-2xl font-semibold group-hover:underline underline-offset-4">
              {{ e.title }}
            </span>
            <span class="col-start-2 sm:col-start-auto soi-muted leading-relaxed">{{ e.text }}</span>
            <span
              class="row-start-1 col-start-3 sm:row-start-auto sm:col-start-auto text-xl transition-transform group-hover:translate-x-1"
              aria-hidden="true"
              >→</span
            >
          </RouterLink>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { SYRPHIDAE } from './useSoiStats.js'
import { useT } from '@/utils/soiLang.js'

const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

const t = useT({
  en: {
    eyebrow: 'Contents',
    title: 'Find your way in',
    g: 'Genera table', gt: 'Every genus with species counts, realms and keys in English and Italian.',
    a: 'Atlas', at: 'Records mapped by Italian region, the flight season and Red List species.',
    k: 'Identification keys', kt: 'Step-by-step dichotomous keys to genera and species.',
    tr: 'Taxonomic tree', trt: 'Start at the family page and browse down through subfamilies, tribes and genera.',
    b: 'Bibliography', bt: 'The literature behind every name and record, searchable by author, year and title.',
    d: 'Occurrence data', dt: 'Filter and download specimen and observation records in Darwin Core.',
    l: 'Latest additions', lt: 'Names and references added to the catalogue most recently.',
    h: 'Help wanted', ht: 'Species still missing photos, Italian records or ecological data.'
  },
  it: {
    eyebrow: 'Indice',
    title: 'Da dove cominciare',
    g: 'Tabella dei generi', gt: 'Tutti i generi con numero di specie, regioni biogeografiche e chiavi in inglese e italiano.',
    a: 'Atlante', at: 'Record per regione italiana, periodo di volo e specie della Lista Rossa.',
    k: 'Chiavi di identificazione', kt: 'Chiavi dicotomiche, passo dopo passo, per generi e specie.',
    tr: 'Albero tassonomico', trt: 'Parti dalla pagina della famiglia e scendi tra sottofamiglie, tribù e generi.',
    b: 'Bibliografia', bt: 'La letteratura dietro ogni nome e record, ricercabile per autore, anno e titolo.',
    d: 'Dati di presenza', dt: 'Filtra e scarica i record di esemplari e osservazioni in Darwin Core.',
    l: 'Ultime aggiunte', lt: 'I nomi e i riferimenti aggiunti più di recente.',
    h: 'Cerchiamo aiuto', ht: 'Specie ancora senza foto, record italiani o dati ecologici.'
  }
})

const entries = computed(() => [
  { title: t('g'), text: t('gt'), to: '/taxa' },
  { title: t('a'), text: t('at'), to: '/atlas' },
  { title: t('k'), text: t('kt'), to: '/keys' },
  { title: t('tr'), text: t('trt'), to: { name: 'otus-id-overview', params: { id: SYRPHIDAE.otuId } } },
  { title: t('b'), text: t('bt'), to: { name: 'resources-tw-filter-bibliography' } },
  { title: t('d'), text: t('dt'), to: { name: 'resources-tw-filter-dwc-otus' } },
  { title: t('l'), text: t('lt'), to: '/newtaxa' },
  { title: t('h'), text: t('ht'), to: '/help-wanted' }
])
</script>

<style scoped>
.soi-explore {
  background: var(--soi-paper);
}
.soi-toc:hover {
  background: linear-gradient(90deg, color-mix(in srgb, var(--soi-yellow) 14%, transparent), transparent 70%);
}
</style>
