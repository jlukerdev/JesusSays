# Session Handoff — v2 Catalog Migration
**Written:** 2026-04-28  
**Branch:** `dev_catalogv2`  
**Last commit:** `54340da`  

---

## What Was Accomplished This Session

### 1. Branch & Plan Review
- Checked out `dev_catalogv2`
- Read `catalog-rebuild-plan.md` in full
- Confirmed scripts 1–3 had already been run (outputs exist in `bible_datasets/reports/`)

### 2. Scripts 4–7 Written
All four pipeline scripts were created from scratch in `bible_datasets/scripts/`:

| Script | File | Status |
|--------|------|--------|
| Script 4 | `add-parallel-refs.js` | ✅ Written, not yet run |
| Script 5 | `generate-stubs.js` | ✅ Written, not yet run |
| Script 6 | `assemble-v2.js` | ✅ Written, not yet run |
| Script 7 | `validate-v2.js` | ✅ Written, not yet run |
| Helper | `ai-editorial-pass.js` | ✅ Written, but approach failed (see below) |

### 3. `src/utils/bookOrder.js` Updated
Added `2Cor` to all three maps per plan Decision 4:
- `NT_BOOK_ORDER` → added `'2 Corinthians'`
- `NT_BOOK_ABBR_ORDER` → added `'2Cor'`
- `ABBR_TO_FULL` → added `'2Cor': '2 Corinthians'`
- `BLB_BOOK_SLUG` → added `'2Cor': '2co'`

### 4. `gaps-annotated.json` Patched
The failed `ai-editorial-pass.js` runs wrote back null values but did add the `groupWithGapId: null` scaffold field to every gap entry. The file is otherwise unchanged from script 3's output.

---

## What Is Blocked and Why

### The AI Editorial Pass — Core Blocker

The plan calls for an AI pass to fill three fields on each of **356 Type B gaps** in `bible_datasets/reports/gaps-annotated.json`:
- `text` — 10–20 word editorial summary
- `suggestedCategory` — integer 1–31
- `suggestedSubcategory` — string like `"8.1"`
- `tags` — array from `["parable","healing","i-am","prophecy","prayer","blessing","woe"]`
- `groupWithGapId` — null or another gap ID to merge into

**All 356 gaps currently have `text: null`.** Scripts 5 and 6 depend on this data; Script 4 can run independently.

**Two approaches were tried and failed:**

1. `claude --bare` mode (no repo context, pure API): requires `ANTHROPIC_API_KEY` env var. Only OAuth/keychain auth is available in this environment — bare mode refuses to start.
2. `claude -p "..."` from `/tmp` (bypasses CLAUDE.md context): works, but takes ~66 seconds per batch of 5 gaps. With 356 gaps, estimated total runtime is 75–90 minutes — exceeding bash command timeout limits.

---

## What Remains To Do (In Order)

### Step 1 — AI Editorial Pass ⬅ PICK UP HERE
**File to update:** `bible_datasets/reports/gaps-annotated.json`  
**Fields to fill on every gap where `type === 'B'`:** `text`, `suggestedCategory`, `suggestedSubcategory`, `tags`, `groupWithGapId`

**Recommended approach: write `rule-based-editorial-pass.js`**

A plain Node.js script with a hardcoded lookup table of all 356 gap IDs → annotations. No API calls. Runs instantly. The annotating agent (or human) fills in the table based on Gospel knowledge.

The script should:
```js
// Structure of the lookup table:
const ANNOTATIONS = {
  'gap-001': { text: '...', suggestedCategory: 8, suggestedSubcategory: '8.1', tags: [], groupWithGapId: null },
  // ... all 356 entries
};
// Then loop gaps, assign, write back to gaps-annotated.json
```

**Alternative approach: call the claude CLI in small batches from `/tmp`**
- Use `claude -p "PROMPT" --output-format json --no-session-persistence` from cwd `/tmp`
- Batch size of 5–10 gaps per call to stay under 120s timeout
- Run each batch as a separate bash command (not in a loop) to avoid accumulated timeout
- See `bible_datasets/scripts/ai-editorial-pass.js` for prompt template and category list — it works correctly, just needs per-batch execution rather than a loop

**Prompt template is already in `ai-editorial-pass.js`** — the `buildPrompt()` function is complete and correct. The issue was only the execution loop timing out.

---

### Step 2 — Run Script 4
```bash
node bible_datasets/scripts/add-parallel-refs.js
```
- Input: `gaps-annotated.json` + `public/teachings.json`
- Output: `bible_datasets/reports/catalog-with-parallels.json`
- Adds 93 secondary `references[]` entries to existing teachings (Type A gaps)
- **Can run immediately — does not depend on the AI editorial pass**

---

### Step 3 — Run Script 5
```bash
node bible_datasets/scripts/generate-stubs.js
```
- Input: `gaps-annotated.json` (must have `text` filled for Type B gaps)
- Output: `bible_datasets/reports/stubs.json`
- Depends on Step 1 (editorial pass) being complete

---

### Step 4 — Run Script 6
```bash
node bible_datasets/scripts/assemble-v2.js
```
- Inputs: `catalog-with-parallels.json`, `stubs.json`, `bible_datasets/output/*.json`
- Output: `bible_datasets/jesussays_datasets/teachings_v2.json`
- Backfills `quote` field on all 360 existing teachings from source verse files
- Normalizes `bookAbbr` (`1 Cor` → `1Cor`, etc.)
- Inserts stubs into their categories
- Builds `cat-31` (Passion Narrative) from stubs with `suggestedCategory: 31`
- Does **not** touch `public/teachings.json`

---

### Step 5 — Run Script 7
```bash
node bible_datasets/scripts/validate-v2.js
```
- Input: `bible_datasets/jesussays_datasets/teachings_v2.json`
- Runs full validation: coverage audit, ID uniqueness, bookAbbr check, schema checks
- Target: ≥ 95% coverage of all red-letter verses
- Fix any errors before proceeding

---

### Step 6 — Copy to public
```bash
cp bible_datasets/jesussays_datasets/teachings_v2.json public/teachings.json
```
Only after Script 7 passes cleanly.

---

### Step 7 — Update `catalog-rebuild-plan.md` Checkboxes
Mark these as complete:
- `[ ] Script 4: add-parallel-refs.js` → `[x]`
- `[ ] Script 5: generate-stubs.js` → `[x]`
- `[ ] Script 6: assemble-v2.js` → `[x]`
- `[ ] Script 7: validate-v2.js` → `[x]`
- `[ ] AI editorial pass on Type B stubs` → `[x]`
- `[ ] Run scripts 4–7` → `[x]`
- `[ ] Final human review of teachings_v2.json` → mark as done (review was waived)
- `[ ] Copy to public/teachings.json` → `[x]`
- `[ ] Update src/utils/bookOrder.js` → `[x]` ← already done
- `[ ] Smoke-test app` → test with `npm run dev`

---

### Step 8 — Smoke-Test the App
```bash
npm run dev
```
- Verify the app loads with the new `public/teachings.json`
- Check that `2Cor` references display correctly
- Check that `cat-31` (Passion Narrative) appears in the sidebar if sidebar/categories are rendered

---

### Step 9 — Commit and Push
```bash
git add .
git commit -m "dev_catalogv2: complete v1→v2 migration ..."
git push -u origin dev_catalogv2
```

---

## Key File Locations

| File | Path | Notes |
|------|------|-------|
| Gap annotation data | `bible_datasets/reports/gaps-annotated.json` | 356 Type B gaps need `text` filled |
| Script 4 | `bible_datasets/scripts/add-parallel-refs.js` | Ready to run |
| Script 5 | `bible_datasets/scripts/generate-stubs.js` | Needs editorial pass first |
| Script 6 | `bible_datasets/scripts/assemble-v2.js` | Needs scripts 4+5 first |
| Script 7 | `bible_datasets/scripts/validate-v2.js` | Needs script 6 first |
| Editorial pass runner | `bible_datasets/scripts/ai-editorial-pass.js` | Prompt template is correct; execution strategy needs adjustment |
| Source verse files | `bible_datasets/output/70_MAT.json` etc. | Used by script 6 for `quote` backfill |
| REV source file | `bible_datasets/output/96_REV.json` | Note: filename is `96_REV`, not `90_REV` |
| v2 output target | `bible_datasets/jesussays_datasets/teachings_v2.json` | Does not exist yet |
| Current catalog | `public/teachings.json` | Do not overwrite until v2 is validated |
| Plan document | `bible_datasets/catalog-rebuild-plan.md` | Source of truth |

---

## Gap Distribution (Type B — all need annotation)

| Book | Count | Notes |
|------|-------|-------|
| Matthew | 74 | Mostly healings, controversies, Passion Narrative (ch 26–27) |
| Mark | 64 | Mostly synoptic parallels of Matthew |
| Luke | 79 | Synoptic parallels + unique material (Zacchaeus, Emmaus) |
| John | 129 | Biggest gap — Bread of Life (ch 6), I AM discourses (ch 7–10), Farewell Discourse (ch 13–16), High Priestly Prayer fragments (ch 17), Passion (ch 18–19) |
| Acts | 1 | Acts 11:16 — "baptized with the Holy Ghost" |
| Revelation | 9 | Missing verses within Seven Churches letters (cat-30) |

---

## Category Assignment Quick Reference

For whoever does the editorial pass annotations:

| # | Category | Key content |
|---|----------|-------------|
| 1 | God the Father | Fatherhood, true worship, sovereignty |
| 2 | Identity of Jesus | I AM statements (2.1), relationship with Father (2.2), authority (2.3), pre-existence (2.4), passion predictions (2.5), messianic identity (2.6), words from cross (2.7) |
| 3 | Holy Spirit | Promise/coming of Spirit (3.1), Spirit's work (3.2), Spirit in witness (3.3), blasphemy (3.4) |
| 4 | Kingdom of God | Nature (4.1), growth (4.2), entering (4.3), Beatitudes (4.4), parables of people (4.5) |
| 5 | Repentance | Call to repent (5.1), parables of lost (5.2), invitation to come (5.3) |
| 6 | Salvation/Eternal Life | New birth (6.1), faith condition (6.2), eternal life (6.3), narrow way (6.4) |
| 7 | Faith and Trust | Nature/power of faith (7.1), overcoming fear (7.2), trust over anxiety (7.3) |
| 8 | Old Covenant | Jesus and the Law (8.1), law's fulfillment in love (8.2), Moses pointing to Jesus (8.3) |
| 9 | New Covenant | Lord's Supper (9.1), Bread of Life (9.2), new/old transition (9.3) |
| 10 | Prayer | Lord's Prayer (10.1), how to pray (10.2), persistence (10.3), praying in Jesus's name (10.4), corporate/watchfulness (10.5) |
| 11 | Abiding in Christ | Vine and branches (11.1), abiding in love (11.2) |
| 12 | High Priestly Prayer | For himself (12.1), for disciples (12.2), for all believers (12.3) |
| 13 | Love | For God (13.1), for neighbor (13.2), for enemies (13.3), new commandment (13.4) |
| 14 | Righteousness/Ethics | Salt and light (14.1), law (14.2), antitheses (14.3), authentic piety (14.4), judging (14.5), golden rule (14.6) |
| 15 | Humility/Servanthood | Greatness (15.1), servant model (15.2), parables of humility (15.3), childlikeness (15.4) |
| 16 | Truth/Integrity | Power of words (16.1), truthfulness/oaths (16.2), Jesus as truth (16.3) |
| 17 | Wisdom/Discernment | Hearing/perceiving (17.1), spiritual blindness (17.2), true vs false (17.3), hidden things (17.4) |
| 18 | Forgiveness | God's forgiveness (18.1), forgiving others (18.2), reconciliation (18.3) |
| 19 | Marriage/Family | Marriage/divorce (19.1), sexual purity (19.2), family/kingdom (19.3), children (19.4) |
| 20 | Wealth/Generosity | Treasure and heart (20.1), danger of riches (20.2), generosity (20.3), rich man/Lazarus (20.4) |
| 21 | Justice/Mercy | Blessing poor/woe rich (21.1), sheep and goats (21.2), mercy/compassion (21.3) |
| 22 | Discipleship | Call to follow (22.1), counting cost (22.2), fruit-bearing (22.3), faithful to end (22.4), Great Commission (22.5) |
| 23 | Suffering/Persecution | Promise of persecution (23.1), courage (23.2), taking up cross (23.3) |
| 24 | Religious Hypocrisy | Seven woes (24.1), outward vs inward (24.2), traditions vs commands (24.3), Sabbath (24.4), leadership hypocrisy (24.5) |
| 25 | The Church | Foundation (25.1), discipline (25.2), corporate prayer (25.3), unity (25.4) |
| 26 | Mission/Witness | Harvest and workers (26.1), instructions for twelve/seventy (26.2), courage (26.3), persecution (26.4), visions/commissions (26.5) |
| 27 | Post-Resurrection | Resurrection appearances (27.1), Thomas (27.2), Peter restored (27.3), final commission (27.4) |
| 28 | Eschatology | Signs of end (28.1), return of Son of Man (28.2), readiness (28.3), fig tree/unknown hour (28.4) |
| 29 | Judgment/Hell | Certainty/scope (29.1), hell's reality (29.2), resurrection/destiny (29.3) |
| 30 | Seven Churches | Letters to seven churches (30.1–30.8) — all 9 REV gaps belong here |
| 31 | Passion Narrative | Last Supper (31.1), Gethsemane (31.2), Trial and Crucifixion (31.3) |

**Key placement patterns:**
- Matt/Mark/Luke ch 26–27 / 14–15 / 22–23 → **cat 31**
- John ch 6 (Bread of Life) → **cat 9, subcat 9.2**
- John ch 7–10 (temple debates, I AM, Good Shepherd) → **cat 2** (primarily 2.1, 2.2, 2.3)
- John ch 11 (Lazarus) → **cat 6, subcat 6.3**
- John ch 12–16 (Farewell Discourse fragments) → **cat 11, 13, 23** depending on content
- John ch 17 fragments → **cat 12**
- John ch 18–19 → **cat 31**
- Revelation gaps → **cat 30** (match to correct church subcategory)
- Healing commands ("be thou clean", "rise and walk", etc.) → **cat 2, subcat 2.3**
- Temptation responses (Matt 4, Mark 1:13 parallels, Luke 4) → **cat 8, subcat 8.1**

---

## Script Behavior Notes

### `generate-stubs.js` (Script 5)
- Skips any Type B gap with `text === null` (logs a warning)
- Handles `groupWithGapId` merging: if gap A has `groupWithGapId: "gap-B"`, gap B's `jesusText` is merged into gap A's `quote` and `ranges`, and gap B is excluded from stubs
- Grouping only works within the same chapter; cross-chapter groups are rejected

### `assemble-v2.js` (Script 6)
- Uses `bible_datasets/output/96_REV.json` (not `90_REV.json`) — script auto-detects via `find`
- If a stub's `suggestedSubcategory` doesn't exist in the catalog, it falls back to the first subcategory of `suggestedCategory` with a warning
- `cat-31` is created from scratch from stubs with `suggestedCategory: 31`
- `quote` field is backfilled from `output/*.json` source files using the primary reference's `chapter` + `ranges`

### `validate-v2.js` (Script 7)
- Exits with code 1 if any hard errors found (duplicate IDs, bad bookAbbr, wrong isPrimary count, private fields remaining)
- Coverage below 95% is a warning, not a hard error
- Missing `quote` fields are warnings only

---

## Notes on `groupWithGapId`

This field is optional — all gaps can safely have `groupWithGapId: null`. It only affects how stubs are merged. If you want to use it:
- Only group gaps that are in the **same chapter**, **within 5 verses**, and part of the **same speech unit**
- The gap with the *earlier* ID should be the "primary" (the one that survives); the gap with the *later* ID sets `groupWithGapId` to the earlier ID
- Example: gap-049 (Matt 15:32) and gap-050 (Matt 15:34) are 2 verses apart, same feeding miracle → gap-050 sets `groupWithGapId: "gap-049"`

---

## Verification Checklist Before Calling v2 Done

- [ ] `gaps-annotated.json`: zero Type B gaps with `text === null`
- [ ] `catalog-with-parallels.json` exists in `bible_datasets/reports/`
- [ ] `stubs.json` exists in `bible_datasets/reports/`
- [ ] `teachings_v2.json` exists in `bible_datasets/jesussays_datasets/`
- [ ] Script 7 passes with 0 errors and ≥ 95% coverage
- [ ] `public/teachings.json` replaced with v2 content
- [ ] `catalog-rebuild-plan.md` all Phase 1 + Phase 2 checkboxes marked
- [ ] `src/utils/bookOrder.js` has `2Cor` ← **already done**
- [ ] App loads without errors (`npm run dev`)
- [ ] All changes committed and pushed to `dev_catalogv2`
