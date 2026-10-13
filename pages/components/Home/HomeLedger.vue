<template>
  <section class="soi-ledger border-b soi-rule">
    <div class="container mx-auto px-4 py-10 sm:py-12">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
        <h2 class="soi-serif text-2xl sm:text-3xl font-semibold">{{ t('title') }}</h2>
        <p class="text-sm soi-muted">{{ t('live') }}</p>
      </div>

      <dl class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border-t soi-rule">
        <div
          v-for="item in items"
          :key="item.label"
          class="soi-ledger-cell py-5 pr-4 border-b soi-rule"
        >
          <dt class="text-xs font-bold uppercase tracking-[0.16em] soi-muted">{{ item.label }}</dt>
          <dd class="soi-serif mt-2 text-4xl sm:text-[2.6rem] leading-none font-semibold tabular-nums">
            <span :class="{ 'soi-skel': item.value === null || item.value === undefined }">{{ fmt(item.value) }}</span>
          </dd>
          <dd class="mt-2 text-sm soi-muted leading-snug">{{ item.note }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { fmt, useSoiStats } from './useSoiStats.js'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: { title: 'The catalogue in numbers', live: 'Counted live from TaxonWorks', sp: 'Valid species', spN: 'in the catalogue', ge: 'Genera', geN: 'valid genera', sy: 'Synonyms', syN: 'and other invalid species names', re: 'References', reN: 'papers and books cited', co: 'Specimens', coN: 'museum and field records', geo: 'Georeferenced', geoN: 'localities on the map' },
  it: { title: 'Il catalogo in cifre', live: 'Conteggi in tempo reale da TaxonWorks', sp: 'Specie valide', spN: 'nel catalogo', ge: 'Generi', geN: 'generi validi', sy: 'Sinonimi', syN: 'e altri nomi specifici non validi', re: 'Riferimenti', reN: 'articoli e libri citati', co: 'Esemplari', coN: 'record museali e di campo', geo: 'Georeferenziati', geoN: 'località sulla mappa' }
})

const s = useSoiStats()

const items = computed(() => [
  { label: t('sp'), value: s.family.species, note: t('spN') },
  { label: t('ge'), value: s.family.genera, note: t('geN') },
  { label: t('sy'), value: s.family.invalid, note: t('syN') },
  { label: t('re'), value: s.stats['Project sources'], note: t('reN') },
  { label: t('co'), value: s.stats['Collection objects'], note: t('coN') },
  { label: t('geo'), value: s.stats['Georeferences'], note: t('geoN') }
])
</script>

<style scoped>
.soi-ledger {
  background: var(--soi-paper);
}
@media (min-width: 1280px) {
  .soi-ledger-cell + .soi-ledger-cell {
    padding-left: 1.25rem;
    border-left: 1px solid var(--soi-rule);
  }
}
</style>
