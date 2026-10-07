<template>
  <div class="gbif-citations__footer">
    <div class="gbif-citations__footer-side">
      <template v-if="hasPreviousPage">
        <button
          type="button"
          class="gbif-citations__footer-button"
          title="First page"
          :disabled="loading"
          @click="page = 1"
        >
          <MaterialIcon name="firstPage" />
        </button>
        <button
          type="button"
          class="gbif-citations__footer-button"
          title="Previous"
          :disabled="loading"
          @click="page--"
        >
          <MaterialIcon name="chevronLeft" />
        </button>
      </template>
    </div>
    <div :class="{ 'gbif-citations__skeleton': loading }">
      <span class="gbif-citations__page-label">
        {{ pageCount == null ? 'Loading' : `Page ${formatNumber(page)} of ${formatNumber(pageCount)}` }}
      </span>
    </div>
    <div class="gbif-citations__footer-side gbif-citations__footer-side--end">
      <button
        v-if="hasNextPage"
        type="button"
        class="gbif-citations__footer-button"
        title="Next"
        :disabled="loading"
        @click="page++"
      >
        <MaterialIcon name="chevronRight" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MaterialIcon from './MaterialIcon.vue'

const props = defineProps({
  total: {
    type: Number,
    default: null
  },

  perPage: {
    type: Number,
    required: true
  },

  loading: {
    type: Boolean,
    default: false
  }
})

const page = defineModel({ type: Number, default: 1 })

// Same rules as gbif-web searchTable/hooks/usePagination.tsx
const pageCount = computed(() =>
  props.total ? Math.ceil(props.total / props.perPage) : null
)
const hasPreviousPage = computed(() => !!pageCount.value && page.value > 1)
const hasNextPage = computed(
  () => !!pageCount.value && page.value < pageCount.value
)

function formatNumber(value) {
  return value.toLocaleString()
}
</script>
