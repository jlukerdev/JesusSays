export const NT_BOOK_ORDER = [
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  '1 Corinthians',
  'Revelation'
]

export const NT_BOOK_ABBR_ORDER = ['Matt', 'Mark', 'Luke', 'John', 'Acts', '1Cor', 'Rev']

export const ABBR_TO_FULL = {
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  '1Cor': '1 Corinthians',
  Rev: 'Revelation'
}

export const FULL_TO_ABBR = Object.fromEntries(
  Object.entries(ABBR_TO_FULL).map(([k, v]) => [v, k])
)

export const BLB_BOOK_SLUG = {
  Matt: 'mat',
  Mark: 'mar',
  Luke: 'luk',
  John: 'jhn',
  Acts: 'act',
  '1Cor': '1co',
  Rev: 'rev'
}

export function sortByBookOrder(books) {
  return [...books].sort(
    (a, b) => NT_BOOK_ABBR_ORDER.indexOf(a) - NT_BOOK_ABBR_ORDER.indexOf(b)
  )
}
