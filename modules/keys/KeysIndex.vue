<template>
  <div class="container mx-auto py-6">
    <h1 class="text-2xl font-semibold text-base-content mb-4">Keys</h1>

    <VSpinner v-if="loading" />
    <p
      v-else-if="!generaRows.length && !speciesRows.length"
      class="text-base-soft"
    >No public keys in this project.</p>

    <template v-else>
      <!-- Keys to genera — always visible, above the filter -->
      <section v-if="generaRows.length" class="mb-8">
        <h2 class="text-lg font-semibold text-base-content mb-3 border-b border-base-muted pb-1">
          Keys to genera
        </h2>
        <ul class="space-y-4">
          <li
            v-for="row in generaRows"
            :key="row.key"
            class="rounded-xl border border-base-muted bg-base-foreground p-4 sm:p-5"
          >
            <KeyRow :row="row" :open-id="openRowKey" @toggle="toggleRow" />
          </li>
        </ul>
      </section>

      <!-- Keys to species — letter filter, then the filtered list -->
      <section v-if="speciesRows.length">
        <h2 class="text-lg font-semibold text-base-content mb-3 border-b border-base-muted pb-1">
          Keys to species
        </h2>

        <!-- Letter filter -->
        <div class="mb-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            @click="activeLetter = null"
            class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
            :class="!activeLetter
              ? 'bg-[#854F0B] text-white'
              : 'bg-[#faeeda] text-[#633806] hover:bg-[#f6e2c2]'"
          >All</button>
          <button
            v-for="letter in availableLetters"
            :key="letter"
            type="button"
            @click="activeLetter = activeLetter === letter ? null : letter"
            class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
            :class="activeLetter === letter
              ? 'bg-[#854F0B] text-white'
              : 'bg-[#faeeda] text-[#633806] hover:bg-[#f6e2c2]'"
          >{{ letter }}</button>
        </div>

        <ul v-if="filteredSpeciesRows.length" class="space-y-4">
          <li
            v-for="row in filteredSpeciesRows"
            :key="row.key"
            class="rounded-xl border border-base-muted bg-base-foreground p-4 sm:p-5"
          >
            <KeyRow :row="row" :open-id="openRowKey" @toggle="toggleRow" />
          </li>
        </ul>
        <p v-else class="text-sm text-base-soft py-6">
          No keys starting with “{{ activeLetter }}”.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { RouterLink } from 'vue-router'
import { makeAPIRequest } from '@/utils/request'
import { sanitizeAndLinkifyHtml } from '@/utils'
import TaxonWorks from '@/modules/otus/services/TaxonWorks.js'
import taxaListRaw from '/pages/taxa/constants/taxa.js'

// --- Amber palette (matches the warm taxa table) -----------------------------
const AMBER = {
  name: '#854F0B',        // deep amber — clickable genus names / links
  nameHover: '#BA7517',   // mid amber — name hover
  chipBg: '#faeeda',      // pale amber — language chip background
  chipBgHover: '#f6e2c2', // slightly deeper on hover
  chipText: '#633806'     // darkest — chip text
}

const loading = ref(true)
const generaRows = ref([])
const speciesRows = ref([])
const activeLetter = ref(null)

// Which dual-language row currently has its EN/IT chooser expanded (by row.key).
const openRowKey = ref(null)
function toggleRow(key) {
  openRowKey.value = openRowKey.value === key ? null : key
}

// --- Genus name set, for italicizing genus names inside a title ---------------
// Only genera (from the taxa list) get italicized; families like "Syrphidae"
// aren't in this set, so they stay roman.
const genusNames = (Array.isArray(taxaListRaw) ? taxaListRaw : [])
  .map((t) => String(t.taxonName || '').replace(/<[^>]*>/g, '').trim())
  .filter(Boolean)

const genusRegex = (() => {
  if (!genusNames.length) return null
  const escaped = genusNames
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'g')
})()

function italicizeGenera(title) {
  const escaped = String(title || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  if (!genusRegex) return escaped
  return escaped.replace(genusRegex, '<i>$1</i>')
}

function firstLetter(title) {
  const m = String(title || '').replace(/<[^>]*>/g, '').trim().match(/[a-zA-Z]/)
  return m ? m[0].toUpperCase() : '#'
}

// --- Row component ------------------------------------------------------------
const KeyRow = (props, { emit }) => {
  const row = props.row

  const variants = []
  if (row.en) variants.push({ label: 'EN', long: 'English', id: row.en.id })
  if (row.it) variants.push({ label: 'IT', long: 'Italian', id: row.it.id })
  if (row.plain) variants.push({ label: 'Open key', long: null, id: row.plain.id })

  const isMulti = variants.length > 1
  const single = variants.length === 1 ? variants[0] : null
  const isOpen = props.openId === row.key

  // Shared title styling — identical for link and button so single/dual rows match.
  const titleStyle = { color: AMBER.name }
  const titleClass = 'text-lg font-medium hover:underline cursor-pointer [&_i]:italic text-left bg-transparent border-0 p-0'
  const onHover = (e) => { e.target.style.color = AMBER.nameHover }
  const offHover = (e) => { e.target.style.color = AMBER.name }

  let titleNode
  if (single) {
    titleNode = h(RouterLink, {
      to: { name: 'dichotomous-key', params: { id: single.id } },
      class: titleClass, style: titleStyle,
      onMouseenter: onHover, onMouseleave: offHover,
      innerHTML: row.titleHtml
    })
  } else if (isMulti) {
    titleNode = h('button', {
      type: 'button', class: titleClass, style: titleStyle,
      'aria-expanded': isOpen ? 'true' : 'false',
      onMouseenter: onHover, onMouseleave: offHover,
      onClick: () => emit('toggle', row.key),
      innerHTML: row.titleHtml
    })
  } else {
    titleNode = h('span', { class: 'text-lg text-base-content [&_i]:italic', innerHTML: row.titleHtml })
  }

  const headerChildren = [titleNode]
  if (isMulti) {
    headerChildren.push(
      h('span', { class: 'text-xs text-base-soft' }, isOpen ? '▾ choose language' : '▸ EN / IT')
    )
  }

  const children = [
    h('div', { class: 'flex flex-wrap items-baseline gap-x-3 gap-y-1' }, headerChildren)
  ]

  // Inline language chooser — amber chips, only for multi rows when expanded.
  if (isMulti && isOpen) {
    children.push(
      h('div', { class: 'mt-2.5 flex flex-wrap gap-2' },
        variants.map((v) =>
          h(RouterLink, {
            to: { name: 'dichotomous-key', params: { id: v.id } },
            class: 'text-sm font-medium rounded-md transition-colors',
            style: {
              backgroundColor: AMBER.chipBg,
              color: AMBER.chipText,
              padding: '5px 14px'
            },
            onMouseenter: (e) => {
              e.currentTarget.style.backgroundColor = AMBER.nameHover
              e.currentTarget.style.color = '#fff'
            },
            onMouseleave: (e) => {
              e.currentTarget.style.backgroundColor = AMBER.chipBg
              e.currentTarget.style.color = AMBER.chipText
            }
          }, () => v.long ? `${v.label} — ${v.long}` : 'Open key')
        )
      )
    )
  }

  if (row.scope) {
    children.push(h('p', { class: 'mt-1 text-sm text-base-content [&_i]:italic' }, [
      h('span', { class: 'text-base-soft' }, 'Scope: '),
      h('span', { innerHTML: italicizeGenera(row.scope) })
    ]))
  }
  if (row.citation) {
    children.push(h('p', { class: 'mt-1 text-sm text-base-content [&_i]:italic' }, [
      h('span', { class: 'text-base-soft' }, 'Primary source: '),
      h('span', { innerHTML: sanitizeAndLinkifyHtml(row.citation) })
    ]))
  }
  const pills = []
  if (row.coupletsCount) pills.push(h('span', { class: 'border border-base-muted rounded px-2 py-0.5' }, `${row.coupletsCount} couplets`))
  if (row.taxaCount) pills.push(h('span', { class: 'border border-base-muted rounded px-2 py-0.5' }, `${row.taxaCount} taxa`))
  if (row.updatedInWords) pills.push(h('span', { class: 'border border-base-muted rounded px-2 py-0.5' }, `updated ${row.updatedInWords} ago`))
  if (pills.length) children.push(h('div', { class: 'mt-2 flex flex-wrap gap-2 text-xs text-base-soft' }, pills))

  return h('div', children)
}
KeyRow.props = ['row', 'openId']
KeyRow.emits = ['toggle']

// --- Filter ------------------------------------------------------------------
const availableLetters = computed(() => {
  const set = new Set(speciesRows.value.map((r) => r.letter))
  return [...set].filter((l) => l !== '#').sort()
})

const filteredSpeciesRows = computed(() =>
  activeLetter.value
    ? speciesRows.value.filter((r) => r.letter === activeLetter.value)
    : speciesRows.value
)

// --- Title strippers for folding EN/IT variants ------------------------------
function baseName(text) {
  return String(text || '')
    .replace(/\s*\((?:en|it)\)\s*$/i, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}
function langOf(text) {
  const m = String(text || '').match(/\((en|it)\)\s*$/i)
  return m ? m[1].toLowerCase() : null
}

onMounted(async () => {
  try {
    const taxa = (Array.isArray(taxaListRaw) ? taxaListRaw : []).filter((t) => t.otuId)

    const results = await Promise.all(
      taxa.map((t) =>
        TaxonWorks.getKeys(t.otuId)
          .then((r) => ({ taxon: t, data: r.data }))
          .catch(() => null)
      )
    )

    const collectedById = new Map()
    for (const res of results) {
      if (!res) continue
      const { taxon, data } = res
      const add = (lead, band) => {
        const existing = collectedById.get(lead.id)
        if (!existing) collectedById.set(lead.id, { id: lead.id, text: lead.text, band, taxon })
        else if (band === 'in' && existing.band !== 'in') existing.band = 'in'
      }
      for (const l of data.leads?.scoped || []) add(l, 'scoped')
      for (const l of data.leads?.in || []) add(l, 'in')
    }
    const collected = [...collectedById.values()]

    const details = await Promise.all(
      collected.map((c) =>
        makeAPIRequest.get(`/leads/key/${c.id}`).then((res) => res.data || {}).catch(() => ({}))
      )
    )

    let updatedByLeadId = new Map()
    try {
      const { data: leadsList } = await makeAPIRequest.get('/leads', { params: { per: 1000 } })
      updatedByLeadId = new Map(
        (Array.isArray(leadsList) ? leadsList : [])
          .filter((r) => r && r.key_updated_at_in_words)
          .map((r) => [r.id, r.key_updated_at_in_words])
      )
    } catch { /* no update wording */ }

    const enriched = collected.map((c, i) => {
      const d = details[i] || {}
      const meta = d.metadata || {}
      const entries = d.data?.entries || {}
      const leadsObj = d.data?.leads || {}
      const originalTitle = meta.title || c.text || `Key ${c.id}`
      return {
        id: c.id,
        band: c.band,
        originalTitle,
        base: baseName(originalTitle),
        lang: langOf(originalTitle),
        scope: meta.taxonomic_scope || null,
        citation: meta.origin_citation || null,
        coupletsCount: Object.keys(entries).length || null,
        taxaCount: Object.values(leadsObj).filter(
          (l) => typeof l.target_type === 'string' && l.target_type.includes('/otus')
        ).length || null,
        updatedInWords: updatedByLeadId.get(c.id) || null
      }
    })

    function foldRows(items) {
      const byBase = new Map()
      for (const it of items) {
        const k = it.base.toLowerCase()
        if (!byBase.has(k)) {
          byBase.set(k, {
            key: `${it.band}:${k}`,
            titleHtml: italicizeGenera(it.base || it.originalTitle),
            letter: firstLetter(it.base || it.originalTitle),
            scope: it.scope,
            citation: it.citation,
            coupletsCount: it.coupletsCount,
            taxaCount: it.taxaCount,
            updatedInWords: it.updatedInWords,
            en: null, it: null, plain: null
          })
        }
        const row = byBase.get(k)
        if (it.lang === 'en') row.en = it
        else if (it.lang === 'it') row.it = it
        else row.plain = it
        row.scope ||= it.scope
        row.citation ||= it.citation
        row.coupletsCount ||= it.coupletsCount
        row.taxaCount ||= it.taxaCount
        row.updatedInWords ||= it.updatedInWords
      }
      return [...byBase.values()].sort((a, b) =>
        String(a.titleHtml).replace(/<[^>]*>/g, '')
          .localeCompare(String(b.titleHtml).replace(/<[^>]*>/g, ''))
      )
    }

    generaRows.value = foldRows(enriched.filter((e) => e.band === 'in'))
    speciesRows.value = foldRows(enriched.filter((e) => e.band === 'scoped'))
  } catch {
    generaRows.value = []
    speciesRows.value = []
  } finally {
    loading.value = false
  }
})
</script>