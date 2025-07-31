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

  <div class="mt-1 flex gap-2 items-center">
    <!-- Key to the Species Button -->
    <template v-if="profile.keyUrl">
      <RouterLink
        :to="profile.keyUrl"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-serif rounded-full shadow-md hover:bg-green-700 transition-colors duration-300"
      >
        <span class="text-base">Key to Species</span>
      </RouterLink>
    </template>
    <template v-else>
      <button
        disabled
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 font-serif rounded-full shadow-inner cursor-not-allowed"
      >
        <span class="text-base">Key to Species</span>
      </button>
    </template>

    <!-- Explore SoI Data Button -->
    <RouterLink
      v-if="profile.url"
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
