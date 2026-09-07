<template>
  <div class="mb-8 p-6 bg-gray-50 border border-gray-200 border-l-4 border-l-[#f79e87] rounded-xl shadow-sm">
    <!-- Title -->
    <h2 class="text-xl font-semibold text-gray-900 mb-2">
      Genera Overview
    </h2>

    <!-- Description -->
    <p class="text-sm text-gray-700 leading-relaxed mb-4">
      A summary of every genus in the database. Click any row to open its full page. The columns cover:
    </p>

    <!-- Key points -->
    <div class="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-gray-700 mb-5">
      <div class="flex gap-2">
        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f79e87] shrink-0"></span>
        <p><span class="font-medium text-gray-900">Authorship</span> — who described the genus.</p>
      </div>
      <div class="flex gap-2">
        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f79e87] shrink-0"></span>
        <p><span class="font-medium text-gray-900">Global richness</span> — total species worldwide.</p>
      </div>
      <div class="flex gap-2">
        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f79e87] shrink-0"></span>
        <p><span class="font-medium text-gray-900">Species in Italy</span> — richness of the Italian fauna.</p>
      </div>
      <div class="flex gap-2">
        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f79e87] shrink-0"></span>
        <p><span class="font-medium text-gray-900">Identification keys</span> — in English (EN) and Italian (IT).</p>
      </div>
    </div>

    <!-- Realm legend (doubles as the key for the distribution grid) -->
    <div class="mb-4">
      <p class="text-xs font-medium text-gray-500 mb-2">Biogeographic distribution — realm codes used in the table:</p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="r in realms"
          :key="r.abbr"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs"
          :class="r.class"
        >
          <span class="font-semibold">{{ r.abbr }}</span>
          <span class="opacity-80">{{ r.full }}</span>
        </span>
      </div>
    </div>

    <!-- Tip -->
    <p class="text-xs text-gray-500 leading-relaxed">
      In the table below, click a colored realm code (e.g.
      <span class="font-semibold text-[#8f3f3f]">Pal</span>) to open its distribution map.
      Greyed codes mark realms where the genus has not been recorded.
    </p>
  </div>
</template>

<script setup>
// Realm palette mirrors the distribution grid in the table.
// If you later move this to a shared constants file, import it in both places.
const realms = [
  { abbr: 'Pal', full: 'Palearctic', class: 'bg-[#f2d6d6] text-[#8f3f3f]' },
  { abbr: 'Nea', full: 'Nearctic', class: 'bg-[#e8efd1] text-[#5f6f2f]' },
  { abbr: 'Neo', full: 'Neotropical', class: 'bg-[#ece5f0] text-[#715c74]' },
  { abbr: 'Afr', full: 'Afrotropical', class: 'bg-[#dde6f0] text-[#4e637f]' },
  { abbr: 'Ind', full: 'Indomalayan', class: 'bg-[#f2e3cc] text-[#8b6a3e]' },
  { abbr: 'Aus', full: 'Australasian', class: 'bg-[#f6e2cc] text-[#9a5f24]' }
];
</script>