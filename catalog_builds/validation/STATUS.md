# Validation Status Dashboard — April 29, 2026

**Catalog snapshot at validation start:** 31 categories · 126 subcategories · 683 teachings · 42 parables  
**Current catalog state (after B2):** 31 categories · 126 subcategories · 676 teachings · 42 parables  
**Plan:** [PLAN.md](PLAN.md)

---

## Batch Progress

| Batch | Name | Status | Findings | Open | Resolved | Accepted |
|---|---|---|---|---|---|---|
| B0 | Baseline Snapshot | DONE | 3 | 0 | 0 | 3 |
| B1 | Global Override Compliance | DONE | 24 | 0 | 13 | 11 |
| B2 | Categories 1–10 | DONE | 12 | 0 | 10 | 2 |
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
| WARNING | 0 | 0 | 3 | 0 | 3 |
| REVIEW | 0 | 0 | 14 | 1 | 15 |
| INFO | 0 | 0 | 1 | 4 | 5 |
| **All** | **0** | **0** | **31** | **8** | **39** |

*Update this table after each batch is completed.*

---

## Catalog State After Validation

Track changes made during resolution. Update as teachings are moved.

| Change | Count | Notes |
|---|---|---|
| Teachings moved (reclassified) | 19 | B1: 2.4.3→12.1.3, 6.3.1→12.1.4, 25.4.1→12.3.4, 2.6.1→27.3.7, 4.1.12→27.3.8, 9.1.1→27.1.11, 10.5.2→27.2.7, 2.1.11→31.1.4; plus 5 split-offs (27.1.12–14, 27.3.9, 31.1.5) · B2: 1.1.5→1.3.5, 5.2.4→5.1.10, 6.3.6→30.1.6, 8.3.3→24.4.8, 10.1.6→10.3.4 |
| Teachings deleted (duplicates/misroutes) | 9 | B1: 2.1.9, 5.1.4, 22.4.2, 22.4.3, 27.4.8 · B2: 2.2.6 (redundant), 2.5.9 (dup of 2.5.5), 2.6.15 (dup/misroute), 2.6.16 (misroute — absorbed into 2.7.13 ref) |
| Teachings merged | 1 | B2: 7.1.11–7.1.14 → single teaching 7.1.11 (Mark 9:16–23) |
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
| 04/30/2026 | B2 | 11 (3 warnings, 6 reviews, 2 info) | B2-CATS01-10.md created; all 10 categories reviewed; key findings: 2.2.6/2.6.15/2.6.16 routing issues in Cat 2; 5.2.4 non-parable in parable subcat; 6.3.2/6.3.6/6.3.7 weak Cat 6.3 fits; 8.3.3 misrouted OT teaching; 10.1.6 misrouted in Lord's Prayer subcat |
| 04/30/2026 | B2 resolution | — | 10 findings resolved, 2 accepted (F-B2005 ignore, F-B2009 ignore); 5 teachings moved, 4 deleted, 1 merged (4→1), 1 ref-swapped (6.3.2), 1 secondary ref added (2.7.13); catalog: 683→676 teachings; validate-catalog.js clean |

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
