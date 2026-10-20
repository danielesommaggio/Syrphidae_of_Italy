<template>
  <SoiMasthead
    :eyebrow="mt('eyebrow')"
    :title="mt('title')"
    :lede="mt('lede')"
  />
  <div class="soi-module container mx-auto box-border px-4 py-10">
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div class="w-full sm:w-96">
        <KeySearchBar
          v-model="searchQuery"
  :placeholder="kt('filter')"
        />
      </div>
      <span
        v-if="!loading && keys.length"
        class="text-sm soi-muted"
        >{{ kt('count', { n: filteredKeys.length, total: keys.length }) }}</span
      >
    </div>

    <VSpinner v-if="loading" />
    <p
      v-else-if="!keys.length"
      class="soi-card p-6 soi-muted"
    >{{ kt('none') }}</p>
    <p
      v-else-if="!filteredKeys.length"
      class="soi-card p-6 soi-muted"
    >{{ kt('noMatch', { q: searchQuery }) }}</p>

    <ul
      v-else
      class="grid md:grid-cols-2 gap-5"
    >
      <li
        v-for="k in filteredKeys"
        :key="k.id"
        class="soi-key-card flex flex-col"
      >
        <div class="flex items-start justify-between gap-3">
          <RouterLink
            :to="{ name: 'dichotomous-key', params: { id: k.id } }"
            class="soi-serif text-xl font-semibold leading-snug !text-[color:var(--soi-ink)] hover:underline underline-offset-4 [&_i]:italic"
            v-html="k.titleHtml"
          />
          <span
            v-if="lang(k)"
            class="soi-lang"
            :title="lang(k) === 'IT' ? 'In Italian' : 'In English'"
            >{{ lang(k) }}</span
          >
        </div>

        <dl class="mt-3 space-y-1.5 text-sm">
          <div
            v-if="k.scope"
            class="flex gap-2"
          >
            <dt class="soi-muted w-16 shrink-0">{{ kt('scope') }}</dt>
            <dd class="[&_i]:italic">
              <RouterLink
                v-if="k.otuId"
                :to="{ name: 'otus-id', params: { id: k.otuId } }"
                class="soi-link"
              ><span
                v-if="k.scopeHtml"
                v-html="k.scopeHtml"
              /><template v-else>{{ k.scope }}</template></RouterLink><span
                v-else-if="k.scopeHtml"
                v-html="k.scopeHtml"
              /><template v-else>{{ k.scope }}</template>
            </dd>
          </div>
          <div
            v-if="k.citation"
            class="flex gap-2"
          >
            <dt class="soi-muted w-16 shrink-0">{{ kt('source') }}</dt>
            <dd
              class="[&_i]:italic"
              v-html="sanitizeAndLinkifyHtml(k.citation)"
            />
          </div>
        </dl>
        <p
          v-if="k.description"
          class="mt-3 text-sm leading-relaxed soi-muted"
        >
          {{ k.description }}
        </p>

        <div class="mt-auto pt-4 flex flex-wrap items-center gap-2 text-xs soi-muted">
          <span
            v-if="k.coupletsCount"
            class="soi-chip"
          >{{ k.coupletsCount }} {{ kt('couplets') }}</span>
          <span
            v-if="k.taxaCount"
            class="soi-chip"
          >{{ k.taxaCount }} taxa</span>
          <span
            v-if="k.updatedInWords"
            class="soi-chip"
          >updated {{ k.updatedInWords }} ago</span>
          <RouterLink
            :to="{ name: 'dichotomous-key', params: { id: k.id } }"
            class="ml-auto soi-btn soi-btn-ink !py-1.5 !px-4 !text-sm"
            >{{ kt('start') }} →</RouterLink
          >
        </div>
      </li>
    </ul>

    <!-- species → keys -->
    <section
      v-if="!loading && species.length"
      class="mt-12"
    >
      <h2 class="soi-serif text-2xl font-semibold">{{ kt('species') }}</h2>
      <p class="mt-1 text-sm soi-muted">{{ kt('speciesLede') }}</p>
      <div class="mt-4 w-full sm:w-96">
        <KeySearchBar
          v-model="speciesQuery"
          :placeholder="kt('speciesFilter')"
        />
      </div>
      <p
        v-if="!speciesVisible.length"
        class="mt-4 soi-muted"
      >{{ kt('noSpecies') }}</p>
      <ul class="mt-4 columns-1 md:columns-2 gap-10 text-sm [&_i]:italic">
        <li
          v-for="sp in speciesVisible"
          :key="sp.otuId"
          class="break-inside-avoid py-1 border-b border-[color:var(--soi-rule)]"
        >
          <RouterLink
            :to="{ name: 'otus-id', params: { id: sp.otuId } }"
            class="soi-link"
          ><i>{{ sp.label }}</i></RouterLink>
          <span class="soi-muted"> → </span>
          <template
            v-for="(k, i) in sp.keys"
            :key="k.id"
          >
            <RouterLink
              :to="{ name: 'dichotomous-key', params: { id: k.id } }"
              class="hover:underline"
            >{{ k.title }}</RouterLink><span v-if="i < sp.keys.length - 1">, </span>
          </template>
        </li>
      </ul>
      <button
        v-if="!speciesQuery.trim() && species.length > SPECIES_LIMIT && !showAllSpecies"
        type="button"
        class="mt-4 soi-btn !py-1.5 !px-4 !text-sm"
        @click="showAllSpecies = true"
      >
        {{ kt('allSpecies', { n: species.length }) }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { useT as useMastheadT } from '@/utils/soiLang.js'

const kt = useMastheadT({
  en: { species: 'Find the key for a species', speciesLede: 'Every taxon the keys lead to, with the key(s) that reach it.', speciesFilter: 'Species name…', allSpecies: 'Show all {n}', noSpecies: 'No taxon matches.', filter: 'Filter keys by taxon name…', count: '{n} of {total} keys', none: 'No public keys in this project yet.', noMatch: 'No keys match “{q}”.', scope: 'Scope', source: 'Source', couplets: 'couplets', start: 'Start key' },
  it: { species: 'Trova la chiave per una specie', speciesLede: 'Tutti i taxa a cui arrivano le chiavi, con la chiave (o le chiavi) che li raggiungono.', speciesFilter: 'Nome della specie…', allSpecies: 'Mostra tutti i {n}', noSpecies: 'Nessun taxon corrisponde.', filter: 'Filtra le chiavi per nome del taxon…', count: '{n} di {total} chiavi', none: 'Nessuna chiave pubblica in questo progetto.', noMatch: 'Nessuna chiave corrisponde a “{q}”.', scope: 'Ambito', source: 'Fonte', couplets: 'distici', start: 'Inizia la chiave' }
})

const mt = useMastheadT({
  en: { eyebrow: 'Identification', title: 'Identification keys', lede: 'Dichotomous keys to the genera and species of Italian hoverflies, in English and Italian. Pick a key and answer one couplet at a time.' },
  it: { eyebrow: 'Identificazione', title: 'Chiavi di identificazione', lede: 'Chiavi dicotomiche per i generi e le specie dei sirfidi italiani, in inglese e in italiano. Scegli una chiave e rispondi a un distico alla volta.' }
})

import { ref, computed, onMounted } from 'vue'
import { makeAPIRequest } from '@/utils/request'
import { sanitizeAndLinkifyHtml } from '@/utils'
import { rankIndex } from './lib/completeness.js'
import KeySearchBar from './KeySearchBar.vue'
import { buildNodes } from './lib/tree.js'
import { taxaReached, speciesIndex } from './lib/keyExtras.js'

// Species → keys: every taxon reached by the keys, with the keys that reach it
const species = computed(() => speciesIndex(keys.value.map((k) => ({ id: k.id, title: k.title, taxa: k.taxa }))))
const speciesQuery = ref('')
const SPECIES_LIMIT = 40
const speciesShown = computed(() => {
  const q = speciesQuery.value.trim().toLowerCase()
  const list = q ? species.value.filter((s) => s.label.toLowerCase().includes(q)) : species.value
  return q ? list : list.slice(0, SPECIES_LIMIT)
})
const showAllSpecies = ref(false)
const speciesVisible = computed(() => (showAllSpecies.value && !speciesQuery.value.trim() ? species.value : speciesShown.value))

const loading = ref(true)
const keys = ref([])
const searchQuery = ref('')

// Language tag from the "(EN)" / "(IT)" suffix used in SoI key titles
function lang(k) {
  const m = plain(k.titleHtml || k.title).match(/\((EN|IT)\)/i)
  return m ? m[1].toUpperCase() : ''
}

// Strip HTML tags so a search for "Ilma" matches the stored "<i>Ilma</i>".
function plain(s) {
  return String(s || '').replace(/<[^>]*>/g, '')
}

// Filter keys by title + scope + description (case-insensitive). Empty → all.
const filteredKeys = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return keys.value
  return keys.value.filter((k) => {
    const haystack = [
      plain(k.titleHtml || k.title),
      plain(k.scopeHtml || k.scope),
      k.description || '',
      ...(k.taxa || []).map((t) => t.label)
    ].join(' ').toLowerCase()
    return haystack.includes(q)
  })
})

// Pull the marked-up scope name out of an OTU object_tag.
function scopeNameFromObjectTag(tag) {
  if (!tag) return null
  const m = String(tag).match(/otu_tag_(?:taxon_name|otu_name)[^>]*>([\s\S]*?)<\/span>/)
  return m ? m[1].trim() || null : null
}

// Escape plain text before inserting into a v-html string.
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Italicize the genus in a plain-text title using the key's own scope name.
function italicizeTitle(title, scopeHtml) {
  const safe = escHtml(title || '')
  if (!scopeHtml) return safe
  const genus = String(scopeHtml).replace(/<[^>]*>/g, '').trim().split(/\s+/)[0]
  if (!genus) return safe
  const re = new RegExp(`\\b(${genus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`)
  return safe.replace(re, '<i>$1</i>')
}

onMounted(async () => {
  try {
    const { data: list } = await makeAPIRequest.get('/leads', { params: { per: 1000 } })
    const rows = Array.isArray(list) ? list : []
    const metas = await Promise.all(
      rows.map((r) =>
        makeAPIRequest
          .get(`/leads/key/${r.id}`)
          .then((res) => ({
            ...(res.data?.metadata || {}),
            // the taxa this key leads to (for the species → key list and the filter)
            _taxa: taxaReached(buildNodes(res.data?.data?.entries || {}, res.data?.data?.leads || {}))
          }))
          .catch(() => ({ _taxa: [] }))
      )
    )

    const otuIds = [...new Set(rows.map((r) => r.otu_id).filter(Boolean))]
    const nameByOtuId = new Map()
    const rankIdxByOtuId = new Map()
    if (otuIds.length) {
      try {
        const oq = new URLSearchParams()
        otuIds.forEach((id) => oq.append('otu_id[]', id))
        oq.set('per', '1000')
        const { data: otus } = await makeAPIRequest.get(`/otus?${oq.toString()}`)

        const tnIdByOtuId = new Map()
        for (const o of Array.isArray(otus) ? otus : []) {
          nameByOtuId.set(o.id, scopeNameFromObjectTag(o.object_tag))
          if (o.taxon_name_id != null) tnIdByOtuId.set(o.id, o.taxon_name_id)
        }

        const tnIds = [...new Set(tnIdByOtuId.values())]
        if (tnIds.length) {
          const tq = new URLSearchParams()
          tnIds.forEach((id) => tq.append('taxon_name_id[]', id))
          tq.set('per', '1000')
          const { data: tns } = await makeAPIRequest.get(`/taxon_names?${tq.toString()}`)
          const rankByTnId = new Map(
            (Array.isArray(tns) ? tns : []).map((t) => [t.id, t.rank || t.rank_string])
          )
          for (const [otuId, tnId] of tnIdByOtuId) {
            rankIdxByOtuId.set(otuId, rankIndex(rankByTnId.get(tnId)))
          }
        }
      } catch {
        // leave empty — scope falls back to plain text, no sort key
      }
    }

    keys.value = rows
      .map((r, i) => {
        const title = metas[i].title || r.text || `Key ${r.id}`
        const scopeHtml = nameByOtuId.get(r.otu_id) || null
        return {
          id: r.id,
          title,
          titleHtml: italicizeTitle(title, scopeHtml),
          scope: metas[i].taxonomic_scope || null,
          otuId: r.otu_id || null,
          scopeHtml,
          scopeRankIdx: rankIdxByOtuId.get(r.otu_id) ?? -1,
          citation: metas[i].origin_citation || null,
          description: r.description || null,
          coupletsCount: r.couplets_count || null,
          taxaCount: r.otus_count
            ? Math.max(0, r.otus_count - (r.otu_id ? 1 : 0))
            : null,
          updatedInWords: r.key_updated_at_in_words || null,
          taxa: metas[i]._taxa || []
        }
      })
      .sort((a, b) => {
        const ra = a.scopeRankIdx < 0 ? Infinity : a.scopeRankIdx
        const rb = b.scopeRankIdx < 0 ? Infinity : b.scopeRankIdx
        if (ra !== rb) return ra - rb
        if ((a.coupletsCount || 0) !== (b.coupletsCount || 0)) {
          return (b.coupletsCount || 0) - (a.coupletsCount || 0)
        }
        return String(a.title).localeCompare(String(b.title))
      })
  } catch {
    keys.value = []
  } finally {
    loading.value = false
  }
})
</script>
<style scoped>
.soi-key-card {
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-left: 4px solid var(--soi-yellow);
  border-radius: 6px;
  padding: 1.4rem 1.5rem;
}
.soi-lang {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  background: var(--soi-ink);
  color: var(--soi-paper);
}
.soi-chip {
  border: 1px solid var(--soi-rule);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
}
</style>
