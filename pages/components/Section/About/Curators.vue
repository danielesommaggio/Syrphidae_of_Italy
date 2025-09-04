<template>
  <section class="container max-w-screen-xl mx-auto py-5 px-4 sm:px-10 bg-white rounded-lg shadow-lg mt-12 mb-10">
    <h1
      class="text-4xl font-semibold text-gray-900 tracking-tight relative inline-block mb-6"
    >
      Meet the team
      <span
        class="absolute left-0 -bottom-1 h-[2px] w-16 bg-yellow-500 rounded"
        aria-hidden="true"
      ></span>
    </h1>

    <!-- flex wrapper that centers the grid -->
    <div class="flex">
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 w-fit mx-auto">
        <div
          v-for="curator in curators"
          :key="curator.email"
          class="flex flex-col items-center text-center p-6 bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <img
            :src="curator.image || defaultImage"
            :alt="curator.name"
            class="w-28 h-28 rounded-full object-cover border-2 border-gray-300 mb-5"
          />
          <h4 class="text-lg font-semibold text-gray-900 mb-1">{{ curator.name }}</h4>
          <p class="text-sm text-gray-600 mb-1">{{ curator.affiliation }}</p>
          <p class="text-sm text-gray-700 mb-3 font-medium">{{ curator.role }}</p>
          <a :href="'mailto:' + curator.email" class="text-blue-600 hover:underline mb-2">
            {{ curator.email }}
          </a>
          <a
            v-if="curator.url"
            :href="curator.url"
            target="_blank"
            rel="noopener"
            class="text-sm text-blue-500 hover:underline"
          >
            View profile
          </a>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import curators from '../Data/curators.js';

const defaultImage = 'https://via.placeholder.com/96?text=Photo';
</script>
