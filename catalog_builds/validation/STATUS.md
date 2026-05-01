# Validation Status Dashboard — April 29, 2026

**Catalog snapshot at validation start:** 31 categories · 126 subcategories · 683 teachings · 42 parables  
**Current catalog state (after B5 Pass 2):** 31 categories · 124 subcategories · 666 teachings · **38 parables**  
**B4 status:** DONE  
**Plan:** [PLAN.md](PLAN.md)

---

## Batch Progress

| Batch | Name | Status | Findings | Open | Resolved | Accepted |
|---|---|---|---|---|---|---|
| B0 | Baseline Snapshot | DONE | 3 | 0 | 0 | 3 |
| B1 | Global Override Compliance | DONE | 24 | 0 | 13 | 11 |
| B2 | Categories 1–10 | DONE | 12 | 0 | 10 | 2 |
| B3 | Categories 11–20 | DONE | 19 | 0 | 19 | 0 |
| B4 | Categories 21–31 | DONE | 19 | 0 | 18 | 1 |
| B5 | Parable Tag Audit | DONE | 5 | 0 | 5 | 0 |
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
| ERROR | 0 | 0 | 17 | 3 | **20** |
| WARNING | 0 | 0 | 11 | 0 | **11** |
| REVIEW | 0 | 0 | 32 | 2 | **34** |
| INFO | 0 | 0 | 13 | 4 | **17** |
| **All** | **0** | **0** | **73** | **9** | **82** |

*Update this table after each batch is completed.*

---

## Catalog State After Validation

Track changes made during resolution. Update as teachings are moved.

| Change | Count | Notes |
|---|---|---|
| Teachings moved (reclassified) | 28 | B1: 2.4.3→12.1.3, 6.3.1→12.1.4, 25.4.1→12.3.4, 2.6.1→27.3.7, 4.1.12→27.3.8, 9.1.1→27.1.11, 10.5.2→27.2.7, 2.1.11→31.1.4; plus 5 split-offs (27.1.12–14, 27.3.9, 31.1.5) · B2: 1.1.5→1.3.5, 5.2.4→5.1.10, 6.3.6→30.1.6, 8.3.3→24.4.8, 10.1.6→10.3.4 · B3: 19.4.3→25.3, 14.1.3→2.6, 14.3.7→17.3, 18.1.3→18.2, 13.4.4→11.2, 17.3.4→5.1, 18.3.4→14.5, 18.3.5→5.1, 19.3.3→22.2 |
| Teachings deleted (duplicates/misroutes) | 18 | B1: 2.1.9, 5.1.4, 22.4.2, 22.4.3, 27.4.8 · B2: 2.2.6, 2.5.9, 2.6.15, 2.6.16 · B3: 14.3.6, 13.3.3, 12.1.3, 12.3.4, 16.2.1, 19.2.1, 15.1.5, 15.1.6, 13.1.1 |
| Teachings merged | 3 | B2: 7.1.11–7.1.14 → single teaching 7.1.11 (Mark 9:16–23) · B3: 12.1.3→12.1.2 (John 17:4–5 consolidated); 12.3.4→12.3.1 (John 17:20–23 consolidated) |
| Subcategories deleted | 1 | B3: Cat 13.1 "Love for God" (merged into Cat 13.2, retitled "Love for God and Neighbor") |
| Tags corrected | 1 | B3: removed i-am tag from 17.2.8 (John 9:39) |
| Canonical list IDs corrected (TAG_RULES.md) | 5 | B5 Pass 1: 2.1.14→2.1.11, 2.1.16→2.1.13, 5.1.5→5.1.4, 13.2.2→13.1.2, 18.1.4→18.1.3 (ID drift from B1–B4 renumbering) |
| Parable tags removed (false positives) | 4 | B5 Pass 2: 2.1.11, 2.1.13, 20.4.1, 21.2.1 — Good Shepherd metaphors and eschatological narratives fail the three-part parable definition |
| Field fixes (text, quote, refs) | 12 | B2: 2.3.4, 5.3.2, 15.2.1, 16.3.1, 17.1.1, 22.4.1 (ref strip + text update); 15.1.1, 19.3.3 (ref strip only) · B3: 12.1.2 (ref → John 17:4–5); 12.3.1 (ref → John 17:20–23); 15.1.1 (consolidated Mark 10 + added Mark 9:33); 13.2.1 (full Greatest Commandment content merged in) |
| `renumber.js` runs | 4 | After apply-b1-resolutions.cjs; after duplicate removal; after apply-b3-resolutions.cjs; after apply-b4-resolutions.cjs |

---

## Session Log

Record each work session so progress can be resumed.

| Date | Batches Worked | Findings Added | Actions Taken |
|---|---|---|---|
| 04/29/2026 | B0 | 3 (2 dup-text INFO, 1 parable-candidate FALSE POSITIVE) | B0-BASELINE.md created; validate-catalog passed clean; B1 unblocked |
| 04/29/2026 | B1 | 24 (16 ERROR, 8 REVIEW) | B1-OVERRIDES.md created; G-1/G-2/G-4 checks run; 16 hard violations + 8 composite-teaching reviews; B1 COMPLETE — PENDING RESOLUTION |
| 04/30/2026 | B2 | 11 (3 warnings, 6 reviews, 2 info) | B2-CATS01-10.md created; all 10 categories reviewed; key findings: 2.2.6/2.6.15/2.6.16 routing issues in Cat 2; 5.2.4 non-parable in parable subcat; 6.3.2/6.3.6/6.3.7 weak Cat 6.3 fits; 8.3.3 misrouted OT teaching; 10.1.6 misrouted in Lord's Prayer subcat |
| 04/30/2026 | B2 resolution | — | 10 findings resolved, 2 accepted (F-B2005 ignore, F-B2009 ignore); 5 teachings moved, 4 deleted, 1 merged (4→1), 1 ref-swapped (6.3.2), 1 secondary ref added (2.7.13); catalog: 683→676 teachings; validate-catalog.js clean |
| 04/30/2026 | B3 | 19 (4 ERROR, 3 WARNING, 8 REVIEW, 4 INFO) | B3-CATS11-20.md created; all 10 categories reviewed; key findings: 13.3.1/13.3.2 Antitheses-block verses in wrong Cat; 13.3.3 Golden Rule duplicate of 14.6.1; 19.4.3 complete misroute (exorcist teaching in children subcat); 14.1.3/14.3.7 subcategory misroutes; 18.1.3 wrong forgiveness subcat; 12.1 and 12.3 reference fragmentation/duplicates; Cat 20 clean |
| 04/30/2026 | B4 | 19 (5 warnings, 11 reviews, 3 info) | B4-CATS21-31.md created; all 11 categories reviewed; key findings: 21.3.4 Render-to-Caesar misrouted in Cat 21.3; 22.1.9 Luke 4:18–19 (Nazareth reading) in Cat 22.1 instead of Cat 2.6; 22.3.4 Triumphal Entry colt (Luke 19:30–31) in Cat 22.3 instead of Cat 2.6; 26.1.2/28.1.3 duplicate commissioning content; 28.1.4 Damascus road in Cat 28 instead of Cat 26.3; Thomas not in Cat 7 as primary; Feed-my-sheep not cross-listed in Cat 22/26; 25.4.1 kingdom-divided Beelzebul argument in Cat 25.4 instead of Cat 24; Cats 23/27/31 clean |
| 04/30/2026 | B4 resolution | — | 18 findings resolved, 1 accepted (F-B4015 Thomas ignored); apply-b4-resolutions.cjs run; 28 structural operations: 8 teachings moved, 8 deleted, 8 split/merged into new teachings, 1 subcategory deleted (28.3), 8 ref-only updates; catalog: 667→666 teachings, 125→124 subcategories; renumber + validate-catalog both clean |
| 04/30/2026 | B5 | 5 INFO | B5-PARABLES.md created; all 4 checks run; Check A: count = 42 ✓; Checks B/C: 5 canonical IDs stale due to B1–B4 renumbering — all correct parables tagged at shifted IDs; Check D: all placement checks pass ✓; TAG_RULES.md updated with 5 corrected IDs (2.1.14→2.1.11, 2.1.16→2.1.13, 5.1.5→5.1.4, 13.2.2→13.1.2, 18.1.4→18.1.3); all 5 findings resolved; B5 DONE |
| 04/30/2026 | B5 Pass 2 | 4 INFO | User manually reviewed canonical list and flagged 4 false positives (2.1.11, 2.1.13, 20.4.1, 21.2.1); parable tag removed from all 4 in teachings.json; TAG_RULES.md updated — count 42→38, false positive column removed, 4 entries moved to Removed section with rationale; validate-catalog.js clean; catalog now 38 parables |

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
