<template>
  <section class="py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-6xl mx-auto flex items-center gap-4">

      <!-- GBIF Logo -->
      <img 
        src="/images/GBIF.png" 
        alt="GBIF" 
        class="h-6 opacity-80 dark:opacity-90"
      />

      <!-- Label -->
      <span class="text-sm text-gray-600 dark:text-gray-400">
        Citations & DOI via GBIF
      </span>

      <!-- GBIF Literature Badge -->
      <iframe 
        src="https://www.gbif.org/api/widgets/literature/button?gbifDatasetKey=83c91ce0-3fd9-42dd-a920-20feafe541f8"
        scrolling="no"
        frameborder="0"
        allowtransparency="true"
        allowfullscreen="false"
        class="w-[140px] h-[24px] ml-auto"
      ></iframe>

      <!-- DOI Badge -->
      <a 
        href="https://doi.org/10.15468/faryxm" 
        target="_blank"
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
</script>
