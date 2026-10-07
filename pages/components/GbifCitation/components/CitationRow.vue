<template>
  <tr class="gbif-citations__row">
    <td class="gbif-citations__cell">
      <div :class="{ 'gbif-citations__skeleton': loading }">
        <div>
          <template v-if="link == null">{{ item.title }}</template>
          <a
            v-else
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ item.title }} <MaterialIcon
              name="link"
              class="inline"
            />
          </a>
        </div>
        <div class="gbif-citations__authors">{{ authors }}</div>
        <span class="gbif-citations__abstract">{{ abstract }}</span>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { getAuthors, getLink, getTruncatedAbstract } from '../utils/citation.js'
import MaterialIcon from './MaterialIcon.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },

  loading: {
    type: Boolean,
    default: false
  }
})

const link = computed(() => getLink(props.item))
const authors = computed(() => getAuthors(props.item))
const abstract = computed(() => getTruncatedAbstract(props.item))
</script>
