# Validation Status Dashboard — April 29, 2026

**Catalog snapshot at validation start:** 31 categories · 126 subcategories · 683 teachings · 42 parables  
**Plan:** [PLAN.md](PLAN.md)

---

## Batch Progress

| Batch | Name | Status | Findings | Open | Resolved | Accepted |
|---|---|---|---|---|---|---|
| B0 | Baseline Snapshot | DONE | 3 | 0 | 0 | 3 |
| B1 | Global Override Compliance | COMPLETE — PENDING RESOLUTION | 24 | 24 | 0 | 0 |
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
| ERROR | 16 | 0 | 0 | 0 | 16 |
| WARNING | 0 | 0 | 0 | 0 | 0 |
| REVIEW | 8 | 0 | 0 | 0 | 8 |
| INFO | 0 | 0 | 0 | 3 | 3 |
| **All** | **24** | **0** | **0** | **3** | **27** |

*Update this table after each batch is completed.*

---

## Catalog State After Validation

Track changes made during resolution. Update as teachings are moved.

| Change | Count | Notes |
|---|---|---|
| Teachings moved (reclassified) | 0 | — |
| Teachings deleted (duplicates) | 0 | — |
| Tags corrected | 0 | — |
| Field fixes (text, quote, refs) | 0 | — |
| `renumber.js` runs | 0 | — |

---

## Session Log

Record each work session so progress can be resumed.

| Date | Batches Worked | Findings Added | Actions Taken |
|---|---|---|---|
| 04/29/2026 | B0 | 3 (2 dup-text INFO, 1 parable-candidate FALSE POSITIVE) | B0-BASELINE.md created; validate-catalog passed clean; B1 unblocked |
| 04/29/2026 | B1 | 24 (16 ERROR, 8 REVIEW) | B1-OVERRIDES.md created; G-1/G-2/G-4 checks run; 16 hard violations + 8 composite-teaching reviews; B1 COMPLETE — PENDING RESOLUTION |

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
