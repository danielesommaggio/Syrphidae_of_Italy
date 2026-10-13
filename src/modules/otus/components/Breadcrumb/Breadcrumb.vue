<template>
  <nav aria-label="Breadcrumb">
  <ul class="breadcrumb inline-flex items-center flex-wrap">
    <li
      v-for="([item], key, index) in trail"
      :key="item.id"
      class="inline-flex items-center"
    >
      <IconArrowRight
        v-if="index"
        class="w-3 h-3 mr-0.5 ml-0.5 opacity-50"
      />
      <RouterLink
        class="inline-flex items-center text-[0.82rem] font-semibold !text-[color:var(--soi-ink-soft)] hover:!text-[color:var(--soi-ink)] hover:underline underline-offset-2"
        :to="{ name: 'otus-id', params: { id: item.id } }"
      >
        {{ key }}
      </RouterLink>
    </li>
    <li class="inline-flex items-center ml-0 text-[0.82rem]">
      <IconArrowRight class="w-3 h-3 mr-0.5 ml-0.5 opacity-50" />
      <span v-html="current.full_name_tag" />
    </li>
  </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  list: {
    type: Object,
    default: () => ({})
  },

  current: {
    type: Object,
    required: true
  }
})

// "Root" is a TaxonWorks placeholder, not a real rank — hide it
const trail = computed(() =>
  Object.fromEntries(Object.entries(props.list || {}).filter(([k]) => k !== 'Root'))
)
</script>
