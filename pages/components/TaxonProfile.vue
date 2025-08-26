<template>
  <div class="max-w-screen-xl mx-auto font-serif px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="py-5 border-b border-gray-300 flex items-center justify-between">
      <h2 class="text-2xl sm:text-3xl font-bold">
        <i>{{ profile.taxonName }}</i>
        <span class="text-base sm:text-lg font-normal text-gray-600 ml-2">
          {{ profile.author }}
        </span>
      </h2>

      <div class="mt-1 flex gap-2 items-center relative">
        <!-- Single Key to Species Button -->
        <button
          @click="isModalOpen = true"
          class="inline-flex items-center gap-2 px-4 py-2 font-serif rounded-full shadow-md bg-red-600 text-white hover:bg-red-400 transition-colors duration-300"
        >
          <span class="text-base">Key to Species</span>
        </button>

        <!-- Explore SoI Data Button -->
        <RouterLink
          v-if="profile.url"
          :to="profile.url"
          class="inline-flex items-center gap-2 px-4 py-2 bg-orange-400 text-white font-serif rounded-full shadow-md hover:bg-orange-300 transition-colors duration-300"
        >
          <span class="text-base">Explore SoI Data</span>
        </RouterLink>
      </div>
    </div>

    <!-- Sections -->
    <template v-for="(title, key) in SECTIONS">
      <section
        v-if="profile[key]"
        :key="key"
        class="mt-6 p-4 sm:p-6 border rounded-lg shadow-sm bg-white mb-10"
      >
        <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          {{ title }}
        </h3>

        <div
          v-if="key !== 'references'"
          v-html="profile[key]"
          class="prose max-w-none"
        />

        <div v-else class="space-y-2">
          <p
            v-for="(ref, i) in profile.references"
            :key="i"
            class="text-sm text-gray-800 leading-snug pl-6 text-justify"
            style="text-indent: -1.5rem;"
          >
            {{ ref }}
          </p>
        </div>
      </section>
    </template>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-80 sm:w-96 relative">
        <h3 class="text-lg text-gray-800 font-semibold mb-4">Choose Language</h3>

        <div class="flex flex-col gap-3">
          <component
            :is="profile.keyUrl ? 'RouterLink' : 'button'"
            :to="profile.keyUrl || undefined"
            :disabled="!profile.keyUrl"
            class="w-full text-center px-1 py-2 rounded-full text-white font-semibold transition-colors duration-200"
            :class="profile.keyUrl
                    ? 'bg-yellow-500 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'"
            @click="isModalOpen = false"
          >
            🇮🇹 Italian version
          </component>

          <component
            :is="profile.keyUrlEN ? 'RouterLink' : 'button'"
            :to="profile.keyUrlEN || undefined"
            :disabled="!profile.keyUrlEN"
            class="w-full text-center px-1 py-2 rounded-full text-white font-semibold transition-colors duration-200"
            :class="profile.keyUrlEN
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'"
            @click="isModalOpen = false"
          >
            🇬🇧 English version
          </component>
        </div>

        <!-- Close button -->
        <button
          @click="isModalOpen = false"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const SECTIONS = {
  introduction: 'General',
  diagnosis: 'Diagnosis',
  description: 'Description',
  biology: 'Biology',
  biodiversity: 'Biodiversity and distribution',
  italianBiodiversity: 'Italian Biodiversity',
  references: 'References'
}

const props = defineProps({
  profile: Object
})

const isModalOpen = ref(false)
</script>
