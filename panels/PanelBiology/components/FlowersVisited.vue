<template>
  <section>
    <div class="fv-head">
      <h3 class="bio-h !mb-0">
        {{ t('title') }}
        <span class="bio-val">{{ t('summary', { f: families.length, g: genusCount }) }}</span>
      </h3>
      <input
        v-if="families.length > 6"
        v-model="filter"
        type="search"
        class="fv-filter"
        :placeholder="t('filter')"
        :aria-label="t('filter')"
      />
    </div>

    <!-- One bar per plant family -->
    <ul class="fv-list">
      <li
        v-for="f in all || filter ? shown : shown.slice(0, TOP)"
        :key="f.family"
      >
        <button
          type="button"
          class="fv-row"
          :aria-expanded="isOpen(f.family)"
          @click="toggle(f.family)"
        >
          <span class="fv-name">{{ f.family }}</span>
          <span class="fv-track">
            <span
              class="fv-bar"
              :style="{ width: Math.max(4, (f.genera.length / maxGenera) * 100) + '%' }"
            />
          </span>
          <span class="fv-n">
            {{ f.genera.length }}
            <i
              v-if="f.genera.some((g) => g.soi)"
              class="fv-dot"
              :title="t('dotTitle')"
            />
          </span>
          <span
            class="fv-caret"
            aria-hidden="true"
            >{{ isOpen(f.family) ? '−' : '+' }}</span
          >
        </button>

        <!-- Genera of the family -->
        <ul
          v-if="isOpen(f.family)"
          class="fv-genera"
        >
          <li
            v-for="g in f.genera"
            :key="g.name"
          >
            <button
              type="button"
              class="fv-genus"
              :class="{ on: picked === g.name, plain: !g.isGenus }"
              :disabled="!g.isGenus"
              :aria-pressed="picked === g.name"
              :title="g.isGenus ? t('who', { g: g.name }) : ''"
              @click="pick(g.name)"
            >
              <i v-if="g.isGenus">{{ g.name }}</i
              ><template v-else>{{ g.name }}</template>
              <i
                v-if="g.soi"
                class="fv-dot"
                :title="t('dotTitle')"
              />
            </button>
          </li>
        </ul>

        <!-- Who else visits the chosen genus -->
        <div
          v-if="picked && f.genera.some((g) => g.name === picked)"
          class="fv-who"
          role="region"
          :aria-label="t('who', { g: picked })"
        >
          <p class="font-semibold">
            {{ t('who', { g: picked }) }}
          </p>
          <p
            v-if="visitors.loading"
            class="bio-muted text-sm mt-1"
          >
            {{ t('loading') }}
          </p>
          <p
            v-else-if="!visitors.list.length"
            class="bio-muted text-sm mt-1"
          >
            {{ t('onlyThis') }}
          </p>
          <ul
            v-else
            class="fv-visitors"
          >
            <li
              v-for="v in visitors.list"
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

    <button
      v-if="!filter && shown.length > TOP"
      type="button"
      class="fv-more"
      @click="all = !all"
    >
      {{ all ? t('fewer') : t('allFamilies', { n: shown.length }) }}
    </button>
    <p
      v-if="filter && !shown.length"
      class="bio-muted text-sm mt-2"
    >
      {{ t('noMatch') }}
    </p>
    <p class="bio-legend">
      <span><i class="sw lit" /> {{ t('legendBar') }}</span>
      <span
        v-if="hasSoi"
        class="inline-flex items-center gap-1.5"
        ><i class="fv-dot" /> {{ t('legendDot') }}</span
      >
      <span>{{ t('legendClick') }}</span>
    </p>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { makeAPIRequest } from '@/utils'
import { useT } from '@/utils/soiLang.js'
import { fetchAssociations } from '../../_shared/associationGraph.js'
import { TOPIC, flowerGroups, splitList } from '../traits.js'

const props = defineProps({
  otuId: { type: Number, required: true },
  // literature items, already split: ["Apiaceae (Daucus, Heracleum)", "Caltha", …]
  items: { type: Array, default: () => [] },
  // this taxon's biological associations (as loaded by PanelBiology)
  associations: { type: Array, default: () => [] }
})

const t = useT({
  en: {
    title: 'Flowers visited',
    summary: '{f} plant families · {g} genera',
    filter: 'Find a plant…',
    allFamilies: 'Show all {n} families',
    fewer: 'Show fewer',
    noMatch: 'No plant matches.',
    other: 'Family not given',
    dotTitle: 'Also recorded in SoI flower visits',
    legendBar: 'genera per family (literature and SoI records)',
    legendDot: 'recorded in SoI flower visits',
    legendClick: 'Click a family for its genera, a genus for the other hoverflies that visit it.',
    who: 'Other hoverflies visiting {g}',
    loading: 'Looking for other visitors…',
    onlyThis: 'No other hoverfly in SoI is recorded on this plant yet.'
  },
  it: {
    title: 'Fiori visitati',
    summary: '{f} famiglie · {g} generi',
    filter: 'Cerca una pianta…',
    allFamilies: 'Mostra tutte le {n} famiglie',
    fewer: 'Mostra meno',
    noMatch: 'Nessuna pianta corrisponde.',
    other: 'Famiglia non indicata',
    dotTitle: 'Registrato anche nelle visite ai fiori di SoI',
    legendBar: 'generi per famiglia (letteratura e record di SoI)',
    legendDot: 'registrato nelle visite ai fiori di SoI',
    legendClick: 'Clicca una famiglia per i suoi generi, un genere per gli altri sirfidi che lo visitano.',
    who: 'Altri sirfidi che visitano {g}',
    loading: 'Cerco altri visitatori…',
    onlyThis: 'Nessun altro sirfide in SoI è ancora registrato su questa pianta.'
  }
})

const strip = (s) => String(s || '').replace(/<[^>]+>/g, '').trim()
const isFlower = (a) => /flower/i.test(a.biological_relationship?.name || '')
const isUs = (a) => a.subject?.id === props.otuId || a.subject?.taxonomy?.family === 'Syrphidae'
const genusOf = (o) => o?.taxonomy?.genus?.[1] || strip(o?.object_label).split(/\s+/)[0] || ''

// Literature (grouped by family) + this taxon's flower visits in SoI
const families = computed(() => {
  const soi = props.associations
    .filter((a) => isFlower(a) && isUs(a))
    .map((a) => ({ family: a.object?.taxonomy?.family || '', genus: genusOf(a.object) }))
    .filter((x) => x.genus)
  return flowerGroups(props.items, soi, t('other'))
})
const genusCount = computed(() => families.value.reduce((n, f) => n + f.genera.filter((g) => g.isGenus).length, 0))
const maxGenera = computed(() => Math.max(1, ...families.value.map((f) => f.genera.length)))
const hasSoi = computed(() => families.value.some((f) => f.genera.some((g) => g.soi)))

const filter = ref('')
const TOP = 8
const all = ref(false)
const shown = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return families.value
  return families.value
    .map((f) =>
      f.family.toLowerCase().includes(q) ? f : { ...f, genera: f.genera.filter((g) => g.name.toLowerCase().includes(q)) }
    )
    .filter((f) => f.genera.length)
})

const open = reactive(new Set())
const isOpen = (fam) => open.has(fam) || !!filter.value.trim()
function toggle(fam) {
  if (open.has(fam)) open.delete(fam)
  else open.add(fam)
}

// ---------- other visitors of a genus (whole project, loaded on the first click) ----------
const picked = ref('')
const visitors = reactive({ loading: false, list: [] })
let project = null

function loadProject() {
  project ||= Promise.all([
    makeAPIRequest
      .get('/contents', { params: { topic_id: [TOPIC.flowers], per: 1000 } })
      .then((r) => r.data || [])
      .catch(() => []),
    fetchAssociations({}).catch(() => [])
  ]).then(async ([contents, assoc]) => {
    // literature: OTU → genera named in its "Flowers visited"
    const lit = contents.map((c) => ({
      otu: c.otu_id,
      genera: new Set(flowerGroups(splitList(c.text), [], '').flatMap((f) => f.genera.map((g) => g.name)))
    }))
    const flowerAssoc = assoc.filter((a) => isFlower(a) && a.subject?.taxonomy?.family === 'Syrphidae')
    // names of the OTUs found only through the literature
    const ids = [...new Set(lit.map((l) => l.otu))]
    const names = new Map(flowerAssoc.map((a) => [a.subject.id, a.subject.object_tag || a.subject.object_label]))
    const missing = ids.filter((id) => !names.has(id))
    for (let i = 0; i < missing.length; i += 50) {
      const p = new URLSearchParams({ per: '100' })
      missing.slice(i, i + 50).forEach((id) => p.append('otu_id[]', id))
      try {
        const { data } = await makeAPIRequest.get(`/otus?${p}`)
        ;(data || []).forEach((o) => names.set(o.id, o.object_tag || o.object_label))
      } catch {
        /* names stay unknown */
      }
    }
    return { lit, flowerAssoc, names }
  })
  return project
}

async function pick(genus) {
  if (picked.value === genus) {
    picked.value = ''
    return
  }
  picked.value = genus
  visitors.loading = true
  visitors.list = []
  const { lit, flowerAssoc, names } = await loadProject()
  if (picked.value !== genus) return
  const ids = new Set([
    ...lit.filter((l) => l.genera.has(genus)).map((l) => l.otu),
    ...flowerAssoc.filter((a) => genusOf(a.object) === genus).map((a) => a.subject.id)
  ])
  ids.delete(props.otuId)
  visitors.list = [...ids]
    .filter((id) => names.has(id))
    .map((id) => ({ id, html: String(names.get(id)).replace(/<(?!\/?i>)[^>]*>/gi, '') }))
    .sort((a, b) => strip(a.html).localeCompare(strip(b.html)))
  visitors.loading = false
}
</script>

<style scoped>
/* same look as the other sections of PanelBiology (its styles are scoped) */
.bio-h {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bio-muted);
}
.bio-val {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: var(--bio-ink);
}
.bio-muted {
  color: var(--bio-muted);
}
.bio-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  margin-top: 0.6rem;
  font-size: 0.75rem;
  color: var(--bio-muted);
}
.sw {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  margin-right: 0.25rem;
  vertical-align: -1px;
  border-radius: 3px;
}
.sw.lit {
  background: var(--soi-yellow, #f0b81f);
}
.fv-more {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  color: var(--bio-ink);
}
.fv-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.6rem;
}
.fv-filter {
  width: 11rem;
  max-width: 100%;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--bio-rule);
  border-radius: 999px;
  background: transparent;
  color: var(--bio-ink);
  font-size: 0.8rem;
}
.fv-list {
  display: grid;
  gap: 2px;
}
.fv-row {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) 1fr 2.6rem 1rem;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.3rem 0.4rem;
  border-radius: 4px;
  text-align: left;
  font-size: 0.85rem;
  color: var(--bio-ink);
}
.fv-row:hover,
.fv-row[aria-expanded='true'] {
  background: var(--soi-paper-2, #f2ecdd);
}
.fv-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fv-track {
  height: 0.7rem;
}
.fv-bar {
  display: block;
  height: 100%;
  border-radius: 0 4px 4px 0;
  background: var(--soi-yellow, #f0b81f);
}
.fv-n {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.fv-caret {
  color: var(--bio-muted);
  font-weight: 700;
}
.fv-dot {
  display: inline-block;
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--bio-bar);
}
.fv-genera {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.4rem 0.4rem 0.6rem 1rem;
}
.fv-genus {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--bio-rule);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--bio-ink);
}
.fv-genus:not(:disabled):hover {
  border-color: var(--bio-ink);
}
.fv-genus.on {
  background: var(--bio-ink);
  color: var(--soi-paper, #faf7ef);
}
.fv-genus.plain {
  cursor: default;
  border-style: dashed;
}
.fv-who {
  margin: 0 0.4rem 0.6rem 1rem;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--bio-bar);
  background: var(--soi-paper-2, #f2ecdd);
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
}
.fv-visitors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 1rem;
  margin-top: 0.35rem;
}
.fv-visitors a:hover {
  text-decoration: underline;
}
</style>
