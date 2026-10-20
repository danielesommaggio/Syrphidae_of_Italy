<template>
  <section
    v-if="taxa.length"
    class="key-taxa mt-8 border-t border-base-muted pt-4 [&_i]:italic"
  >
    <div class="flex items-baseline justify-between gap-3">
      <h2 class="text-base font-semibold text-base-content">
        {{ L.title }} ({{ taxa.length }})
      </h2>
      <button
        type="button"
        class="key-print-hide text-sm text-secondary hover:underline"
        @click="open = !open"
      >
        {{ open ? L.hide : L.show }}
      </button>
    </div>
    <p class="mt-1 text-sm text-base-soft">
      {{ L.help }}
    </p>
    <ol
      class="key-taxa-list mt-3 columns-1 sm:columns-2 gap-8 text-sm"
      :class="{ 'hidden': !open }"
    >
      <li
        v-for="t in taxa"
        :key="t.otuId"
        class="break-inside-avoid py-0.5"
      >
        <RouterLink
          :to="{ name: 'otus-id', params: { id: t.otuId } }"
          class="text-secondary hover:underline"
        ><i>{{ t.label }}</i></RouterLink>
        <span class="text-base-soft"> — {{ L.at }} </span>
        <template
          v-for="(c, i) in t.couplets"
          :key="c"
        >
          <RouterLink
            :to="{ name: 'dichotomous-key', params: { id: keyId, couplet: c } }"
            class="tabular-nums hover:underline"
          >{{ c }}</RouterLink><span v-if="i < t.couplets.length - 1">, </span>
        </template>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

// Every taxon the key leads to, alphabetical, with the couplet(s) where it comes out.
// Collapsed on screen; always printed (index of the PDF).
const props = defineProps({
  taxa: { type: Array, default: () => [] },
  keyId: { type: [String, Number], required: true },
  lang: { type: String, default: 'en' }
})
const open = ref(false)
const L = computed(() => (props.lang === 'it'
  ? { title: 'Taxa in questa chiave', show: 'Mostra', hide: 'Nascondi', help: 'In ordine alfabetico, con la coppia (o le coppie) a cui si arriva.', at: 'coppia' }
  : { title: 'Taxa in this key', show: 'Show', hide: 'Hide', help: 'Alphabetical, with the couplet(s) where each taxon keys out.', at: 'couplet' }))
</script>
