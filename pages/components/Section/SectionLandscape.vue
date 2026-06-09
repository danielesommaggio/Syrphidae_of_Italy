<template>
  <section>
    <div class="relative box-border">
      <ImageCarrousel>
        <div class="flex flex-col justify-center sm:items-center w-full h-full gap-5 px-6 pb-16 sm:pb-0">

          <!-- Eyebrow -->
          <span class="text-xs tracking-[0.3em] uppercase text-white/70">
            Diptera · Syrphidae · Italia
          </span>

          <!-- Title -->
          <h1 class="flex items-baseline gap-2.5">
            <span class="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Syrphidae of Italy
            </span>
            <span class="text-2xl sm:text-3xl font-semibold text-white/60 tracking-tight">
              (SoI)
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xs sm:text-sm text-white/70 tracking-[0.2em] uppercase max-w-md text-center">
            A comprehensive database for the Italian fauna of Hoverflies
          </p>

          <!-- Search bar -->
          <div class="flex items-center gap-3 w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 mt-2 overflow-visible relative z-50">
            <i class="ti ti-search text-white/50" style="font-size: 16px;" aria-hidden="true"></i>
            <AutocompleteOtu
              autofocus
              class="w-full bg-transparent"
              placeholder="Search by taxon name..."
            />
          </div>

        </div>
      </ImageCarrousel>

      <!-- Stats bar — desktop: overlaid at bottom of hero -->
      <div class="hidden sm:background-gray-900 sm:block absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10 z-10">
        <SectionData />
      </div>
    </div>

    <!-- Stats bar — mobile: below hero, in page flow -->
<!-- Stats bar — mobile: below hero, in page flow -->
<div class="sm:hidden border-t border-black/10 bg-neutral-600 dark:bg-neutral-800">
  <SectionData />
</div>

  </section>
</template>

<script setup>
import ImageCarrousel from '../ImageCarrousel.vue'
import SectionData from './SectionData.vue'
const { project_name } = __APP_ENV__
</script>