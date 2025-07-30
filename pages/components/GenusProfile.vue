<template>
  <div class="max-w-screen-xl mx-auto font-serif px-4 sm:px-6 lg:px-8">

    <!-- Header -->
<div class="py-5 border-b border-gray-300 flex items-center justify-between">
  <h2 class="text-2xl sm:text-3xl font-bold">
    <i>{{ genusName }}</i>
    <span class="text-base sm:text-lg font-normal text-gray-600 ml-2">{{ authority }}</span>
  </h2>

  <!-- Link to genus page (change :to to your route or URL) -->
<div v-if="genusLink" class="mt-1">
<router-link
  :to="genusLink"
  class="inline-flex items-center gap-2 px-4 py-2 bg-orange-400 text-white font-serif rounded-full shadow-md hover:bg-green-700 transition-colors duration-300"
>
  <span class="text-base">Explore SoI Data</span>
</router-link>
</div>


</div>

    <!-- Section Cards -->
    <section v-if="introduction" class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">General</h3>
      <div v-html="introduction" class="prose max-w-none" />
    </section>

    <section v-if="diagnosis" class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Diagnosis</h3>
      <div v-html="diagnosis" class="prose max-w-none"/>
    </section>

    <section v-if="description" class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Description</h3>
      <div v-html="description" class="prose max-w-none" />
    </section>

    <section v-if="biology" class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Biology</h3>
      <div v-html="biology" class="prose max-w-none"/>
    </section>

    <section v-if="biodiversity" class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Biodiversity and distribution</h3>
      <div v-html="biodiversity" class="prose max-w-none"/>
    </section>

    <section v-if="italianBiodiversity" class="mt-6 mb-10 p-4 sm:p-6 border rounded-lg shadow-sm bg-white">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Italian Biodiversity</h3>
      <div v-html="italianBiodiversity" class="prose max-w-none"/>
    </section>

  </div>
</template>

<script>
export default {
  name: 'GenusProfile',
  props: {
    genusName: String,
    authority: String,
    genusLink: String,
    introduction: String,
    diagnosis: String,
    description: String,
    biology: String,
    biodiversity: String,
    italianBiodiversity: String,
  }
}
</script>
