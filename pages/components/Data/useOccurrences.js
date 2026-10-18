// Occurrence records of the SoI project (specimens and literature records),
// loaded once and normalised for the Data page.
import { makeAPIRequest } from '@/utils/request'
import { REGION_ALIASES } from '../Atlas/useAtlas.js'

const PER = 1000
const MAX_PAGES = 30 // 30 000 records; past that, move the filters to the API

const REGION_OF = new Map()
Object.entries(REGION_ALIASES).forEach(([name, aliases]) => aliases.forEach((a) => REGION_OF.set(a.toLowerCase(), name)))

const num = (v) => (v === null || v === undefined || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)

export function toRecord(r) {
  const species = r.specificEpithet && r.genus ? `${r.genus} ${r.specificEpithet}` : ''
  const name = species || r.scientificName || r.genus || r.family || ''
  const country = r.country || ''
  const state = r.stateProvince || ''
  const region = country === 'Italy' ? REGION_OF.get(state.toLowerCase()) || '' : ''
  const year = num(r.year) || num(String(r.eventDate || '').slice(0, 4))
  const month = num(r.month) || num(String(r.eventDate || '').slice(5, 7))
  const lat = num(r.decimalLatitude)
  const lng = num(r.decimalLongitude)
  const literature = r.basisOfRecord === 'MaterialCitation' || r.dwc_occurrence_object_type === 'AssertedDistribution'
  const collectors = String(r.recordedBy || '')
    .split(/\s*[|;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    id: r.id,
    otu: r.otu_id || null,
    name: name || '—',
    italic: !!r.genus,
    species,
    author: r.scientificNameAuthorship || '',
    subfamily: r.subfamily || '',
    tribe: r.tribe || '',
    genus: r.genus || '',
    country,
    state,
    region,
    locality: r.verbatimLocality || r.locality || '',
    where: [region || state, country].filter(Boolean).join(', '),
    date: r.eventDate || r.verbatimEventDate || (year ? String(year) : ''),
    year,
    month: month >= 1 && month <= 12 ? month : null,
    collectors,
    collector: collectors.join(', '),
    inst: r.institutionCode || '',
    cat: r.catalogNumber || '',
    basis: literature ? 'literature' : 'specimen',
    sex: r.sex ? String(r.sex).toLowerCase() : '',
    type: r.typeStatus || '',
    elev: num(r.minimumElevationInMeters) ?? num(r.maximumElevationInMeters),
    lat: lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? lat : null,
    lng: lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? lng : null,
    refs: r.associatedReferences || '',
    raw: r,
    text: [name, r.scientificName, r.subfamily, r.tribe, country, state, region, r.verbatimLocality, r.locality, collectors.join(' '), r.institutionCode, r.catalogNumber, r.typeStatus, r.habitat]
      .filter(Boolean)
      .join(' ')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
  }
}

/** Loads every record, calling onProgress(loaded, total) as pages arrive. */
export async function fetchOccurrences(onProgress = () => {}) {
  const out = []
  let total = null
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, headers } = await makeAPIRequest.get('/dwc_occurrences.json', { params: { per: PER, page } })
    const rows = Array.isArray(data) ? data : []
    total ??= Number(headers?.['pagination-total']) || null
    out.push(...rows)
    onProgress(out.length, total)
    if (rows.length < PER || (total && out.length >= total)) break
  }
  return out.map(toRecord)
}

// Darwin Core columns for the CSV download
export const DWC_COLUMNS = [
  'occurrenceID',
  'basisOfRecord',
  'scientificName',
  'scientificNameAuthorship',
  'taxonRank',
  'family',
  'subfamily',
  'tribe',
  'genus',
  'specificEpithet',
  'country',
  'stateProvince',
  'county',
  'verbatimLocality',
  'decimalLatitude',
  'decimalLongitude',
  'minimumElevationInMeters',
  'maximumElevationInMeters',
  'eventDate',
  'verbatimEventDate',
  'year',
  'month',
  'day',
  'recordedBy',
  'identifiedBy',
  'institutionCode',
  'catalogNumber',
  'sex',
  'lifeStage',
  'individualCount',
  'typeStatus',
  'samplingProtocol',
  'habitat',
  'associatedReferences'
]

export function downloadCsv(records, name) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [DWC_COLUMNS, ...records.map((r) => DWC_COLUMNS.map((c) => r.raw[c]))]
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((x) => x.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
