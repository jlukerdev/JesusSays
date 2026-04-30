# Validation Status Dashboard — April 29, 2026

**Catalog snapshot at validation start:** 31 categories · 126 subcategories · 683 teachings · 42 parables  
**Plan:** [PLAN.md](PLAN.md)

---

## Batch Progress

| Batch | Name | Status | Findings | Open | Resolved | Accepted |
|---|---|---|---|---|---|---|
| B0 | Baseline Snapshot | DONE | 3 | 0 | 0 | 3 |
| B1 | Global Override Compliance | DONE | 24 | 0 | 13 | 11 |
| B2 | Categories 1–10 | NOT STARTED | — | — | — | — |
| B3 | Categories 11–20 | NOT STARTED | — | — | — | — |
| B4 | Categories 21–31 | NOT STARTED | — | — | — | — |
| B5 | Parable Tag Audit | NOT STARTED | — | — | — | — |
| B6 | Taxonomy Compliance | NOT STARTED | — | — | — | — |

**Status values:** `NOT STARTED` · `IN PROGRESS` · `COMPLETE — PENDING RESOLUTION` · `DONE`

> A batch is `DONE` only when all findings are either `RESOLVED` or `ACCEPTED`.

---

## Blocking Dependencies

```
B0 (Baseline) ──► must pass validate-catalog.js before proceeding
                └──► B1 (Global Overrides) ──► must be clean before B2/B3/B4 are meaningful
                                              └──► B2 / B3 / B4 (can run in any order)
                                                                └──► B5 (Parable Tags)
                                                                └──► B6 (Taxonomy)
```

---

## Running Summary

### Total Findings

| Severity | Open | In Review | Resolved | Accepted | Total |
|---|---|---|---|---|---|
| ERROR | 0 | 0 | 13 | 3 | 16 |
| WARNING | 0 | 0 | 0 | 0 | 0 |
| REVIEW | 0 | 0 | 8 | 0 | 8 |
| INFO | 0 | 0 | 0 | 3 | 3 |
| **All** | **0** | **0** | **21** | **6** | **27** |

*Update this table after each batch is completed.*

---

## Catalog State After Validation

Track changes made during resolution. Update as teachings are moved.

| Change | Count | Notes |
|---|---|---|
| Teachings moved (reclassified) | 14 | 2.4.3→12.1.3, 6.3.1→12.1.4, 25.4.1→12.3.4, 2.6.1→27.3.7, 4.1.12→27.3.8, 9.1.1→27.1.11, 10.5.2→27.2.7, 2.1.11→31.1.4; plus 5 split-off new teachings (27.1.12–14, 27.3.9, 31.1.5) |
| Teachings deleted (duplicates) | 5 | 2.1.9 (DUP-002), 5.1.4, 22.4.2, 22.4.3, 27.4.8 (duplicate of 27.4.1) |
| Tags corrected | 0 | — |
| Field fixes (text, quote, refs) | 7 | 2.3.4, 5.3.2, 15.2.1, 16.3.1, 17.1.1, 22.4.1 (ref strip + text update); 15.1.1, 19.3.3 (ref strip only) |
| `renumber.js` runs | 2 | After apply-b1-resolutions.cjs; after duplicate removal |

---

## Session Log

Record each work session so progress can be resumed.

| Date | Batches Worked | Findings Added | Actions Taken |
|---|---|---|---|
| 04/29/2026 | B0 | 3 (2 dup-text INFO, 1 parable-candidate FALSE POSITIVE) | B0-BASELINE.md created; validate-catalog passed clean; B1 unblocked |
| 04/29/2026 | B1 | 24 (16 ERROR, 8 REVIEW) | B1-OVERRIDES.md created; G-1/G-2/G-4 checks run; 16 hard violations + 8 composite-teaching reviews; B1 COMPLETE — PENDING RESOLUTION |
| 04/29/2026 | B1 resolutions | 24 resolved/accepted | All approver decisions implemented: 8 simple moves, 5 splits, 5 deletes, 3 accepted-no, 7 ref-strip+text-fix; validate-catalog PASSED; B1 DONE |

---

## Quick Commands

```bash
# Run before starting B0
node catalog_builds/engine/scripts/validate-catalog.js
node catalog_builds/engine/scripts/audit-catalog.js

# Save B0 raw output
node catalog_builds/engine/scripts/validate-catalog.js --json > catalog_builds/validation/b0-validate-output.json
node catalog_builds/engine/scripts/audit-catalog.js --json > catalog_builds/validation/b0-audit-output.json

# After any catalog change
node catalog_builds/engine/scripts/renumber.js
node catalog_builds/engine/scripts/validate-catalog.js

# Get current stats
node catalog_builds/engine/scripts/parse-catalog.js --stats
```
