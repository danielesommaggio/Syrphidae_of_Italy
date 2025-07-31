<template>
  <div class="max-w-screen-xl mx-auto font-serif px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div
      class="py-5 border-b border-gray-300 flex items-center justify-between"
    >
      <h2 class="text-2xl sm:text-3xl font-bold">
        <i>{{ profile.taxonName }}</i>
        <span class="text-base sm:text-lg font-normal text-gray-600 ml-2">
          {{ profile.author }}
        </span>
      </h2>

      <!-- Link to genus page (change :to to your route or URL) -->
      <div
        v-if="profile.url"
        class="mt-1"
      >
        <RouterLink
          :to="profile.url"
          class="inline-flex items-center gap-2 px-4 py-2 bg-orange-400 text-white font-serif rounded-full shadow-md hover:bg-green-700 transition-colors duration-300"
        >
          <span class="text-base">Explore SoI Data</span>
        </RouterLink>
      </div>
    </div>

    <template v-for="(title, key) in SECTIONS">
      <section
        v-if="profile[key]"
        class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white"
      >
        <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          {{ title }}
        </h3>
        <div
          v-html="profile[key]"
          class="prose max-w-none"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
const SECTIONS = {
  introduction: 'General',
  diagnosis: 'Diagnosis',
  description: 'Description',
  biology: 'Biology',
  biodiversity: 'Biodiversity and distribution',
  italianBiodiversity: 'Italian Biodiversity'
}
const props = defineProps({
  profile: Object
})
</script>
