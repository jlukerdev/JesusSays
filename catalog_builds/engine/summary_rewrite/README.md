# Summary Rewrite

Tooling for the bulk rewrite of every teaching's `text` summary in `public/teachings.json`.

## Goal

Update each teaching's `text` so it is:

- **Complete sentence(s).** Most are 1 sentence; complex passages may use 2–3.
- **Descriptive of the actual referenced scriptures** — not a paraphrase the text has drifted away from.
- **Doctrinally neutral** — summarize the words spoken; do not interpret.
- **Scannable.** A reader skimming a list of 50 summaries should grasp this one in 2 seconds.

## Length & Style Rules

Length caps by primary `verseSpan`:

| Verse span | Word cap |
|---|---|
| 1–2 verses | ≤ 25 words |
| 3–10 verses | ≤ 45 words |
| > 10 verses | ≤ 70 words |

Additional rules:

1. **One load-bearing point per summary.** Pick the central thing said. Do not enumerate every clause of the quote. Cross-references are for color, not for adding more content.
2. **Clause limit:** at most one em-dash *or* two commas per sentence. If more is needed, split into two short sentences.
3. **Voice:** Jesus named as the speaker with a varied verb (says, teaches, declares, tells of, warns, blesses, proclaims, cries out, likens, prays, calls, charges, names, draws a parable, etc.).
4. **No quotation marks** in the new text.
5. **No doctrinal interpretation** — no "this teaches us that…" / "this means…". Stick to what is spoken or described.

### Approved tightening examples

The three reference examples that calibrate the caps. The full rewrite pass produced longer summaries; the tightening pass (see Phasing § 4) will compress entries that exceed their cap to match this calibration.

**1–2 verse cap example** — `30.1.3` Matt 12:41–42 (24 words):

> Jesus declares that Nineveh and the queen of the south shall condemn this generation, for a greater than Jonas and Solomon is here.

**3–10 verse cap example** — `6.4.4` Luke 13:32–35 (45 words):

> Jesus calls Herod that fox and says he will continue his work until perfected on the third day. He laments over Jerusalem that kills her prophets, saying how often he would have gathered her children as a hen gathers her brood, but she would not.

**>10 verse cap example** — `5.2.3` Luke 15:11–32, prodigal son (69 words):

> Jesus tells of a younger son who takes his portion to a far country, wastes it in riotous living, and in famine resolves to return confessing he has sinned. His father runs to meet him with compassion and restores him with the best robe and the fatted calf, rebuking the elder son's anger and declaring that this son was dead and is alive again, was lost and is found.

## Files

```
summary_rewrite/
├── apply-summaries.mjs              # applies the mapping JSON to public/teachings.json
├── render-review.mjs                # renders the review markdown from the mapping JSON
└── output/
    ├── summary-rewrite.json         # mapping: { entries: [{ uid, id, old, new, needsReview, ... }] }
    └── summary-rewrite-review.md    # human review queue (regenerated from JSON)
```

The **mapping JSON is the single source of truth.** The review markdown is regenerated from it.

## Mapping schema

```jsonc
{
  "version": "1.0",
  "phase": "pilot" | "full",
  "generatedAt": "ISO-8601",
  "policy": { ... },                 // descriptive only
  "entries": [
    {
      "uid": "<uuid-v4>",            // required — stable key into teachings.json
      "id": "1.1.1",                 // contextual — current id at authoring time
      "categoryTitle": "...",
      "subcategoryTitle": "...",
      "primaryRef": "Matt 5:13",
      "verseSpan": 4,                // total verses across all references
      "tags": ["parable"] | [],
      "old": "<existing text>",      // sanity check on apply
      "new": "<rewritten text>",     // what apply will set
      "needsReview": true | false,
      "reviewReasons": ["parable" | "long-passage" | "structural-change"]
    }
  ]
}
```

## Review flags

A teaching is flagged for review (and skipped by default during apply) when any of these hold:

| Reason | Trigger |
|---|---|
| `parable` | Teaching has the `"parable"` tag |
| `long-passage` | Total verse span across references > 10 |
| `structural-change` | Token-Jaccard similarity between `old` and `new` < 0.30 |

## Workflow

```
                     ┌─────────────────────────────┐
                     │ Author entries in            │
                     │ output/summary-rewrite.json  │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
              ┌───────────────────────────────────────┐
              │ node render-review.mjs                │
              │   → writes summary-rewrite-review.md  │
              └──────────────────┬───────────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────────────┐
              │ Human review: tick approvals,              │
              │ note edits, update entries in JSON,        │
              │ then re-render until queue is clean        │
              └──────────────────┬─────────────────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────────────┐
              │ node apply-summaries.mjs --dry-run         │
              │   (apply non-review entries first to vet)  │
              └──────────────────┬─────────────────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────────────┐
              │ node apply-summaries.mjs                   │
              │ node apply-summaries.mjs --include-review  │
              │   (after approvals)                        │
              └────────────────────────────────────────────┘
```

`apply-summaries.mjs` automatically runs `renumber.js` then `validate-catalog.js` after writing.

## Commands

All from project root:

```bash
# regenerate the review markdown
node catalog_builds/engine/summary_rewrite/render-review.mjs

# preview applying non-review entries
node catalog_builds/engine/summary_rewrite/apply-summaries.mjs --dry-run

# apply non-review entries
node catalog_builds/engine/summary_rewrite/apply-summaries.mjs

# apply everything (after review approvals)
node catalog_builds/engine/summary_rewrite/apply-summaries.mjs --include-review

# apply even if current text differs from entry.old (catalog drifted)
node catalog_builds/engine/summary_rewrite/apply-summaries.mjs --force
```

## Phasing

1. **Pilot (complete).** 20 representative teachings spanning categories, parables, and long passages. Voice approved.
2. **Full pass (complete).** All 655 teachings have authored `new` summaries in `output/summary-rewrite.json`. Voice matches the pilot.
3. **Tighten pass (queued — not yet executed).** Audit revealed 360 of 655 entries (≈55%) exceed the word caps in **Length & Style Rules**. Many are run-on, restating the entire passage rather than summarizing it. The tighten pass will:
   - Read each entry's existing `new`, current `verseSpan`, and applicable cap.
   - For entries already under cap: leave `new` unchanged.
   - For entries over cap: compress to ≤ cap, preserving the same Jesus-verb and the same load-bearing point. Apply the clause limit (one em-dash *or* two commas per sentence; otherwise split).
   - Recompute `needsReview` and `reviewReasons` after compression — the `structural-change` flag is recomputed against the *original* `old`, so most run-on rewrites that were flagged purely for length-driven Jaccard drift may un-flag once they are tighter and reuse more original wording.
   - Strategy: parallel agents per category, mirroring the full-pass dispatch. Input file = current mapping entries; output = updated entries with shortened `new`.
4. **Apply.** Run `apply-summaries.mjs` (no flag) to apply unflagged entries; review the consolidated `summary-rewrite-review.md` for flagged entries; run `apply-summaries.mjs --include-review` once approved.
5. **Standards update.** After the full rewrite is applied, update `catalog_builds/engine/TAXONOMY_STANDARDS.md` Part 4 to soften the strict "1 sentence" rule for the `text` field and document the new length caps. This is wording-only and per Workflow 6 does not require a `REVISION.md` version bump.

## Notes

- Bulk text edits do not change IDs or structure, so `renumber.js` is a no-op pass; `validate-catalog.js` only verifies field shape (≥20 chars on `text`, etc.). Per `REVISION.md` policy, text-only edits do not warrant a version bump.
- The mapping is keyed by `uid`, which is stable across renumbering. Catalog reorganization between authoring and apply does not break the mapping.
