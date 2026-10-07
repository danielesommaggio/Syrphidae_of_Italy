<template>
  <section class="py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-6xl mx-auto flex items-center gap-4">

      <img
        src="/images/GBIF.png"
        alt="GBIF"
        class="h-6 opacity-80 dark:opacity-90"
      />

      <span class="text-sm text-gray-600 dark:text-gray-400">
        Citations & DOI via GBIF
      </span>

      <!-- GBIF Literature Badge (native, no iframe) -->
      <div class="w-[140px] ml-auto rounded overflow-hidden">
        <VGbifCitationWidgetButton
          query="gbifDatasetKey=83c91ce0-3fd9-42dd-a920-20feafe541f8"
        />
      </div>

      <a
        href="https://doi.org/10.15468/faryxm"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0"
      >
        <img
          src="https://img.shields.io/badge/DOI-10.15468%2faryxm-orange.svg"
          alt="Dataset DOI"
          class="h-6"
        />
      </a>

    </div>
  </section>
</template>

<script setup>
import VGbifCitationWidgetButton from '../GbifCitation/components/VGbifCitationWidgetButton.vue'
</script>
