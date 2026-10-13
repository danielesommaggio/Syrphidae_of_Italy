<template>
  <section class="soi-partners">
    <div class="container mx-auto px-4 py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
      <p class="soi-eyebrow shrink-0 !text-[color:var(--soi-ink-soft)]">{{ t('by') }}</p>
      <ul class="flex flex-wrap items-center gap-x-10 gap-y-6">
        <li
          v-for="p in partners"
          :key="p.name"
        >
          <a
            :href="p.url"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity !text-[color:var(--soi-ink)]"
            :title="p.name"
          >
            <img
              :src="p.logo"
              :alt="p.name"
              class="h-12 w-auto object-contain"
            />
            <span
              v-if="p.label"
              class="soi-serif text-lg font-semibold"
              >{{ p.label }}</span
            >
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { useT } from '@/utils/soiLang.js'

const t = useT({ en: { by: 'Built with & supported by' }, it: { by: 'Realizzato con il supporto di' } })

const partners = [
  { name: 'TaxonWorks', label: 'TaxonWorks', logo: '/images/TW.png', url: 'https://taxonworks.org' },
  { name: 'Species File Group', logo: '/images/SFG.png', url: 'https://speciesfilegroup.org' },
  { name: 'GBIF', logo: '/images/GBIF.png', url: 'https://www.gbif.org/dataset/83c91ce0-3fd9-42dd-a920-20feafe541f8' },
  {
    name: 'Parco Nazionale Dolomiti Bellunesi',
    logo: '/images/DolomitiBellunesi.png',
    url: 'https://www.dolomitipark.it'
  }
]
</script>

<style scoped>
.soi-partners {
  background: var(--soi-paper);
}
</style>
