<template>
  <section>
    <h3 class="bio-h">{{ t('title') }}</h3>
    <p class="hp-breadth">{{ breadth }}</p>

    <!-- One row per broad habitat type -->
    <ul class="hp-list">
      <li
        v-for="g in groups"
        :key="g.type"
      >
        <button
          type="button"
          class="hp-row"
          :aria-expanded="open.has(g.type)"
          @click="toggle(g.type)"
        >
          <span class="hp-name">{{ t('type_' + g.type) }}</span>
          <span class="hp-track">
            <span
              class="hp-bar"
              :style="{ width: Math.max(4, (g.items.length / maxItems) * 100) + '%' }"
            />
          </span>
          <span class="hp-n">{{ g.items.length }}</span>
          <span
            class="hp-caret"
            aria-hidden="true"
            >{{ open.has(g.type) ? '−' : '+' }}</span
          >
        </button>

        <ul
          v-if="open.has(g.type)"
          class="hp-items"
        >
          <li
            v-for="h in g.items"
            :key="h"
          >
            <button
              type="button"
              class="hp-item"
              :class="{ on: picked === h }"
              :aria-pressed="picked === h"
              :title="t('who', { h })"
              @click="pick(h)"
            >
              {{ h }}
            </button>
          </li>
        </ul>

        <!-- Other hoverflies sharing the chosen habitat -->
        <div
          v-if="picked && g.items.includes(picked)"
          class="hp-who"
          role="region"
          :aria-label="t('who', { h: picked })"
        >
          <p class="font-semibold">{{ t('who', { h: picked }) }}</p>
          <p
            v-if="sharing.loading"
            class="bio-muted text-sm mt-1"
          >
            {{ t('loading') }}
          </p>
          <p
            v-else-if="!sharing.list.length"
            class="bio-muted text-sm mt-1"
          >
            {{ t('onlyThis') }}
          </p>
          <ul
            v-else
            class="hp-visitors"
          >
            <li
              v-for="v in sharing.list"
              :key="v.id"
            >
              <RouterLink
                :to="{ name: 'otus-id-biology', params: { id: v.id } }"
                v-html="v.html"
              />
            </li>
          </ul>
        </div>
      </li>
    </ul>

    <p class="bio-legend">{{ t('legend') }}</p>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { makeAPIRequest } from '@/utils'
import { lang, useT } from '@/utils/soiLang.js'
import { TOPIC, habitatGroups, splitList } from '../traits.js'

const props = defineProps({
  otuId: { type: Number, required: true },
  // habitat names, already split and cleaned (traits.habitat)
  items: { type: Array, default: () => [] }
})

const t = useT({
  en: {
    title: 'Preferred habitat',
    type_woodland: 'Woodland',
    type_scrub: 'Scrub & Mediterranean shrubland',
    type_grassland: 'Grassland',
    type_wetland: 'Wetland & coast',
    type_farmland: 'Farmland & urban',
    type_other: 'Other',
    one: '1 habitat',
    many: '{n} habitats',
    generalist: '{h} across {k} habitat types — a habitat generalist.',
    specialist: '{h}, all {type} — a {type} specialist.',
    some: '{h} across {k} habitat types.',
    who: 'Other hoverflies in {h}',
    loading: 'Looking for other species…',
    onlyThis: 'No other hoverfly in SoI has this habitat recorded yet.',
    legend: 'Click a type for its habitats, a habitat for the other hoverflies that share it.'
  },
  it: {
    title: 'Habitat preferito',
    type_woodland: 'Boschi',
    type_scrub: 'Macchia e arbusteti',
    type_grassland: 'Praterie',
    type_wetland: 'Zone umide e costa',
    type_farmland: 'Coltivi e aree urbane',
    type_other: 'Altro',
    one: '1 habitat',
    many: '{n} habitat',
    generalist: '{h} in {k} tipi di ambiente — una specie generalista.',
    specialist: '{h}, tutti di tipo «{type}» — una specie specialista.',
    some: '{h} in {k} tipi di ambiente.',
    who: 'Altri sirfidi in {h}',
    loading: 'Cerco altre specie…',
    onlyThis: 'Nessun altro sirfide in SoI ha ancora questo habitat registrato.',
    legend: 'Clicca un tipo per i suoi habitat, un habitat per gli altri sirfidi che lo condividono.'
  }
})

const groups = computed(() => habitatGroups(props.items))
const maxItems = computed(() => Math.max(1, ...groups.value.map((g) => g.items.length)))

// "41 habitats across 5 habitat types — a habitat generalist."
const breadth = computed(() => {
  const n = props.items.length
  const k = groups.value.filter((g) => g.type !== 'other').length
  const h = n === 1 ? t('one') : t('many', { n })
  if (k === 1 && n > 1) {
    const type = t('type_' + groups.value.find((g) => g.type !== 'other').type)
    return t('specialist', { h, type: lang.value === 'it' ? type : type.toLowerCase() })
  }
  if (k >= 4 || n >= 15) return t('generalist', { h, k })
  return t('some', { h, k: Math.max(k, 1) })
})

const open = reactive(new Set())
function toggle(type) {
  if (open.has(type)) open.delete(type)
  else open.add(type)
}

// ---------- other species with the same habitat (loaded on the first click) ----------
const picked = ref('')
const sharing = reactive({ loading: false, list: [] })
let project = null
const key = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim()

function loadProject() {
  project ||= makeAPIRequest
    .get('/contents', { params: { topic_id: [TOPIC.habitat], per: 1000 } })
    .then(async ({ data }) => {
      const rows = (data || []).map((c) => ({ otu: c.otu_id, habitats: new Set(splitList(c.text).map(key)) }))
      const names = new Map()
      const ids = [...new Set(rows.map((r) => r.otu))]
      for (let i = 0; i < ids.length; i += 50) {
        const p = new URLSearchParams({ per: '100' })
        ids.slice(i, i + 50).forEach((id) => p.append('otu_id[]', id))
        try {
          const { data: otus } = await makeAPIRequest.get(`/otus?${p}`)
          ;(otus || []).forEach((o) => names.set(o.id, o.object_tag || o.object_label))
        } catch {
          /* names stay unknown */
        }
      }
      return { rows, names }
    })
    .catch(() => ({ rows: [], names: new Map() }))
  return project
}

async function pick(habitat) {
  if (picked.value === habitat) {
    picked.value = ''
    return
  }
  picked.value = habitat
  sharing.loading = true
  sharing.list = []
  const { rows, names } = await loadProject()
  if (picked.value !== habitat) return
  const k = key(habitat)
  sharing.list = [...new Set(rows.filter((r) => r.habitats.has(k) && r.otu !== props.otuId).map((r) => r.otu))]
    .filter((id) => names.has(id))
    .map((id) => ({ id, html: String(names.get(id)).replace(/<(?!\/?i>)[^>]*>/gi, '') }))
    .sort((a, b) => a.html.replace(/<[^>]+>/g, '').localeCompare(b.html.replace(/<[^>]+>/g, '')))
  sharing.loading = false
}
</script>

<style scoped>
/* same look as the other sections of PanelBiology (its styles are scoped) */
.bio-h {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bio-muted);
  margin-bottom: 0.4rem;
}
.bio-muted {
  color: var(--bio-muted);
}
.bio-legend {
  margin-top: 0.6rem;
  font-size: 0.75rem;
  color: var(--bio-muted);
}
.hp-breadth {
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: var(--bio-ink);
}
.hp-list {
  display: grid;
  gap: 2px;
}
.hp-row {
  display: grid;
  grid-template-columns: minmax(8rem, 13rem) 1fr 2rem 1rem;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.3rem 0.4rem;
  border-radius: 4px;
  text-align: left;
  font-size: 0.85rem;
  color: var(--bio-ink);
}
.hp-row:hover,
.hp-row[aria-expanded='true'] {
  background: var(--soi-paper-2, #f2ecdd);
}
.hp-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hp-track {
  height: 0.7rem;
}
.hp-bar {
  display: block;
  height: 100%;
  border-radius: 0 4px 4px 0;
  background: var(--bio-bar);
}
.hp-n {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.hp-caret {
  color: var(--bio-muted);
  font-weight: 700;
}
.hp-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.4rem 0.4rem 0.6rem 1rem;
}
.hp-item {
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--bio-rule);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--bio-ink);
  text-align: left;
}
.hp-item:hover {
  border-color: var(--bio-ink);
}
.hp-item.on {
  background: var(--bio-ink);
  color: var(--soi-paper, #faf7ef);
}
.hp-who {
  margin: 0 0.4rem 0.6rem 1rem;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--bio-bar);
  background: var(--soi-paper-2, #f2ecdd);
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
}
.hp-visitors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 1rem;
  margin-top: 0.35rem;
}
.hp-visitors a:hover {
  text-decoration: underline;
}
</style>
