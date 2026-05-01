# Catalog Stats

**Single source of truth for all Jesus Says catalog counts.**

---

## Current Live Stats

| Metric | Value |
|---|---|
| Version | 1.3 |
| Categories | 31 |
| Subcategories | 117 |
| Teachings | 655 |
| Tagged parables | 38 |
| NT books covered | Matt, Mark, Luke, John, Acts, 1Cor, 2Cor, Rev |

---

## How to Update

Run this command from the project root to get the authoritative live count:

```bash
node catalog_builds/engine/scripts/parse-catalog.js --stats
```

**After any structural catalog change** (add, delete, move, rename, split, or merge of a category or subcategory), update this file to reflect the new counts from that command. **Do not update counts in any other file** — all other files reference this document.

---

## `public/teachings.json` Schema

```jsonc
{
  "meta": {
    "version": "1.3",              // string — semver-like; kept in sync with REVISION.md
    "title": "...",                // catalog display title
    "subtitle": "...",             // catalog display subtitle
    "totalCategories": 31,         // integer
    "sources": ["Matthew", ...]    // array of full NT book names represented
  },
  "categories": [
    {
      "id": 1,                     // sequential integer (1-based)
      "slug": "cat-1",             // "cat-{id}"
      "uid": "<uuid-v4>",          // string — stable UUID v4; never modified after creation
      "title": "...",
      "sources": ["Matt", ...],    // abbreviated book names in this category
      "description": null,         // string or null
      "subcategories": [
        {
          "id": "1.1",             // "{catId}.{subIndex}"
          "slug": "cat-1-1",       // "cat-{catId}-{subIndex}"
          "uid": "<uuid-v4>",      // string — stable UUID v4; never modified after creation
          "title": "...",
          "teachings": [
            {
              "id": "1.1.1",       // "{catId}.{subId}.{teachingIndex}"
              "uid": "<uuid-v4>", // string — stable UUID v4; never modified after creation
              "text": "...",       // thematic summary (agent-authored)
              "quote": "...",      // canonical scripture quotation, or null
              "tags": [],          // string array; "parable" for parable entries
              "references": [
                {
                  "label": "Matt 5:3-12",
                  "book": "Matthew",
                  "bookAbbr": "Matt",
                  "chapter": 5,
                  "ranges": [[3, 12]],   // array of [startVerse, endVerse] pairs
                  "isPrimary": true      // exactly one reference per teaching must be true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

> **Schema notes:**
> - `meta.version` is required; validate-catalog.js enforces its presence as a string.
> - `meta.totalCategories` is informational only — the authoritative count is `categories.length`.
> - `uid` is a stable UUID v4. It survives renumbering. `renumber.js` never modifies it.

---

## Version History (catalog count milestones)

| Version | Date | Categories | Subcategories | Teachings | Parables |
|---|---|---|---|---|---|
| v1.3 | May 1, 2026 | 31 | 117 | 655 | 38 |
| v1.2 | April 30, 2026 | 31 | 117 | 655 | 38 |
| v1.1 | April 30, 2026 | 31 | 124 | 666 | 42 |
| v1.0 | April 29, 2026 | 31 | 126 | 683 | 42 |

Full structural change details are recorded in [`REVISION.md`](REVISION.md).
