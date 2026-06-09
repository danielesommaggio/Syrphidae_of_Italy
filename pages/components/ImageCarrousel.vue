<template>
  <div class="overflow-hidden h-[550px] w-full">
    <img
      class="object-cover overflow-hidden h-[550px] w-full absolute"
      :key="currentImage.src"
      :src="currentImage.src"
      alt="Dichroplus maculipennis"
    />
    <div class="absolute h-full w-full top-0" style="background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 100%);">
      <slot />
    </div>

    <!-- Image credit — top right -->
    <div class="absolute top-4 right-4 z-10">
      <RouterLink
        v-if="currentImage.otuId"
        :to="{ name: 'otus-id', params: { id: currentImage.otuId } }"
        class="flex items-center gap-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors duration-200 rounded-lg px-3 py-1.5 no-underline"
      >
        <div class="flex flex-col items-end">
          <i class="text-white text-sm font-medium">{{ currentImage.label }}</i>
          <span class="text-white/50 text-xs">© {{ currentImage.copyright }}</span>
        </div>
        <i class="ti ti-camera text-white/50 text-base" aria-hidden="true"></i>
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import scaeva from './images/scaeva.jpg'

const props = defineProps({
  duration: {
    type: Number,
    default: 5000
  }
})

const images = [

  {
    label: 'Scaeva',
    copyright: 'Serena Magagnoli',
    src: scaeva,
    otuId: 950165
  }
]

const currentIndex = ref(null)
const currentImage = computed(() => images[currentIndex.value] || {})

onMounted(() => {
  currentIndex.value = Math.floor(Math.random() * images.length)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter-from {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
