// Live counts for the Syrphidae of Italy home page.
// Everything comes from the TaxonWorks API; nothing is hard-coded except
// the TaxonWorks ids of the family and its four subfamilies.
import { makeAPIRequest } from '@/utils/request'
import { reactive } from 'vue'

export const SYRPHIDAE = { taxonId: 1095229, otuId: 945664 }

export const SUBFAMILIES = [
  {
    name: 'Syrphinae',
    author: 'Latreille, 1802',
    taxonId: 1095193,
    otuId: 945635,
    color: 'var(--soi-yellow)',
    blurb: {
      en: 'Mostly aphid-eating larvae — the classic “flower flies” with yellow-banded abdomens.',
      it: 'Larve per lo più afidofaghe — i classici sirfidi con l’addome a bande gialle.'
    }
  },
  {
    name: 'Eristalinae',
    author: 'Newman, 1834',
    taxonId: 1095287,
    otuId: 946077,
    color: 'var(--soi-olive)',
    blurb: {
      en: 'Drone flies and allies: saprophagous, aquatic “rat-tailed” and phytophagous larvae.',
      it: 'Eristali e affini: larve saprofaghe, acquatiche “a coda di topo” e fitofaghe.'
    }
  },
  {
    name: 'Pipizinae',
    author: 'Williston, 1885',
    taxonId: 1100224,
    otuId: 950017,
    color: 'var(--soi-terra)',
    blurb: {
      en: 'Small dark hoverflies whose larvae prey on woolly and gall-forming aphids.',
      it: 'Piccoli sirfidi scuri le cui larve predano afidi lanigeri e galligeni.'
    }
  },
  {
    name: 'Microdontinae',
    author: 'Rondani, 1845',
    taxonId: 1173763,
    otuId: 1027062,
    color: 'var(--soi-sea)',
    blurb: {
      en: 'Ant-nest specialists: slug-like larvae living inside ant colonies.',
      it: 'Specialisti dei formicai: larve simili a lumache che vivono nelle colonie di formiche.'
    }
  }
]

const RANK = {
  species: 'NomenclaturalRank::Iczn::SpeciesGroup::Species',
  genus: 'NomenclaturalRank::Iczn::GenusGroup::Genus'
}

async function countNames(taxonId, rank, validity) {
  const { headers } = await makeAPIRequest.get('/taxon_names', {
    params: {
      'taxon_name_id[]': taxonId,
      descendants: true,
      validity,
      'rank[]': rank,
      per: 1,
      page: 1
    }
  })
  return Number(headers['pagination-total']) || 0
}

const state = reactive({
  loaded: false,
  family: { species: null, genera: null, invalid: null },
  stats: {},
  subfamilies: {}
})

let pending = null

export function useSoiStats() {
  if (!pending && !import.meta.env.SSR) {
    pending = Promise.allSettled([
      makeAPIRequest.get('/stats').then(({ data }) => {
        state.stats = data?.data || {}
      }),
      countNames(SYRPHIDAE.taxonId, RANK.species, true).then((n) => (state.family.species = n)),
      countNames(SYRPHIDAE.taxonId, RANK.genus, true).then((n) => (state.family.genera = n)),
      countNames(SYRPHIDAE.taxonId, RANK.species, false).then((n) => (state.family.invalid = n)),
      ...SUBFAMILIES.map(async (s) => {
        const [species, genera] = await Promise.all([
          countNames(s.taxonId, RANK.species, true),
          countNames(s.taxonId, RANK.genus, true)
        ])
        state.subfamilies[s.name] = { species, genera }
      })
    ]).finally(() => {
      state.loaded = true
    })
  }

  return state
}

export function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString('en-US') : '—'
}
