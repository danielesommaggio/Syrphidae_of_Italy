<template>
  <section>
    <div class="container max-w-screen-xl mx-auto py-10">
      <!-- Intro component -->
      <TaxaTableIntro />

      <!-- Search bar -->
      <div class="mb-4 flex flex-wrap gap-4 items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Genus or Region"
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-80"
        />
      </div>

      <div class="overflow-x-auto">
        <VCard class="shadow-sm border border-gray-200 rounded-xl">
          <VCardContent>
            <VTable class="w-full table-auto text-sm">
              <!-- Table Header -->
              <VTableHeader>
                <VTableHeaderRow class="bg-gray-50 border-b">
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600">Genus</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600">Author</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600 text-center"># Species</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600 text-center"># Italy</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600 text-center">Distribution</VTableHeaderCell>
                  <VTableHeaderCell class="font-semibold text-xs uppercase tracking-wide text-gray-600 text-center w-32">Key</VTableHeaderCell>
                </VTableHeaderRow>
              </VTableHeader>

              <!-- Table Body -->
              <VTableBody>
                <VTableBodyRow
                  v-for="item in filteredTaxaList"
                  :key="item.taxonName"
                  class="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <!-- Genus -->
                  <VTableBodyCell>
                    <RouterLink
                      :to="{ name: 'taxa-name', params: { name: item.taxonName } }"
                      class="font-semibold text-sm text-[#f79e87] hover:text-[#f46f4f] transition-colors"
                    >
                      <span class="italic" v-html="item.taxonName"></span>
                    </RouterLink>
                  </VTableBodyCell>

                  <!-- Author -->
                  <VTableBodyCell>{{ item.author }}</VTableBodyCell>

                  <!-- # Species -->
                  <VTableBodyCell class="text-center font-medium">{{ item.numSpecies || '–' }}</VTableBodyCell>

                  <!-- # Species Italy -->
                  <VTableBodyCell class="text-center font-medium">{{ item.numSpeciesIta || '–' }}</VTableBodyCell>

                  <!-- Distribution -->
                  <VTableBodyCell class="text-center">
                    <div class="flex flex-wrap justify-center gap-1">
                      <template v-if="item.distribution && item.distribution.length">
                        <span
                          v-for="region in getSortedRegions(item.distribution)"
                          :key="region"
                          @click="modalRegion = region"
                          class="px-2 py-0.5 text-xs font-medium rounded-md cursor-pointer transition-colors duration-200"
                          :class="distributionClassMap[region]"
                        >
                          {{ regionMap[region]?.abbr || region }}
                        </span>
                      </template>
                      <span v-else>–</span>
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
                        @click.prevent="!item.keyUrlEN"
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
                        @click.prevent="!item.keyUrl"
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
    >
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <button
          @click="modalRegion = null"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
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
import { computed, ref } from 'vue';
import TaxaTableIntro from './TaxaTableIntro.vue';
import taxaListRaw from '/pages/taxa/constants/taxa.js';

const modalRegion = ref(null); // region clicked for modal
const searchQuery = ref('');

// Helper functions
function parseNumSpecies(taxon) {
  if (taxon.numSpecies) return taxon.numSpecies;
  if (!taxon.biodiversity) return '–';
  const match = taxon.biodiversity.match(/(\d+)\s+species/);
  return match ? Number(match[1]) : '–';
}

function parseNumSpeciesIta(taxon) {
  if (taxon.numSpeciesIta) return taxon.numSpeciesIta;
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
  Nearctic: 'bg-[#e8efd1] text-[#5f6f2f] hover:bg-[#dde8b8] hover:bg-blue-200',
  Neotropical: 'bg-[#ece5f0] text-[#715c74] hover:bg-[#e2d9e8]',
  Afrotropical: 'bg-[#dde6f0] text-[#4e637f] hover:bg-[#cfdceb]',
  Indomalayan: 'bg-[#f2e3cc] text-[#8b6a3e] hover:bg-orange-200',
  Australasian: 'bg-[#f6e2cc] text-[#9a5f24] hover:bg-[#edd1b3]',
  Cosmopolitan: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

const regionImages = {
  Indomalayan: {
    src: '/images/regions/indomalayan.png', // <-- your image path
    attribution: `
      By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, 
      CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704075`
  },
  Nearctic: {
    src:'/images/regions/nearctic.png',
    attribution: `
      By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, 
      CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704039`

  },
    Palearctic: {
    src:'/images/regions/palearctic.png',
    attribution: `
      By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, 
      CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704127`

  },
    Afrotropical: {
    src:'/images/regions/afrotropical.png',
    attribution: `
      By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, 
      CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3698068`

  },
    Australasian: {
    src:'/images/regions/australasian.png',
    attribution: `
      By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, 
      CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3698073`

  },
    Neotropical: {
    src:'/images/regions/neotropical.png',
    attribution: `
      By carol - Ecozones and Image:BlankMap-World6, compact.svg by User:Lokal_Profil, 
      CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3704119`

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

// Filtered list based on search query
const filteredTaxaList = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return taxaList;

  return taxaList.filter(taxon => {
    // Check genus
    const genusMatch = taxon.taxonName.toLowerCase().includes(query);

    // Check distribution
    const regionMatch = taxon.distribution?.some(region => {
      return regionMap[region]?.full.toLowerCase().includes(query);
    });

    return genusMatch || regionMatch;
  });
});
</script>
