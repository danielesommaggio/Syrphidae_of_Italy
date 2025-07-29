<template>
  <section>
    <div class="mx-auto mb-12 prose !container dark:prose-invert">
      <h2 class="px-4 sm:px-0 text-gray-900">Highlights</h2>
      <div class="flex gap-4 flex-col">

        <VCard>
          <VCardContent class="relative">
            <div class="flex items-center space-x-2 mb-1">
              <!-- Animated Attention Icon -->
              <h3 class="mt-2 mb-0 text-lg font-semibold">Taxa Completed</h3>
              <svg
                class="w-5 h-5 text-yellow-500 animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.764-1.36 2.682-1.36 3.446 0l6.518 11.607c.75 1.336-.213 2.994-1.732 
                  2.994H3.471c-1.52 0-2.482-1.658-1.732-2.994L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <time class="text-base-soft block mb-3 italic text-sm" datetime="2023-10-09">
                    Updated: {{ todayFormatted }}
            </time>

            <p>
              Not all the subfamilies are completed, meaning some names are missing.
              Therefore, before citing the contents, make sure to take a look at the
              document here.
            </p>
          </VCardContent>
        </VCard>

        <VCard>
          <VCardContent>
            <h3 class="mt-2 mb-1 font-semibold text-lg">Syrphidae of Italy Powered by TaxonWorks</h3>
            <time datetime="2023-04-17" class="block text-sm text-base-soft mb-3 italic">
              Updated: April 17, 2023
            </time>
            <p>
              Syrphidae of Italy lives in TaxonWorks.
              The interfaces of TaxonWorks include a wide range of additional
              filtering and reporting functionalities. Please
              <router-link to="/about" class="no-underline hover:underline hover:text-red-400 transition">
                contact us
              </router-link>
              if you need extended access to the data. Over time we expect
              this site to gradually mirror these extended functionalities of
              TaxonWorks.
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