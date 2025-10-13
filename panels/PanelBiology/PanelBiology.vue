<template>
  <ClientOnly>
    <div v-if="isLoading" class="min-h-48">
      <VSpinner />
    </div>
  </ClientOnly>

  <div v-if="!isLoading && !Object.keys(contents).length" class="text-xl text-center my-8 w-full">
    No records found.
  </div>

  <div v-if="!isLoading" class="space-y-10">
    <template v-for="(group, groupName) in groupedContents" :key="groupName">
      <!-- Group title -->
      <h2 class="text-2xl font-bold mb-4">{{ groupName }}</h2>

      <!-- Grid of cards, single column for Habitat, 2-3 columns for others -->
      <div
        :class="[
          'grid gap-3',
          groupName === 'Habitat' ? 'grid-cols-1' : 'grid md:grid-cols-2 lg:grid-cols-3'
        ]"
      >
        <template v-for="content in group" :key="content.topic.id">
          <VCard class="h-full flex flex-col">
            <VCardHeader class="border-b border-base-muted">
              {{ content.topic.name }}
            </VCardHeader>

            <VCardContent class="panel-content-list flex-grow">
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

// ✅ Define topic groups
const topicGroups = {
  Habitat: [6429],
  Adult: [6424, 6423, 6432, 6433, 6436, 6438, 6434, 6435, 6439, 6431, 6437],
  Larva: [6422, 6430]
}

// ✅ Flatten topic IDs for sorting
const topicOrder = [
  ...topicGroups.Habitat,
  ...topicGroups['Adult'],
  ...topicGroups.Larva
]

// ✅ Sort contents based on topicOrder
const sortedContents = computed(() =>
  Object.values(contents.value).sort((a, b) => {
    const indexA = topicOrder.indexOf(a.topic.id)
    const indexB = topicOrder.indexOf(b.topic.id)

    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1

    return a.topic.id - b.topic.id
  })
)

// ✅ Group sorted contents by topicGroups for rendering
const groupedContents = computed(() => {
  const groups = {}
  for (const [groupName, ids] of Object.entries(topicGroups)) {
    groups[groupName] = sortedContents.value.filter(c => ids.includes(c.topic.id))
  }
  return groups
})

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
