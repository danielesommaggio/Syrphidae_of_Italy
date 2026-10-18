<template>
  <footer class="footer soi-footer print:hidden">
    <div class="container mx-auto box-border px-4 pt-12 pb-8">
      <div class="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-5">
          <RouterLink
            to="/"
            class="soi-footer-brand inline-flex items-center gap-3"
          >
            <img
              :src="logoUrl"
              alt=""
              class="h-12 w-auto"
            />
            <span class="soi-serif text-xl font-semibold leading-tight">
              Syrphidae of Italy
              <span class="soi-footer-tag">SoI</span>
            </span>
          </RouterLink>
          <p class="mt-4 text-sm leading-relaxed soi-footer-muted max-w-sm">{{ t('tagline') }}</p>

          <div class="mt-6 soi-footer-cite">
            <p class="soi-footer-label">{{ t('cite') }}</p>
            <FooterCitation class="text-sm !pt-1 !pb-0" />
          </div>
        </div>

        <!-- Explore -->
        <nav
          class="md:col-span-2"
          :aria-label="t('explore')"
        >
          <p class="soi-footer-label">{{ t('explore') }}</p>
          <ul class="mt-3 space-y-2 text-sm">
            <li
              v-for="l in explore"
              :key="l.to"
            >
              <RouterLink
                :to="l.to"
                class="soi-footer-link"
                >{{ l.label }}</RouterLink
              >
            </li>
          </ul>
        </nav>

        <!-- Project -->
        <nav
          class="md:col-span-2"
          :aria-label="t('project')"
        >
          <p class="soi-footer-label">{{ t('project') }}</p>
          <ul class="mt-3 space-y-2 text-sm">
            <li
              v-for="l in project"
              :key="l.to"
            >
              <RouterLink
                :to="l.to"
                class="soi-footer-link"
                >{{ l.label }}</RouterLink
              >
            </li>
          </ul>
        </nav>

        <!-- Open data -->
        <div class="col-span-2 md:col-span-3">
          <p class="soi-footer-label">{{ t('open') }}</p>
          <ul class="mt-3 space-y-2 text-sm">
            <li>
              <a
                :href="LINKS.publisher"
                target="_blank"
                rel="noopener"
                class="soi-footer-link inline-flex items-center gap-2"
                ><GbifLogoIcon class="soi-footer-gbif" />{{ t('publisher') }}</a
              >
            </li>
            <li>
              <a
                :href="LINKS.dataset"
                target="_blank"
                rel="noopener"
                class="soi-footer-link"
                >{{ t('gbif') }} · doi:10.15468/faryxm</a
              >
            </li>
            <li>
              <a
                :href="LINKS.cc0"
                target="_blank"
                rel="noopener license"
                class="soi-footer-link"
                >{{ t('licence') }}</a
              >
            </li>
            <li>
              <TrackerReport
                icon
                :label="t('report')"
                button-class="soi-footer-link inline-flex gap-2 items-center !p-0"
              />
            </li>
          </ul>
        </div>
      </div>

      <div class="soi-footer-bottom mt-10 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p class="soi-footer-muted">
          {{ t('data') }}
          <a
            href="https://taxonworks.org/"
            target="_blank"
            rel="noopener"
            class="soi-footer-link"
            >TaxonWorks</a
          >
          · {{ t('pages') }}
          <a
            href="https://github.com/SpeciesFileGroup/taxonpages"
            target="_blank"
            rel="noopener"
            class="soi-footer-link"
            >TaxonPages</a
          >
          · {{ t('support') }}
          <a
            href="https://speciesfilegroup.org"
            target="_blank"
            rel="noopener"
            class="soi-footer-link"
            >Species File Group</a
          >
          <FooterAnalytics class="italic" />
        </p>
        <p class="soi-footer-muted">© {{ year }} Syrphidae of Italy · {{ t('bottomLicence') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import FooterCitation from '@/components/Footer/FooterCitation.vue'
import FooterAnalytics from '@/components/Footer/FooterAnalytics.vue'
import { isValidUrl } from '@/utils/url'
import { menuLabel, useT } from '@/utils/soiLang.js'
import GbifLogoIcon from '~/pages/components/GbifCitation/components/GbifLogoIcon.vue'
import { LINKS } from '~/pages/components/Gbif/useGbif.js'

const { header_logo_url, base_url } = __APP_ENV__
const logoUrl = isValidUrl(header_logo_url)
  ? header_logo_url
  : (base_url + header_logo_url).replace('//', '/')

const year = new Date().getFullYear()

const t = useT({
  en: {
    tagline: 'The open catalogue of Italian hoverflies — names, literature, specimen records, maps and identification keys.',
    cite: 'Cite this page',
    explore: 'Explore',
    project: 'Project',
    open: 'Open data',
    publisher: 'Published on GBIF',
    gbif: 'Occurrence dataset',
    licence: 'Data licence: CC0 1.0 (public domain)',
    bottomLicence: 'Data CC0 1.0 · images under the licence shown with each one',
    report: 'Report a problem',
    data: 'Data in',
    pages: 'built with',
    support: 'supported by'
  },
  it: {
    tagline: 'Il catalogo aperto dei sirfidi italiani — nomi, letteratura, record di esemplari, mappe e chiavi di identificazione.',
    cite: 'Cita questa pagina',
    explore: 'Esplora',
    project: 'Progetto',
    open: 'Dati aperti',
    publisher: 'Pubblicato su GBIF',
    gbif: 'Dataset di occorrenze',
    licence: 'Licenza dei dati: CC0 1.0 (pubblico dominio)',
    bottomLicence: 'Dati CC0 1.0 · immagini con la licenza indicata per ciascuna',
    report: 'Segnala un problema',
    data: 'Dati in',
    pages: 'realizzato con',
    support: 'supportato da'
  }
})

const explore = computed(() => [
  { to: '/taxa', label: menuLabel('Genera') },
  { to: '/atlas', label: menuLabel('Atlas') },
  { to: '/keys', label: menuLabel('Keys') },
  { to: '/bibliography', label: menuLabel('Bibliography') },
  { to: '/data', label: menuLabel('Data') }
])

const project = computed(() => [
  { to: '/about', label: menuLabel('About SoI') },
  { to: '/news', label: menuLabel('News') },
  { to: '/newtaxa', label: menuLabel('Names added') },
  { to: '/help-wanted', label: menuLabel('Help wanted') }
])
</script>

<style scoped>
.soi-footer {
  --f-ink: #efeadb;
  --f-muted: #b3ae97;
  --f-rule: rgba(239, 234, 219, 0.14);
  color: var(--f-ink) !important;
}
.soi-footer-brand {
  color: var(--f-ink) !important;
}
.soi-footer-tag {
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0.05rem 0.4rem;
  font-family: 'Source Sans 3', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  vertical-align: 3px;
  background: var(--soi-yellow);
  color: #22281c;
  border-radius: 3px;
}
.soi-footer-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--soi-yellow);
}
.soi-footer-muted {
  color: var(--f-muted);
}
.soi-footer :deep(.soi-footer-link),
.soi-footer .soi-footer-link {
  color: var(--f-ink) !important;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s, color 0.15s;
}
.soi-footer :deep(.soi-footer-link:hover),
.soi-footer .soi-footer-link:hover {
  color: var(--soi-yellow) !important;
  border-bottom-color: currentColor;
}
.soi-footer-cite {
  padding-left: 0.9rem;
  border-left: 3px solid var(--soi-yellow);
}
.soi-footer-cite :deep(.tp-footer-citation) {
  color: var(--f-muted);
  line-height: 1.5;
}
.soi-footer-cite :deep(a) {
  color: var(--f-ink) !important;
  word-break: break-all;
}
.soi-footer-gbif {
  font-size: 1.05rem;
  color: #7cc46f;
}
.soi-footer-bottom {
  border-top: 1px solid var(--f-rule);
}
</style>
