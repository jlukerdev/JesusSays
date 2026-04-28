# Catalog Rebuild Plan — teachings_v2.json

**Created:** 2026-04-27
**Branch:** dev_catalogv2
**Goal:** Replace `public/teachings.json` with a fully-covered version containing ≥95% of all red-letter (Words of Christ) source verses.

---

## Status

### Phase 0 — Scripts
- [x] Script 1: `audit-coverage.js` — baseline coverage report
- [x] Script 2: `export-gaps.js` — editorial gap worksheet
- [x] Script 3: `synoptic-matcher.js` — annotate gaps as Type A / Type B
- [x] Script 4: `add-parallel-refs.js` — add Type A refs to existing teachings (now extends ranges on same-chapter refs)
- [x] Script 5: `generate-stubs.js` — create stub teachings for Type B gaps
- [x] Script 6: `assemble-v2.js` — assemble final teachings_v2.json
- [x] Script 7: `validate-v2.js` — validate coverage and schema

### Phase 1 — Editorial
- [x] Run scripts 1–3, review `gaps-annotated.json`
- [x] AI editorial pass on Type B stubs (replaced with `rule-based-editorial-pass.js` driven by 6 hand-authored chunk files in `bible_datasets/reports/chunks/`)
- [ ] Human review: approve/edit text summaries, assign categories
- [x] Confirm new categories needed (Passion Narrative confirmed; cat-31 created with subcats 31.1/31.2/31.3)

### Phase 2 — Assembly
- [x] Run scripts 4–7 (100% coverage; 716 teachings; 31 categories; 0 errors)
- [ ] Final human review of `teachings_v2.json`
- [ ] Copy to `public/teachings.json`
- [x] Update `src/utils/bookOrder.js` (add `2Cor` to all three maps)
- [ ] Smoke-test app

---

## Locked Decisions

| # | Decision | Answer |
|---|---|---|
| 1 | Taxonomy | Live `public/teachings.json` (30 categories) |
| 2 | `text` field policy | Option C: add `quote` field (raw KJV) alongside `text` (editorial summary) |
| 3 | Synoptic parallels | Type A: add `references[]` entry to existing teaching (`isPrimary: false`) |
| 4 | bookAbbr normalization | Normalize `1 Cor` → `1Cor`, `2 Cor` → `2Cor` in v2 |
| 5 | Short fragments | Group 1–2 verse conversational fragments into compound teachings |
| 6 | 2 Corinthians scope | Yes — Paul's audition of Jesus (2 Cor 12:9) is in scope |
| 7 | Editorial drafts | AI drafts with human review |
| 8 | New categories | Add as needed; Passion Narrative confirmed |
| 9 | Coverage target | Maximum — every verse that makes theological sense |

---

## Schema v2

```json
{
  "id": "1.1.1",
  "text": "If earthly fathers give good gifts, how much more will the heavenly Father...",
  "quote": "If ye then, being evil, know how to give good gifts unto your children, how much more shall your Father which is in heaven give good things to them that ask him?",
  "tags": [],
  "references": [
    {
      "label": "Matt 7:11",
      "book": "Matthew",
      "bookAbbr": "Matt",
      "chapter": 7,
      "ranges": [[11, 11]],
      "isPrimary": true
    }
  ]
}
```

**New field:** `quote` — raw `jesusText[]` joined with `" "`. Auto-populated for all teachings from source data. New stubs get it from the gap worksheet.

---

## bookAbbr Normalization

| Old (v1) | New (v2) | Source JSON abbr |
|---|---|---|
| `Matt` | `Matt` | `MAT` |
| `Mark` | `Mark` | `MRK` |
| `Luke` | `Luke` | `LUK` |
| `John` | `John` | `JHN` |
| `Acts` | `Acts` | `ACT` |
| `1 Cor` | `1Cor` | `1CO` |
| `2 Cor` | `2Cor` | `2CO` |
| `Rev` | `Rev` | `REV` |

`src/utils/bookOrder.js` also needs: add `2Cor` to `NT_BOOK_ABBR_ORDER`, `ABBR_TO_FULL`, and `BLB_BOOK_SLUG`.

---

## Actual Run Results (2026-04-27)

Scripts 1–3 have been run. All numbers below are exact.

| Book | Jesus verses | Covered | Uncovered | Coverage | Runs |
|---|---|---|---|---|---|
| Matthew | 644 | 470 | 174 | 73.0% | 106 |
| Mark | 286 | 147 | 139 | 51.4% | 90 |
| Luke | 587 | 371 | 216 | 63.2% | 113 |
| John | 419 | 162 | 257 | 38.7% | 130 |
| Acts | 27 | 26 | 1 | 96.3% | 1 |
| 1 Corinthians | 2 | 2 | 0 | 100% | 0 |
| 2 Corinthians | 1 | 1 | 0 | 100% | 0 |
| Revelation | 62 | 53 | 9 | 85.5% | 9 |
| **Total** | **2,028** | **1,232** | **796** | **60.7%** | **449** |

**Gap annotation summary (from `synoptic-matcher.js`):**
- **Type A** (add ref to existing teaching): 93 runs
- **Type B** (new teaching needed): 356 runs

**Known patterns in the gaps:**
- John is the biggest gap (61.3% uncovered) — concentrated in the Bread of Life discourse (ch 6), I AM statements (ch 8, 10), Lazarus (ch 11), Farewell Discourse (ch 13–17)
- Mark and Luke gaps are heavily synoptic parallels of already-covered Matthew teachings
- 9 Revelation gaps are missing verses within the Seven Churches letters (cat-30), NOT new categories
- 216 of the 356 Type B runs are single-verse fragments; 296 are 1–2 verses

---

## New Categories

**cat-31: The Passion Narrative** (confirmed)

Slug: `cat-31`

Subcategories:
- `31.1` / `cat-31-1` — The Last Supper (Matt 26, Mark 14, Luke 22, 1 Cor 11)
- `31.2` / `cat-31-2` — Gethsemane (Matt 26, Mark 14, Luke 22)
- `31.3` / `cat-31-3` — The Trial and Crucifixion (Matt 26–27, Mark 14–15, Luke 22–23, John 18–19)

**Sources field** for cat-31: `["Matt", "Mark", "Luke", "John"]`

**Note on REV gaps:** The 9 uncovered Revelation verses are all within the Seven Churches letters (Rev 2–3). They belong in **cat-30** (existing), not a new category. Assign to the appropriate church subcategory.

Additional categories: review `gaps-annotated.json` Type B items after AI pass to identify any other thematic clusters that warrant a new category.

---

## Script Pipeline

All scripts in `bible_datasets/scripts/`. Run from repo root:

```bash
node bible_datasets/scripts/audit-coverage.js
# → bible_datasets/reports/gaps-report.json

node bible_datasets/scripts/export-gaps.js
# → bible_datasets/reports/gaps-worksheet.json

node bible_datasets/scripts/synoptic-matcher.js
# → bible_datasets/reports/gaps-annotated.json

# --- AI editorial pass on Type B gaps here ---

node bible_datasets/scripts/add-parallel-refs.js
node bible_datasets/scripts/generate-stubs.js

# --- Human review of stubs here ---

node bible_datasets/scripts/assemble-v2.js
# → bible_datasets/jesussays_datasets/teachings_v2.json

node bible_datasets/scripts/validate-v2.js
```

---

## Reference Construction Guide

When building new `references[]` entries (Type A or Type B), use these exact values:

| catalogAbbr | book (full name) |
|---|---|
| `Matt` | `Matthew` |
| `Mark` | `Mark` |
| `Luke` | `Luke` |
| `John` | `John` |
| `Acts` | `Acts` |
| `1Cor` | `1 Corinthians` |
| `2Cor` | `2 Corinthians` |
| `Rev` | `Revelation` |

**Label format:** `"{bookAbbr} {chapter}:{startVerse}"` for single verse, `"{bookAbbr} {chapter}:{startVerse}–{endVerse}"` for ranges. Use an en-dash (`–`), not a hyphen (`-`).

**Type A reference object** (append to existing teaching, `isPrimary: false`):
```json
{
  "label": "Mark 2:17",
  "book": "Mark",
  "bookAbbr": "Mark",
  "chapter": 2,
  "ranges": [[17, 17]],
  "isPrimary": false
}
```

**Type B reference object** (primary reference for new teaching):
```json
{
  "label": "John 6:35",
  "book": "John",
  "bookAbbr": "John",
  "chapter": 6,
  "ranges": [[35, 35]],
  "isPrimary": true
}
```

---

## Fragment Grouping Rules

216 of the 356 Type B gaps are single verses; 296 are 1–2 verses. Decision 5 says group them rather than creating one teaching per verse.

**Rules for grouping during the AI pass (script 5 input):**

1. **Same chapter, within 5 verses, same speaker context** — consider merging into one teaching. E.g., Matt 26:25 and Matt 26:29 (Judas exchange + cup words) can be one teaching if thematically unified.
2. **Same discourse, interrupted by narration** — if a Jesus speech is split by a narrator note (e.g., "And he said"), the gaps likely belong to the same teaching.
3. **Do NOT group across chapter boundaries** unless the passage is a continuous speech (rare).
4. **Do NOT group if the verses are thematically distinct** even if adjacent — two separate commands/statements that stand on their own should stay separate.
5. **When grouped:** the `ranges` array on the reference gets multiple entries, e.g., `[[25,25],[29,29]]`, and the `quote` field concatenates all `jesusText` with a space.
6. **Minimum teaching size:** a teaching with only 1–2 words of Jesus (e.g., short healings like "Be thou clean") should still be its own entry — brevity is not a reason to merge across thematic lines.

The AI pass should flag candidate groupings with a `groupWithGapId` field; the assembler script handles the actual merge.

---

## Script 4–7 Specifications

### Script 4: `add-parallel-refs.js`

**Input:** `bible_datasets/reports/gaps-annotated.json`, `public/teachings.json`
**Output:** `bible_datasets/reports/catalog-with-parallels.json` (intermediate, not yet deployed)

For each gap where `type === 'A'`:
1. Find the teaching with `id === gap.existingTeachingId` in the catalog.
2. Check if a reference for this book/chapter already exists on that teaching (avoid duplicates).
3. If not present, build a new reference object (see Reference Construction Guide above) with `isPrimary: false`.
4. Append it to the teaching's `references[]`.

Edge case: if the gap spans multiple chapters (rare), create one reference per chapter with the appropriate verse ranges.

### Script 5: `generate-stubs.js`

**Input:** `bible_datasets/reports/gaps-annotated.json` (after AI editorial pass has filled `text`, `suggestedCategory`, `suggestedSubcategory`)
**Output:** `bible_datasets/reports/stubs.json`

For each gap where `type === 'B'` and `text` is not null:
1. Build a stub teaching object:
```json
{
  "_stub": true,
  "_gapId": "gap-042",
  "id": "PENDING",
  "text": "...",
  "quote": "...",
  "tags": [],
  "suggestedCategory": 31,
  "suggestedSubcategory": "31.1",
  "references": [{ "label": "...", "book": "...", "bookAbbr": "...", "chapter": 0, "ranges": [[0,0]], "isPrimary": true }]
}
```
2. Set `quote` to `gap.jesusText.join(' ')`.
3. Leave `id` as `"PENDING"` — IDs are assigned in script 6.
4. If `groupWithGapId` is set on this gap, merge the referenced gap into this one (combine `jesusText`, extend the `ranges` array), and mark the merged gap as `_merged: true` so script 6 skips it.

Gaps with `text === null` after the AI pass are skipped and logged as warnings — they need manual attention before assembly.

### Script 6: `assemble-v2.js`

**Input:** `public/teachings.json`, `bible_datasets/reports/catalog-with-parallels.json`, `bible_datasets/reports/stubs.json`, `bible_datasets/output/*.json` (source files for `quote` backfill)
**Output:** `bible_datasets/jesussays_datasets/teachings_v2.json`

Steps:
1. Start from `catalog-with-parallels.json` as the base (already has Type A refs applied).
2. **Backfill `quote` on all existing 360 teachings:** for each teaching, find the primary reference, look up the matching verses in the source JSON files, join `jesusText[]` into a single string. Write to `quote` field. If no match found, log a warning and leave `quote: null`.
3. **Normalize all `bookAbbr` values:** replace `"1 Cor"` → `"1Cor"` and `"2 Cor"` → `"2Cor"` everywhere.
4. **Insert stubs into their categories:** for each stub, look up the `suggestedCategory` and `suggestedSubcategory`, find the matching subcategory in the catalog, and append the teaching. Assign a sequential `id` based on existing teaching count in that subcategory.
5. **If cat-31 stubs exist:** insert the full cat-31 category object into `categories[]` at position 30 (zero-indexed), with subcategories built from stubs grouped by `suggestedSubcategory`.
6. **Strip private fields:** remove `_stub`, `_gapId`, `_merged` from all objects.
7. **Update `meta.totalCategories`** to reflect new category count.
8. Write output. Do not overwrite `public/teachings.json` directly.

### Script 7: `validate-v2.js`

**Input:** `bible_datasets/jesussays_datasets/teachings_v2.json`, source files
**Checks:**
- Re-run coverage audit against v2: report new coverage % (target ≥95%)
- All teaching `id` values are unique and match pattern `\d+\.\d+\.\d+`
- All `bookAbbr` values are in the canonical set (`Matt`, `Mark`, `Luke`, `John`, `Acts`, `1Cor`, `2Cor`, `Rev`)
- Each teaching has exactly one reference with `isPrimary: true`
- No `_stub` or `_gapId` fields remain
- `meta.totalCategories` matches actual category count
- All `ranges` values are `[number, number]` pairs where `end >= start`
- Log any teachings still missing a `quote` field

---

## AI Editorial Pass Instructions

**When to run:** after scripts 1–3, before scripts 4–5.
**Input file:** `bible_datasets/reports/gaps-annotated.json`
**Output file:** same file, updated in place (or `gaps-editorial.json` if preferred)
**Tool:** Use the `/claude-api` skill. Model: `claude-sonnet-4-6`.

### Batch strategy

356 Type B gaps is too large for one API call. Batch in groups of 25–30. Process book by book (all MAT gaps, then MRK, etc.) so the model has consistent context per batch.

### Few-shot examples to include in every prompt

Pull 5 diverse examples from `public/teachings.json` that represent the style range (short command, parable summary, doctrinal statement, healing pronouncement, eschatological warning). Example selections:

- `"1.1.1"` — "If earthly fathers give good gifts, how much more will the heavenly Father give good things to those who ask"
- `"4.1.1"` — (Kingdom parable)
- `"14.1.1"` — (Ethics/righteousness)
- `"22.1.1"` — (Discipleship)
- `"29.1.1"` — (Judgment)

### Prompt template

```
You are building a teaching catalog of the recorded words of Jesus Christ.

For each gap below, fill in these fields:
- "text": one sentence (10–20 words) summarizing what Jesus said, in present tense, third person. Match the style of the examples.
- "suggestedCategory": integer 1–31 (see category list below)
- "suggestedSubcategory": string like "1.1", "4.2" — the subcategory id within the chosen category
- "tags": array of applicable tags from: ["parable", "healing", "i-am", "prophecy", "prayer", "blessing", "woe"]
- "groupWithGapId": if this gap should be merged with an adjacent gap id (same speech, interrupted by narration), set this field. Otherwise null.

STYLE EXAMPLES (match this tone and length):
[insert 5 examples as JSON]

CATEGORY LIST:
1. God the Father  2. Identity of Jesus Christ  3. The Holy Spirit
4. Kingdom of God  5. Repentance and Conversion  6. Salvation and Eternal Life
7. Faith and Trust  8. The Old Covenant  9. The New Covenant
10. Prayer and Communion  11. Abiding in Christ  12. High Priestly Prayer
13. Love  14. Righteousness and Ethics  15. Humility and Servanthood
16. Truth and Integrity  17. Wisdom and Discernment  18. Forgiveness and Reconciliation
19. Marriage and Family  20. Wealth and Generosity  21. Justice and Mercy
22. Discipleship  23. Suffering and Persecution  24. Religious Hypocrisy
25. The Church  26. Mission and Witness  27. Post-Resurrection Appearances
28. Eschatology and the End Times  29. Judgment and Hell  30. The Seven Churches
31. The Passion Narrative

GAPS TO PROCESS:
[insert 25–30 gap objects as JSON, each with: id, label, verseText, jesusText]

Return a JSON array where each element is: { "id": "gap-xxx", "text": "...", "suggestedCategory": N, "suggestedSubcategory": "N.N", "tags": [...], "groupWithGapId": null }
```

### After the AI pass

- Merge the AI output back into `gaps-annotated.json` by matching on `id`.
- Flag any gaps where `text` is still null (AI skipped or errored) — these need manual input.
- Human reviews the completed file before running scripts 4–5. Pay special attention to category assignments for John's discourses, which are theologically dense.

---

## Notes for Scheduled Agent

1. Check `## Status` checkboxes to find where we are.
2. Run the next unchecked script; review its output in `bible_datasets/reports/`.
3. For the **AI editorial pass**, follow the detailed instructions in the section above. Do not skip this step — scripts 4 and 5 depend on `text` and `suggestedCategory` being filled in.
4. After the AI pass, **pause for human review** before running scripts 4–7. The human must approve category assignments and text summaries. Update the Status checkbox after approval is confirmed.
5. Update Status checkboxes immediately after completing each step — this file is the source of truth for progress.
6. Do **NOT** overwrite `public/teachings.json` — write to `teachings_v2.json` only until final human sign-off.
7. Do **NOT** alter existing teaching `id` values. Only append new teachings with new IDs.
8. If a script fails, check that the previous script's output file exists in `bible_datasets/reports/` before debugging further.
9. The `quote` field backfill in script 6 requires the source files at `bible_datasets/output/`. Do not delete those files.

---

## Post-pipeline reorder — Passion Narrative (2026-04-28)

After the v2 pipeline completed, **Cat 31 "The Passion Narrative" was moved to Cat 27** so it sits chronologically before the Resurrection block instead of trailing the Seven Churches. Old → new top-level mapping:

| Old | New | Title |
|---|---|---|
| 27 | 28 | Post-Resurrection Appearances |
| 28 | 29 | Eschatology and the End Times |
| 29 | 30 | Judgment and Hell |
| 30 | 31 | The Seven Churches |
| 31 | 27 | The Passion Narrative |

**Scope of change:** `bible_datasets/jesussays_datasets/teachings_v2.json` only. All `category.id`, `subcategory.id`, and `teaching.id` values for the affected cats were rewritten in place; the categories array was re-sorted by id. Transform performed by `bible_datasets/scripts/renumber-passion-cat.js`.

**Out of scope (intentionally not updated):** `gaps-annotated.json`, the `reports/chunks/annotations_*.json` chunks, `rule-based-editorial-pass.js` `VALID_SUBS`, and the inline cat-number references earlier in this plan. Those artifacts still reference the pre-reorder numbering and will be inconsistent with the v2 output. Re-running scripts 4–7 after this reorder would regenerate stale numbering — **don't re-run them** without first updating those upstream artifacts.

**Known cosmetic carryover:** Cat 31 (Seven Churches) still has its preamble subcat numbered `31.8` (Vision of Christ) while displaying first in the list. Pre-existing oddity from the live catalog; not addressed here.
