## Table of Contents

- [v1.4 — May 8, 2026](#v14--may-8-2026)
- [v1.3 — May 1, 2026](#v13--may-1-2026)
- [v1.2 — April 30, 2026](#v12--april-30-2026)
- [Catalog Revision History](#catalog-revision-history)

# Catalog Revision History

Tracks all structural changes to `public/teachings.json` by version and date.

**Format:** Each version entry records the date, catalog stats at the time of writing, and all structural changes made since the previous version. Minor wording edits to `text` or `quote` fields do not require a version bump; structural changes (adds, deletes, moves, renames, splits, merges) do.

<!-- Add new versions above this line -->

## v1.4 — May 8, 2026

| Stat | Count |
|---|---|
| Categories | 31 |
| Subcategories | 117 |
| Teachings | 654 |
| Parables | 37 |

### Delete duplicate teaching: Pharisee and Publican parable

Removed teaching `15.3.3` (Luke 18:9–14) which was a duplicate of teaching `24.2.8` in the Religious Hypocrisy category.

**Reason:** Audit identified identical text and quote between the two teachings. Both referenced the same scripture (Luke 18:9–14, the Pharisee and Publican parable). Teaching `24.2.8` (Religious Hypocrisy > Outward Versus Inward Religion) is the correct location for this parable's thematic focus; `15.3.3` in Humility > Parables of Humility was redundant.

**Deleted teaching:**
- id: `15.3.3`
- uid: `0ff5fb6d-dcd3-4eea-8819-aeb7f45c6aef`
- text: "Jesus tells of a Pharisee who boasts to God of his fasts and tithes and a publican who beats his breast pleading mercy..."
- category: Humility and Servanthood
- subcategory: Parables of Humility

**Net delta:** Teachings: 655 → 654; Parables: 38 → 37.

---

## v1.3 — May 1, 2026

| Stat | Count |
|---|---|
| Categories | 31 |
| Subcategories | 117 |
| Teachings | 655 |
| Parables | 38 |

### Schema: Add field `uid`

Added a stable `uid` field (UUID v4 string) to every **category**, **subcategory**, and **teaching** object in `public/teachings.json`.

**Motivation:** The existing `id` and `slug` fields are positional — they are reassigned by `renumber.js` whenever objects are inserted, deleted, or moved. A stable, immutable identifier is needed for cross-referencing, deep-linking, and future export/sync use cases where positional IDs are unreliable.

**Implementation:**
- Migration script: `catalog_builds/validation/apply-schema-uid.cjs`
- All 31 categories, 117 subcategories, and 655 teachings received a `uid`
- `renumber.js` preserves `uid` (it only touches `id`, `slug`, and `_hidden`/`_isNew` markers)
- `validate-catalog.js` now warns when `uid` is missing or not a valid UUID v4
- `TAXONOMY_STANDARDS.md` updated: `uid` added to all three required-fields tables
- `loader.js` not modified — `uid` is a backend-only metadata field; the app continues to use positional `id` for all lookups

**Net delta:** 0 structural changes (no categories/subcategories added, removed, or moved). Schema-only change.

