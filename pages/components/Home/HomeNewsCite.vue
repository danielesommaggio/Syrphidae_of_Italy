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

        <div class="soi-cite mt-6 p-6 sm:p-7">
          <p class="soi-eyebrow">{{ t('howCite') }}</p>
          <p class="mt-3 text-[1.02rem] leading-relaxed">
            {{ citation }}
            {{ t('retrieved') }} {{ today }} {{ t('from') }}
            <a
              :href="siteUrl"
              class="soi-link"
              >{{ siteHost }}</a
            >
          </p>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="soi-btn soi-btn-ink"
              @click="copy"
            >
              {{ copied ? t('copied') : t('copy') }}
            </button>
            <a
              href="https://doi.org/10.15468/faryxm"
              target="_blank"
              rel="noopener"
              class="soi-btn soi-btn-line"
              >{{ t('dataset') }} · doi:10.15468/faryxm</a
            >
          </div>
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
import { onMounted, ref } from 'vue'
import { makeAPIRequest } from '@/utils/request'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: { news: 'News', allNews: 'All news', cite: 'Cite and reuse', howCite: 'How to cite', dataset: 'Dataset on GBIF', research: 'Published research using SoI data', via: 'via GBIF literature tracking', none: 'No news yet.', copy: 'Copy citation', copied: 'Copied', retrieved: 'Retrieved', from: 'from' },
  it: { news: 'Notizie', allNews: 'Tutte le notizie', cite: 'Citare e riutilizzare', howCite: 'Come citare', dataset: 'Dataset su GBIF', research: 'Ricerche pubblicate con i dati di SoI', via: 'tramite il monitoraggio della letteratura GBIF', none: 'Ancora nessuna notizia.', copy: 'Copia la citazione', copied: 'Copiata', retrieved: 'Consultato il', from: 'su' }
})
import VGbifCitationWidget from '../GbifCitation/components/VGbifCitationWidget.vue'

const { project_citation, project_authors, project_url } = __APP_ENV__

const news = ref([])
const loading = ref(true)
const copied = ref(false)

const siteHost = (project_url || 'syrphidaeitaly.com').replace(/^https?:\/\//, '').replace(/\/$/, '')
const siteUrl = `https://${siteHost}`
const today = new Date().toISOString().slice(0, 10)
const year = (project_authors || '').match(/\d{4}/)?.[0]
const authors = (project_authors || 'Sommaggio et al.').replace(/\s*\(\d{4}\)\s*/, '')
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

function copy() {
  const text = `${citation} Retrieved ${today} from ${siteUrl}`
  navigator.clipboard?.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
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
.soi-gbif {
  border: 1px solid var(--soi-rule);
  border-radius: 6px;
}
</style>
