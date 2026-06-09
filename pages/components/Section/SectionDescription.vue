<script setup lang="ts">
import GbifBar from './GbifBar.vue';
import GbifLatestLiterature from './GbifLatestLiterature.vue';
</script>

<template>
  <section class="bg-base-foreground py-8 sm:py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-5 border border-base-muted rounded-2xl overflow-hidden shadow-sm">

        <!-- Left: Logo panel -->
        <div class="lg:col-span-2 bg-base-secondary border-b lg:border-b-0 lg:border-r border-base-muted flex flex-col items-center justify-between gap-0 py-8 sm:py-12 px-5 sm:px-8">

          <!-- Title at top -->
          <div class="flex flex-col items-center gap-2 text-center pb-6 border-b border-base-muted w-full">
            <h1 class="flex items-baseline gap-2 flex-wrap justify-center">
              <span class="text-2xl sm:text-3xl font-semibold text-base-content tracking-tight">
                Syrphidae of Italy
              </span>
              <span class="text-2xl sm:text-3xl font-semibold text-base-soft tracking-tight">
                (SoI)
              </span>
            </h1>
            <span class="text-xs tracking-[0.25em] uppercase px-3 py-1 rounded-full border border-base-muted text-base-soft">
              Diptera · Syrphidae
            </span>
          </div>

          <!-- Logo -->
          <div class="flex-1 flex items-center justify-center w-full py-6">
            <img
              src="/images/Logo.png"
              alt="Syrphidae of Italy logo"
              class="w-full max-w-[320px] sm:max-w-[500px]"
            />
          </div>

          <!-- Bottom: TaxonWorks credit -->
          <div class="flex flex-col items-center gap-3 text-center pt-6 border-t border-base-muted w-full">
            <span class="text-xs tracking-[0.25em] uppercase text-base-soft">
              Managed in
            </span>
            
             <a href="https://taxonworks.org"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <img
                src="/images/TW.png"
                alt=""
                class="h-12 sm:h-16 w-12 sm:w-16 object-contain"
              />
              <span class="text-xl font-medium text-base-content tracking-wide">TaxonWorks</span>
            </a>
          </div>

        </div>

        <!-- Right: Content panel -->
        <div class="lg:col-span-3 bg-base-foreground flex flex-col py-8 sm:py-12 px-5 sm:px-10 gap-8">

          <!-- About -->
          <div class="flex flex-col gap-1.5 border-l-2 border-base-content pl-4">
            <span class="text-xs tracking-[0.3em] uppercase text-base-soft">
              Diptera · Syrphidae
            </span>
            <h2 class="text-xl sm:text-2xl font-medium text-base-content tracking-tight">
              About the project
            </h2>
          </div>

          <div class="space-y-4 text-base leading-relaxed text-base-soft">
            <p>
              The <strong class="text-base-content font-medium">Syrphidae of Italy (SoI)</strong>
              is a comprehensive database for all available information on Italian hoverflies.
              Managed in
              
              <a  href="https://taxonworks.org"
                target="_blank"
                rel="noopener noreferrer"
                class="text-base-content underline underline-offset-2 hover:opacity-70 transition-opacity"
              >TaxonWorks</a>, it brings together detailed data on
              <strong class="text-base-content font-medium">distribution</strong>,
              <strong class="text-base-content font-medium">nomenclature</strong>, and
              <strong class="text-base-content font-medium">biology</strong>.
            </p>
            <p>
              Driven by the crucial ecological roles of hoverflies — pollination and biological
              pest control — this database merges historical records with new observations to
              support ongoing scientific efforts across Italy.
            </p>
          </div>

          <hr class="border-base-muted" />

          <!-- GBIF -->
          <div class="flex flex-col gap-1.5 border-l-2 border-base-muted pl-4">
            <span class="text-xs tracking-[0.3em] uppercase text-base-soft">
              External data
            </span>
            <h2 class="text-base sm:text-lg font-medium text-base-content tracking-tight">
              GBIF overview
            </h2>
          </div>

          <div class="flex flex-col gap-5">
            <GbifBar />
            <GbifLatestLiterature />
          </div>

          <hr class="border-base-muted" />

          <!-- Partners -->
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5 border-l-2 border-base-muted pl-4">
              <span class="text-xs tracking-[0.3em] uppercase text-base-soft">
                Acknowledgements
              </span>
              <h2 class="text-base sm:text-lg font-medium text-base-content tracking-tight">
                Partners & support
              </h2>
            </div>

            <div class="flex flex-wrap items-center gap-5 sm:gap-8">
              
               <a href="https://speciesfilegroup.org"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:opacity-70 transition-opacity"
              >
                <img
                  src="/images/SFG.png"
                  alt="Species File Group"
                  class="h-14 sm:h-20 object-contain"
                />
              </a>
              
              <a  href="https://www.dolomitipark.it"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:opacity-70 transition-opacity"
              >
                <img
                  src="/images/DolomitiBellunesi.png"
                  alt="Parco Nazionale Dolomiti Bellunesi"
                  class="h-14 sm:h-20 object-contain"
                />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>