## Table of Contents

- [v1.6 — May 10, 2026](#v16--may-10-2026)
- [v1.5 — May 9, 2026](#v15--may-9-2026)
- [v1.4 — May 8, 2026](#v14--may-8-2026)
- [v1.3 — May 1, 2026](#v13--may-1-2026)
- [v1.2 — April 30, 2026](#v12--april-30-2026)
- [Catalog Revision History](#catalog-revision-history)

# Catalog Revision History

Tracks all structural changes to `public/teachings.json` by version and date.

**Format:** Each version entry records the date, catalog stats at the time of writing, and all structural changes made since the previous version. Minor wording edits to `text` or `quote` fields do not require a version bump; structural changes (adds, deletes, moves, renames, splits, merges) do.

<!-- Add new versions above this line -->

## v1.6 — May 10, 2026

| Stat | Count |
|---|---|
| Categories | 31 |
| Subcategories | 117 |
| Teachings | 647 |
| Parables | 35 |

### Merge: Temple Cleansing (4 teachings → 1 in 24.5)

Combined four separate temple cleansing teachings into a single unified teaching in **24.5 Hypocrisy in Leadership**.

**Reason:** The temple cleansing story was redundantly cataloged once per gospel account rather than as a single event with cross-references. All four accounts — Matt 21:13, Mark 11:17, Luke 19:46, and John 2:16 — describe the same prophetic act of cleansing the temple. One in Cat 2.5 (Predictions of His Suffering) was also misplaced.

**Merged into:** `24.5.3` — "Cleansing the Temple — My House Shall Be a House of Prayer"
- Primary reference: Matt 21:13; cross-references: Mark 11:17, Luke 19:46, John 2:16

**Deleted teachings (consolidated as cross-refs):**
- `24.5.8` (Mark 11:17) — "Jesus asks in the temple, is my house not the house of prayer for all nations?..."
- `24.5.12` (Luke 19:46) — "Jesus declares in the temple that it is written, My house is the house of prayer..."
- `2.5.10` (John 2:16) — "Jesus drives out the dove sellers, charging them to take these things away..."

**Net delta:** Cat 24.5: 14 → 12 teachings; Cat 2.5: 15 → 14 teachings; Teachings: 652 → 649

---

### Merge: Temple Destruction Prediction (3 teachings → 1 in 29.1)

Combined three parallel temple destruction predictions into a single unified teaching in **29.1 Signs of the End**.

**Reason:** Matt 24:2, Mark 13:2, and Luke 21:6 all record Jesus's "not one stone upon another" prediction as the opening of the Olivet Discourse. These were cataloged as three separate teachings rather than one with cross-references.

**Merged into:** `29.1.1` — "Not One Stone Left Upon Another"
- Primary reference: Matt 24:2; cross-references: Mark 13:2, Luke 21:6

**Deleted teachings (consolidated as cross-refs):**
- `29.1.8` (Mark 13:2) — "Jesus foretells the destruction of the temple, declaring that not one stone will be left upon another..."
- `29.1.10` (Luke 21:6) — "Jesus foretells that the days will come when not one stone of the temple will be left upon another."

**Net delta:** Cat 29.1: 10 → 8 teachings; Teachings: 649 → 647

---

### Move subcategory: The Rich Man and Lazarus (20.4 → 30.4)

Moved subcategory **"The Rich Man and Lazarus"** from **Cat 20 Wealth and Generosity** to **Cat 30 Judgment and Hell** (now 30.4).

**Reason:** The parable's primary theological thrust is the irreversible divide between the condemned and the blessed after death, and the impossibility of post-mortem repentance. Placement in Cat 20 prioritized the wealth-vs.-poverty surface reading over the parable's eschatological and judicial core. Cat 30 is the correct doctrinal home.

**Subcategory contents moved (2 teachings):**
- `30.4.1` (formerly 20.4.1) — "Jesus tells of a rich man clothed in purple who fared sumptuously..."
- `30.4.2` (formerly 20.4.2) — second teaching in the Rich Man and Lazarus subcategory

**Net delta:** Cat 20: 4 → 3 subcategories; Cat 30: 3 → 4 subcategories; total subcategories unchanged (move, not add/remove)

---

## v1.5 — May 9, 2026

| Stat | Count |
|---|---|
| Categories | 31 |
| Subcategories | 117 |
| Teachings | 652 |
| Parables | 35 |

### Delete duplicate teaching: The Good Samaritan (21.3.5)

Removed teaching `21.3.5` (Luke 10:30–37) which was a duplicate of teaching `13.1.2` in Compassion and Mercy.

**Reason:** Both teachings referenced the same scripture (Luke 10:30–37, the Good Samaritan parable) with equivalent text and quote. Teaching `13.1.2` (Compassion and Mercy > The Good Samaritan) is the authoritative location; `21.3.5` in Healing and Miracles > Healings Paired with Discipleship was a misplaced duplicate.

**Deleted teaching:**
- id: `21.3.5`
- uid: `5a626e47-88ea-4655-8c60-4a37ae982c82`
- text: "Jesus tells of a man going from Jerusalem to Jericho who falls among thieves..."
- category: Healing and Miracles
- subcategory: Healings Paired with Discipleship

### Delete duplicate teaching: The Ten Virgins (29.3.3)

Removed teaching `29.3.3` (Matt 25:1–13) which was a duplicate of teaching `4.1.9` in Parables of the Kingdom.

**Reason:** Both teachings referenced the same scripture (Matt 25:1–13, the Ten Virgins parable) with equivalent text and quote. Teaching `4.1.9` (Parables of the Kingdom > Kingdom Parables) is the authoritative location; `29.3.3` in Eschatology > Parables of Watchfulness was a duplicate.

**Deleted teaching:**
- id: `29.3.3`
- uid: `9a78bc8d-8460-42b5-9326-ff0640c2f673`
- text: "Jesus likens the kingdom to ten virgins who took lamps to meet the bridegroom..."
- category: Eschatology and Final Things
- subcategory: Parables of Watchfulness

**Net delta:** Teachings: 654 → 652; Parables: 37 → 35.

---

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

