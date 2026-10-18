<template>
  <section class="soi-newscite border-y soi-rule">
    <div class="container mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-12 gap-10 lg:gap-14">
      <!-- News -->
      <div class="lg:col-span-5">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="soi-serif text-2xl sm:text-3xl font-semibold">{{ t('news') }}</h2>
          <RouterLink
            :to="{ name: 'news-index' }"
            class="soi-link text-sm font-semibold"
            >{{ t('allNews') }}</RouterLink
          >
        </div>

        <ul class="mt-6 space-y-4">
          <li v-if="loading">
            <div class="soi-card p-5 space-y-2">
              <span class="soi-skel block h-3 w-24" />
              <span class="soi-skel block h-5 w-3/4" />
            </div>
          </li>
          <li
            v-for="n in news"
            :key="n.id"
          >
            <RouterLink
              :to="`/news/${n.id}`"
              class="soi-card group !text-[color:var(--soi-ink)] flex gap-5 p-5 hover:border-[color:var(--soi-ink)] transition-colors"
            >
              <div class="soi-date shrink-0 text-center">
                <div class="soi-serif text-3xl font-semibold leading-none">{{ n.day }}</div>
                <div class="text-[0.7rem] font-bold uppercase tracking-[0.14em] soi-muted mt-1">
                  {{ n.month }} {{ n.year }}
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="soi-serif text-lg font-semibold leading-snug group-hover:underline underline-offset-4">
                  {{ n.title }}
                </h3>
                <p
                  v-if="n.excerpt"
                  class="mt-1 text-sm soi-muted line-clamp-2"
                >
                  {{ n.excerpt }}
                </p>
              </div>
            </RouterLink>
          </li>
          <li
            v-if="!loading && !news.length"
            class="soi-card p-5 soi-muted text-sm"
          >
            {{ t('none') }}
          </li>
        </ul>
      </div>

      <!-- Cite + GBIF -->
      <div class="lg:col-span-7">
        <h2 class="soi-serif text-2xl sm:text-3xl font-semibold">{{ t('cite') }}</h2>

        <p class="mt-3 soi-muted leading-relaxed">{{ t('reuse') }}</p>

        <ClientOnly>
          <GbifOpenData class="mt-6" />
        </ClientOnly>

        <div class="soi-cite mt-6 p-6 sm:p-7">
          <p class="soi-eyebrow">{{ t('howCite') }}</p>
          <dl class="mt-4 space-y-5">
            <div
              v-for="c in cites"
              :key="c.key"
            >
              <dt class="text-sm font-semibold">{{ c.label }}</dt>
              <dd class="mt-1 text-[1.02rem] leading-relaxed soi-cite-text">{{ c.text }}</dd>
              <dd class="mt-2">
                <button
                  type="button"
                  class="soi-btn soi-btn-line !py-1 !px-3 text-sm"
                  @click="copy(c)"
                >
                  {{ copied === c.key ? t('copied') : t('copy') }}
                </button>
              </dd>
            </div>
          </dl>
        </div>

        <div class="mt-8">
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <h3 class="soi-serif text-xl font-semibold">{{ t('research') }}</h3>
            <span class="text-xs soi-muted">{{ t('via') }}</span>
          </div>
          <ClientOnly>
            <VGbifCitationWidget
              query="gbifDatasetKey=83c91ce0-3fd9-42dd-a920-20feafe541f8"
              :per-page="10"
              :height="300"
              class="soi-gbif mt-4 overflow-hidden"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { makeAPIRequest } from '@/utils/request'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: { news: 'News', allNews: 'All news', cite: 'Cite and reuse', reuse: 'SoI data are open: browse them here, or download them from GBIF, where they are published as a citable dataset.', howCite: 'How to cite', citeSite: 'The website', citeData: 'The occurrence data (if you use records, downloaded here or from GBIF)', research: 'Published research using SoI data', via: 'via GBIF literature tracking', none: 'No news yet.', copy: 'Copy citation', copied: 'Copied ✓', retrieved: 'Retrieved', from: 'from' },
  it: { news: 'Notizie', allNews: 'Tutte le notizie', cite: 'Citare e riutilizzare', reuse: 'I dati di SoI sono aperti: consultali qui o scaricali da GBIF, dove sono pubblicati come dataset citabile.', howCite: 'Come citare', citeSite: 'Il sito', citeData: 'I dati di occorrenza (se usi i record, scaricati qui o da GBIF)', research: 'Ricerche pubblicate con i dati di SoI', via: 'tramite il monitoraggio della letteratura GBIF', none: 'Ancora nessuna notizia.', copy: 'Copia la citazione', copied: 'Copiata ✓', retrieved: 'Retrieved', from: 'from' }
})
import VGbifCitationWidget from '../GbifCitation/components/VGbifCitationWidget.vue'
import GbifOpenData from '../Gbif/GbifOpenData.vue'
import { GBIF, datasetCitation, useGbif } from '../Gbif/useGbif.js'

const { project_citation, project_authors, project_url } = __APP_ENV__

const news = ref([])
const loading = ref(true)
const copied = ref('')
const gbif = useGbif()

const siteHost = (project_url || 'syrphidaeitaly.com').replace(/^https?:\/\//, '').replace(/\/$/, '')
const siteUrl = `https://${siteHost}`
const today = new Date().toISOString().slice(0, 10)
const year = (project_authors || '').match(/\d{4}/)?.[0]
const authors = (project_authors || 'Sommaggio D, Dal Pos D').replace(/\s*\(\d{4}\)\.?\s*/, '').replace(/\.$/, '')
const citation = `${authors}${year ? ` (${year})` : ''}. ${project_citation || 'Syrphidae of Italy (SoI)'}.`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

onMounted(async () => {
  try {
    const { data } = await makeAPIRequest.get('/news', { params: { per: 3 } })
    news.value = (Array.isArray(data) ? data : []).slice(0, 3).map((n) => {
      const d = new Date(n.display_start || n.created_at)
      return {
        id: n.id,
        title: n.title,
        excerpt: stripHtml(n.body_html || n.body || '').slice(0, 180),
        day: d.getDate(),
        month: MONTHS[d.getMonth()],
        year: d.getFullYear()
      }
    })
  } catch {
    news.value = []
  } finally {
    loading.value = false
  }
})

// The website, and the GBIF occurrence dataset (citation from GBIF, title not repeated)
const cites = computed(() => [
  { key: 'site', label: t('citeSite'), text: `${citation} Retrieved ${today} from ${siteUrl}` },
  { key: 'data', label: t('citeData'), text: gbif.citation ? datasetCitation('GBIF.org') : `https://doi.org/${GBIF.doi}` }
])

function copy(c) {
  navigator.clipboard?.writeText(c.text).then(() => {
    copied.value = c.key
    setTimeout(() => (copied.value = ''), 1800)
  })
}
</script>

<style scoped>
.soi-newscite {
  background: var(--soi-paper-2);
}
.soi-date {
  width: 4.5rem;
  padding-right: 1rem;
  border-right: 1px solid var(--soi-rule);
}
.soi-cite {
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-left: 5px solid var(--soi-yellow);
  border-radius: 4px;
}
.soi-cite-text {
  overflow-wrap: anywhere;
}
.soi-gbif {
  border: 1px solid var(--soi-rule);
  border-radius: 6px;
}
</style>
