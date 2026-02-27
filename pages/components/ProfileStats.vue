<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
    <!-- Panel 1: # Species Worldwide -->
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col items-center justify-center rounded-xl p-4 bg-green-200/20 text-green-800 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <span class="text-3xl block">🪰</span>
        <div class="text-3xl font-bold">{{ animatedNumSpecies }}</div>
        <div class="text-sm"># Species Worldwide</div>
      </div>

      <!-- Panel 2: # Species in Italy -->
      <div
        class="flex flex-col items-center justify-center rounded-xl p-4 bg-red-200/20 text-red-800 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect
            x="3"
            y="4"
            width="6"
            height="16"
            fill="#008C45"
          />
          <rect
            x="9"
            y="4"
            width="6"
            height="16"
            fill="#F4F5F0"
          />
          <rect
            x="15"
            y="4"
            width="6"
            height="16"
            fill="#CD212A"
          />
        </svg>
        <div class="text-3xl font-bold">{{ animatedNumSpeciesIta }}</div>
        <div class="text-sm"># Species in Italy</div>
      </div>

      <!-- Panel 3: Distribution -->
      <div
        class="flex flex-col items-center justify-center rounded-xl p-4 bg-blue-200/20 text-blue-800 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <span class="text-3xl block mb-4 leading-none">🌍</span>
        <div class="flex flex-wrap justify-center gap-3 mb-2">
          <span
            v-for="region in distribution"
            :key="region"
            class="px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer"
            :class="distributionClassMap[region] ?? 'bg-gray-200 text-gray-700'"
          >
            {{ region }}
          </span>
        </div>
        <div class="text-sm">Distribution</div>
      </div>
    </div>
    <div
      id="panel-map"
      class="md:col-span-2 h-500 sm:h-auto"
    >
      <PanelDistribution
        class="h-full"
        :otu-id="otuId"
        :taxon="{}"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from 'vue'
import PanelDistribution from '@/modules/otus/components/Panel/PanelMap/PanelMap.vue'

const props = defineProps({
  numSpecies: [Number, String],
  numSpeciesIta: [Number, String],
  distribution: {
    type: Array,
    default: () => []
  },
  distributionClassMap: {
    type: Object,
    default: () => ({})
  },
  otuId: {
    type: Number,
    required: true
  },
  profile: Object
})

// Animated numbers
const animatedNumSpecies = ref(0)
const animatedNumSpeciesIta = ref(0)

function animateNumber(target, refVar, duration = 1200) {
  const start = 0
  const end = Number(target) || 0
  const stepTime = Math.max(Math.floor(duration / end), 20)
  let current = start
  const timer = setInterval(() => {
    current++
    refVar.value = current
    if (current >= end) clearInterval(timer)
  }, stepTime)
}

onMounted(() => {
  animateNumber(props.numSpecies, animatedNumSpecies)
  animateNumber(props.numSpeciesIta, animatedNumSpeciesIta)
})
</script>

<style scoped>
:deep(#panel-map) {
  box-sizing: content-box;
  button:first-of-type {
    display: none;
  }
}
</style>
