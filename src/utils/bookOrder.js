export const NT_BOOKS = [
  { bookInt: 40, fullName: 'Matthew',          abbr: 'Matt',   chapters: 28 },
  { bookInt: 41, fullName: 'Mark',              abbr: 'Mark',   chapters: 16 },
  { bookInt: 42, fullName: 'Luke',              abbr: 'Luke',   chapters: 24 },
  { bookInt: 43, fullName: 'John',              abbr: 'John',   chapters: 21 },
  { bookInt: 44, fullName: 'Acts',              abbr: 'Acts',   chapters: 28 },
  { bookInt: 45, fullName: 'Romans',            abbr: 'Rom',    chapters: 16 },
  { bookInt: 46, fullName: '1 Corinthians',     abbr: '1Cor',   chapters: 16 },
  { bookInt: 47, fullName: '2 Corinthians',     abbr: '2Cor',   chapters: 13 },
  { bookInt: 48, fullName: 'Galatians',         abbr: 'Gal',    chapters: 6  },
  { bookInt: 49, fullName: 'Ephesians',         abbr: 'Eph',    chapters: 6  },
  { bookInt: 50, fullName: 'Philippians',       abbr: 'Phil',   chapters: 4  },
  { bookInt: 51, fullName: 'Colossians',        abbr: 'Col',    chapters: 4  },
  { bookInt: 52, fullName: '1 Thessalonians',   abbr: '1Thess', chapters: 5  },
  { bookInt: 53, fullName: '2 Thessalonians',   abbr: '2Thess', chapters: 3  },
  { bookInt: 54, fullName: '1 Timothy',         abbr: '1Tim',   chapters: 6  },
  { bookInt: 55, fullName: '2 Timothy',         abbr: '2Tim',   chapters: 4  },
  { bookInt: 56, fullName: 'Titus',             abbr: 'Titus',  chapters: 3  },
  { bookInt: 57, fullName: 'Philemon',          abbr: 'Phlm',   chapters: 1  },
  { bookInt: 58, fullName: 'Hebrews',           abbr: 'Heb',    chapters: 13 },
  { bookInt: 59, fullName: 'James',             abbr: 'Jas',    chapters: 5  },
  { bookInt: 60, fullName: '1 Peter',           abbr: '1Pet',   chapters: 5  },
  { bookInt: 61, fullName: '2 Peter',           abbr: '2Pet',   chapters: 3  },
  { bookInt: 62, fullName: '1 John',            abbr: '1John',  chapters: 5  },
  { bookInt: 63, fullName: '2 John',            abbr: '2John',  chapters: 1  },
  { bookInt: 64, fullName: '3 John',            abbr: '3John',  chapters: 1  },
  { bookInt: 65, fullName: 'Jude',              abbr: 'Jude',   chapters: 1  },
  { bookInt: 66, fullName: 'Revelation',        abbr: 'Rev',    chapters: 22 },
]

export const NT_BOOK_ABBR_ORDER = NT_BOOKS.map(b => b.abbr)

export const ABBR_TO_FULL = Object.fromEntries(NT_BOOKS.map(b => [b.abbr, b.fullName]))

// Chapters available for Bible browsing. Gospels include all chapters; other books
// include only chapters referenced in the catalog.
export const CATALOG_CHAPTERS = {
  Matt: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28],
  Mark: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
  Luke: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
  John: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
  Acts: [1,9,10,11,18,20,22,23,26],
  '1Cor': [11],
  '2Cor': [12],
  Rev: [1,2,3,16,21,22],
}

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
