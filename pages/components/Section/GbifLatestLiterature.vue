<template>
  <section class="py-7 bg-gray-50 dark:bg-gray-900/30 border-t border-b border-gray-300 dark:border-gray-700">
    <div class="max-w-6xl mx-auto">

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
        Latest Publications Using SoI Data
      </h3>

      <VGbifCitationWidget
        query="gbifDatasetKey=83c91ce0-3fd9-42dd-a920-20feafe541f8"
        :per-page="20"
        :height="350"
        class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      />

    </div>
  </section>
</template>

<script setup>
import VGbifCitationWidget from '@jlpereira/taxonpages-plugin-gbif-citation-widget/components/VGbifCitationWidget.vue'
</script>