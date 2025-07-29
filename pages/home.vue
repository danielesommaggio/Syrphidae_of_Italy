<template>
    <div class="h-full">
      <SectionLandscape />
      <SectionData />
      <hr class="border-base-muted" />
      <SectionDescription class="border-b "/>
      <SectionHighlights class="drop-shadow" />
      <SectionTerms class="drop-shadow" />
    </div>
  </template>
  <script setup>
  import SectionData from './components/Section/SectionData.vue'
import SectionDescription from './components/Section/SectionDescription.vue'
import SectionHighlights from './components/Section/SectionHighlights.vue'
import SectionLandscape from './components/Section/SectionLandscape.vue'
import SectionTerms from './components/Section/SectionTerms.vue'
  </script>