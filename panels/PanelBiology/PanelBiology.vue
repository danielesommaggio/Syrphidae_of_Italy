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
    <!-- Group: Habitat & Conservation (side by side) -->
    <div v-if="contents[6429] || contents[6440]">
      <h2 class="text-2xl font-bold mb-4">Habitat & Conservation</h2>

      <div class="grid gap-3 grid-cols-1 md:grid-cols-5">
        <!-- Habitat card: takes 3/4 width -->
        <div class="md:col-span-4">
          <VCard v-if="contents[6429]" class="h-full flex flex-col">
            <VCardHeader class="border-b border-base-muted">
              {{ contents[6429].topic.name }}
            </VCardHeader>
            <VCardContent class="panel-content-list flex-grow">
              <div
                v-for="(item, index) in contents[6429].list"
                :key="index"
                class="pt-1 text-sm"
                v-html="item.text"
              ></div>
            </VCardContent>
          </VCard>
        </div>

        <!-- Red List card: takes 1/4 width -->
        <div class="md:col-span-1">
          <VCard v-if="contents[6440]" class="h-full flex flex-col items-center justify-center text-center">
            <VCardHeader class="border-b border-base-muted">
              Red List Category
            </VCardHeader>
            <VCardContent class="flex flex-col items-center justify-center py-5">
              <template v-for="(item, index) in contents[6440].list" :key="index">
                <img
                  :src="redListIcons[item.text] || redListIcons.Unknown"
                  :alt="item.text"
                  class="h-12 w-12 mb-2"
                />
                <span class="text-sm font-medium">{{ item.text }}</span>
              </template>
            </VCardContent>
          </VCard>
        </div>
      </div>
    </div>

    <!-- Other groups -->
    <template v-for="(group, groupName) in otherGroups" :key="groupName">
      <h2 class="text-2xl font-bold mb-4">{{ groupName }}</h2>
      <div class="grid gap-3 grid md:grid-cols-2 lg:grid-cols-3">
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

// ✅ Red List icons
const redListIcons = {
  'Least Concern': '/images/redlist/LeastConcern.png',
  'Near Threatened': '/images/redlist/NearThreatened.png',
  'Vulnerable': '/images/redlist/Vulnerable.png',
  'Endangered': '/images/redlist/Endangered.png',
  'Critically Endangered': '/images/redlist/CriticallyEndangered.png',
  'Extinct': '/images/redlist/Extinct.png',
  'Data Deficient': '/images/redlist/DataDeficient.png',
  'Not Evaluated': '/images/redlist/NotEvaluated.png'
}

// ✅ Topic groups (no 6440 in Habitat now)
const topicGroups = {
  Adult: [6424, 6423, 6432, 6433, 6436, 6438, 6434, 6435, 6439, 6431, 6437],
  Larva: [6422, 6430]
}

const topicOrder = [6429, 6440, ...topicGroups.Adult, ...topicGroups.Larva]

// ✅ Sort contents
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

// ✅ Filter out Habitat & 6440 for custom layout
const otherGroups = computed(() => {
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
      const topic = topics.find(t => t.id == current.topic_id)
      if (!topic) return acc
      if (acc[topic.id]) acc[topic.id].list.push(current)
      else
        acc[topic.id] = {
          topic: {
            id: topic.id,
            name: topic.name,
            definition: topic.definition
          },
          list: [current]
        }
      return acc
    }, {})
  } catch {
    // Silent fail
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => controller.abort())
</script>
