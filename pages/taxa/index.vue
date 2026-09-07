<template>
  <section>
    <div class="container max-w-screen-xl mx-auto py-10">
      <!-- Intro component -->
      <TaxaTableIntro />

      <!-- Search bar -->
      <div class="mb-3 flex flex-wrap gap-3 items-center">
        <div class="relative w-full sm:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by genus..."
            class="border border-gray-300 rounded-md pl-3 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            title="Clear search"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Realm filter chips -->
      <div class="mb-4 flex flex-wrap gap-2 items-center">
        <button
          @click="activeRegion = null"
          class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
          :class="!activeRegion ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          All realms
        </button>
        <button
          v-for="region in availableRegions"
          :key="region"
          @click="toggleRegion(region)"
          :title="`Filter by ${regionMap[region]?.full || region}`"
          class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
          :class="[
            distributionClassMap[region],
            activeRegion === region ? 'ring-2 ring-inset ring-black/40' : ''
          ]"
        >
          {{ regionMap[region]?.full || region }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <VCard class="shadow-sm border border-gray-200 rounded-xl">
          <VCardContent>
            <VTable class="w-full table-auto text-sm">
              <!-- Table Header -->
              <VTableHeader>
                <VTableHeaderRow class="bg-gray-50 border-b">
                  <VTableHeaderCell class="text-gray-600 sticky top-0 bg-gray-50 z-10">
                    <button type="button" @click="sortBy('taxonName')"
                      class="font-semibold text-xs uppercase tracking-wide flex items-center gap-1 hover:text-gray-900">
                      Genus <span class="text-gray-400">{{ sortIndicator('taxonName') }}</span>
                    </button>
                  </VTableHeaderCell>
                  <VTableHeaderCell class="text-center sticky top-0 bg-gray-50 z-10">
                    <button type="button" @click="sortBy('numSpecies')"
                      class="font-semibold text-xs uppercase tracking-wide flex items-center gap-1 mx-auto hover:text-gray-900">
                      # Species <span class="text-gray-400">{{ sortIndicator('numSpecies') }}</span>
                    </button>
                  </VTableHeaderCell>
                  <VTableHeaderCell class="text-center sticky top-0 bg-gray-50 z-10">
                    <button type="button" @click="sortBy('numSpeciesIta')"
                      class="font-semibold text-xs uppercase tracking-wide flex items-center gap-1 mx-auto hover:text-gray-900">
                      # Italy <span class="text-gray-400">{{ sortIndicator('numSpeciesIta') }}</span>
                    </button>
                  </VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600 text-center sticky top-0 bg-gray-50 z-10">Distribution</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600 text-center w-32 sticky top-0 bg-gray-50 z-10">Key</VTableHeaderCell>
                </VTableHeaderRow>
              </VTableHeader>

              <!-- Table Body -->
              <VTableBody>
                <VTableBodyRow
                  v-for="(item, i) in sortedTaxaList"
                  :key="item.taxonName"
                  @click="goToTaxon(item)"
                  class="border-b last:border-0 border-l-2 border-transparent transition-colors cursor-pointer hover:bg-[#fdf3ef] hover:border-[#f79e87]"
                  :class="i % 2 === 1 ? 'bg-[#faf8f6]' : ''"
                >
                  <!-- Genus + Author -->
                  <VTableBodyCell>
                    <RouterLink
                      :to="{ name: 'taxa-name', params: { name: item.taxonName } }"
                      class="font-semibold text-sm text-[#c85a3c] hover:text-[#9c3f24] transition-colors"
                      @click.stop
                    >
                      <span class="italic" v-html="item.taxonName"></span>
                    </RouterLink>
                    <div v-if="item.author" class="text-xs text-gray-500 mt-0.5">{{ item.author }}</div>
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
                          : 'text-gray-300'"
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
                        :to="item.keyUrlEN || ''"
                        class="inline-flex items-center gap-1 text-xs text-gray-800 hover:text-amber-600 transition transform hover:scale-110"
                        :class="{ 'opacity-25 pointer-events-none cursor-default': !item.keyUrlEN }"
                        :title="item.keyUrlEN ? 'Open English key' : 'English key not available'"
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
                        :to="item.keyUrl || ''"
                        class="inline-flex items-center gap-1 text-xs text-gray-800 hover:text-amber-600 transition transform hover:scale-110"
                        :class="{ 'opacity-25 pointer-events-none cursor-default': !item.keyUrl }"
                        :title="item.keyUrl ? 'Open Italian key' : 'Italian key not available'"
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

                <!-- Empty state -->
                <VTableBodyRow v-if="!sortedTaxaList.length">
                  <VTableBodyCell colspan="5" class="text-center text-sm text-gray-500 py-10">
                    No genera match the current filters. Clear the search or realm filter to see all genera.
                  </VTableBodyCell>
                </VTableBodyRow>

                <!-- Totals -->
                <VTableBodyRow
                  v-if="sortedTaxaList.length"
                  class="border-t-2 border-gray-300 bg-gray-50 font-semibold text-gray-700"
                >
                  <VTableBodyCell class="text-sm">
                    Total — {{ totals.genera }} {{ totals.genera === 1 ? 'genus' : 'genera' }}
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
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <button
          @click="modalRegion = null"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          title="Close"
        >
          ✕
        </button>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ regionMap[modalRegion]?.full || modalRegion }}
        </h3>
        <p class="text-sm text-gray-600">
          Abbreviation for the {{ regionMap[modalRegion]?.full || modalRegion }} biogeographic realm.
        </p>
        <div v-if="regionImages[modalRegion]" class="mt-4">
          <img
            :src="regionImages[modalRegion].src"
            :alt="modalRegion"
            class="w-full rounded-lg border border-gray-200"
          />

          <p
            class="text-[10px] text-gray-500 mt-2 leading-snug"
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
import taxaListRaw from '/pages/taxa/constants/taxa.js';

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
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

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

// Build taxa list
const taxaList = taxaListRaw.map(taxon => ({
  ...taxon,
  numSpecies: parseNumSpecies(taxon),
  numSpeciesIta: parseNumSpeciesIta(taxon)
}));

// Realms actually present in the data, alphabetical, for the filter chips
const availableRegions = computed(() => {
  const set = new Set();
  taxaList.forEach(t => (t.distribution || []).forEach(r => set.add(r)));
  return [...set].sort((a, b) => (regionMap[a]?.full || a).localeCompare(regionMap[b]?.full || b));
});

// Filtered list based on genus search and active realm chip
const filteredTaxaList = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return taxaList.filter(taxon => {
    // Realm chip filter
    if (activeRegion.value && !(taxon.distribution || []).includes(activeRegion.value)) {
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