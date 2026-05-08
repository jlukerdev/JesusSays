# Summary Rewrite

Tooling for the bulk rewrite of every teaching's `text` summary in `public/teachings.json`.

## Goal

Update each teaching's `text` so it is:

- **Complete sentence(s).** Most are 1 sentence; complex passages may use 2–3.
- **Descriptive of the actual referenced scriptures** — not a paraphrase the text has drifted away from.
- **Doctrinally neutral** — summarize the words spoken; do not interpret.

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

1. **Pilot (current).** ~20 representative teachings spanning categories, parables, and long passages. Review voice and style; iterate.
2. **Full pass.** After pilot is approved, generate entries for the remaining ~635 teachings using the same schema and the same scripts.
3. **Standards update.** After the full rewrite is applied, update `catalog_builds/engine/TAXONOMY_STANDARDS.md` Part 4 to soften the strict "1 sentence" rule for the `text` field — this is wording-only and per Workflow 6 does not require a `REVISION.md` version bump.

## Notes

- Bulk text edits do not change IDs or structure, so `renumber.js` is a no-op pass; `validate-catalog.js` only verifies field shape (≥20 chars on `text`, etc.). Per `REVISION.md` policy, text-only edits do not warrant a version bump.
- The mapping is keyed by `uid`, which is stable across renumbering. Catalog reorganization between authoring and apply does not break the mapping.
