// Ported from gbif-web packages/gbif-org/src/routes/widgets/columns.tsx

const MAX_AUTHORS = 10
const MAX_ABSTRACT_LENGTH = 200

export function getAuthors(item) {
  const authors = item.authors || []
  const tooLong = authors.length > MAX_AUTHORS

  return (
    authors
      .slice(0, MAX_AUTHORS)
      .map(
        (author) =>
          `${author.lastName}${author.firstName ? ' ' + Array.from(author.firstName)[0] + '.' : ''}`
      )
      .join(', ') + (tooLong ? ' et. al.' : '')
  )
}

export function getLink(item) {
  if (item.identifiers?.doi) {
    return `https://doi.org/${item.identifiers.doi}`
  }

  return item.websites?.[0]
}

export function getTruncatedAbstract(item) {
  return item.abstract != null && item.abstract.length > MAX_ABSTRACT_LENGTH
    ? `${item.abstract.substr(0, MAX_ABSTRACT_LENGTH)}...`
    : item.abstract
}
