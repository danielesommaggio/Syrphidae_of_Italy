<template>
  <section class="soi min-h-screen">
    <div class="container max-w-screen-xl mx-auto px-4 py-10 sm:py-14">
      <!-- Intro component -->
      <TaxaTableIntro :summary="introSummary" />

      <!-- Search bar -->
      <div class="mb-4 flex flex-wrap gap-3 items-center">
        <div class="relative w-full sm:w-80">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('filter')"
            :aria-label="t('filter')"
            class="soi-input w-full pl-4 pr-9 py-2"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 flex items-center pr-3 soi-muted hover:text-[color:var(--soi-ink)]"
            title="Clear search"
          >
            ✕
          </button>
        </div>
        <select
          v-model="activeSubfamily"
          class="soi-input px-4 py-2 pr-8 text-sm"
          :aria-label="t('subfamily')"
        >
          <option :value="null">{{ t('allSubfamilies') }}</option>
          <option
            v-for="s in subfamilies"
            :key="s"
            :value="s"
          >
            {{ s }}
          </option>
        </select>
        <span class="text-sm soi-muted">{{ t('showing', { n: sortedTaxaList.length, total: taxaList.length }) }}</span>
      </div>

      <!-- Realm filter chips -->
      <div class="mb-4 flex flex-wrap gap-2 items-center">
        <button
          @click="activeRegion = null"
          class="px-3 py-1 text-xs font-semibold rounded-full transition-colors border"
          :class="!activeRegion ? 'bg-[color:var(--soi-ink)] text-[color:var(--soi-paper)] border-transparent' : 'soi-rule soi-muted hover:text-[color:var(--soi-ink)]'"
        >
          {{ t('allRealms') }}
        </button>
        <button
          v-for="region in availableRegions"
          :key="region"
          @click="toggleRegion(region)"
          :title="`Filter by ${regionMap[region]?.full || region}`"
          class="px-3 py-1 text-xs font-semibold rounded-full transition-colors"
          :class="[
            distributionClassMap[region],
            activeRegion === region ? 'ring-2 ring-inset ring-black/40' : ''
          ]"
        >
          {{ regionMap[region]?.full || region }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <VCard class="soi-table-card">
          <VCardContent>
            <VTable class="w-full table-auto text-sm">
              <!-- Table Header -->
              <VTableHeader>
                <VTableHeaderRow class="soi-thead border-b">
                  <VTableHeaderCell class="soi-muted sticky top-0 soi-thead z-10">
                    <button type="button" @click="sortBy('taxonName')"
                      class="font-semibold text-xs uppercase tracking-wide flex items-center gap-1 hover:text-[color:var(--soi-ink)]">
                      {{ t('colGenus') }} <span class="opacity-50">{{ sortIndicator('taxonName') }}</span>
                    </button>
                  </VTableHeaderCell>
                  <VTableHeaderCell class="text-center sticky top-0 soi-thead z-10">
                    <button type="button" @click="sortBy('numSpecies')"
                      class="font-semibold text-xs uppercase tracking-wide flex items-center gap-1 mx-auto hover:text-[color:var(--soi-ink)]">
                      {{ t('colWorld') }} <span class="opacity-50">{{ sortIndicator('numSpecies') }}</span>
                    </button>
                  </VTableHeaderCell>
                  <VTableHeaderCell class="text-center sticky top-0 soi-thead z-10">
                    <button type="button" @click="sortBy('numSpeciesIta')"
                      class="font-semibold text-xs uppercase tracking-wide flex items-center gap-1 mx-auto hover:text-[color:var(--soi-ink)]">
                      {{ t('colItaly') }} <span class="opacity-50">{{ sortIndicator('numSpeciesIta') }}</span>
                    </button>
                  </VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide soi-muted text-center sticky top-0 soi-thead z-10">{{ t('colRealms') }}</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide soi-muted text-center w-32 sticky top-0 soi-thead z-10">{{ t('colKeys') }}</VTableHeaderCell>
                </VTableHeaderRow>
              </VTableHeader>

              <!-- Table Body -->
              <VTableBody>
                <VTableBodyRow
                  v-for="(item, i) in sortedTaxaList"
                  :key="item.taxonName"
                  @click="goToTaxon(item)"
                  class="border-b last:border-0 border-l-2 border-transparent transition-colors cursor-pointer soi-row"
                  :class="i % 2 === 1 ? 'soi-row-alt' : ''"
                >
                  <!-- Genus + Author -->
                  <VTableBodyCell>
                    <RouterLink
                      :to="{ name: 'taxa-name', params: { name: item.taxonName } }"
                      class="soi-serif text-[1.05rem] font-semibold text-[color:var(--soi-ink)] hover:underline underline-offset-4"
                      @click.stop
                    >
                      <span class="italic" v-html="item.taxonName"></span>
                    </RouterLink>
                    <span
                      v-if="item.hasAccount"
                      class="soi-acct"
                      :title="t('hasAccount')"
                      >{{ t('account') }}</span
                    >
                    <div class="text-xs soi-muted mt-0.5">
                      {{ item.author }}<template v-if="item.subfamily"> · {{ item.subfamily }}</template>
                    </div>
                  </VTableBodyCell>

                  <!-- # Species -->
                  <VTableBodyCell class="text-center font-medium">{{ item.numSpecies || '–' }}</VTableBodyCell>

                  <!-- # Species Italy -->
                  <VTableBodyCell class="text-center font-medium">{{ item.numSpeciesIta || '–' }}</VTableBodyCell>

                  <!-- Distribution (labelled presence grid) -->
                  <VTableBodyCell>
                    <div class="flex items-center justify-center gap-1">
                      <span
                        v-for="region in availableRegions"
                        :key="region"
                        @click.stop="hasRegion(item, region) && (modalRegion = region)"
                        :title="hasRegion(item, region)
                          ? `${regionMap[region]?.full || region} — click for map`
                          : `Not recorded in ${regionMap[region]?.full || region}`"
                        class="inline-flex items-center justify-center w-9 py-0.5 text-[11px] font-medium rounded transition-colors"
                        :class="hasRegion(item, region)
                          ? `${distributionClassMap[region]} cursor-pointer hover:ring-1 hover:ring-inset hover:ring-black/10`
                          : 'opacity-30'"
                      >
                        {{ regionMap[region]?.abbr || region }}
                      </span>
                    </div>
                  </VTableBodyCell>

                  <!-- Keys EN + IT -->
                  <VTableBodyCell class="text-center">
                    <div class="flex items-center justify-center gap-6">
                      <!-- EN -->
                      <RouterLink
                        :to="item.keyLinkEN || ''"
                        class="inline-flex items-center gap-1 text-xs text-[color:var(--soi-ink)] hover:text-[color:var(--soi-yellow-deep)] transition transform hover:scale-110"
                        :class="{ 'opacity-25 pointer-events-none cursor-default': !item.keyLinkEN }"
                        :title="item.keyLinkEN ? 'Open English key' : 'English key not available'"
                        @click.stop
                      >
                        <span class="font-medium tracking-wide">EN</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round"
                          class="w-3.5 h-3.5">
                          <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L10 5" />
                          <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L14 19" />
                        </svg>
                      </RouterLink>

                      <!-- IT -->
                      <RouterLink
                        :to="item.keyLinkIT || ''"
                        class="inline-flex items-center gap-1 text-xs text-[color:var(--soi-ink)] hover:text-[color:var(--soi-yellow-deep)] transition transform hover:scale-110"
                        :class="{ 'opacity-25 pointer-events-none cursor-default': !item.keyLinkIT }"
                        :title="item.keyLinkIT ? 'Open Italian key' : 'Italian key not available'"
                        @click.stop
                      >
                        <span class="font-medium tracking-wide">IT</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round"
                          class="w-3.5 h-3.5">
                          <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L10 5" />
                          <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L14 19" />
                        </svg>
                      </RouterLink>
                    </div>
                  </VTableBodyCell>
                </VTableBodyRow>

                <!-- Loading -->
                <VTableBodyRow v-if="genera.loading">
                  <VTableBodyCell colspan="5" class="text-center text-sm soi-muted py-10">
                    {{ t('loading') }}
                  </VTableBodyCell>
                </VTableBodyRow>

                <!-- Empty state -->
                <VTableBodyRow v-else-if="!sortedTaxaList.length">
                  <VTableBodyCell colspan="5" class="text-center text-sm soi-muted py-10">
                    No genera match the current filters. Clear the search or realm filter to see all genera.
                  </VTableBodyCell>
                </VTableBodyRow>

                <!-- Totals -->
                <VTableBodyRow
                  v-if="sortedTaxaList.length"
                  class="border-t-2 soi-rule soi-thead font-semibold"
                >
                  <VTableBodyCell class="text-sm">
                    {{ t('total') }} — {{ totals.genera }} {{ totals.genera === 1 ? t('genus') : t('genera') }}
                  </VTableBodyCell>
                  <VTableBodyCell class="text-center">{{ totals.species }}</VTableBodyCell>
                  <VTableBodyCell class="text-center">{{ totals.italy }}</VTableBodyCell>
                  <VTableBodyCell></VTableBodyCell>
                  <VTableBodyCell></VTableBodyCell>
                </VTableBodyRow>
              </VTableBody>
            </VTable>
          </VCardContent>
        </VCard>
      </div>
    </div>

    <!-- Modal for distribution -->
    <div
      v-if="modalRegion"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="modalRegion = null"
    >
      <div class="soi-card shadow-xl max-w-md w-full p-6 relative text-[color:var(--soi-ink)]">
        <button
          @click="modalRegion = null"
          class="absolute top-3 right-3 soi-muted hover:text-[color:var(--soi-ink)]"
          title="Close"
        >
          ✕
        </button>
        <h3 class="soi-serif text-2xl font-semibold mb-1">
          {{ regionMap[modalRegion]?.full || modalRegion }}
        </h3>
        <p class="text-sm soi-muted">
          Abbreviation for the {{ regionMap[modalRegion]?.full || modalRegion }} biogeographic realm.
        </p>
        <div v-if="regionImages[modalRegion]" class="mt-4">
          <img
            :src="regionImages[modalRegion].src"
            :alt="modalRegion"
            class="w-full rounded border soi-rule"
          />

          <p
            class="text-[10px] soi-muted mt-2 leading-snug"
            v-html="regionImages[modalRegion].attribution"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import TaxaTableIntro from './TaxaTableIntro.vue';
import { useGenera } from './useGenera.js';
import { useT } from '@/utils/soiLang.js';
import { useHead } from '@unhead/vue';

const t = useT({
  en: {
    filter: 'Filter genera…', subfamily: 'Subfamily', allSubfamilies: 'All subfamilies', allRealms: 'All realms',
    showing: '{n} of {total} genera', account: 'Account', hasAccount: 'Full genus account available',
    loading: 'Loading genera from TaxonWorks…', genera: 'genera', genus: 'genus',
    colWorld: 'World', colItaly: 'Italy', colRealms: 'Realms', colKeys: 'Keys', colGenus: 'Genus', total: 'Total',
    speciesWorld: 'species worldwide (genera with an account)', speciesItaly: 'species in Italy'
  },
  it: {
    filter: 'Filtra i generi…', subfamily: 'Sottofamiglia', allSubfamilies: 'Tutte le sottofamiglie', allRealms: 'Tutte le regioni',
    showing: '{n} di {total} generi', account: 'Scheda', hasAccount: 'Scheda completa del genere disponibile',
    loading: 'Caricamento dei generi da TaxonWorks…', genera: 'generi', genus: 'genere',
    colWorld: 'Mondo', colItaly: 'Italia', colRealms: 'Regioni biogeogr.', colKeys: 'Chiavi', colGenus: 'Genere', total: 'Totale',
    speciesWorld: 'specie nel mondo (generi con scheda)', speciesItaly: 'specie in Italia'
  }
});

const router = useRouter();


const modalRegion = ref(null); // region clicked for modal
const searchQuery = ref('');
const activeRegion = ref(null); // realm filter chip

// Sorting state
const sortKey = ref('taxonName');
const sortDir = ref('asc');

function sortBy(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
}

function sortIndicator(key) {
  if (sortKey.value !== key) return '↕';
  return sortDir.value === 'asc' ? '↑' : '↓';
}

function toggleRegion(region) {
  activeRegion.value = activeRegion.value === region ? null : region;
}

// Navigate to a genus page when its row is clicked
function goToTaxon(item) {
  router.push({ name: 'taxa-name', params: { name: item.taxonName } });
}

// Does this genus occur in the given realm?
function hasRegion(item, region) {
  return (item.distribution || []).includes(region);
}

// Solid accent colours for the presence-grid dots (tuned to match the chip palette)
const regionDotColor = {
  Palearctic: '#b25a5a',
  Nearctic: '#7d9142',
  Neotropical: '#8f7593',
  Afrotropical: '#6a82a3',
  Indomalayan: '#b08a4e',
  Australasian: '#c07e33',
  Cosmopolitan: '#6b7280'
};

// Close modal on Escape
function handleKeydown(e) {
  if (e.key === 'Escape') modalRegion.value = null;
}

// Coerce a value to a finite number, or null if it isn't one
function toNum(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

// Helper functions
function parseNumSpecies(taxon) {
  if (taxon.numSpecies) return toNum(taxon.numSpecies) ?? taxon.numSpecies;
  if (!taxon.biodiversity) return '–';
  const match = taxon.biodiversity.match(/(\d+)\s+species/);
  return match ? Number(match[1]) : '–';
}

function parseNumSpeciesIta(taxon) {
  if (taxon.numSpeciesIta) return toNum(taxon.numSpeciesIta) ?? taxon.numSpeciesIta;
  if (!taxon.biodiversityIta) return '–';
  const match = taxon.biodiversityIta.match(/(\d+)\s+species/);
  return match ? Number(match[1]) : '–';
}

const regionMap = {
  Palearctic: { abbr: 'Pal', full: 'Palearctic' },
  Nearctic: { abbr: 'Nea', full: 'Nearctic' },
  Neotropical: { abbr: 'Neo', full: 'Neotropical' },
  Afrotropical: { abbr: 'Afr', full: 'Afrotropical' },
  Indomalayan: { abbr: 'Ind', full: 'Indomalayan' },
  Australasian: { abbr: 'Aus', full: 'Australasian' },
  Cosmopolitan: { abbr: 'Cos', full: 'Cosmopolitan' }
};

// Pastel colors with hover
const distributionClassMap = {
  Palearctic: 'bg-[#f2d6d6] text-[#8f3f3f] hover:bg-[#e8c2c2]',
  Nearctic: 'bg-[#e8efd1] text-[#5f6f2f] hover:bg-[#dde8b8]',
  Neotropical: 'bg-[#ece5f0] text-[#715c74] hover:bg-[#e2d9e8]',
  Afrotropical: 'bg-[#dde6f0] text-[#4e637f] hover:bg-[#cfdceb]',
  Indomalayan: 'bg-[#f2e3cc] text-[#8b6a3e] hover:bg-[#ecd6b3]',
  Australasian: 'bg-[#f6e2cc] text-[#9a5f24] hover:bg-[#edd1b3]',
  Cosmopolitan: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

const regionImages = {
  Indomalayan: {
    src: '/images/regions/indomalayan.png',
    attribution: `By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704075`
  },
  Nearctic: {
    src: '/images/regions/nearctic.png',
    attribution: `By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704039`
  },
  Palearctic: {
    src: '/images/regions/palearctic.png',
    attribution: `By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704127`
  },
  Afrotropical: {
    src: '/images/regions/afrotropical.png',
    attribution: `By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3698068`
  },
  Australasian: {
    src: '/images/regions/australasian.png',
    attribution: `By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3698073`
  },
  Neotropical: {
    src: '/images/regions/neotropical.png',
    attribution: `By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704119`
  }
};

// Sort regions alphabetically
function getSortedRegions(distribution) {
  return [...distribution].sort((a, b) => (regionMap[a]?.full || a).localeCompare(regionMap[b]?.full || b));
}

useHead({ title: () => `${t('colGenus') === 'Genere' ? 'Generi' : 'Genera'} — Syrphidae of Italy` });

// Live list of genera (TaxonWorks + hand-written accounts)
const genera = useGenera();
const taxaList = computed(() => genera.list);
const activeSubfamily = ref(null);
const subfamilies = computed(() =>
  [...new Set(genera.list.map((g) => g.subfamily).filter(Boolean))].sort()
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Realms actually present in the data, alphabetical, for the filter chips
const availableRegions = computed(() => {
  const set = new Set();
  taxaList.value.forEach(t => (t.distribution || []).forEach(r => set.add(r)));
  return [...set].sort((a, b) => (regionMap[a]?.full || a).localeCompare(regionMap[b]?.full || b));
});

// Filtered list based on genus search and active realm chip
const filteredTaxaList = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return taxaList.value.filter(taxon => {
    // Realm chip filter
    if (activeRegion.value && !(taxon.distribution || []).includes(activeRegion.value)) {
      return false;
    }
    if (activeSubfamily.value && taxon.subfamily !== activeSubfamily.value) {
      return false;
    }

    // Genus-only text search
    if (!query) return true;
    return taxon.taxonName.toLowerCase().includes(query);
  });
});

// Sorted list based on the active column
const sortedTaxaList = computed(() => {
  const list = [...filteredTaxaList.value];
  const key = sortKey.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;

  return list.sort((a, b) => {
    if (key === 'taxonName') {
      const va = String(a[key]).replace(/<[^>]*>/g, '').toLowerCase();
      const vb = String(b[key]).replace(/<[^>]*>/g, '').toLowerCase();
      return va.localeCompare(vb) * dir;
    }

    // Numeric columns: missing values (–) always sink to the bottom
    const na = toNum(a[key]);
    const nb = toNum(b[key]);
    if (na === null && nb === null) return 0;
    if (na === null) return 1;
    if (nb === null) return -1;
    return (na - nb) * dir;
  });
});

// Summary shown in the intro (whole table, not the filtered view)
const introSummary = computed(() => {
  let species = 0
  let italy = 0
  taxaList.value.forEach((t) => {
    species += toNum(t.numSpecies) || 0
    italy += toNum(t.numSpeciesIta) || 0
  })
  return [
    { label: taxaList.value.length === 1 ? t('genus') : t('genera'), value: taxaList.value.length },
    { label: t('speciesItaly'), value: italy.toLocaleString('en-US') },
    { label: t('speciesWorld'), value: species.toLocaleString('en-US') }
  ]
})

// Column totals for the currently displayed rows
const totals = computed(() => {
  let species = 0;
  let italy = 0;
  sortedTaxaList.value.forEach(t => {
    const s = toNum(t.numSpecies);
    if (s) species += s;
    const it = toNum(t.numSpeciesIta);
    if (it) italy += it;
  });
  return { genera: sortedTaxaList.value.length, species, italy };
});
</script>

<style scoped>
.soi-input {
  background: var(--soi-card);
  border: 1.5px solid var(--soi-ink);
  border-radius: 999px;
  color: var(--soi-ink);
  outline: none;
}
.soi-input:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--soi-yellow) 45%, transparent);
}
.soi-table-card {
  background: var(--soi-card) !important;
  border: 1px solid var(--soi-rule) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}
:deep(.soi-thead) {
  background: var(--soi-paper-2) !important;
}
:deep(.soi-row) {
  border-left-width: 3px;
}
:deep(.soi-row:hover) {
  background: color-mix(in srgb, var(--soi-yellow) 12%, transparent) !important;
  border-left-color: var(--soi-yellow) !important;
}
.soi-acct {
  margin-left: 0.4rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.05rem 0.4rem;
  border-radius: 3px;
  background: color-mix(in srgb, var(--soi-yellow) 30%, transparent);
  color: var(--soi-yellow-deep);
  vertical-align: 2px;
}
:deep(.soi-row-alt) {
  background: color-mix(in srgb, var(--soi-paper-2) 55%, transparent);
}
</style>
