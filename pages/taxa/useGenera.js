// Live list of SoI genera from TaxonWorks, merged with the hand-written genus
// accounts in ./constants/taxa (which add world richness, realms and text).
import { makeAPIRequest } from '@/utils/request'
import { reactive } from 'vue'
import accounts from './constants/taxa.js'

const SYRPHIDAE_ID = 1095229
const R = {
  species: 'NomenclaturalRank::Iczn::SpeciesGroup::Species',
  genus: 'NomenclaturalRank::Iczn::GenusGroup::Genus',
  subfamily: 'NomenclaturalRank::Iczn::FamilyGroup::Subfamily',
  tribe: 'NomenclaturalRank::Iczn::FamilyGroup::Tribe'
}

const accountByName = new Map(accounts.map((a) => [a.taxonName, a]))

function names(rank, extra = {}) {
  return makeAPIRequest
    .get('/taxon_names', {
      params: {
        'taxon_name_id[]': SYRPHIDAE_ID,
        descendants: true,
        validity: true,
        'rank[]': rank,
        per: 1000,
        ...extra
      }
    })
    .then(({ data }) => (Array.isArray(data) ? data : []))
}

const state = reactive({
  loading: true,
  error: false,
  list: [], // one row per genus
  speciesByGenus: {} // genus name -> [{ id, html, author }]
})

let started = false

export function useGenera() {
  if (started || import.meta.env.SSR) return state
  started = true
  load()
  return state
}

async function load() {
  try {
    const [genera, species, groups, leads] = await Promise.all([
      names(R.genus),
      names(R.species),
      names([R.subfamily, R.tribe]),
      makeAPIRequest
        .get('/leads', { params: { per: 1000 } })
        .then(({ data }) => (Array.isArray(data) ? data : []))
        .catch(() => [])
    ])

    // Family-group lookup to place each genus in its subfamily
    const groupById = new Map(groups.map((g) => [g.id, g]))
    function subfamilyOf(t) {
      let p = groupById.get(t.parent_id)
      let guard = 0
      while (p && guard++ < 6) {
        if (p.rank_string === R.subfamily) return p.name
        p = groupById.get(p.parent_id)
      }
      return ''
    }

    // Species per genus (first word of the cached name)
    const byGenus = {}
    species.forEach((s) => {
      const g = String(s.cached || '').split(' ')[0]
      ;(byGenus[g] ||= []).push({
        id: s.id,
        html: s.cached_html || s.cached,
        author: s.cached_author_year || ''
      })
    })
    Object.values(byGenus).forEach((arr) =>
      arr.sort((a, b) => a.html.replace(/<[^>]*>/g, '').localeCompare(b.html.replace(/<[^>]*>/g, '')))
    )

    // OTUs for genera (links) and species (filled lazily on the genus page)
    let otuByTaxon = new Map()
    if (genera.length) {
      const { data: otus } = await makeAPIRequest.get('/otus', {
        params: { taxon_name_id: genera.map((g) => g.id), per: 1000 }
      })
      otuByTaxon = new Map((otus || []).map((o) => [o.taxon_name_id, o.id]))
    }

    // Keys by OTU, language from the "(EN)" / "(IT)" tag in the key title
    const keysByOtu = new Map()
    leads.forEach((l) => {
      if (!l.otu_id) return
      // Untagged keys in SoI are the original Italian ones
      const lang = /\(en\)/i.test(l.text || '') ? 'EN' : 'IT'
      const entry = keysByOtu.get(l.otu_id) || {}
      entry[lang] ||= { name: 'dichotomous-key', params: { id: l.id } }
      keysByOtu.set(l.otu_id, entry)
    })

    state.speciesByGenus = byGenus
    state.list = genera
      .map((g) => {
        const acc = accountByName.get(g.name)
        const otuId = otuByTaxon.get(g.id) || acc?.otuId || null
        const keys = (otuId && keysByOtu.get(otuId)) || {}
        const worldRaw = acc?.numSpecies ?? (acc?.biodiversity?.match(/(\d+)\s+species/)?.[1] || null)
        const world = Number(worldRaw)
        return {
          taxonName: g.name,
          taxonId: g.id,
          author: g.cached_author_year || acc?.author || '',
          subfamily: subfamilyOf(g),
          otuId,
          numSpecies: Number.isFinite(world) && world > 0 ? world : null,
          numSpeciesIta: (byGenus[g.name] || []).length,
          distribution: acc?.distribution || [],
          hasAccount: !!acc,
          keyLinkEN: keys.EN || null,
          keyLinkIT: keys.IT || null
        }
      })
      .sort((a, b) => a.taxonName.localeCompare(b.taxonName))
  } catch {
    state.error = true
    // Fall back to the hand-written accounts so the page is never empty
    state.list = accounts.map((a) => ({
      taxonName: a.taxonName,
      author: a.author,
      subfamily: '',
      otuId: a.otuId,
      numSpecies: Number(a.numSpecies) || null,
      numSpeciesIta: Number(a.numSpeciesIta) || null,
      distribution: a.distribution || [],
      hasAccount: true,
      keyLinkEN: null,
      keyLinkIT: null
    }))
  } finally {
    state.loading = false
  }
}

export function accountFor(name) {
  return accountByName.get(name) || null
}
