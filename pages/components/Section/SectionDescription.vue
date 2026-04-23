<script setup lang="ts">
import GbifBar from './GbifBar.vue';
import GbifLatestLiterature from './GbifLatestLiterature.vue';

</script>

<template>
  <section class="bg-base-foreground mb-10">
    <div class="container mx-auto p-4 sm:pt-10 sm:pb-2 relative box-border">

      <!-- Title section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-base-content">
          Syrphidae of Italy (SoI)
        </h1>
        <p class="mt-2 text-lg text-base-soft">
          A comprehensive database for Italian hoverflies (Diptera, Syrphidae)
        </p>
      </div>
      <!-- Main content with prose styling -->
      <div class="dark:prose-invert mb-10">
        <div class="text-lg text-justify text-gray-600 space-y-6 leading-relaxed max-w-7xl mx-auto px-4">
          <p>
            The <strong class="text-gray-800 font-semibold">Syrphidae of Italy (SoI)</strong> is a comprehensive database created to include all available information on Italian hoverflies (Diptera, Syrphidae). Managed in 
            <a 
              href="https://taxonworks.org" 
              class="no-underline text-gray-700 font-medium hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              target="_blank" 
              rel="noopener noreferrer"
            >
              TaxonWorks
            </a>, you can find detailed data on the <span class="text-gray-800 font-semibold">distribution</span>, <span class="text-gray-800 font-semibold">nomenclature</span>, and <span class="text-gray-800 font-semibold">biology</span> of hoverfly species.
          </p>

          <p>
            The growing interest in hoverflies, driven by their crucial ecological roles such as pollination and biological pest control, has led to increased research in Italy. This database aims to merge historical data with new observations to support ongoing scientific efforts.
          </p>
<GbifBar />
<GbifLatestLiterature />
        </div>
      </div>

    </div>
  </section>
</template>
