<template>
  <div class="flex items-center flex-col gap-2 py-3 px-4 group">
    
    <div class="p-2 rounded-full bg-white/10 group-hover:bg-primary/20 transition-colors duration-300">
      <component
        class="h-7 w-7 text-primary-color group-hover:text-primary transition-colors duration-300"
        :is="icon"
      />
    </div>

    <span class="font-medium text-2xl leading-none tabular-nums text-white">
      <ClientOnly>
        <AnimateNumber :number="count" />
      </ClientOnly>
    </span>
    <span class="text-xs uppercase tracking-wider text-white/50 text-center">
      {{ label }}
    </span>
  </div>
</template>

<script setup>
import AnimateNumber from '../../AnimateNumber.vue'

defineProps({
  icon: { type: Object, required: true },
  count: { type: Number, default: 0 },
  label: { type: String, required: true }
})
</script>