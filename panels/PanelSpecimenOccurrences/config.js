// Site-specific settings for this panel. The panel is shared with other
// TaxonPages sites (WID…); leave HOME_COUNTRY empty there to keep the
// original behaviour.
//
// HOME_COUNTRY — the country the site is about. When set:
//   • type specimens collected outside it are moved to a collapsible
//     "Type material from outside <country>" block above the list,
//   • a region filter (stateProvince) for that country is offered,
//   • its records are listed first.
export const HOME_COUNTRY = 'Italy'

// Colours of the record kinds on the map (and the kind badges)
export const KIND_COLORS = {
  type: '#c0392b', // type specimens
  specimen: 'rgb(var(--color-ui-accent, 154, 106, 18))', // preserved specimens
  field: '#1b9e6f' // field occurrences (observations)
}
