<template>
  <section class="soi-subf">
    <div class="container mx-auto px-4 py-14 sm:py-20">
      <div class="grid lg:grid-cols-12 gap-8 items-end mb-10">
        <div class="lg:col-span-7">
          <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
          <h2 class="soi-serif mt-3 text-3xl sm:text-[2.6rem] leading-tight font-semibold">
            {{ t('title') }}
          </h2>
        </div>
        <p class="lg:col-span-5 soi-muted text-base sm:text-lg leading-relaxed">
          {{ t('lede') }}
        </p>
      </div>

      <!-- Proportional bar -->
      <div
        class="flex h-5 w-full overflow-hidden rounded-full border soi-rule bg-[color:var(--soi-paper-2)]"
        role="img"
        :aria-label="barLabel"
      >
        <div
          v-for="s in rows"
          :key="s.name"
          class="h-full transition-[width] duration-700"
          :style="{ width: s.share + '%', background: s.color }"
          :title="`${s.name}: ${fmt(s.species)} species (${s.shareLabel})`"
        />
      </div>

      <div class="mt-8 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <RouterLink
          v-for="s in rows"
          :key="s.name"
          :to="{ name: 'otus-id-overview', params: { id: s.otuId } }"
          class="soi-card group relative flex flex-col p-6 pt-7 !text-[color:var(--soi-ink)] hover:-translate-y-0.5 transition-transform"
        >
          <span
            class="absolute left-0 top-0 h-1.5 w-full rounded-t-[6px]"
            :style="{ background: s.color }"
          />
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="soi-serif text-2xl font-semibold group-hover:underline underline-offset-4">
              {{ s.name }}
            </h3>
            <span class="text-sm font-bold tabular-nums soi-muted">{{ s.shareLabel }}</span>
          </div>
          <p class="text-xs soi-muted mt-0.5">{{ s.author }}</p>
          <p class="mt-4 text-[0.95rem] leading-relaxed flex-1">{{ s.blurb[lang] || s.blurb.en }}</p>
          <div class="mt-5 pt-4 border-t soi-rule flex gap-8">
            <div>
              <div class="soi-serif text-3xl font-semibold tabular-nums leading-none">
                <span :class="{ 'soi-skel': s.species === null }">{{ fmt(s.species) }}</span>
              </div>
              <div class="text-xs uppercase tracking-[0.14em] soi-muted mt-1.5">{{ t('species') }}</div>
            </div>
            <div>
              <div class="soi-serif text-3xl font-semibold tabular-nums leading-none">
                <span :class="{ 'soi-skel': s.genera === null }">{{ fmt(s.genera) }}</span>
              </div>
              <div class="text-xs uppercase tracking-[0.14em] soi-muted mt-1.5">{{ t('genera') }}</div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { SUBFAMILIES, fmt, useSoiStats } from './useSoiStats.js'
import { lang, useT } from '@/utils/soiLang.js'

const t = useT({
  en: { eyebrow: 'Four lineages', title: 'How the Italian fauna divides', lede: 'Every hoverfly in Italy belongs to one of four subfamilies. The bar shows each one’s share of the valid species in the catalogue.', species: 'species', genera: 'genera' },
  it: { eyebrow: 'Quattro linee evolutive', title: 'Come si suddivide la fauna italiana', lede: 'Ogni sirfide italiano appartiene a una di quattro sottofamiglie. La barra mostra la quota di specie valide di ciascuna nel catalogo.', species: 'specie', genera: 'generi' }
})

const stats = useSoiStats()

const rows = computed(() => {
  const counts = SUBFAMILIES.map((s) => stats.subfamilies[s.name] || {})
  const total = counts.reduce((acc, c) => acc + (c.species || 0), 0)

  return SUBFAMILIES.map((s, i) => {
    const species = counts[i].species ?? null
    const genera = counts[i].genera ?? null
    const share = total && species !== null ? (species / total) * 100 : 25
    const pct = total && species !== null ? (species / total) * 100 : null

    return {
      ...s,
      species,
      genera,
      share,
      shareLabel: pct === null ? '' : pct < 1 ? '<1%' : `${Math.round(pct)}%`
    }
  })
})

const barLabel = computed(() =>
  rows.value.map((r) => `${r.name} ${r.shareLabel}`).join(', ')
)
</script>

<style scoped>
.soi-subf {
  background: var(--soi-paper-2);
}
</style>
