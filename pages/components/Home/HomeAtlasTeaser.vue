<template>
  <section class="soi-teaser">
    <div class="container mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
      <div class="lg:col-span-6">
        <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
        <h2 class="soi-serif mt-3 text-3xl sm:text-[2.6rem] leading-tight font-semibold">{{ t('title') }}</h2>
        <p class="mt-4 text-lg leading-relaxed soi-muted">{{ t('lede') }}</p>

        <dl class="mt-8 grid grid-cols-3 gap-4 border-t soi-rule pt-5">
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.14em] soi-muted">{{ t('records') }}</dt>
            <dd class="soi-serif text-3xl sm:text-4xl font-semibold tabular-nums mt-1">
              <span :class="{ 'soi-skel': atlas.total === null }">{{ fmt(atlas.total) }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.14em] soi-muted">{{ t('regions') }}</dt>
            <dd class="soi-serif text-3xl sm:text-4xl font-semibold tabular-nums mt-1">
              <span :class="{ 'soi-skel': atlas.loadingRegions }">{{ regionsWithRecords }}</span><span class="text-xl soi-muted">/20</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.14em] soi-muted">{{ t('peak') }}</dt>
            <dd class="soi-serif text-3xl sm:text-4xl font-semibold mt-1">
              <span :class="{ 'soi-skel': atlas.loadingMonths }">{{ peakMonth || '—' }}</span>
            </dd>
          </div>
        </dl>

        <div class="mt-6 soi-card p-4">
          <SeasonBars
            :values="atlas.months"
            :height="90"
          />
        </div>

        <RouterLink
          to="/atlas"
          class="soi-btn soi-btn-ink mt-8"
          >{{ t('cta') }} →</RouterLink
        >
      </div>

      <div class="lg:col-span-6">
        <RouterLink
          to="/atlas"
          class="block soi-card p-4 sm:p-6 hover:border-[color:var(--soi-ink)] transition-colors"
          :aria-label="t('cta')"
        >
          <AtlasMap
            :counts="atlas.regions"
            class="pointer-events-none max-w-md mx-auto"
          />
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import AtlasMap from '../Atlas/AtlasMap.vue'
import SeasonBars from '../Atlas/SeasonBars.vue'
import { useAtlas } from '../Atlas/useAtlas.js'
import { fmt } from './useSoiStats.js'
import { lang, useT } from '@/utils/soiLang.js'

const atlas = useAtlas()

const t = useT({
  en: {
    eyebrow: 'Atlas',
    title: 'Where and when they fly',
    lede: 'The Italian records in SoI, mapped by region and by month. Darker regions have more records — and the pale ones are where new fieldwork would help most.',
    records: 'Italian records',
    regions: 'Regions',
    peak: 'Peak month',
    cta: 'Open the atlas'
  },
  it: {
    eyebrow: 'Atlante',
    title: 'Dove e quando volano',
    lede: 'I record italiani di SoI, per regione e per mese. Le regioni più scure hanno più record — quelle chiare sono dove nuove ricerche sul campo servirebbero di più.',
    records: 'Record italiani',
    regions: 'Regioni',
    peak: 'Mese di picco',
    cta: 'Apri l’atlante'
  }
})

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  it: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
}

const regionsWithRecords = computed(
  () => Object.values(atlas.regions).filter((r) => r.records > 0).length
)

const peakMonth = computed(() => {
  const v = atlas.months.map((x) => x || 0)
  const max = Math.max(...v)
  return max ? (MONTHS[lang.value] || MONTHS.en)[v.indexOf(max)] : ''
})
</script>

<style scoped>
.soi-teaser {
  background: var(--soi-paper);
}
</style>
