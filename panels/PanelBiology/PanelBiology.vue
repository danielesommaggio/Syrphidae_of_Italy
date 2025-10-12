<template>
  <ClientOnly>
    <div v-if="isLoading" class="min-h-48">
      <VSpinner />
    </div>
  </ClientOnly>

  <div v-if="!isLoading && !Object.keys(contents).length" class="text-xl text-center my-8 w-full">
    No records found.
  </div>

  <div v-if="!isLoading">
    <template
      v-for="(content, key) in sortedContents"
      :key="key"
    >
      <VCard class="mb-4">
        <VCardHeader class="border-b border-base-muted">
          {{ content.topic.name }}
        </VCardHeader>

        <VCardContent class="panel-content-list">
          <div
            v-for="(item, index) in content.list"
            :key="index"
            class="pt-1 text-sm"
            v-html="item.text"
          ></div>
        </VCardContent>
      </VCard>
    </template>
  </div>
</template>

<script setup>
import { makeAPIRequest } from '@/utils'
import markdownit from 'markdown-it'
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  otuId: {
    type: Number,
    required: true
  },
  topic_id: {
    type: [Array, Number],
    default: undefined
  }
})

const md = markdownit()
const contents = ref({})
const isLoading = ref(false)
const controller = new AbortController()

md.renderer.rules.link_open = () => ''
md.renderer.rules.link_close = () => ''

// ✅ Computed property to sort topics alphabetically by name
const sortedContents = computed(() =>
  Object.values(contents.value).sort((a, b) =>
    a.topic.name.localeCompare(b.topic.name)
  )
)

onBeforeMount(async () => {
  try {
    isLoading.value = true

    const { data: topics } = await makeAPIRequest.get('/controlled_vocabulary_terms', {
      params: { type: 'Topic' }
    })

    const { data } = await makeAPIRequest.get('/contents', {
      params: {
        otu_id: [props.otuId],
        topic_id: [props.topic_id].flat(),
        extend: ['depiction']
      },
      signal: controller.signal
    })

    contents.value = data.reduce((acc, current) => {
      const topic = topics.find((t) => t.id == current.topic_id)
      if (!topic) return acc

      if (acc[topic.id]) {
        acc[topic.id].list.push(current)
      } else {
        acc[topic.id] = {
          topic: {
            id: topic.id,
            name: topic.name,
            definition: topic.definition
          },
          list: [current]
        }
      }
      return acc
    }, {})
  } catch {
    // Handle silently
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  controller?.abort()
})
</script>
