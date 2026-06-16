<template>
  <section class="py-7 bg-gray-50 dark:bg-gray-900/30 border-t border-b border-gray-300 dark:border-gray-700">
    <div class="max-w-6xl mx-auto">

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
        Latest Publications Using SoI Data
      </h3>

      <iframe 
        src="https://www.gbif.org/api/widgets/literature/latest?gbifDatasetKey=83c91ce0-3fd9-42dd-a920-20feafe541f8"
        scrolling="no"
        frameborder="0"
        allowtransparency="true"
        allowfullscreen="false"
        class="w-full h-[350px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
      ></iframe>

    </div>
  </section>
</template>

<script setup>
</script>
