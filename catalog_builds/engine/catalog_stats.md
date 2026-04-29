# Catalog Stats

**Single source of truth for all Jesus Says catalog counts.**

---

## Current Live Stats

| Metric | Value |
|---|---|
| Categories | 31 |
| Subcategories | 126 |
| Teachings | 683 |
| Tagged parables | 42 |
| NT books covered | Matt, Mark, Luke, John, Acts, 1Cor, 2Cor, Rev |

---

## How to Update

Run this command from the project root to get the authoritative live count:

```bash
node catalog_builds/engine/scripts/parse-catalog.js --stats
```

**After any structural catalog change** (add, delete, move, rename, split, or merge of a category or subcategory), update this file to reflect the new counts from that command. **Do not update counts in any other file** — all other files reference this document.

---

## Version History (catalog count milestones)

| Version | Date | Categories | Subcategories | Teachings | Parables |
|---|---|---|---|---|---|
| v1.0 | April 29, 2026 | 31 | 126 | 683 | 42 |

Full structural change details are recorded in [`REVISION.md`](REVISION.md).
