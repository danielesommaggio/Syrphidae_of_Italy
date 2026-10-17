/**
 * associationBus.js
 *
 * Shared state between the Biological associations table and the Association
 * network on a taxon page, so they work as one:
 *   - hover    — pointing at a row highlights its link in the network, and back
 *   - pinnedSource — a reference picked in either is highlighted in both
 *   - sourceNumbers — the network numbers the references; the table uses the
 *                     same numbers so [3] means the same paper in both
 */
import { reactive } from 'vue'

export const associationBus = reactive({
  hover: null, // { partner: 'aphis fabae', relationship?: 'Predator of', from: 'table' | 'graph' }
  pinnedSource: null, // source id
  sourceNumbers: new Map() // source id → number
})

export const sameName = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase()
