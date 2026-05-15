export const NT_BOOK_ORDER = [
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation'
]

export const NT_BOOK_ABBR_ORDER = [
  'Matt', 'Mark', 'Luke', 'John', 'Acts',
  'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col',
  '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm',
  'Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev'
]

export const ABBR_TO_FULL = {
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  '1Cor': '1 Corinthians',
  '2Cor': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Phil: 'Philippians',
  Col: 'Colossians',
  '1Thess': '1 Thessalonians',
  '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy',
  '2Tim': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Heb: 'Hebrews',
  Jas: 'James',
  '1Pet': '1 Peter',
  '2Pet': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  Jude: 'Jude',
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
  Rom: 'rom',
  '1Cor': '1co',
  '2Cor': '2co',
  Gal: 'gal',
  Eph: 'eph',
  Phil: 'phl',
  Col: 'col',
  '1Thess': '1th',
  '2Thess': '2th',
  '1Tim': '1ti',
  '2Tim': '2ti',
  Titus: 'tit',
  Phlm: 'phm',
  Heb: 'heb',
  Jas: 'jas',
  '1Pet': '1pe',
  '2Pet': '2pe',
  '1John': '1jo',
  '2John': '2jo',
  '3John': '3jo',
  Jude: 'jud',
  Rev: 'rev'
}

// All 27 NT books with chapter counts and api.bible OSIS IDs
export const NT_BOOKS = [
  { bookInt: 40, fullName: 'Matthew',          abbr: 'Matt',   chapters: 28, osisId: 'MAT' },
  { bookInt: 41, fullName: 'Mark',              abbr: 'Mark',   chapters: 16, osisId: 'MRK' },
  { bookInt: 42, fullName: 'Luke',              abbr: 'Luke',   chapters: 24, osisId: 'LUK' },
  { bookInt: 43, fullName: 'John',              abbr: 'John',   chapters: 21, osisId: 'JHN' },
  { bookInt: 44, fullName: 'Acts',              abbr: 'Acts',   chapters: 28, osisId: 'ACT' },
  { bookInt: 45, fullName: 'Romans',            abbr: 'Rom',    chapters: 16, osisId: 'ROM' },
  { bookInt: 46, fullName: '1 Corinthians',     abbr: '1Cor',   chapters: 16, osisId: '1CO' },
  { bookInt: 47, fullName: '2 Corinthians',     abbr: '2Cor',   chapters: 13, osisId: '2CO' },
  { bookInt: 48, fullName: 'Galatians',         abbr: 'Gal',    chapters: 6,  osisId: 'GAL' },
  { bookInt: 49, fullName: 'Ephesians',         abbr: 'Eph',    chapters: 6,  osisId: 'EPH' },
  { bookInt: 50, fullName: 'Philippians',       abbr: 'Phil',   chapters: 4,  osisId: 'PHP' },
  { bookInt: 51, fullName: 'Colossians',        abbr: 'Col',    chapters: 4,  osisId: 'COL' },
  { bookInt: 52, fullName: '1 Thessalonians',   abbr: '1Thess', chapters: 5,  osisId: '1TH' },
  { bookInt: 53, fullName: '2 Thessalonians',   abbr: '2Thess', chapters: 3,  osisId: '2TH' },
  { bookInt: 54, fullName: '1 Timothy',         abbr: '1Tim',   chapters: 6,  osisId: '1TI' },
  { bookInt: 55, fullName: '2 Timothy',         abbr: '2Tim',   chapters: 4,  osisId: '2TI' },
  { bookInt: 56, fullName: 'Titus',             abbr: 'Titus',  chapters: 3,  osisId: 'TIT' },
  { bookInt: 57, fullName: 'Philemon',          abbr: 'Phlm',   chapters: 1,  osisId: 'PHM' },
  { bookInt: 58, fullName: 'Hebrews',           abbr: 'Heb',    chapters: 13, osisId: 'HEB' },
  { bookInt: 59, fullName: 'James',             abbr: 'Jas',    chapters: 5,  osisId: 'JAS' },
  { bookInt: 60, fullName: '1 Peter',           abbr: '1Pet',   chapters: 5,  osisId: '1PE' },
  { bookInt: 61, fullName: '2 Peter',           abbr: '2Pet',   chapters: 3,  osisId: '2PE' },
  { bookInt: 62, fullName: '1 John',            abbr: '1John',  chapters: 5,  osisId: '1JO' },
  { bookInt: 63, fullName: '2 John',            abbr: '2John',  chapters: 1,  osisId: '2JO' },
  { bookInt: 64, fullName: '3 John',            abbr: '3John',  chapters: 1,  osisId: '3JO' },
  { bookInt: 65, fullName: 'Jude',              abbr: 'Jude',   chapters: 1,  osisId: 'JUD' },
  { bookInt: 66, fullName: 'Revelation',        abbr: 'Rev',    chapters: 22, osisId: 'REV' },
]

export function sortByBookOrder(books) {
  return [...books].sort(
    (a, b) => NT_BOOK_ABBR_ORDER.indexOf(a) - NT_BOOK_ABBR_ORDER.indexOf(b)
  )
}
