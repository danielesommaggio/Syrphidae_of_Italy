// Printing a key (Print / PDF button): the citation, the @page rules with running
// footer and page numbers, and waiting for the figures. Pure helpers + two DOM ones.

// "Sommaggio D, Dal Pos D (2026)." + key title → the citation printed with the key
export function keyCitation({ authors = '', project = 'Syrphidae of Italy (SoI)', title = '', url = '', date = '' }) {
  const who = String(authors).trim().replace(/\.$/, '')
  const t = String(title).replace(/<[^>]+>/g, '').trim()
  return `${who}. ${t ? `${t}. ` : ''}In: ${project}. ${url ? `Available at ${url}` : ''}${date ? ` (accessed ${date})` : ''}.`
    .replace(/\s+\./g, '.').replace(/\.\./g, '.')
}

// a CSS string literal for `content:` in a margin box
export const cssString = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`

// @page with running footer (short title + site, page x of y) and the version top right — margin boxes are honoured by
// Chromium browsers (Chrome, Edge); elsewhere the citation block printed in the page still shows
export function pageCss({ footerLeft = '', footerRight = '', headerRight = '' } = {}) {
  return `@media print {
  @page {
    size: A4;
    margin: 16mm 15mm 18mm 15mm;
    @top-right { content: ${cssString(headerRight)}; font: 8pt Georgia, serif; color: #777; }
    @bottom-left { content: ${cssString(footerLeft)}; font: 8pt Georgia, serif; color: #555; }
    @bottom-right { content: ${cssString(footerRight)} " " counter(page) " / " counter(pages); font: 8pt Georgia, serif; color: #555; }
  }
  /* the front page has no running header / footer */
  @page :first {
    @top-right { content: none; }
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }
}`
}

// wait (max `ms`) until every image inside `root` has loaded or failed
export function imagesReady(root, ms = 8000) {
  const imgs = [...(root?.querySelectorAll('img') || [])].filter((i) => !i.complete)
  if (!imgs.length) return Promise.resolve()
  return Promise.race([
    Promise.all(imgs.map((i) => new Promise((res) => { i.addEventListener('load', res, { once: true }); i.addEventListener('error', res, { once: true }) }))),
    new Promise((res) => setTimeout(res, ms))
  ])
}
