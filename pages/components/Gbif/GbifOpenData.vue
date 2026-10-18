<template>
  <div class="gb-card">
    <div class="flex items-start gap-4">
      <span class="gb-mark">
        <GbifLogoIcon />
      </span>
      <div class="min-w-0">
        <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
        <p class="soi-serif mt-1 text-xl sm:text-2xl font-semibold leading-snug">{{ t('title') }}</p>
        <p class="mt-2 text-sm leading-relaxed soi-muted">
          {{ t('text') + (gbif.endorsedBy ? ' ' + t('endorsed', { node: gbif.endorsedBy }) : '') }}
        </p>
      </div>
    </div>

    <dl class="gb-stats">
      <div>
        <dt>{{ t('records') }}</dt>
        <dd :class="{ 'soi-skel': gbif.records === null && !gbif.loaded }">{{ num(gbif.records) }}</dd>
      </div>
      <div>
        <dt>{{ t('species') }}</dt>
        <dd :class="{ 'soi-skel': gbif.species === null && !gbif.loaded }">{{ num(gbif.species) }}</dd>
      </div>
      <div>
        <dt>{{ t('updated') }}</dt>
        <dd class="gb-small">{{ gbif.updated ? fmtDate(gbif.updated, isIt) : '—' }}</dd>
      </div>
      <div>
        <dt>{{ t('licence') }}</dt>
        <dd class="gb-small">
          <a
            :href="gbif.licence.url"
            target="_blank"
            rel="noopener license"
            class="soi-link"
            >{{ gbif.licence.code }}</a
          >
        </dd>
      </div>
    </dl>

    <div class="mt-5 flex flex-wrap gap-2">
      <a
        :href="LINKS.dataset"
        target="_blank"
        rel="noopener"
        class="soi-btn soi-btn-ink"
        >{{ t('dataset') }} ↗</a
      >
      <a
        :href="LINKS.occurrences"
        target="_blank"
        rel="noopener"
        class="soi-btn soi-btn-line"
        >{{ t('explore') }} ↗</a
      >
      <a
        :href="LINKS.publisher"
        target="_blank"
        rel="noopener"
        class="soi-btn soi-btn-line"
        >{{ t('publisher') }} ↗</a
      >
    </div>
    <p class="mt-3 text-xs soi-muted">
      DOI
      <a
        :href="LINKS.doi"
        target="_blank"
        rel="noopener"
        class="soi-link"
        >{{ GBIF.doi }}</a
      >
      · {{ t('harvest') }}
    </p>
  </div>
</template>

<script setup>
import GbifLogoIcon from '../GbifCitation/components/GbifLogoIcon.vue'
import { GBIF, LINKS, fmtDate, useGbif } from './useGbif.js'
import { isIt, useT } from '@/utils/soiLang.js'

const gbif = useGbif()

const t = useT({
  en: {
    eyebrow: 'Open data on GBIF',
    title: 'Syrphidae of Italy is a GBIF data publisher',
    text: 'Every specimen and literature record in SoI is published as an occurrence dataset on the Global Biodiversity Information Facility, free to reuse.',
    endorsed: 'Endorsed by {node}.',
    records: 'Records on GBIF',
    species: 'Species',
    updated: 'Last updated',
    licence: 'Licence',
    dataset: 'The dataset on GBIF',
    explore: 'Explore & download',
    publisher: 'Publisher page',
    harvest: 'GBIF reads the dataset straight from our TaxonWorks database, so it stays up to date.'
  },
  it: {
    eyebrow: 'Dati aperti su GBIF',
    title: 'Syrphidae of Italy è un publisher di dati GBIF',
    text: 'Ogni esemplare e ogni dato di letteratura di SoI è pubblicato come dataset di occorrenze sul Global Biodiversity Information Facility, liberamente riutilizzabile.',
    endorsed: 'Riconosciuto da {node}.',
    records: 'Record su GBIF',
    species: 'Specie',
    updated: 'Ultimo aggiornamento',
    licence: 'Licenza',
    dataset: 'Il dataset su GBIF',
    explore: 'Esplora e scarica',
    publisher: 'Pagina del publisher',
    harvest: 'GBIF legge il dataset direttamente dal nostro database TaxonWorks, così resta sempre aggiornato.'
  }
})

const num = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString(isIt.value ? 'it-IT' : 'en-US'))
</script>

<style scoped>
.gb-card {
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-top: 5px solid #4c9b45;
  border-radius: 4px;
  padding: 1.5rem;
}
@media (min-width: 640px) {
  .gb-card {
    padding: 1.75rem;
  }
}
.gb-mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: #4c9b45;
  color: #fff;
  font-size: 1.6rem;
}
.gb-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--soi-rule);
}
@media (min-width: 640px) {
  .gb-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.gb-stats dt {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--soi-ink-soft);
}
.gb-stats dd {
  margin: 0.15rem 0 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}
.gb-stats dd.gb-small {
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  padding-top: 0.4rem;
}
</style>
