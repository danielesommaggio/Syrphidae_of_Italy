<template>
  <div
    ref="rootEl"
    class="ba-graph relative"
  >
    <!-- Legend: two series -->
    <ul class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-base-content/80 mb-4">
      <li
        v-for="s in SERIES"
        :key="s.key"
        class="flex items-center gap-1.5"
      >
        <span
          class="inline-block h-2.5 w-2.5 rounded-sm"
          :style="{ background: `var(${s.color})` }"
        />
        {{ t(s.key) }}
      </li>
    </ul>

    <p
      v-if="!rows.length"
      class="text-sm text-base-content/60"
    >
      {{ t('none') }}
    </p>

    <ol
      v-else
      class="space-y-1.5"
      @mouseleave="hover = null"
    >
      <li
        v-for="(r, i) in rows"
        :key="r.family"
        class="pf-row"
        :class="{ dim: hover !== null && hover !== i }"
        @mouseenter="hover = i"
      >
        <span class="pf-name">{{ r.family }}</span>
        <span class="pf-track">
          <span
            v-for="s in SERIES"
            v-show="r[s.key]"
            :key="s.key"
            :class="['pf-seg', { end: s.key === lastKey(r) }]"
            :style="{ width: `${(r[s.key] / max) * 100}%`, background: `var(${s.color})` }"
          />
          <span class="pf-value">{{ r.total }}</span>
        </span>
      </li>
    </ol>

    <div
      v-if="hover !== null && rows[hover]"
      class="pf-tip"
      :style="{ top: `${hover * 30 + 30}px` }"
    >
      <p class="font-semibold">{{ rows[hover].family }}</p>
      <p v-if="rows[hover].flowers">{{ t('flowers') }}: {{ rows[hover].flowers }}</p>
      <p v-if="rows[hover].feeding">{{ t('feeding') }}: {{ rows[hover].feeding }}</p>
      <p class="opacity-75 mt-1 italic">{{ rows[hover].plants.join(', ') }}</p>
    </div>

    <p class="mt-4 text-xs text-base-content/55">{{ t('note') }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { slotOf } from '~/panels/_shared/associationGraph.js'
import { useT } from '@/utils/soiLang.js'

const props = defineProps({
  // result of buildGraph() in panels/_shared/associationGraph.js
  graph: { type: Object, required: true },
  // families shown before the rest are folded into "Other families"
  top: { type: Number, default: 12 }
})

const t = useT({
  en: {
    flowers: 'Flower visits',
    feeding: 'Larvae or adults feeding on the plant',
    other: 'Other families',
    unknown: 'Family not recorded',
    none: 'No hoverfly–plant associations recorded yet.',
    note: 'Number of hoverfly–plant associations per plant family. Hover a bar to see the plants.'
  },
  it: {
    flowers: 'Visite ai fiori',
    feeding: 'Larve o adulti che si nutrono della pianta',
    other: 'Altre famiglie',
    unknown: 'Famiglia non registrata',
    none: 'Ancora nessuna associazione sirfide–pianta registrata.',
    note: 'Numero di associazioni sirfide–pianta per famiglia di piante. Passa sopra una barra per vedere le piante.'
  }
})

// Series = the two plant relationships, in the same colours as the network
const SERIES = [
  { key: 'flowers', slot: 1, color: '--ba-rel-1' },
  { key: 'feeding', slot: 2, color: '--ba-rel-2' }
]

const rootEl = ref(null)
const hover = ref(null)

const rows = computed(() => {
  const nodes = new Map(props.graph.columns.flatMap((c) => c.nodes.map((n) => [n.id, n])))
  const byFamily = new Map()
  props.graph.links.forEach((l) => {
    const from = nodes.get(l.from)
    const to = nodes.get(l.to)
    if (!from || !to || from.level !== 0) return // hoverfly → plant only
    const series = SERIES.find((s) => s.slot === slotOf(l.relationship))
    if (!series) return
    const family = to.family || t('unknown')
    if (!byFamily.has(family)) byFamily.set(family, { family, flowers: 0, feeding: 0, plants: new Set() })
    const row = byFamily.get(family)
    row[series.key] += l.count
    row.plants.add(to.name)
  })
  const list = [...byFamily.values()]
    .map((r) => ({ ...r, total: r.flowers + r.feeding, plants: [...r.plants].sort() }))
    .sort((a, b) => b.total - a.total || a.family.localeCompare(b.family))
  if (list.length <= props.top + 1) return list
  const rest = list.slice(props.top)
  const other = rest.reduce(
    (o, r) => ({
      ...o,
      flowers: o.flowers + r.flowers,
      feeding: o.feeding + r.feeding,
      total: o.total + r.total,
      plants: [...o.plants, ...r.plants]
    }),
    { family: `${t('other')} (${rest.length})`, flowers: 0, feeding: 0, total: 0, plants: [] }
  )
  return [...list.slice(0, props.top), other]
})

// the outer segment of a bar gets the rounded end
const lastKey = (r) => [...SERIES].reverse().find((s) => r[s.key])?.key

const max = computed(() => Math.max(1, ...rows.value.map((r) => r.total)))
</script>

<style scoped>
.pf-row {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) 1fr;
  align-items: center;
  gap: 0.75rem;
  font-size: 13px;
  transition: opacity 0.15s;
}
.pf-row.dim {
  opacity: 0.4;
}
.pf-name {
  text-align: right;
  color: rgb(var(--color-base-content));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pf-track {
  display: flex;
  align-items: center;
  gap: 2px; /* surface gap between stacked segments */
  height: 16px;
}
.pf-seg {
  display: block;
  height: 100%;
  min-width: 3px;
}
.pf-seg.end {
  border-radius: 0 4px 4px 0;
}
.pf-value {
  margin-left: 0.45rem;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--color-base-content), 0.7);
}
.pf-tip {
  position: absolute;
  right: 0;
  z-index: 20;
  max-width: 300px;
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
