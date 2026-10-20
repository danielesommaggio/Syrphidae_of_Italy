<template>
  <!-- Printed only: the first page of the PDF -->
  <section class="key-print-only key-front">
    <p class="key-front-site">{{ project }}</p>
    <h1
      class="key-front-title"
      v-html="titleHtml"
    />
    <p
      v-if="scopeHtml"
      class="key-front-scope"
    >
      <span>{{ L.scope }}</span> <span v-html="scopeHtml" />
    </p>
    <p
      v-if="description"
      class="key-front-desc"
    >
      {{ description }}
    </p>
    <p
      v-if="primaryHtml"
      class="key-front-desc"
    >
      <span>{{ L.primary }}</span> <span v-html="primaryHtml" />
    </p>

    <div class="key-front-meta">
      <div>
        <p v-if="authors"><span>{{ L.authors }}</span> {{ authors }}</p>
        <p v-if="version"><span>{{ L.version }}</span> {{ version }}</p>
        <p><span>{{ L.printed }}</span> {{ date }}</p>
        <p class="key-front-cite">
          <span>{{ L.cite }}</span> {{ citation }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

// First page of the printed key: title, scope, authors, version and citation (the QR code
// to the key online is on the last page, so it can be cut off for a submission).
const props = defineProps({
  project: { type: String, default: 'Syrphidae of Italy (SoI)' },
  titleHtml: { type: String, default: '' },
  scopeHtml: { type: String, default: '' },
  description: { type: String, default: '' },
  primaryHtml: { type: String, default: '' },
  authors: { type: String, default: '' },
  version: { type: String, default: '' },
  date: { type: String, default: '' },
  citation: { type: String, default: '' },
  url: { type: String, default: '' },
  lang: { type: String, default: 'en' }
})

const L = computed(() => (props.lang === 'it'
  ? { scope: 'Ambito:', primary: 'Fonte principale:', authors: 'Autori:', version: 'Versione:', printed: 'Stampata il', cite: 'Come citare:', online: 'La chiave aggiornata online' }
  : { scope: 'Scope:', primary: 'Primary source:', authors: 'Authors:', version: 'Version:', printed: 'Printed on', cite: 'How to cite:', online: 'The current key online' }))
</script>
