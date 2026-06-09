<template>
  <section class="bg-base-foreground py-10 px-4">
    <div class="container mx-auto max-w-4xl flex flex-col gap-6">

      <!-- Section header -->
      <div class="flex flex-col gap-1.5 border-l-2 border-base-content pl-4">
        <span class="text-xs tracking-[0.25em] uppercase text-base-soft">Latest</span>
        <h2 class="text-xl sm:text-2xl font-medium text-base-content tracking-tight">
          Highlights
        </h2>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <!-- News & Updates -->
        <VCard class="border border-base-muted rounded-2xl bg-base-secondary">
          <VCardContent class="flex flex-col gap-3 p-6">
            <div class="flex flex-col gap-1.5 border-l-2 border-base-muted pl-4">
              <span class="text-xs tracking-[0.25em] uppercase text-base-soft">News</span>
              <h3 class="text-lg font-medium text-base-content tracking-tight">
                News & Updates
              </h3>
            </div>
            <time
              class="text-xs tracking-[0.2em] uppercase text-base-soft"
              :datetime="todayISO"
            >
              Updated: {{ todayFormatted }}
            </time>
            <p class="text-sm leading-relaxed text-base-soft">
              Stay up to date with the latest developments, new records, and ongoing work
              on the Syrphidae of Italy project.
            </p>
            <RouterLink
              to="/news"
              class="inline-flex items-center gap-2 text-sm font-medium text-base-content border border-base-muted rounded-lg px-4 py-2 hover:bg-base-muted transition-colors self-start mt-auto"
            >
              <i class="ti ti-arrow-right" style="font-size: 15px;" aria-hidden="true"></i>
              News section
            </RouterLink>
          </VCardContent>
        </VCard>

        <!-- TaxonWorks -->
        <VCard class="border border-base-muted rounded-2xl bg-base-secondary">
          <VCardContent class="flex flex-col gap-3 p-6">
            <div class="flex flex-col gap-1.5 border-l-2 border-base-muted pl-4">
              <span class="text-xs tracking-[0.25em] uppercase text-base-soft">Platform</span>
              <h3 class="text-lg font-medium text-base-content tracking-tight">
                SoI in TaxonWorks
              </h3>
            </div>
            <time
              datetime="2023-04-17"
              class="text-xs tracking-[0.2em] uppercase text-base-soft"
            >
              Updated: April 17, 2023
            </time>
            <p class="text-sm leading-relaxed text-base-soft">
              Built on the TaxonWorks platform, providing powerful tools for data
              exploration, filtering, reporting, and collaborative research. For deeper
              access or advanced functionality:
            </p>
            <RouterLink
              to="/about"
              class="inline-flex items-center gap-2 text-sm font-medium text-base-content border border-base-muted rounded-lg px-4 py-2 hover:bg-base-muted transition-colors self-start mt-auto"
            >
              <i class="ti ti-arrow-right" style="font-size: 15px;" aria-hidden="true"></i>
              Contact us
            </RouterLink>
          </VCardContent>
        </VCard>

      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const todayFormatted = ref('')
const todayISO = ref('')

onMounted(() => {
  const d = new Date()
  todayFormatted.value = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  todayISO.value = d.toISOString().split('T')[0]
})
</script>