<template>
  <section>
    <div class="mx-auto mb-12 prose !container dark:prose-invert">
      <h2 class="px-4 sm:px-0 text-gray-900">Highlights</h2>
      <div class="flex gap-4 flex-col">

        <VCard>
          <VCardContent class="relative">
            <div class="flex items-center space-x-2 mb-1">
              <!-- Animated Attention Icon -->
              <h3 class="mt-2 mb-0 text-lg font-semibold">News & Updates</h3>
            </div>

            <time class="text-base-soft block mb-3 italic text-sm" datetime="2023-10-09">
                    Updated: {{ todayFormatted }}
            </time>

            <p>
Stay up to date with the latest developments, new records, and ongoing work on the Syrphidae of Italy project.
Visit the
<router-link to="/news" class="no-underline hover:underline hover:text-red-400 transition">
News section
</router-link>
to explore recent additions, announcements, and project highlights.
            </p>
          </VCardContent>
        </VCard>

        <VCard>
          <VCardContent>
            <h3 class="mt-2 mb-1 font-semibold text-lg">Syrphidae of Italy in TaxonWorks</h3>
            <time datetime="2023-04-17" class="block text-sm text-base-soft mb-3 italic">
              Updated: April 17, 2023
            </time>
            <p>
The Syrphidae of Italy project is built on the TaxonWorks platform, which provides powerful tools for data exploration, filtering, reporting, and collaborative research.
If you require deeper access to the dataset or advanced functionality, please
<router-link to="/about" class="no-underline hover:underline hover:text-red-400 transition">
contact us
</router-link>.
As the project grows, this site will continue to expand and incorporate more of the advanced features available within TaxonWorks.
            </p>
          </VCardContent>
        </VCard>

      </div>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'

const todayFormatted = ref('')

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  todayFormatted.value = formatDate(new Date())
})
</script>