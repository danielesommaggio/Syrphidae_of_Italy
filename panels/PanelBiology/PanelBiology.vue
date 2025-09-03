<template>
  <VCard>
    <VCardHeader> Biology </VCardHeader>
    <VCardContent>
      <ClientOnly>
        <VSpinner v-if="isLoading" />
      </ClientOnly>
      <div
        v-if="!isLoading && !contents.length"
        class="text-xl text-center my-8 w-full"
      >
        No records found.
      </div>
      <div
        v-for="item in contents"
        class="pt-1 text-sm mb-4"
        v-html="md.render(item.text)"
      />
    </VCardContent>
  </VCard>
</template>

<script setup>
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { makeAPIRequest } from '@/utils'
import markdownit from 'markdown-it'

const props = defineProps({
  otuId: {
    type: Number,
    required: true
  },

  topic_id: {
    type: Number,
    default: undefined
  }
})

const md = markdownit()
const contents = ref([])
const controller = new AbortController()

md.renderer.rules.link_open = () => ''
md.renderer.rules.link_close = () => ''

onBeforeMount(() => {
  makeAPIRequest
    .get('/contents', {
      params: {
        otu_id: [props.otuId],
        topic_id: props.topic_id,
        extend: ['depiction']
      },
      signal: controller.signal
    })
    .then(({ data }) => {
      contents.value = data
    })
    .catch(() => {})
})

onBeforeUnmount(() => {
  controller.abort()
})
</script>
