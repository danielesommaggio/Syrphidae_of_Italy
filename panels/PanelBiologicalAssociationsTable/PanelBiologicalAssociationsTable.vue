<template>
  <VCard class="soi-bat">
    <VCardHeader>
      {{ t('title') }} <span class="opacity-60 tabular-nums">({{ statements.length }})</span>
    </VCardHeader>
    <VCardContent>
      <ClientOnly>
        <VSpinner v-if="isLoading" />
      </ClientOnly>

      <p
        v-if="!isLoading && !statements.length"
        class="text-sm text-base-content/60"
      >
        {{ t('none') }}
      </p>

      <template v-else-if="statements.length">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <div
            class="flex flex-wrap gap-1.5"
            role="group"
            :aria-label="t('filterBy')"
          >
            <button
              v-for="g in allGroups"
              :key="g.key"
              type="button"
              :class="['bat-chip', { off: hiddenGroups.has(g.key) }]"
              :aria-pressed="!hiddenGroups.has(g.key)"
              @click="toggle(hiddenGroups, g.key)"
            >
              <span
                class="bat-swatch"
                :class="{ dashed: !g.slot }"
                :style="{ '--c': colorOf(g.slot) }"
              />
              {{ g.label }} <span class="opacity-60 tabular-nums">{{ g.count }}</span>
            </button>
          </div>
          <div
            v-if="allProperties.length"
            class="flex flex-wrap gap-1.5"
            role="group"
            :aria-label="t('filterStage')"
          >
            <button
              v-for="p in allProperties"
              :key="p.name"
              type="button"
              :class="['bat-chip', { off: hiddenProps.has(p.name) }]"
              :aria-pressed="!hiddenProps.has(p.name)"
              @click="toggle(hiddenProps, p.name)"
            >
              <span class="bat-pill bat-pill-sm">{{ p.label }}</span>
              <span class="opacity-60 tabular-nums">{{ p.count }}</span>
            </button>
          </div>
          <label
            v-if="statements.length > 8"
            class="bat-search"
          >
            <span class="sr-only">{{ t('find') }}</span>
            <input
              v-model="query"
              type="search"
              :placeholder="t('find')"
            />
          </label>
          <button
            type="button"
            class="bat-btn ml-auto"
            :title="t('csvTitle')"
            @click="downloadCsv"
          >
            ↓ CSV
          </button>
        </div>

        <!-- One section per relationship -->
        <section
          v-for="g in groups"
          :key="g.key"
          class="mb-6 last:mb-0"
        >
          <header class="bat-group">
            <span
              class="bat-swatch"
              :class="{ dashed: !g.slot }"
              :style="{ '--c': colorOf(g.slot) }"
            />
            <span class="font-bold">{{ g.label }}</span>
            <span class="opacity-60">({{ g.rows.length }})</span>
            <a
              v-if="g.term"
              :href="g.term.url"
              target="_blank"
              rel="noopener"
              class="bat-term"
              :title="t('roTitle')"
              >RO: {{ g.term.label }}<span v-if="g.term.broader"> ({{ t('broader') }})</span> ↗</a
            >
          </header>
          <p
            v-if="g.definition"
            class="bat-def"
          >
            {{ g.definition }}
          </p>

          <div
            class="bat-table"
            :class="{ 'has-area': hasAreas }"
            role="table"
          >
            <div
              class="bat-head"
              role="row"
            >
              <span role="columnheader">{{ t('subject') }}</span>
              <span
                role="columnheader"
                class="text-center"
                >{{ t('relationship') }}</span
              >
              <span role="columnheader">{{ t('object') }}</span>
              <span
                v-if="hasAreas"
                role="columnheader"
                >{{ t('area') }}</span
              >
              <span role="columnheader">{{ t('evidence') }}</span>
            </div>

            <div
              v-for="r in g.rows"
              :key="r.key"
              :class="['bat-row', { on: isLit(r), dim: bus.pinnedSource && !r.citations.some((c) => c.id === bus.pinnedSource) }]"
              role="row"
              @mouseenter="bus.hover = { partner: r.partner.name, relationship: r.relationship, from: 'table' }"
              @mouseleave="bus.hover?.from === 'table' && (bus.hover = null)"
            >
              <!-- Subject -->
              <span
                role="cell"
                class="bat-side"
              >
                <TaxonCell
                  :side="r.subject"
                  :t="t"
                  @open="openViewer"
                />
              </span>

              <!-- Relationship -->
              <span
                role="cell"
                class="bat-rel"
              >
                <span
                  class="bat-arrow"
                  :style="{ '--c': colorOf(g.slot) }"
                  :class="{ dashed: !g.slot }"
                />
                <span class="bat-rel-label">{{ r.relLabel }}</span>
                <button
                  v-if="r.ownImages.length"
                  type="button"
                  class="bat-own-photo"
                  :title="t('ownPhoto')"
                  @click="openViewer(r.ownImages)"
                >
                  <img
                    :src="r.ownImages[0].thumb"
                    :alt="t('ownPhoto')"
                    loading="lazy"
                  />
                  <span v-if="r.ownImages.length > 1">+{{ r.ownImages.length - 1 }}</span>
                </button>
              </span>

              <!-- Object -->
              <span
                role="cell"
                class="bat-side"
              >
                <TaxonCell
                  :side="r.object"
                  :t="t"
                  @open="openViewer"
                />
              </span>

              <!-- Area -->
              <span
                v-if="hasAreas"
                role="cell"
                class="bat-area"
              >
                <ItalyAreaMap
                  v-if="r.areas.some((a) => isItalian(a.name))"
                  :areas="r.areas"
                />
                <span class="bat-area-names">
                  <span
                    v-for="a in r.areas"
                    :key="a.name"
                    :class="{ 'line-through opacity-60': a.absent }"
                    >{{ a.name }}</span
                  >
                </span>
              </span>

              <!-- Evidence -->
              <span
                role="cell"
                class="bat-evidence"
              >
                <button
                  v-for="c in r.citations"
                  :key="c.id"
                  type="button"
                  :class="['bat-cite', { on: bus.pinnedSource === c.id }]"
                  :title="`${c.full}\n\n${t('citeTitle')}`"
                  @click="pin(c.id)"
                >
                  <span class="bat-cite-author">{{ c.author }}</span>
                  <span class="bat-cite-year">{{ c.year }}<template v-if="c.pages">: {{ c.pages }}</template></span>
                </button>
                <button
                  v-for="sp in r.specimens"
                  :key="sp.type + sp.id"
                  type="button"
                  class="bat-badge"
                  :title="t('details')"
                  @click="dwcTableRef?.show({ id: sp.id, type: sp.type })"
                >
                  {{ sp.type === 'CollectionObject' ? t('specimen') : t('observation') }} ⓘ
                </button>
              </span>
            </div>
          </div>
        </section>

        <p
          v-if="!groups.length"
          class="text-sm text-base-content/60"
        >
          {{ t('noMatch') }}
        </p>

        <!-- References: everything cited in the table, in full -->
        <section
          v-if="referenceList.length"
          class="bat-refs"
        >
          <h3 class="bat-refs-title">
            {{ t('references') }} <span class="opacity-60 tabular-nums">({{ referenceList.length }})</span>
          </h3>
          <ol>
            <li
              v-for="s in referenceList"
              :key="s.id"
              :class="{ on: bus.pinnedSource === s.id }"
            >
              <button
                type="button"
                class="bat-refs-text"
                :aria-pressed="bus.pinnedSource === s.id"
                :title="t('citeTitle')"
                @click="pin(s.id)"
                v-html="s.html"
              />
              <span class="bat-refs-meta">
                <span>{{ t(s.count === 1 ? 'supports1' : 'supports', { n: s.count }) }}</span>
                <a
                  v-if="s.url"
                  :href="s.url"
                  target="_blank"
                  rel="noopener"
                  >{{ s.url.includes('doi.org') ? 'DOI' : t('link') }} ↗</a
                >
              </span>
            </li>
          </ol>
          <p
            v-if="bus.pinnedSource"
            class="bat-refs-clear"
          >
            <button
              type="button"
              @click="bus.pinnedSource = null"
            >
              {{ t('showAll') }}
            </button>
          </p>
        </section>

        <p class="mt-4 text-xs text-base-content/55">{{ t('help') }}</p>
      </template>

      <DwcTable ref="dwcTableRef" />
      <ImageViewer
        v-if="viewer.images.length"
        :index="viewer.index"
        :images="viewer.images"
        :next="viewer.index < viewer.images.length - 1"
        :previous="viewer.index > 0"
        @select-index="viewer.index = $event"
        @next="viewer.index++"
        @previous="viewer.index--"
        @close="viewer.images = []"
      />
    </VCardContent>
  </VCard>
</template>

<script setup>
/**
 * PanelBiologicalAssociationsTable
 *
 * Each association as a statement — subject [properties] — relationship → object
 * [properties] — like an ontology triple, with the relationship linked to the
 * Relation Ontology and life stages to Uberon (../_shared/ontology.js).
 *
 * Rows with the same subject, relationship, object and properties are merged.
 * Every row has a picture: the association's own photo, else a photo of the
 * partner taxon (SoI, then iNaturalist), labelled as such.
 * Grouped by relationship in the network's colours; references are numbered as
 * under the Association network and both panels highlight each other
 * (../_shared/associationBus.js).
 */
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { makeAPIRequest } from '@/utils'
import { isIt, useT } from '@/utils/soiLang.js'
import DwcTable from '../PanelBiologicalAssociationsV2/DwcTable.vue'
import {
  fetchAssociations,
  fetchProperties,
  fetchReferences,
  nameParts,
  relationshipLabel,
  slotOf
} from '../_shared/associationGraph.js'
import { propertyTerm, relationshipTerm, splitProperties } from '../_shared/ontology.js'
import { associationBus as bus, sameName } from '../_shared/associationBus.js'
import ItalyAreaMap from '../_shared/ItalyAreaMap.vue'
import { isItalian } from '../_shared/italyAreas.js'

const props = defineProps({
  otuId: { type: Number, required: true }
})

const t = useT({
  en: {
    title: 'Biological associations',
    none: 'No associations recorded yet.',
    noMatch: 'Nothing matches the filters.',
    filterBy: 'Show or hide a kind of association',
    filterStage: 'Show or hide a life stage',
    find: 'Find a name…',
    image: 'Image',
    subject: 'Subject',
    relationship: 'Relationship',
    object: 'Object',
    area: 'Recorded in',
    evidence: 'Source',
    references: 'References',
    citeTitle: 'Click to show only the associations from this reference',
    supports: '{n} associations in this table',
    supports1: '1 association in this table',
    link: 'Link',
    showAll: 'Show all associations',
    specimen: 'Specimen',
    observation: 'Observation',
    details: 'Show the record',
    ownPhoto: 'Photo of this association',
    inatPhoto: '{name} — photo from iNaturalist',
    roTitle: 'Term in the Relation Ontology (OBO)',
    broader: 'broader term',
    plants: 'Plants of the World Online',
    csvTitle: 'Download as a table (CSV)',
    help: 'Each row reads subject — relationship → object, with life stages as labels. Each partner is shown with its picture (SoI, or iNaturalist when marked iNat); a photo under the arrow shows the association itself. The small map shows the Italian region(s) where the association was recorded. Each source is given as author and year (with the page); click it, or a reference in the list below, to show only the associations it supports.'
  },
  it: {
    title: 'Associazioni biologiche',
    none: 'Ancora nessuna associazione registrata.',
    noMatch: 'Nessun risultato con questi filtri.',
    filterBy: 'Mostra o nascondi un tipo di associazione',
    filterStage: 'Mostra o nascondi uno stadio',
    find: 'Cerca un nome…',
    image: 'Immagine',
    subject: 'Soggetto',
    relationship: 'Relazione',
    object: 'Oggetto',
    area: 'Osservata in',
    evidence: 'Fonte',
    references: 'Bibliografia',
    citeTitle: 'Clicca per mostrare solo le associazioni di questo riferimento',
    supports: '{n} associazioni in questa tabella',
    supports1: '1 associazione in questa tabella',
    link: 'Link',
    showAll: 'Mostra tutte le associazioni',
    specimen: 'Esemplare',
    observation: 'Osservazione',
    details: 'Mostra il record',
    ownPhoto: 'Foto di questa associazione',
    inatPhoto: '{name} — foto da iNaturalist',
    roTitle: 'Termine della Relation Ontology (OBO)',
    broader: 'termine più ampio',
    plants: 'Plants of the World Online',
    csvTitle: 'Scarica come tabella (CSV)',
    help: 'Ogni riga si legge soggetto — relazione → oggetto, con gli stadi come etichette. Ogni partner è mostrato con la sua immagine (SoI, o iNaturalist se indicato iNat); una foto sotto la freccia mostra l’associazione stessa. La piccola mappa indica la regione (o le regioni) italiane in cui l’associazione è stata osservata. Ogni fonte è indicata con autore e anno (e pagina); cliccala, o clicca un riferimento nell’elenco sotto, per mostrare solo le associazioni che documenta.'
  }
})

// ---- One taxon cell: name, family, life-stage labels ----------------------------
const TaxonCell = defineComponent({
  props: { side: { type: Object, required: true }, t: { type: Function, required: true } },
  emits: ['open'],
  setup(p, { emit }) {
    return () => {
      const s = p.side
      // picture of the taxon: SoI / TaxonWorks first, then iNaturalist
      const pic = s.isSelf
        ? null
        : s.images.length
        ? h(
            'button',
            {
              type: 'button',
              class: 'bat-thumb',
              title: s.imageSource === 'iNat' ? p.t('inatPhoto', { name: s.name }) : s.name,
              onClick: () => emit('open', s.images)
            },
            [
              h('img', { src: s.images[0].thumb, alt: s.name, loading: 'lazy' }),
              s.imageSource === 'iNat' ? h('span', { class: 'bat-src' }, 'iNat') : null
            ]
          )
        : h('span', { class: 'bat-thumb bat-noimg', 'aria-hidden': 'true' })
      const name = s.otuId && !s.isSelf
        ? h(RouterLink, { to: { name: 'otus-id', params: { id: s.otuId } }, class: 'hover:underline' }, () => h('span', { innerHTML: s.html }))
        : h('span', { innerHTML: s.html })
      const ext = s.plantUrl
        ? h('a', { href: s.plantUrl, target: '_blank', rel: 'noopener', class: 'bat-ext', title: p.t('plants') }, '↗')
        : null
      // the page's own taxon: name and life stage only, its family is obvious
      const family = s.family && !s.isSelf
        ? h('span', { class: 'bat-family' }, s.subfamily ? `${s.family}: ${s.subfamily}` : s.family)
        : null
      const pills = s.properties.map((pr) =>
        pr.term
          ? h('a', { class: 'bat-pill', href: pr.term.url, target: '_blank', rel: 'noopener', title: [pr.definition, `Uberon: ${pr.term.label}`].filter(Boolean).join(' — ') }, pr.label)
          : h('span', { class: 'bat-pill', title: pr.definition || '' }, pr.label)
      )
      return h('span', { class: ['bat-taxon', { 'is-self': s.isSelf }] }, [
        pic,
        h('span', { class: 'bat-text' }, [
          h('span', { class: 'bat-name' }, [name, ext]),
          family,
          pills.length ? h('span', { class: 'bat-pills' }, pills) : null
        ])
      ])
    }
  }
})

const isLoading = ref(true)
const associations = ref([])
const extras = reactive({
  props: new Map(),
  refs: null,
  images: new Map(), // association id → own photos
  taxonImages: new Map(), // lower-case taxon name → { images, source: 'SoI' | 'iNat' }
  areas: new Map(),
  propertyInfo: new Map(), // property name (lower case) → { definition, uri }
  relInfo: new Map() // relationship name (lower case) → definition
})
const hiddenGroups = ref(new Set())
const hiddenProps = ref(new Set())
const query = ref('')
const dwcTableRef = ref(null)
const viewer = reactive({ images: [], index: 0 })

const SLOT_VARS = ['--ba-other', '--ba-rel-1', '--ba-rel-2', '--ba-rel-3']
const colorOf = (slot) => `var(${SLOT_VARS[slot] || SLOT_VARS[0]})`
const specimenTypes = ['CollectionObject', 'FieldOccurrence']

// Is the page's own taxon the subject of this association?
function usIsSubject(a) {
  const s = a.subject || {}
  const o = a.object || {}
  if (s.id === props.otuId && s.base_class === 'Otu') return true
  if (o.id === props.otuId && o.base_class === 'Otu') return false
  if (s.taxonomy?.family === 'Syrphidae') return true
  if (o.taxonomy?.family === 'Syrphidae') return false
  return true
}

function sideOf(entity, isSelf, propString, showSubfamily) {
  const { plain, html } = nameParts(entity)
  const tax = entity.taxonomy || {}
  const isPlant = tax.kingdom === 'Plantae'
  const pic = extras.taxonImages.get(plain.toLowerCase())
  return {
    name: plain,
    html,
    isSelf,
    images: pic?.images || [],
    imageSource: pic?.source || '',
    family: tax.family || tax.order || null,
    subfamily: showSubfamily && !isPlant ? tax.subfamily || null : null,
    otuId: entity.base_class === 'Otu' ? entity.id : null,
    plantUrl: isPlant ? `https://powo.science.kew.org/results?q=${encodeURIComponent(plain.replace(/ sp\.$/, ''))}` : null,
    properties: splitProperties(propString).map((name) => {
      const info = extras.propertyInfo.get(name.toLowerCase()) || {}
      return { name, label: name.toLowerCase(), definition: info.definition || '', term: propertyTerm(name, info.uri) }
    })
  }
}

// One statement per subject + relationship + object + properties
const statements = computed(() => {
  const map = new Map()
  for (const a of associations.value) {
    if (!a.subject || !a.object) continue
    const weAreSubject = usIsSubject(a)
    const rel = a.biological_relationship || {}
    const p = extras.props.get(a.id) || {}
    const subject = sideOf(a.subject, weAreSubject, p.subject, !weAreSubject)
    const object = sideOf(a.object, !weAreSubject, p.object, weAreSubject)
    const partner = weAreSubject ? object : subject
    const key = [rel.name, subject.name, p.subject, object.name, p.object].join('|').toLowerCase()
    if (!map.has(key)) {
      map.set(key, {
        key,
        relationship: rel.name || '—',
        relLabel: relationshipLabel(rel.name || '—', isIt.value).toLowerCase(),
        slot: slotOf(rel.name || ''),
        weAreSubject,
        subject,
        object,
        partner,
        ids: [],
        specimens: []
      })
    }
    const row = map.get(key)
    row.ids.push(a.id)
    ;[a.subject, a.object].forEach((e) => {
      if (specimenTypes.includes(e.base_class) && !row.specimens.some((sp) => sp.id === e.id)) row.specimens.push({ id: e.id, type: e.base_class })
    })
  }

  const refs = extras.refs
  const sources = new Map((refs?.sources || []).map((s) => [s.id, s]))
  return [...map.values()].map((r) => {
    const cites = new Map()
    r.ids.forEach((id) =>
      (refs?.byAssociation.get(id) || []).forEach((sid) => {
        const pages = refs.pages.get(`${id}|${sid}`)
        const prev = cites.get(sid)
        cites.set(sid, prev && pages && prev !== pages ? `${prev}, ${pages}` : pages || prev || '')
      })
    )
    const citations = [...cites.entries()]
      .map(([id, pages]) => {
        const s = sources.get(id)
        return {
          id,
          pages,
          n: bus.sourceNumbers.get(id) ?? s?.n ?? '?',
          author: shortAuthors(s?.authors) || s?.short || '?',
          year: s?.yearLabel || '',
          full: s ? s.html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&') : '',
          title: s ? `${s.short}${pages ? `: ${pages}` : ''}` : ''
        }
      })
      .sort((a, b) => String(a.year).localeCompare(String(b.year)) || a.author.localeCompare(b.author))
    const areas = []
    r.ids.forEach((id) => (extras.areas.get(id) || []).forEach((x) => !areas.some((y) => y.name === x.name) && areas.push(x)))
    return {
      ...r,
      citations,
      areas,
      ownImages: r.ids.flatMap((id) => extras.images.get(id) || [])
    }
  })
})

const groupKey = (r) => `${r.relationship}|${r.weAreSubject}`
const allGroups = computed(() => {
  const map = new Map()
  statements.value.forEach((r) => {
    const key = groupKey(r)
    if (!map.has(key)) {
      map.set(key, {
        key,
        // every row reads subject → object, so the relationship keeps its stored direction
        label: relationshipLabel(r.relationship, isIt.value),
        slot: r.slot,
        count: 0,
        term: relationshipTerm(r.relationship),
        definition: extras.relInfo.get(String(r.relationship).toLowerCase()) || ''
      })
    }
    map.get(key).count++
  })
  return [...map.values()].sort((a, b) => (a.slot || 9) - (b.slot || 9) || b.count - a.count)
})

const allProperties = computed(() => {
  const map = new Map()
  statements.value.forEach((r) =>
    [...r.subject.properties, ...r.object.properties].forEach((p) => {
      if (!map.has(p.name)) map.set(p.name, { name: p.name, label: p.label, count: 0 })
      map.get(p.name).count++
    })
  )
  return [...map.values()]
})

const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return allGroups.value
    .filter((g) => !hiddenGroups.value.has(g.key))
    .map((g) => ({
      ...g,
      rows: statements.value
        .filter((r) => groupKey(r) === g.key)
        .filter((r) => {
          const props = [...r.subject.properties, ...r.object.properties].map((p) => p.name)
          return !props.length || !props.every((p) => hiddenProps.value.has(p))
        })
        .filter((r) => !q || [r.partner.name, r.partner.family].some((x) => String(x || '').toLowerCase().includes(q)))
        .sort((a, b) => (a.partner.family || '~').localeCompare(b.partner.family || '~') || a.partner.name.localeCompare(b.partner.name))
    }))
    .filter((g) => g.rows.length)
})

const hasAreas = computed(() => statements.value.some((r) => r.areas.length))

function toggle(setRef, key) {
  const s = new Set(setRef.value)
  if (s.has(key)) s.delete(key)
  else s.add(key)
  setRef.value = s
}

// highlighted when the same partner is pointed at in the network
const isLit = (r) => {
  const hv = bus.hover
  if (!hv || hv.from !== 'graph') return false
  return sameName(hv.partner, r.partner.name) && (!hv.relationship || hv.relationship === r.relationship)
}

// "Almohamad, Verheggen & Haubruge" → "Almohamad et al."; two authors stay as they are
function shortAuthors(authors) {
  const a = String(authors || '').trim()
  if (!a) return ''
  const names = a.split(/\s*(?:,|&| and )\s*/).filter(Boolean)
  return names.length > 2 ? `${names[0]} et al.` : a
}

// every reference cited in the table, with how many statements it supports
const referenceList = computed(() => {
  const sources = new Map((extras.refs?.sources || []).map((s) => [s.id, s]))
  const counts = new Map()
  statements.value.forEach((r) => r.citations.forEach((c) => counts.set(c.id, (counts.get(c.id) || 0) + 1)))
  return [...counts.entries()]
    .map(([id, count]) => ({ ...(sources.get(id) || { id, html: '?', short: '?' }), count }))
    .filter((s) => s.html)
    .sort((a, b) => a.short.localeCompare(b.short))
})

// select a reference: rows from other sources fade, the network highlights it too
function pin(id) {
  bus.pinnedSource = bus.pinnedSource === id ? null : id
}

function openViewer(images) {
  viewer.images = images
  viewer.index = 0
}

function downloadCsv() {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const props = (side) => side.properties.map((p) => p.name).join('; ')
  const header = ['subject', 'subject_properties', 'relationship', 'relationship_RO', 'object', 'object_properties', 'object_family', 'area', 'references']
  const lines = groups.value.flatMap((g) =>
    g.rows.map((r) =>
      [
        r.subject.name,
        props(r.subject),
        r.relationship,
        relationshipTerm(r.relationship)?.url || '',
        r.object.name,
        props(r.object),
        r.object.family,
        r.areas.map((a) => a.name).join('; '),
        r.citations.map((c) => c.title).join('; ')
      ]
        .map(q)
        .join(',')
    )
  )
  const blob = new Blob(['﻿' + [header.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'biological-associations.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// ---- Extra data -------------------------------------------------------------------
const toImage = (d) => ({
  id: d.image.id,
  thumb: d.image.thumb,
  original: d.image.original,
  medium: d.image.medium,
  attribution: { label: d.attribution?.label || '' },
  source: { label: '' },
  depictions: d.figure_label ? [{ label: d.figure_label }] : []
})

async function galleryFor(type, ids) {
  const p = new URLSearchParams({ depiction_object_type: type })
  ids.forEach((id) => p.append('depiction_object_id[]', id))
  const { data: depictions } = await makeAPIRequest.get(`/depictions?${p}`)
  if (!depictions?.length) return new Map()
  const g = new URLSearchParams()
  depictions.forEach((d) => g.append('depiction_id[]', d.id))
  const { data: gallery } = await makeAPIRequest.get(`/depictions/gallery?${g}`)
  const map = new Map()
  ;(gallery || []).forEach((d) => {
    if (!map.has(d.depiction_object_id)) map.set(d.depiction_object_id, [])
    map.get(d.depiction_object_id).push(toImage(d))
  })
  return map
}

async function loadImages(ids) {
  try {
    extras.images = await galleryFor('BiologicalAssociation', ids)
  } catch {
    /* optional */
  }
}

// A picture of every partner taxon (not the page's own species):
// its SoI / TaxonWorks images first, otherwise iNaturalist
async function loadTaxonImages() {
  const taxa = new Map() // lower-case name → { name, otuId }
  associations.value.forEach((a) =>
    [usIsSubject(a) ? a.object : a.subject].forEach((e) => {
      if (!e) return
      const { plain } = nameParts(e)
      const key = plain.toLowerCase()
      if (!taxa.has(key) || (!taxa.get(key).otuId && e.base_class === 'Otu')) {
        taxa.set(key, { name: plain, otuId: e.base_class === 'Otu' ? e.id : null })
      }
    })
  )
  const found = new Map()
  const otuIds = [...taxa.values()].map((x) => x.otuId).filter(Boolean)
  try {
    if (otuIds.length) {
      const byOtu = await galleryFor('Otu', otuIds)
      taxa.forEach((x, key) => {
        const imgs = x.otuId && byOtu.get(x.otuId)
        if (imgs?.length) found.set(key, { images: imgs, source: 'SoI' })
      })
    }
  } catch {
    /* fall through to iNaturalist */
  }
  extras.taxonImages = new Map(found) // show SoI pictures right away
  const missing = [...taxa.entries()].filter(([key]) => !found.has(key))
  await Promise.all(
    missing.map(async ([key, x]) => {
      const name = x.name.replace(/ sp\.$/, '')
      try {
        const { data } = await axios.get('https://api.inaturalist.org/v1/taxa', { params: { q: name, per_page: 1, is_active: true } })
        const tx = data?.results?.[0]
        const photo = tx?.default_photo
        if (!photo || String(tx.name).toLowerCase() !== name.toLowerCase()) return
        found.set(key, {
          source: 'iNat',
          images: [
            {
              id: `inat-${photo.id}`,
              thumb: photo.square_url,
              medium: photo.medium_url,
              original: photo.medium_url?.replace('medium', 'large'),
              attribution: { label: photo.attribution || '' },
              source: { label: `<a href="https://www.inaturalist.org/taxa/${tx.id}" target="_blank" rel="noopener">iNaturalist</a>` },
              depictions: [{ label: tx.name }]
            }
          ]
        })
      } catch {
        /* no picture */
      }
    })
  )
  extras.taxonImages = found
}

async function loadAreas(ids) {
  try {
    const p = new URLSearchParams()
    ids.forEach((id) => p.append('biological_association_id[]', id))
    const { data } = await makeAPIRequest.get(`/asserted_distributions?${p}`)
    const map = new Map()
    ;(data || []).forEach((d) => {
      const id = d.asserted_distribution_object_id
      const name = d.asserted_distribution_shape?.name
      if (!name) return
      if (!map.has(id)) map.set(id, [])
      map.get(id).push({ name, absent: !!d.is_absent })
    })
    extras.areas = map
  } catch {
    /* optional */
  }
}

// Definitions (and URIs) of the properties and relationships, from TaxonWorks
async function loadVocabulary() {
  try {
    const { data } = await makeAPIRequest.get('/controlled_vocabulary_terms', { params: { per: 500 } })
    const map = new Map()
    ;(data || [])
      .filter((x) => x.type === 'BiologicalProperty')
      .forEach((x) => map.set(String(x.name).toLowerCase(), { definition: x.definition || '', uri: x.uri || null }))
    extras.propertyInfo = map
  } catch {
    /* optional */
  }
  try {
    const { data } = await makeAPIRequest.get('/biological_relationships')
    extras.relInfo = new Map((data || []).map((r) => [String(r.name).toLowerCase(), r.definition || '']))
  } catch {
    /* optional */
  }
}

onMounted(async () => {
  try {
    associations.value = await fetchAssociations({ 'otu_query[coordinatify]': true, 'otu_query[otu_id][]': props.otuId })
  } catch {
    associations.value = []
  }
  const ids = associations.value.map((a) => a.id)
  if (ids.length) {
    await Promise.all([
      fetchProperties(ids).then((m) => (extras.props = m)),
      fetchReferences(ids).then((r) => (extras.refs = r)),
      loadImages(ids),
      loadAreas(ids),
      loadVocabulary()
    ])
  }
  isLoading.value = false
  if (ids.length) loadTaxonImages()
})
</script>

<style>
/* Same relationship colours as the Association network */
.soi-bat {
  --ba-rel-1: #2a78d6;
  --ba-rel-2: #eb6834;
  --ba-rel-3: #1baf7a;
  --ba-other: #8a8984;
}
html.dark .soi-bat {
  --ba-rel-1: #3987e5;
  --ba-rel-2: #d95926;
  --ba-rel-3: #199e70;
  --ba-other: #9a9992;
}
/* life-stage label (also used inside the TaxonCell render function) */
.soi-bat .bat-pill {
  display: inline-block;
  padding: 0 0.45rem;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.3rem;
  font-weight: 600;
  color: rgb(var(--color-base-content));
  background: rgba(var(--color-base-content), 0.08);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.soi-bat a.bat-pill:hover {
  background: rgba(var(--color-base-content), 0.16);
}
.soi-bat .bat-pill-sm {
  line-height: 1.1rem;
}
.soi-bat .bat-taxon {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
}
.soi-bat .bat-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  padding-top: 0.1rem;
}
/* picture beside each taxon: [image] taxon -> [image] taxon */
.soi-bat .bat-thumb {
  position: relative;
  flex: none;
  display: block;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  cursor: zoom-in;
}
.soi-bat .bat-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.15s;
}
.soi-bat button.bat-thumb:hover img {
  transform: scale(1.06);
}
.soi-bat .bat-noimg {
  cursor: default;
  background: rgba(var(--color-base-content), 0.05);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.6);
}
.soi-bat .bat-src {
  position: absolute;
  left: 2px;
  bottom: 2px;
  font-size: 8.5px;
  font-weight: 700;
  line-height: 1.2;
  padding: 0 0.22rem;
  border-radius: 3px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
}
.soi-bat .bat-taxon i {
  font-style: italic;
}
.soi-bat .bat-taxon.is-self .bat-name {
  color: rgba(var(--color-base-content), 0.6);
}
.soi-bat .bat-family {
  font-size: 0.75rem;
  color: rgba(var(--color-base-content), 0.6);
}
.soi-bat .bat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.15rem;
}
.soi-bat .bat-ext {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: rgba(var(--color-base-content), 0.45);
}
</style>

<style scoped>
.bat-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
  font-size: 0.85rem;
  color: rgb(var(--color-base-content));
}
.bat-term {
  font-size: 0.72rem;
  color: rgba(var(--color-base-content), 0.55);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
  border-radius: 4px;
  padding: 0 0.35rem;
}
.bat-term:hover {
  color: rgb(var(--color-base-content));
}
.bat-def {
  margin: 0.15rem 0 0.5rem;
  font-size: 0.75rem;
  color: rgba(var(--color-base-content), 0.6);
  max-width: 60rem;
}
.bat-swatch {
  display: inline-block;
  width: 16px;
  height: 0;
  border-top: 3px solid var(--c);
  border-radius: 2px;
}
.bat-swatch.dashed {
  border-top-style: dashed;
}
.bat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.2rem 0.65rem 0.2rem 0.5rem;
  font-size: 12px;
  color: rgba(var(--color-base-content), 0.85);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.bat-chip.off {
  opacity: 0.45;
  text-decoration: line-through;
}
.bat-search input {
  width: 11rem;
  border-radius: 999px;
  border: 0;
  padding: 0.3rem 0.8rem;
  font-size: 12.5px;
  background: rgba(var(--color-base-content), 0.04);
  color: rgb(var(--color-base-content));
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.bat-btn {
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  font-size: 12px;
  font-weight: 600;
  color: rgba(var(--color-base-content), 0.8);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}

/* Table as a CSS grid; rows become cards on narrow screens */
.bat-table {
  --cols: minmax(13rem, 1.4fr) minmax(6.5rem, 0.6fr) minmax(14rem, 1.5fr) minmax(10rem, 1fr);
  font-size: 0.875rem;
}
.bat-table.has-area {
  --cols: minmax(13rem, 1.4fr) minmax(6.5rem, 0.6fr) minmax(14rem, 1.5fr) minmax(9rem, 0.9fr) minmax(10rem, 1fr);
}
.bat-head,
.bat-row {
  display: grid;
  grid-template-columns: var(--cols);
  gap: 0.25rem 1rem;
  align-items: center;
  padding: 0.4rem 0.5rem;
}
.bat-head {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--color-base-content), 0.55);
  border-bottom: 1px solid rgba(var(--color-base-border), 0.8);
}
.bat-row {
  border-bottom: 1px solid rgba(var(--color-base-border), 0.35);
  transition: background-color 0.12s;
}
.bat-row:hover,
.bat-row.on {
  background: rgba(var(--color-base-content), 0.05);
}
.bat-own-photo {
  position: relative;
  margin-top: 0.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 10px;
  font-weight: 700;
  color: rgba(var(--color-base-content), 0.6);
  cursor: zoom-in;
}
.bat-own-photo img {
  width: 2.1rem;
  height: 2.1rem;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgb(var(--color-base-foreground)), 0 0 0 3px rgba(var(--color-base-border), 0.9);
}
.bat-rel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-align: center;
}
.bat-arrow {
  position: relative;
  display: block;
  width: 100%;
  max-width: 6rem;
  height: 0;
  border-top: 2px solid var(--c);
}
.bat-arrow.dashed {
  border-top-style: dashed;
}
.bat-arrow::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -6px;
  border: 5px solid transparent;
  border-left: 7px solid var(--c);
  border-right: 0;
}
.bat-rel-label {
  font-size: 0.75rem;
  color: rgba(var(--color-base-content), 0.75);
}
.bat-area {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.8rem;
}
.bat-area-names {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.bat-evidence {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}
.bat-cite {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.3rem;
  text-align: left;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.35;
  color: rgb(var(--color-base-content));
  background: rgba(var(--color-base-content), 0.06);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.bat-cite-author {
  font-weight: 600;
}
.bat-cite-year {
  font-variant-numeric: tabular-nums;
  color: rgba(var(--color-base-content), 0.7);
}
.bat-cite:hover,
.bat-cite.on {
  background: rgb(var(--color-base-content));
  color: rgb(var(--color-base-foreground));
}
.bat-cite:hover .bat-cite-year,
.bat-cite.on .bat-cite-year {
  color: inherit;
}
.bat-row.dim {
  opacity: 0.3;
}
.bat-refs {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-base-border), 0.8);
}
.bat-refs-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.bat-refs ol {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.bat-refs li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.15rem 0.75rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  line-height: 1.45;
}
.bat-refs li.on {
  background: rgba(var(--color-base-content), 0.07);
  box-shadow: inset 3px 0 0 rgb(var(--color-base-content));
}
.bat-refs-text {
  flex: 1 1 28rem;
  text-align: left;
  color: rgb(var(--color-base-content));
}
.bat-refs-text:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.bat-refs-meta {
  display: inline-flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(var(--color-base-content), 0.6);
  white-space: nowrap;
}
.bat-refs-meta a {
  font-weight: 600;
  color: rgb(var(--color-base-content));
}
.bat-refs-meta a:hover {
  text-decoration: underline;
}
.bat-refs-clear {
  margin-top: 0.5rem;
  font-size: 0.75rem;
}
.bat-refs-clear button {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.bat-ref {
  min-width: 1.4rem;
  padding: 0 0.45rem;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35rem;
  font-variant-numeric: tabular-nums;
  background: rgba(var(--color-base-content), 0.1);
}
.bat-ref:hover,
.bat-ref.on {
  background: rgb(var(--color-base-content));
  color: rgb(var(--color-base-foreground));
}
.bat-pages {
  font-weight: 500;
  opacity: 0.75;
}
.bat-badge {
  padding: 0 0.45rem;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.35rem;
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
@media (max-width: 720px) {
  .bat-head {
    display: none;
  }
  .bat-row {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 0.35rem;
    padding: 0.7rem 0.25rem;
  }
  /* subject, arrow, object stacked; arrow sits under the first picture */
  .bat-rel {
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding-left: 1rem;
  }
  .bat-own-photo {
    margin-top: 0;
  }
  .bat-arrow {
    width: 2rem;
  }
}
</style>
