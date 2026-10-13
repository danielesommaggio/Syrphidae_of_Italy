// Images from TaxonWorks for the home page: specimen "plates" for the hero and
// a gallery of diagnostic characters depicted on species pages.
import { makeAPIRequest } from '@/utils/request'
import { reactive } from 'vue'

// Filename keywords used by the SoI image files → character name
const PARTS = [
  [/addome|abdomen/i, { en: 'Abdomen', it: 'Addome' }],
  [/humeri|omer/i, { en: 'Postpronotum', it: 'Omeri' }],
  [/torace|thorax/i, { en: 'Thorax', it: 'Torace' }],
  [/alula|ala\b|_ala_|wing/i, { en: 'Wing', it: 'Ala' }],
  [/tars/i, { en: 'Fore tarsus', it: 'Tarso anteriore' }],
  [/faccia|face/i, { en: 'Face', it: 'Faccia' }],
  [/scutell/i, { en: 'Scutellum', it: 'Scutello' }],
  [/capo|head/i, { en: 'Head', it: 'Capo' }],
  [/forma|habitus/i, { en: 'Habitus', it: 'Habitus' }]
]

export function partOf(filename = '') {
  return PARTS.find(([re]) => re.test(filename))?.[1] || null
}

function shuffle(a) {
  const arr = [...a]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const strip = (html = '') => html.replace(/<\/?span[^>]*>/g, '')

const state = reactive({ plates: [], gallery: [], loaded: false })
let started = false

export function useSoiImages() {
  if (started || import.meta.env.SSR) return state
  started = true
  load().finally(() => (state.loaded = true))
  return state
}

async function load() {
  try {
    const { data: depictions } = await makeAPIRequest.get('/depictions', { params: { per: 500 } })
    const deps = Array.isArray(depictions) ? depictions : []

    const habitus = deps.filter(
      (d) => d.depiction_object_type === 'CollectionObject' && /habitus/i.test(d.caption || '') && d.figure_label
    )
    const otuDeps = deps.filter((d) => d.depiction_object_type === 'Otu')

    const imageIds = [...new Set([...habitus, ...otuDeps].map((d) => d.image_id))]
    if (!imageIds.length) return

    const { data: images } = await makeAPIRequest.get('/images', {
      params: { per: 500, extend: ['attribution'] }
    })
    const imgById = new Map((images || []).map((i) => [i.id, i]))

    // Plates: specimen habitus photographs
    const plates = await Promise.all(
      habitus.slice(0, 6).map(async (d) => {
        const img = imgById.get(d.image_id)
        if (!img) return null
        const name = d.figure_label.replace(/\.\s*(Male|Female).*$/i, '').trim()
        let otuId = null
        try {
          const { data } = await makeAPIRequest.get('/otus/autocomplete', {
            params: { term: name.split(' ').slice(0, 2).join(' '), having_taxon_name_only: true }
          })
          otuId = data?.[0]?.otu_valid_id || data?.[0]?.id || null
        } catch {
          // no link
        }
        return {
          src: img.medium || img.original,
          name: name.split(' ').slice(0, 2).join(' '),
          credit: (img.attribution?.label || '').replace(/^©\s*/, '© ').replace(/\.\s*Created by.*$/i, '').replace(/\. License.*$/i, ''),
          otuId,
          specimen: true
        }
      })
    )
    state.plates = plates.filter(Boolean)

    // Gallery: photographs (not line drawings) of diagnostic characters
    const photos = otuDeps
      .map((d) => ({ d, img: imgById.get(d.image_id) }))
      .filter(({ img }) => img && /jpe?g$/i.test(img.image_file_file_name || '') && img.width >= 900)

    const picked = shuffle(photos).slice(0, 8)
    const otuIds = [...new Set(picked.map(({ d }) => d.depiction_object_id))]
    let tagById = new Map()
    if (otuIds.length) {
      const { data: otus } = await makeAPIRequest.get('/otus', { params: { otu_id: otuIds, per: 100 } })
      tagById = new Map((otus || []).map((o) => [o.id, strip(o.object_tag)]))
    }

    state.gallery = picked.map(({ d, img }) => ({
      id: img.id,
      src: img.medium || img.thumb,
      otuId: d.depiction_object_id,
      html: tagById.get(d.depiction_object_id) || '',
      part: partOf(img.image_file_file_name),
      credit: (img.attribution?.label || '').replace(/\.\s*Created by.*$/i, '').replace(/\. License.*$/i, ''),
      tall: img.height > img.width * 1.2
    }))
  } catch {
    // leave empty: sections hide themselves
  }
}
