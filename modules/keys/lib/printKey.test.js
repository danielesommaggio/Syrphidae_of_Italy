// node modules/keys/lib/printKey.test.js
import assert from 'node:assert/strict'
import { keyCitation, cssString, pageCss } from './printKey.js'

assert.equal(
  keyCitation({ authors: 'Sommaggio D, Dal Pos D (2026).', title: '<i>Dasysyrphus</i>', url: 'https://syrphidaeitaly.com/#/key/1', date: '2026-10-19' }),
  'Sommaggio D, Dal Pos D (2026). Dasysyrphus. In: Syrphidae of Italy (SoI). Available at https://syrphidaeitaly.com/#/key/1 (accessed 2026-10-19).'
)
assert.equal(cssString('a "b" \\ c'), '"a \\"b\\" \\\\ c"')
assert.ok(pageCss({ footerLeft: 'Key', footerRight: 'p.' }).includes('counter(pages)'))
console.log('printKey: all tests passed')
