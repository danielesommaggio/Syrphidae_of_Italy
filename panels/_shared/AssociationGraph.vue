<template>
  <div
    ref="rootEl"
    class="ba-graph relative"
  >
    <!-- Toolbar: relationship filters (= legend), search, grouping, downloads -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 print:hidden">
      <div
        class="flex flex-wrap gap-1.5"
        role="group"
        :aria-label="t('filterBy')"
      >
        <button
          v-for="r in graph.relationships"
          :key="r.label"
          type="button"
          :class="['ba-chip', { off: hiddenRels.has(r.label) }]"
          :aria-pressed="!hiddenRels.has(r.label)"
          :title="t(hiddenRels.has(r.label) ? 'show' : 'hide')"
          @click="toggleRel(r.label)"
        >
          <svg
            width="18"
            height="8"
            aria-hidden="true"
          >
            <line
              x1="2"
              y1="4"
              x2="16"
              y2="4"
              :stroke="colorOf(r.slot)"
              stroke-width="2.5"
              stroke-linecap="round"
              :stroke-dasharray="r.slot ? null : '4 3'"
            />
          </svg>
          {{ relLabel(r.label) }} <span class="opacity-60 tabular-nums">{{ r.count }}</span>
        </button>
      </div>

      <label
        v-if="searchable"
        class="ba-search"
      >
        <span class="sr-only">{{ t('find') }}</span>
        <input
          v-model="query"
          type="search"
          :placeholder="t('find')"
        />
        <span
          v-if="query.trim().length > 1"
          class="text-xs opacity-60 whitespace-nowrap"
          >{{ t('matches', { n: matches.length }) }}</span
        >
      </label>

      <div class="ml-auto flex flex-wrap gap-1.5 text-xs">
        <button
          v-if="canGroup"
          type="button"
          class="ba-dl"
          :aria-pressed="grouping"
          @click="setGrouping(!grouping)"
        >
          {{ grouping ? t('ungroup') : t('group') }}
        </button>
        <button
          type="button"
          class="ba-dl"
          :title="t('pngTitle')"
          @click="download('png')"
        >
          ↓ PNG
        </button>
        <button
          type="button"
          class="ba-dl"
          :title="t('svgTitle')"
          @click="download('svg')"
        >
          ↓ SVG
        </button>
        <button
          type="button"
          class="ba-dl"
          :title="t('csvTitle')"
          @click="downloadCsv"
        >
          ↓ CSV
        </button>
      </div>
    </div>

    <p
      v-if="!layout.nodes.length"
      class="text-sm text-base-content/60 py-6"
    >
      {{ t('allHidden') }}
    </p>

    <div
      v-else
      ref="scrollEl"
      class="overflow-x-auto"
    >
      <svg
        :width="W"
        :height="layout.height"
        :viewBox="`0 0 ${W} ${layout.height}`"
        role="img"
        :aria-label="summary"
        class="ba-svg block select-none"
        @mouseleave="hover = null"
      >
        <!-- Column titles -->
        <text
          v-for="c in layout.titles"
          :key="c.text + c.x"
          :x="c.x"
          :y="c.y"
          :text-anchor="c.anchor"
          class="ba-coltitle"
        >
          {{ c.text }}
        </text>

        <!-- Links -->
        <g fill="none">
          <path
            v-for="l in layout.links"
            :key="l.id"
            :d="l.d"
            :stroke="colorOf(l.slot)"
            :stroke-width="l.width"
            :stroke-dasharray="l.slot ? null : '5 4'"
            stroke-linecap="round"
            :opacity="dimLink(l) ? 0.08 : 0.72"
          />
          <path
            v-for="l in layout.links"
            :key="l.id + '-hit'"
            :d="l.d"
            stroke="transparent"
            stroke-width="10"
            @mouseenter="hover = { type: 'link', id: l.id }"
          />
        </g>

        <!-- Section headings -->
        <text
          v-for="h in layout.headers"
          :key="h.id"
          :x="h.x"
          :y="h.y"
          :text-anchor="h.anchor"
          class="ba-section"
        >
          {{ h.text }}
        </text>

        <!-- Family brackets -->
        <g
          v-for="f in layout.families"
          :key="f.id"
          :class="['ba-fam', f.collapsible ? 'cursor-pointer' : '']"
          :opacity="dimFamily(f) ? 0.3 : 1"
          @click="f.collapsible && collapse(f.key)"
        >
          <title v-if="f.collapsible">{{ t('collapse') }}</title>
          <line
            v-if="f.y1 > f.y0"
            :x1="f.bx"
            :x2="f.bx"
            :y1="f.y0 - 7"
            :y2="f.y1 + 7"
            class="ba-bracket"
          />
          <text
            :x="f.tx"
            :y="f.sub ? f.ty - 6 : f.ty"
            :text-anchor="f.anchor"
            dominant-baseline="middle"
            :class="['ba-famlabel', { 'ba-subfam': f.sub }]"
            :data-fam="f.text"
          >
            {{ f.text }}
          </text>
          <text
            v-if="f.sub"
            :x="f.tx"
            :y="f.ty + 7"
            :text-anchor="f.anchor"
            dominant-baseline="middle"
            class="ba-famlabel ba-famsmall"
            :data-fam="f.sub"
          >
            {{ f.sub }}
          </text>
        </g>

        <!-- Nodes -->
        <g
          v-for="n in layout.nodes"
          :key="n.id"
          :class="['ba-node', (n.otuId && !n.current) || n.isFamily ? 'cursor-pointer' : '']"
          :opacity="dimNode(n) ? 0.22 : 1"
          @mouseenter="hover = { type: 'node', id: n.id }"
          @click="open(n)"
        >
          <circle
            :cx="n.x"
            :cy="n.y"
            r="12"
            fill="transparent"
          />
          <circle
            v-if="n.isFamily"
            :cx="n.x"
            :cy="n.y"
            :r="n.r + 3"
            fill="none"
            :stroke="colorOf(n.slot)"
            stroke-width="1.5"
          />
          <circle
            :cx="n.x"
            :cy="n.y"
            :r="n.r"
            :fill="n.level === 0 ? 'rgb(var(--color-base-content))' : colorOf(n.slot)"
            stroke="rgb(var(--color-base-foreground))"
            stroke-width="2"
          />
          <text
            :x="n.lx"
            :y="n.ly"
            :text-anchor="n.anchor"
            dominant-baseline="middle"
            :class="['ba-label', n.level === 0 ? 'ba-focal' : '', n.isFamily ? 'ba-famnode' : '', matchSet.has(n.id) ? 'ba-match' : '']"
            :data-id="n.id"
          >
            <tspan :font-style="n.italic ? 'italic' : null">{{ n.label }}</tspan>
            <tspan
              v-if="n.inlineFam"
              class="ba-famlabel"
            >
              · {{ n.inlineFam }}</tspan
            >
          </text>
        </g>
      </svg>
    </div>

    <!-- References -->
    <section
      v-if="showReferences && graph.sources?.length"
      class="mt-5 border-t border-base-border/60 pt-4"
    >
      <h3 class="ba-reftitle">{{ t('references') }} ({{ graph.sources.length }})</h3>
      <p class="text-xs text-base-content/60 mt-1">{{ t('refHelp') }}</p>
      <ol class="mt-3 space-y-1.5 text-sm">
        <li
          v-for="src in graph.sources"
          :key="src.id"
          :class="['ba-ref', { on: pinnedRef === src.id }]"
          tabindex="0"
          @mouseenter="hoverRef = src.id"
          @mouseleave="hoverRef = null"
          @focus="hoverRef = src.id"
          @blur="hoverRef = null"
          @click="pinnedRef = pinnedRef === src.id ? null : src.id"
          @keydown.enter.prevent="pinnedRef = pinnedRef === src.id ? null : src.id"
        >
          <span class="ba-refnum">{{ src.n }}</span>
          <span>
            <span
              class="[&_i]:italic"
              v-html="src.html"
            />
            <a
              v-if="src.url && !src.html.includes(src.url)"
              :href="src.url"
              target="_blank"
              rel="noopener"
              class="ml-1 underline"
              @click.stop
              >{{ src.url.replace(/^https?:\/\//, '') }}</a
            >
            <span class="text-base-content/55 whitespace-nowrap"> · {{ t('nLinks', { n: src.links }) }}</span>
          </span>
        </li>
      </ol>
    </section>

    <!-- Tooltip -->
    <div
      v-if="tip"
      class="ba-tip"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
      <p
        v-if="tip.node"
        class="font-semibold"
      >
        <span :class="tip.node.italic && 'italic'">{{ tip.node.name }}</span>
        <span
          v-if="tip.node.family && !tip.node.isFamily"
          class="font-normal opacity-70"
        >
          · {{ familyText(tip.node) }}</span
        >
      </p>
      <p
        v-for="(line, i) in tip.lines"
        :key="i"
      >
        {{ line }}
      </p>
      <p
        v-if="tip.hint"
        class="opacity-70 mt-1"
      >
        {{ tip.hint }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isIt, useT } from '@/utils/soiLang.js'
import { relationshipLabel } from './associationGraph.js'
import { associationBus as bus, sameName } from './associationBus.js'

const props = defineProps({
  // result of buildGraph() in associationGraph.js
  graph: { type: Object, required: true },
  // OTU id of the page this graph is on (its node is not clickable)
  currentOtuId: { type: Number, default: null },
  // list the sources below the drawing
  showReferences: { type: Boolean, default: true },
  // show the "find a taxon" box
  searchable: { type: Boolean, default: false },
  // name of downloaded files, without extension
  fileName: { type: String, default: 'hoverfly-associations' }
})

const t = useT({
  en: {
    level0: 'Hoverflies',
    'level-1': 'Visits, feeds on',
    'level-2': '…which feed on',
    level1: 'Natural enemies',
    level2: '…and their enemies',
    open: 'Click to open its page',
    expand: 'Click to list the {n} taxa',
    collapse: 'Click to group again',
    record: '{n} record',
    records: '{n} records',
    summary: 'Food web of {n} biological associations',
    it: 'it',
    references: 'References',
    refHelp: 'Point at a reference to see the associations it documents; click to keep them highlighted.',
    nLinks: '{n} associations',
    sources: 'Sources',
    filterBy: 'Show or hide a kind of association',
    show: 'Show',
    hide: 'Hide',
    find: 'Find a taxon…',
    matches: '{n} found',
    group: 'Group by family',
    ungroup: 'List every name',
    allHidden: 'All kinds of association are hidden — click one above to show it again.',
    pngTitle: 'Download as an image (PNG)',
    svgTitle: 'Download as a vector drawing (SVG), for publications',
    csvTitle: 'Download the associations as a table (CSV)',
    credit: 'Syrphidae of Italy (SoI) · {url} · {date}'
  },
  it: {
    level0: 'Sirfidi',
    'level-1': 'Visita, si nutre di',
    'level-2': '…che si nutrono di',
    level1: 'Nemici naturali',
    level2: '…e i loro nemici',
    open: 'Clicca per aprire la sua pagina',
    expand: 'Clicca per elencare i {n} taxa',
    collapse: 'Clicca per raggruppare di nuovo',
    record: '{n} record',
    records: '{n} record',
    summary: 'Rete trofica di {n} associazioni biologiche',
    it: 'questo taxon',
    references: 'Bibliografia',
    refHelp: 'Passa sopra un riferimento per vedere le associazioni che documenta; clicca per tenerle evidenziate.',
    nLinks: '{n} associazioni',
    sources: 'Fonti',
    filterBy: 'Mostra o nascondi un tipo di associazione',
    show: 'Mostra',
    hide: 'Nascondi',
    find: 'Cerca un taxon…',
    matches: '{n} trovati',
    group: 'Raggruppa per famiglia',
    ungroup: 'Mostra tutti i nomi',
    allHidden: 'Tutti i tipi di associazione sono nascosti — cliccane uno qui sopra per mostrarlo.',
    pngTitle: 'Scarica come immagine (PNG)',
    svgTitle: 'Scarica come disegno vettoriale (SVG), per pubblicazioni',
    csvTitle: 'Scarica le associazioni come tabella (CSV)',
    credit: 'Syrphidae of Italy (SoI) · {url} · {date}'
  }
})
const relLabel = (label) => relationshipLabel(label, isIt.value)
// "Ichneumonidae: Diplazontinae" for natural enemies, the family otherwise
const familyText = (n) => (n.level > 0 && n.subfamily && n.family ? `${n.family}: ${n.subfamily}` : n.family)
const records = (n) => t(n === 1 ? 'record' : 'records', { n })
// " (larva)" after a name or relationship, when the association records a life stage
const stageText = (list) => (list?.length ? ` (${list.map((x) => x.toLowerCase()).join(', ')})` : '')
const colTitle = (level) => t(`level${Math.max(-2, Math.min(2, level))}`)
// "Sources: [2] De Buck, 1990; [4] Sommaggio, Burgio & Guerrieri, 2014"
function sourcesOf(links) {
  const ids = [...new Set(links.flatMap((l) => l.sources || []))]
  const list = (props.graph.sources || []).filter((s) => ids.includes(s.id))
  return list.length ? `${t('sources')}: ${list.map((s) => `[${s.n}] ${s.short}`).join('; ')}` : ''
}

const router = useRouter()
const rootEl = ref(null)
const scrollEl = ref(null)
const width = ref(800)
const hover = ref(null)
const hoverRef = ref(null)
// the reference picked here or in the table (shared, see associationBus.js)
const pinnedRef = computed({
  get: () => bus.pinnedSource,
  set: (v) => (bus.pinnedSource = v)
})
const query = ref('')

const ROW = 22
const HEAD = 26
const TOP = 34
const GAP_FOCAL = 90 // room for the links next to the hoverflies
const GAP_OUTER = 50 // room for links between outer columns
const AUTO_GROUP = 25 // a section longer than this starts grouped by family

const SLOT_VARS = ['--ba-other', '--ba-rel-1', '--ba-rel-2', '--ba-rel-3']
const colorOf = (slot) => `var(${SLOT_VARS[slot] || SLOT_VARS[0]})`
const radius = (count) => Math.min(9, 3.5 + Math.sqrt(count) * 1.4)
const slotForGroup = (label) => props.graph.relationships.find((r) => r.label === label)?.slot || 0
const relRank = (r) => [1, 2, 3].indexOf(slotForGroup(r)) + 1 || 9

// ---- What is shown: relationship filters and family grouping -------------------
const hiddenRels = ref(new Set())
function toggleRel(label) {
  const s = new Set(hiddenRels.value)
  if (s.has(label)) s.delete(label)
  else s.add(label)
  hiddenRels.value = s
}

const filtered = computed(() => {
  const links = props.graph.links.filter((l) => !hiddenRels.value.has(l.relationship))
  const used = new Set(links.flatMap((l) => [l.from, l.to]))
  const columns = props.graph.columns
    .map((c) => ({ ...c, nodes: c.nodes.filter((n) => used.has(n.id)) }))
    .filter((c) => c.nodes.length)
  return { columns, links }
})

// family runs worth grouping: ≥2 names of one family in the same section
const groupable = computed(() => {
  const out = []
  filtered.value.columns.forEach((c) => {
    if (c.level === 0) return
    const byKey = new Map()
    c.nodes.forEach((n) => {
      if (!n.family) return
      const k = `${c.level}|${n.group}|${n.family}`
      if (!byKey.has(k)) byKey.set(k, [])
      byKey.get(k).push(n)
    })
    byKey.forEach((members, key) => {
      if (members.length > 1) out.push({ key, members })
    })
  })
  return out
})
const canGroup = computed(() => groupable.value.length > 0)
const groupingChoice = ref(null) // null = automatic
const grouping = computed(() => {
  if (groupingChoice.value !== null) return groupingChoice.value
  return filtered.value.columns.some((c) => {
    const counts = new Map()
    c.nodes.forEach((n) => counts.set(n.group, (counts.get(n.group) || 0) + 1))
    return c.level !== 0 && [...counts.values()].some((v) => v > AUTO_GROUP)
  })
})
const expanded = ref(new Set())
function setGrouping(on) {
  groupingChoice.value = on
  expanded.value = new Set()
}
function collapse(key) {
  const s = new Set(expanded.value)
  s.delete(key)
  expanded.value = s
}

const view = computed(() => {
  const { columns, links } = filtered.value
  if (!grouping.value) return { columns, links }
  const remap = new Map()
  const familyNodes = new Map()
  groupable.value.forEach(({ key, members }) => {
    if (expanded.value.has(key)) return
    const [level, group, family] = key.split('|')
    const id = `${level}|fam:${group}|${family}`
    familyNodes.set(id, {
      id,
      key,
      level: Number(level),
      group,
      family,
      name: family,
      italic: false,
      isFamily: true,
      members,
      otuId: null,
      count: members.reduce((a, m) => a + m.count, 0)
    })
    members.forEach((m) => remap.set(m.id, id))
  })
  const cols = columns.map((c) => {
    const seen = new Set()
    const nodes = []
    c.nodes.forEach((n) => {
      const id = remap.get(n.id)
      if (!id) {
        nodes.push(n)
      } else if (!seen.has(id)) {
        seen.add(id)
        nodes.push(familyNodes.get(id))
      }
    })
    return { ...c, nodes }
  })
  const merged = new Map()
  links.forEach((l) => {
    const from = remap.get(l.from) || l.from
    const to = remap.get(l.to) || l.to
    const k = `${from}>${to}>${l.relationship}`
    if (!merged.has(k)) merged.set(k, { ...l, from, to, count: 0, sources: [] })
    const m = merged.get(k)
    m.count += l.count
    m.sources = [...new Set([...m.sources, ...(l.sources || [])])]
  })
  return { columns: cols, links: [...merged.values()] }
})

// ---- Label widths (measured once drawn, estimated until then) -------------------
const measured = ref(new Map())
const textW = (key, text, px = 6.5) => measured.value.get(key) ?? Math.ceil(String(text).length * px)
const labelOf = (n) => (n.isFamily ? `${n.name} (${n.members.length})` : n.name)
const nameW = (n, inline = false) =>
  measured.value.get(n.id) ??
  Math.ceil(labelOf(n).length * (n.level === 0 ? 7.3 : 6.5) + (inline && n.family && !n.isFamily ? (n.family.length + 3) * 6 : 0))
const famW = (f) => textW(`fam:${f}`, f, 6)

// ---- Layout -----------------------------------------------------------------------
const W = computed(() => Math.max(width.value, layout.value.needed))

const layout = computed(() => {
  const cols = view.value.columns
  const links0 = view.value.links
  const n = cols.length
  const focalIndex = Math.max(0, cols.findIndex((c) => c.level === 0))
  // Names sit on the outer side of their dot (left of it left of the hoverflies,
  // right of it to the right); hoverfly names to the right of their dot. Each
  // side column also has a family column on its outer edge.
  const sideOf = (level) => (level < 0 ? 'left' : level > 0 ? 'right' : focalIndex === 0 && n > 1 ? 'left' : 'right')
  // A column whose outer side receives links from a further column (e.g. the
  // aphids, linked to their host plants) shows families after each name instead,
  // so those links can reach the names.
  const inlineFam = cols.map((c) => c.level !== 0 && cols.some((o) => Math.sign(o.level) === Math.sign(c.level) && Math.abs(o.level) > Math.abs(c.level)))
  const showFam = (node) => !node.isFamily && node.level !== 0 && node.family && !inlineLevels.has(node.level)
  const inlineLevels = new Set(cols.filter((c, i) => inlineFam[i]).map((c) => c.level))
  const colName = cols.map((c, i) => Math.max(0, ...c.nodes.map((nd) => nameW(nd, inlineFam[i]))))
  const famLines = (nd) => (nd.level > 0 && nd.subfamily ? [nd.subfamily, nd.family] : [nd.family])
  const colFam = cols.map((c) => Math.max(0, ...c.nodes.filter(showFam).flatMap((nd) => famLines(nd).map(famW))))
  inlineLevelSet = inlineLevels
  const colW = cols.map((c, i) => colName[i] + (colFam[i] ? 14 + colFam[i] : 0))

  // x positions, left to right; the gaps grow to fill a wide container
  const gaps = cols.slice(1).map((c, i) => (c.level === 0 || cols[i].level === 0 ? GAP_FOCAL : GAP_OUTER))
  const xsFor = (gapList) => {
    const xs = []
    let cursor = 8
    cols.forEach((c, i) => {
      const g = i ? gapList[i - 1] : 0
      if (sideOf(c.level) === 'left') {
        cursor = cursor + g + colW[i] + 12
        xs.push(cursor)
      } else {
        xs.push(cursor + g)
        cursor = cursor + g + 12 + colW[i]
      }
    })
    return { xs, end: cursor + 8 }
  }
  let { xs, end } = xsFor(gaps)
  const needed = end
  const extra = width.value - end
  if (extra > 0 && gaps.length) ({ xs } = xsFor(gaps.map((g) => g + Math.min(extra / gaps.length, 220))))
  else if (extra > 0) xs = xs.map((x) => x + extra / 2)

  const placed = new Map()
  const headers = []
  const titles = []
  let bottom = TOP

  cols.forEach((col, i) => {
    if (col.level === 0 && col.nodes.length < 2) return
    const side = sideOf(col.level)
    titles.push({
      level: col.level,
      y: 14,
      text: colTitle(col.level),
      x: side === 'left' ? xs[i] + 10 : xs[i] - 10,
      anchor: side === 'left' ? 'end' : 'start'
    })
  })

  const neighbours = (id) => links0.filter((l) => l.from === id || l.to === id).map((l) => (l.from === id ? l.to : l.from))
  const focalCol = cols[focalIndex]?.level === 0 ? cols[focalIndex] : null
  const focalOrder = new Map()
  if (focalCol) {
    const main = (node) => {
      const byRel = new Map()
      links0
        .filter((l) => l.from === node.id || l.to === node.id)
        .forEach((l) => byRel.set(l.relationship, (byRel.get(l.relationship) || 0) + l.count))
      return [...byRel.entries()].sort((a, b) => b[1] - a[1] || relRank(a[0]) - relRank(b[0]))[0]?.[0] || ''
    }
    ;[...focalCol.nodes]
      .sort((a, b) => relRank(main(a)) - relRank(main(b)) || b.count - a.count || a.name.localeCompare(b.name))
      .forEach((nd, i) => focalOrder.set(nd.id, i))
  }
  const focalRank = (node) => Math.min(9999, ...neighbours(node.id).map((id) => focalOrder.get(id) ?? 9999))
  const innerSorted = (col) =>
    [...col.nodes].sort(
      (a, b) =>
        relRank(a.group || '') - relRank(b.group || '') ||
        (a.group || '').localeCompare(b.group || '') ||
        focalRank(a) - focalRank(b) ||
        (a.family || '~').localeCompare(b.family || '~') ||
        (a.isFamily ? 0 : 1) - (b.isFamily ? 0 : 1) ||
        a.name.localeCompare(b.name)
    )
  // life stage of the hoverflies in a section, e.g. "Predator of (10) · larva"
  const stageOf = (col, group) => {
    const ids = new Set(col.nodes.filter((m) => m.group === group).map((m) => m.id))
    const set = new Set()
    links0.forEach((l) => {
      if (l.relationship !== group) return
      if (col.level < 0 && ids.has(l.to)) (l.stages?.from || []).forEach((x) => set.add(x))
      if (col.level > 0 && ids.has(l.from)) (l.stages?.to || []).forEach((x) => set.add(x))
    })
    return [...set].map((x) => x.toLowerCase()).join(', ')
  }
  const heading = (col, x, side, group, y) => {
    const count = col.nodes.reduce((a, m) => a + (m.group === group ? (m.isFamily ? m.members.length : 1) : 0), 0)
    const stage = Math.abs(col.level) === 1 ? stageOf(col, group) : ''
    headers.push({
      id: `${col.level}-${group}`,
      text: `${relLabel(group)} (${count})${stage ? ` · ${stage}` : ''}`,
      x: side === 'left' ? x + 10 : x - 10,
      y: y + 6,
      anchor: side === 'left' ? 'end' : 'start'
    })
  }
  const bary = (node) => {
    const ys = neighbours(node.id)
      .map((id) => placed.get(id)?.y)
      .filter((v) => v !== undefined)
    return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : Infinity
  }

  // 1) the larger column beside the hoverflies: stacked, a heading per relationship
  const inner = cols.map((c, i) => ({ c, i })).filter(({ c }) => Math.abs(c.level) === 1)
  inner.sort((a, b) => b.c.nodes.length - a.c.nodes.length)
  const [stacked, follower] = inner
  if (stacked) {
    const { c: col, i } = stacked
    const side = sideOf(col.level)
    let y = TOP
    let group
    for (const node of innerSorted(col)) {
      if (node.group !== group) {
        group = node.group
        if (group) {
          if (y > TOP) y += 10
          heading(col, xs[i], side, group, y)
          y += HEAD
        }
      }
      placed.set(node.id, place(node, xs[i], y, side))
      y += ROW
    }
    bottom = Math.max(bottom, y)
  }

  // 2) hoverflies: each beside the names it is linked to
  if (focalCol) {
    const x = xs[focalIndex]
    const side = sideOf(0)
    const step = ROW * 1.4
    const nodes = [...focalCol.nodes].sort((a, b) => focalOrder.get(a.id) - focalOrder.get(b.id))
    let y = TOP - step
    nodes.forEach((nd) => {
      const b = bary(nd)
      y = Math.max(y + step, Number.isFinite(b) ? b : y + step)
      placed.set(nd.id, place(nd, x, y, side))
    })
    bottom = Math.max(bottom, y + ROW)
  }

  // 3) the other column beside the hoverflies: level with the hoverflies they are linked to
  if (follower) {
    const { c: col, i } = follower
    const side = sideOf(col.level)
    let y = TOP - ROW
    let group
    const order = innerSorted(col).sort(
      (a, b) =>
        relRank(a.group || '') - relRank(b.group || '') || (a.group || '').localeCompare(b.group || '') || bary(a) - bary(b)
    )
    for (const node of order) {
      let next = y + ROW
      if (node.group !== group) {
        group = node.group
        if (group) next = y + ROW + (y > TOP ? 10 : 0) + HEAD
      }
      const b = bary(node)
      y = Math.max(next, Number.isFinite(b) ? b : next)
      if (group && !headers.some((h) => h.id === `${col.level}-${group}`)) heading(col, xs[i], side, group, y - HEAD)
      placed.set(node.id, place(node, xs[i], y, side))
    }
    bottom = Math.max(bottom, y + ROW)
    const firstHead = Math.min(...headers.filter((h) => h.id.startsWith(`${col.level}-`)).map((h) => h.y), Infinity)
    const title = titles.find((tt) => tt.level === col.level)
    if (title && Number.isFinite(firstHead)) title.y = Math.max(14, firstHead - 24)
  }

  // 4) outer columns: each name next to the names it is linked to
  const outer = cols.map((c, i) => ({ c, i })).filter(({ c }) => Math.abs(c.level) >= 2)
  outer.sort((a, b) => Math.abs(a.c.level) - Math.abs(b.c.level))
  for (const { c, i } of outer) {
    const side = sideOf(c.level)
    const order = c.nodes
      .map((node) => ({ node, b: bary(node) }))
      .sort((a, b) => a.b - b.b || a.node.name.localeCompare(b.node.name))
    let y = TOP - ROW
    for (const { node, b } of order) {
      y = Math.max(y + ROW, Number.isFinite(b) ? b : y + ROW, TOP)
      placed.set(node.id, place(node, xs[i], y, side))
    }
    bottom = Math.max(bottom, y + ROW)
    const firstY = Math.min(...c.nodes.map((nd) => placed.get(nd.id).y))
    const title = titles.find((tt) => tt.level === c.level)
    if (title) title.y = Math.max(14, firstY - 24)
  }

  // Family column: one label per run of names of the same family, with a bracket
  const families = []
  cols.forEach((c, i) => {
    if (c.level === 0 || !colFam[i]) return
    const side = sideOf(c.level)
    const x = xs[i]
    const bx = side === 'left' ? x - 12 - colName[i] - 8 : x + 12 + colName[i] + 8
    const nodes = c.nodes
      .map((nd) => placed.get(nd.id))
      .filter(showFam)
      .sort((a, b) => a.y - b.y)
    let run = []
    const flush = () => {
      if (!run.length) return
      const y0 = run[0].y
      const y1 = run.at(-1).y
      const key = `${c.level}|${run[0].group}|${run[0].family}`
      const sub = c.level > 0 && run[0].subfamily ? run[0].subfamily : null
      families.push({
        id: `${key}|${sub}|${y0}`,
        key,
        text: sub || run[0].family,
        sub: sub ? run[0].family : null,
        bx,
        tx: side === 'left' ? bx - 6 : bx + 6,
        ty: (y0 + y1) / 2,
        y0,
        y1,
        anchor: side === 'left' ? 'end' : 'start',
        members: run.map((r) => r.id),
        collapsible: grouping.value && expanded.value.has(key)
      })
      run = []
    }
    nodes.forEach((nd) => {
      const prev = run.at(-1)
      if (
        prev &&
        (prev.family !== nd.family || prev.subfamily !== nd.subfamily || prev.group !== nd.group || nd.y - prev.y > ROW + 0.5)
      )
        flush()
      run.push(nd)
    })
    flush()
  })

  // Links stop at the outer edge of a column's names (and families) when they
  // come from that side, so lines never run through text.
  const extentOf = new Map(cols.map((c, i) => [c.level, colW[i]]))
  const endX = (nd, otherX) => {
    const w = nd.level === 0 || inlineLevels.has(nd.level) ? nameW(nd, true) : extentOf.get(nd.level)
    if (nd.anchor === 'end' && otherX < nd.x) return nd.x - 12 - w - 4
    if (nd.anchor === 'start' && otherX > nd.x) return nd.x + 12 + w + 4
    return nd.x
  }
  const links = links0
    .map((l, i) => {
      const a = placed.get(l.from)
      const b = placed.get(l.to)
      if (!a || !b) return null
      const ax = endX(a, b.x)
      const bx = endX(b, a.x)
      const mx = (ax + bx) / 2
      return {
        ...l,
        id: `l${i}`,
        width: Math.min(5, 1.5 + Math.log2(l.count)),
        d: `M${bx},${b.y} C${mx},${b.y} ${mx},${a.y} ${ax},${a.y}`
      }
    })
    .filter(Boolean)

  return { nodes: [...placed.values()], headers, titles, links, families, height: bottom + 8, needed }
})

// set while laying out: levels whose families are written after the names
let inlineLevelSet = new Set()
const inlineLevel = (node) => !node.isFamily && node.level !== 0 && node.family && inlineLevelSet.has(node.level)

function place(node, x, y, side) {
  const r = radius(node.count) + (node.level === 0 ? 1.5 : 0)
  const label = side === 'left' ? { lx: x - 12, ly: y, anchor: 'end' } : { lx: x + 12, ly: y, anchor: 'start' }
  return {
    ...node,
    x,
    y,
    r,
    label: labelOf(node),
    inlineFam: inlineLevel(node) ? familyText(node) : null,
    slot: slotForGroup(node.group),
    current: props.currentOtuId && node.otuId === props.currentOtuId,
    ...label
  }
}

const nodeById = computed(() => new Map(layout.value.nodes.map((n) => [n.id, n])))

// ---- Search: a taxon and its whole food chain ---------------------------------
const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (q.length < 2) return []
  return layout.value.nodes.filter(
    (n) => labelOf(n).toLowerCase().includes(q) || n.members?.some((m) => m.name.toLowerCase().includes(q))
  )
})
const matchSet = computed(() => new Set(matches.value.map((n) => n.id)))
// From a name, follow links away from it in one direction at a time
// (plant → aphid → hoverfly → parasitoid), so the chain stays a chain.
const chainLinks = computed(() => {
  if (!matches.value.length) return null
  const out = new Set()
  const links = layout.value.links
  const level = (id) => nodeById.value.get(id)?.level ?? 0
  const walk = (id, dir, seen) => {
    links.forEach((l) => {
      const other = l.from === id ? l.to : l.to === id ? l.from : null
      if (other === null || seen.has(other)) return
      if (Math.sign(level(other) - level(id)) !== dir) return
      out.add(l.id)
      seen.add(other)
      walk(other, dir, seen)
    })
  }
  matches.value.forEach((m) => {
    walk(m.id, 1, new Set([m.id]))
    walk(m.id, -1, new Set([m.id]))
  })
  return out
})
watch(matches, async (list) => {
  if (!list.length) return
  await nextTick()
  const el = rootEl.value?.querySelector(`text[data-id="${CSS.escape(list[0].id)}"]`)
  el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
})

// ---- Highlighting --------------------------------------------------------------
const activeLinks = computed(() => {
  const h = hover.value
  if (h?.type === 'link') return new Set([h.id])
  if (h?.type === 'node') return new Set(layout.value.links.filter((l) => l.from === h.id || l.to === h.id).map((l) => l.id))
  const ref = hoverRef.value ?? pinnedRef.value
  if (ref) return new Set(layout.value.links.filter((l) => l.sources?.includes(ref)).map((l) => l.id))
  // a row pointed at in the Biological associations table
  const b = bus.hover
  if (b && b.from === 'table') {
    const ids = layout.value.links
      .filter((l) => {
        const a = nodeById.value.get(l.from)
        const z = nodeById.value.get(l.to)
        if (!a || !z || (a.level !== 0 && z.level !== 0)) return false
        const partner = a.level === 0 ? z : a
        return (partner.members || [partner]).some((m) => sameName(m.name, b.partner)) && (!b.relationship || b.relationship === l.relationship)
      })
      .map((l) => l.id)
    if (ids.length) return new Set(ids)
  }
  return chainLinks.value
})
const activeNodes = computed(() => {
  if (!activeLinks.value) return null
  const s = new Set([...(hover.value?.type === 'node' ? [hover.value.id] : []), ...matchSet.value])
  layout.value.links.forEach((l) => {
    if (activeLinks.value.has(l.id)) {
      s.add(l.from)
      s.add(l.to)
    }
  })
  return s
})
const dimLink = (l) => activeLinks.value && !activeLinks.value.has(l.id)
const dimNode = (n) => activeNodes.value && !activeNodes.value.has(n.id)
const dimFamily = (f) => activeNodes.value && !f.members.some((id) => activeNodes.value.has(id))

const tip = computed(() => {
  const h = hover.value
  const svg = rootEl.value?.querySelector('svg.ba-svg')
  if (!h || !svg) return null
  const box = svg.getBoundingClientRect()
  const root = rootEl.value.getBoundingClientRect()
  const pos = (x, y) => ({
    x: Math.max(0, Math.min(box.left - root.left + x + 14, root.width - 260)),
    y: box.top - root.top + y + 12
  })
  if (h.type === 'node') {
    const node = nodeById.value.get(h.id)
    if (!node) return null
    const mine = layout.value.links.filter((l) => l.from === h.id || l.to === h.id)
    let lines = mine.map((l) => {
      const other = nodeById.value.get(l.from === h.id ? l.to : l.from)
      return l.from === h.id
        ? `${relLabel(l.relationship)}${stageText(l.stages?.from)} ${other?.label || ''} (${l.count})`
        : `${other?.label || ''}${stageText(l.stages?.from)} — ${relLabel(l.relationship).toLowerCase()} ${t('it')}${stageText(l.stages?.to)} (${l.count})`
    })
    if (node.isFamily) lines = [node.members.map((m) => m.name).join(', '), ...lines]
    const refs = sourcesOf(mine)
    if (refs) lines.push(refs)
    const hint = node.isFamily ? t('expand', { n: node.members.length }) : node.otuId && !node.current ? t('open') : ''
    return { node, lines, hint, ...pos(node.x, node.y) }
  }
  const l = layout.value.links.find((x) => x.id === h.id)
  if (!l) return null
  const a = nodeById.value.get(l.from)
  const b = nodeById.value.get(l.to)
  return {
    node: null,
    lines: [
      `${a.label}${stageText(l.stages?.from)} — ${relLabel(l.relationship).toLowerCase()} — ${b.label}${stageText(l.stages?.to)}`,
      records(l.count),
      sourcesOf([l])
    ].filter(Boolean),
    hint: '',
    ...pos((a.x + b.x) / 2, (a.y + b.y) / 2)
  }
})

function open(n) {
  if (n.isFamily) {
    expanded.value = new Set([...expanded.value, n.key])
    hover.value = null
    return
  }
  // a hoverfly opens on its own Biological associations tab, other taxa on their overview
  if (n.otuId && !n.current) router.push({ name: n.level === 0 ? 'otus-id-associations' : 'otus-id', params: { id: n.otuId } })
}

const summary = computed(() => t('summary', { n: props.graph.total }))

// ---- Shared with the Biological associations table -----------------------------
watch(
  () => props.graph.sources,
  (list) => (bus.sourceNumbers = new Map((list || []).map((s) => [s.id, s.n]))),
  { immediate: true }
)
watch(hover, (h) => {
  if (!h) {
    if (bus.hover?.from === 'graph') bus.hover = null
    return
  }
  if (h.type === 'node') {
    const n = nodeById.value.get(h.id)
    bus.hover = n && n.level !== 0 ? { partner: n.name, from: 'graph' } : null
    return
  }
  const l = layout.value.links.find((x) => x.id === h.id)
  const a = l && nodeById.value.get(l.from)
  const z = l && nodeById.value.get(l.to)
  if (!a || !z || (a.level !== 0 && z.level !== 0)) {
    bus.hover = null
    return
  }
  bus.hover = { partner: (a.level === 0 ? z : a).name, relationship: l.relationship, from: 'graph' }
})

// ---- Downloads -----------------------------------------------------------------
// The drawing is copied with every style written into it (so colours, fonts and
// the light/dark theme survive outside the page), with the legend above and a
// credit line below.
const STYLE_PROPS = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'paint-order',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'text-transform'
]
const SVGNS = 'http://www.w3.org/2000/svg'

function exportSvg() {
  const svg = rootEl.value.querySelector('svg.ba-svg')
  const rootStyle = getComputedStyle(rootEl.value)
  const css = (v) => rootStyle.getPropertyValue(v).trim()
  const docStyle = getComputedStyle(document.documentElement)
  const bg = `rgb(${docStyle.getPropertyValue('--color-base-foreground').trim() || '255,255,255'})`
  const ink = `rgb(${docStyle.getPropertyValue('--color-base-content').trim() || '0,0,0'})`
  const font = getComputedStyle(svg).fontFamily

  const body = svg.cloneNode(true)
  const src = svg.querySelectorAll('*')
  body.querySelectorAll('*').forEach((el, i) => {
    const cs = getComputedStyle(src[i])
    STYLE_PROPS.forEach((p) => el.style.setProperty(p, cs.getPropertyValue(p)))
    el.removeAttribute('class')
  })
  body.querySelectorAll('path[stroke="transparent"], circle[fill="transparent"], title').forEach((el) => el.remove())

  const w = Number(svg.getAttribute('width'))
  const h = Number(svg.getAttribute('height'))
  const top = 34
  const out = document.createElementNS(SVGNS, 'svg')
  out.setAttribute('xmlns', SVGNS)
  out.setAttribute('width', w + 32)
  out.setAttribute('height', h + top + 44)
  out.setAttribute('viewBox', `0 0 ${w + 32} ${h + top + 44}`)
  out.setAttribute('font-family', font)
  const add = (parent, tag, attrs, text) => {
    const el = document.createElementNS(SVGNS, tag)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    if (text) el.textContent = text
    parent.appendChild(el)
    return el
  }
  add(out, 'rect', { width: '100%', height: '100%', fill: bg })
  let x = 16
  props.graph.relationships
    .filter((r) => !hiddenRels.value.has(r.label))
    .forEach((r) => {
      const color = css(SLOT_VARS[r.slot] || SLOT_VARS[0])
      const dash = r.slot ? {} : { 'stroke-dasharray': '4 3' }
      add(out, 'line', { x1: x, y1: 20, x2: x + 18, y2: 20, stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round', ...dash })
      const label = `${relLabel(r.label)} (${r.count})`
      add(out, 'text', { x: x + 24, y: 24, 'font-size': 12, fill: ink }, label)
      x += 24 + label.length * 6.4 + 22
    })
  const g = add(out, 'g', { transform: `translate(16, ${top})` })
  ;[...body.childNodes].forEach((nd) => g.appendChild(nd))
  const url = window.location.href.replace(/^https?:\/\//, '')
  add(
    out,
    'text',
    { x: 16, y: h + top + 28, 'font-size': 11, fill: ink, opacity: 0.6 },
    t('credit', { url, date: new Date().toISOString().slice(0, 10) })
  )
  return { text: new XMLSerializer().serializeToString(out), width: w + 32, height: h + top + 44 }
}

function save(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

async function download(kind) {
  const keep = { hover: hover.value, ref: hoverRef.value, pinned: pinnedRef.value, query: query.value }
  hover.value = null
  hoverRef.value = null
  pinnedRef.value = null
  query.value = ''
  await nextTick()
  const { text, width: w, height: h } = exportSvg()
  hover.value = keep.hover
  hoverRef.value = keep.ref
  pinnedRef.value = keep.pinned
  query.value = keep.query
  if (kind === 'svg') return save(new Blob([text], { type: 'image/svg+xml' }), `${props.fileName}.svg`)
  const img = new Image()
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }))
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = url
  })
  const scale = 2 // sharp on screens and in print
  const canvas = document.createElement('canvas')
  canvas.width = w * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0)
  URL.revokeObjectURL(url)
  canvas.toBlob((blob) => blob && save(blob, `${props.fileName}.png`), 'image/png')
}

// One row per pair of taxa and relationship shown (filters apply; families are not grouped)
function downloadCsv() {
  const byId = new Map(props.graph.columns.flatMap((c) => c.nodes.map((n) => [n.id, n])))
  const sources = new Map((props.graph.sources || []).map((s) => [s.id, s]))
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['consumer', 'consumer_family', 'consumer_subfamily', 'relationship', 'resource', 'resource_family', 'resource_subfamily', 'records', 'references']
  const rows = filtered.value.links.map((l) => {
    const a = byId.get(l.from)
    const b = byId.get(l.to)
    const refs = (l.sources || [])
      .map((id) => sources.get(id))
      .filter(Boolean)
      .map((s) => s.short + (s.url ? ` (${s.url})` : ''))
    return [a?.name, a?.family, a?.subfamily, l.relationship, b?.name, b?.family, b?.subfamily, l.count, refs.join('; ')]
      .map(q)
      .join(',')
  })
  const text = '﻿' + [header.join(','), ...rows].join('\r\n') // BOM: opens correctly in Excel
  save(new Blob([text], { type: 'text/csv;charset=utf-8' }), `${props.fileName}.csv`)
}

// ---- Measure drawn text so columns and links fit the names exactly ------------
watch(
  () => layout.value.nodes.map((n) => n.id + n.label).join('|') + layout.value.families.length,
  async () => {
    await nextTick()
    const next = new Map(measured.value)
    let changed = false
    const note = (key, el) => {
      const w = Math.ceil(el.getBBox().width)
      if (w && Math.abs((next.get(key) ?? 0) - w) > 1) {
        next.set(key, w)
        changed = true
      }
    }
    rootEl.value?.querySelectorAll('text[data-id]').forEach((el) => note(el.dataset.id, el))
    rootEl.value?.querySelectorAll('text[data-fam]').forEach((el) => note(`fam:${el.dataset.fam}`, el))
    if (changed) measured.value = next
  },
  { immediate: true }
)

let ro
onMounted(async () => {
  ro = new ResizeObserver(([e]) => (width.value = Math.floor(e.contentRect.width)))
  ro.observe(rootEl.value)
})

// On narrow screens the drawing scrolls sideways: keep the hoverflies in view
// until the visitor scrolls it themselves
let userScrolled = false
watch(
  () => [layout.value.needed, width.value],
  async () => {
    await nextTick()
    const el = scrollEl.value
    if (!el || userScrolled) return
    const focal = layout.value.nodes.find((nd) => nd.level === 0)
    if (focal && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = Math.max(0, focal.x - el.clientWidth / 2)
      el.addEventListener('pointerdown', () => (userScrolled = true), { once: true })
    }
  },
  { immediate: true }
)
onBeforeUnmount(() => ro?.disconnect())
</script>

<style>
/* Relationship colours: categorical slots 1–3 (validated all-pairs in light and
   dark), plus a neutral dashed line for any other relationship. */
.ba-graph {
  --ba-rel-1: #2a78d6;
  --ba-rel-2: #eb6834;
  --ba-rel-3: #1baf7a;
  --ba-other: #8a8984;
}
html.dark .ba-graph {
  --ba-rel-1: #3987e5;
  --ba-rel-2: #d95926;
  --ba-rel-3: #199e70;
  --ba-other: #9a9992;
}
</style>

<style scoped>
.ba-coltitle {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  fill: rgba(var(--color-base-content), 0.55);
}
.ba-section {
  font-size: 11.5px;
  font-weight: 700;
  fill: rgba(var(--color-base-content), 0.8);
}
.ba-label {
  font-size: 12px;
  fill: rgb(var(--color-base-content));
  paint-order: stroke;
  stroke: rgb(var(--color-base-foreground));
  stroke-width: 3px;
  stroke-linejoin: round;
}
.ba-focal {
  font-weight: 700;
  font-size: 13px;
}
.ba-famnode {
  font-weight: 600;
}
.ba-match {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}
.ba-famlabel {
  font-size: 10.5px;
  fill: rgba(var(--color-base-content), 0.55);
}
.ba-subfam {
  fill: rgba(var(--color-base-content), 0.75);
  font-weight: 600;
}
.ba-famsmall {
  font-size: 9.5px;
}
.ba-bracket {
  stroke: rgba(var(--color-base-content), 0.25);
  stroke-width: 1;
}
.ba-fam.cursor-pointer:hover .ba-famlabel {
  text-decoration: underline;
}
.ba-node:hover .ba-label {
  text-decoration: underline;
}
.ba-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.2rem 0.65rem 0.2rem 0.45rem;
  font-size: 12px;
  color: rgba(var(--color-base-content), 0.85);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.ba-chip:hover {
  background: rgba(var(--color-base-content), 0.05);
}
.ba-chip.off {
  opacity: 0.45;
  text-decoration: line-through;
}
.ba-search {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.ba-search input {
  width: 13rem;
  border-radius: 999px;
  border: 0;
  padding: 0.3rem 0.8rem;
  font-size: 12.5px;
  background: rgba(var(--color-base-content), 0.04);
  color: rgb(var(--color-base-content));
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.ba-search input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px rgb(var(--color-primary));
}
.ba-dl {
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  font-weight: 600;
  color: rgba(var(--color-base-content), 0.8);
  box-shadow: inset 0 0 0 1px rgba(var(--color-base-border), 0.9);
}
.ba-dl:hover {
  background: rgba(var(--color-base-content), 0.06);
}
.ba-reftitle {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(var(--color-base-content), 0.6);
}
.ba-ref {
  display: grid;
  grid-template-columns: 1.6rem 1fr;
  gap: 0.25rem;
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
  cursor: pointer;
  line-height: 1.45;
}
.ba-ref:hover,
.ba-ref:focus-visible,
.ba-ref.on {
  background: rgba(var(--color-base-content), 0.06);
  outline: none;
}
.ba-ref.on .ba-refnum {
  background: rgb(var(--color-base-content));
  color: rgb(var(--color-base-foreground));
}
.ba-refnum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.25rem;
  min-width: 1.25rem;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: rgba(var(--color-base-content), 0.1);
  margin-top: 0.05rem;
}
.ba-tip {
  position: absolute;
  z-index: 20;
  max-width: 260px;
  pointer-events: none;
  background: rgb(var(--color-base-content));
  color: rgb(var(--color-base-foreground));
  font-size: 12px;
  line-height: 1.4;
  padding: 6px 9px;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}
</style>
