# Catalog Taxonomy Standards

This document governs when new categories and subcategories are created in the teachings catalog. All structural changes must conform to these standards before being applied to `public/teachings.json`.

---

## Part 1 — Creating a New Subcategory

### Threshold Requirements (ALL must be satisfied)

1. **Volume:** There are 3 or more existing or proposed teachings that share a clearly distinct theological theme.
2. **Distinctiveness:** The shared theme is not already captured by any existing subcategory title or scope statement in `CLASSIFICATION_RULES.md`.
3. **Fit:** The teachings belong within the same parent category — they are not candidates for a different category.
4. **Independence:** The teachings form a coherent group on their own, not just a cluster within an existing subcategory that would be better handled by reordering.

If fewer than 3 teachings qualify, the teaching(s) should be placed in the most appropriate existing subcategory, not trigger a new one.

### Naming Standards

- Subcategory titles must be **noun phrases**, not sentences or questions
- Use title case
- Name the theological concept, not the passage (e.g., "Persistence in Prayer", not "The Widow and the Judge")
- Exception: well-known labeled discourse sections may use the common title (e.g., "The Lord's Prayer — Pattern for Prayer", "The Beatitudes")
- Maximum ~60 characters

### Ordering Within a Category

Subcategories within a category follow this priority sequence:
1. **Canonical arc first** where the category spans multiple books (Matthew → Mark → Luke → John → Acts → 1Cor → 2Cor → Rev). Subcategories anchored to a single book go in book order.
2. **Specific before general** — a subcategory about a specific event or pericope precedes a broad thematic grouping
3. **Doctrinal logic** — if the subcategory content builds on a prior one (e.g., promise → fulfillment), honor that progression

### Ordering Teachings Within a Subcategory

Teachings within a subcategory are sorted using only the **primary reference** (`isPrimary: true`) of each teaching, in this priority sequence:

1. **NT book order** — Matthew → Mark → Luke → John → Acts → 1Cor → 2Cor → Rev
2. **Chapter** — ascending
3. **First verse of the first range** — ascending (i.e., the first element of `ranges[0]`)

### Required Fields for a New Subcategory

| Field | Format | Example |
|---|---|---|
| `id` | `"{catId}.{index}"` — assigned by `renumber.js` | `"10.6"` |
| `slug` | `"cat-{catId}-{index}"` — assigned by `renumber.js` | `"cat-10-6"` |
| `title` | Title-case noun phrase | `"Intercession for Others"` |
| `teachings` | Array (may be empty before first teaching is added) | `[]` |

Do **not** manually assign `id` or `slug` — always run `renumber.js` after inserting.

---

## Part 2 — Creating a New Category

### Threshold Requirements (ALL must be satisfied)

1. **Subcategory mass:** There are 2 or more subcategories' worth of material that do not fit any existing category's scope statement.
2. **Theological independence:** The topic is a coherent, self-contained theological domain — not a sub-theme of an existing category.
3. **Red-letter source:** The material comes from recorded words of Jesus Christ within the defined scope (see below).
4. **Not a reorganization:** The new category is not simply splitting or renaming an existing category without genuine new scope.

### Source Scope (What Can Be Cataloged)

Only teachings drawn from these sources are eligible:
- The four Gospels (Matthew, Mark, Luke, John)
- Post-resurrection appearances (Matt 28, Luke 24, John 20–21, Acts 1)
- The High Priestly Prayer (John 17)
- Paul's direct quotations of Jesus (Acts 20:35; 1 Cor 11:23–25; 2 Cor 12:9)
- Damascus road appearance of Jesus to Saul (Acts 9:4–6; 22:7–10; 26:14–18)
- Visions/commissions to Ananias, Paul, and Peter in Acts (Acts 9:10–16; 10:13–15; 11:7–9; 18:9–10; 22:18–21; 23:11)
- Direct speech of Christ in Revelation (Rev 1:8; 1:11; 1:17–20; 2–3; 16:15; 21:5–8; 22:7–20)

Teachings from outside this scope must not be added.

### Category Ordering Principle

Categories follow the **theological arc** of Jesus's teaching:

```
Nature of God
  → Identity of Christ + the Spirit
    → The Kingdom (organizing center)
      → Entering (Repentance, Salvation, Faith)
        → Covenant (Old → New)
          → Spiritual disciplines (Prayer, Abiding, John 17)
            → Ethics and character (Love, Righteousness, Humility, Truth, Wisdom)
              → Social ethics (Forgiveness, Marriage, Wealth, Justice)
                → Discipleship arc (Calling, Suffering, Hypocrisy)
                  → The Church and Mission
                    → Passion and Resurrection events
                      → Future (Eschatology, Judgment)
                        → Revelation (Seven Churches)
```

A new category must be inserted at the logically appropriate point in this arc. It may not be appended to the end unless it clearly belongs in the Revelation/eschatological terminus.

### Naming Standards

- Category titles are **noun phrases**, title case
- They name the theological domain, not a specific event or passage
- Maximum ~50 characters

### Required Fields for a New Category

| Field | Format | Example |
|---|---|---|
| `id` | Integer — assigned by `renumber.js` | `32` |
| `slug` | `"cat-{id}"` — assigned by `renumber.js` | `"cat-32"` |
| `title` | Title-case noun phrase | `"Signs and Wonders"` |
| `sources` | Array of `bookAbbr` strings for the primary books | `["Matt", "Luke", "John"]` |
| `description` | `null`, or a prose introduction if the category needs context | `null` |
| `subcategories` | Array of subcategory objects | `[...]` |

Do **not** manually assign `id` or `slug` — always run `renumber.js` after inserting.

---

## Part 3 — Modifying Existing Structure

### Renaming a Category or Subcategory

- A rename is permitted if the current title is misleading, too broad, or too narrow for its actual contents
- The new name must conform to naming standards above
- Update the `title` field in `teachings.json` only — slugs and IDs are not affected by rename
- Document the rename and rationale in a note if significant

### Merging Subcategories

Merge is permitted when:
- Two existing subcategories have fewer than 3 teachings between them AND
- Their themes are genuinely the same theological concept

After merging, run `renumber.js` to resequence IDs.

### Splitting a Subcategory

Split is permitted when:
- An existing subcategory has grown to 8+ teachings AND
- A clear thematic divide is present (i.e., the threshold for a new subcategory is met within the existing one)

After splitting, run `renumber.js`.

### Relocating a Teaching

When moving a teaching from one subcategory to another:
1. Run `classify.js --ref "..."` first to confirm the target is more appropriate
2. Consult the tie-breaker rules in `CLASSIFICATION_RULES.md` for the affected categories
3. Move the teaching object in `teachings.json`
4. Run `renumber.js`
5. Run `validate-catalog.js` — must pass with zero errors

### Moving a Subcategory to a Different Category

When moving a whole subcategory:
1. Verify it meets the scope of the destination category per `CLASSIFICATION_RULES.md`
2. Move the subcategory object to the new category's `subcategories` array at the correct position
3. Run `renumber.js`
4. Run `validate-catalog.js`

### Resolving Duplicate Teachings

A **duplicate teaching** exists when two separate teaching objects reference the same scripture passage (same book, chapter, and overlapping or identical verse ranges) and convey the same theological point. This is distinct from intentional cross-listing, where the same passage legitimately serves two categories.

#### Identifying duplicates

A pair of teachings is a candidate duplicate when:
- They share the same `bookAbbr`, `chapter`, and overlapping `ranges` in any of their references, AND
- Their `text` summaries describe the same point (even if worded differently)

A pair is **not** a duplicate if:
- One teaching treats a passage's primary meaning and the other treats a secondary or complementary aspect
- The two teachings are in different subcategories because the passage genuinely serves both thematic scopes (e.g., a verse legitimately cross-listed per CLASSIFICATION_RULES.md tie-breaker logic)

#### Resolution rule

1. **Identify the keeper** — the teaching whose parent subcategory has the stronger scope fit for the passage per `CLASSIFICATION_RULES.md`. When uncertain, prefer the teaching with the more complete `text` summary or fuller verse range.
2. **Merge any unique references** — if the teaching being removed has secondary references (`isPrimary: false`) not present on the keeper, add them to the keeper's `references` array before deleting.
3. **Delete the duplicate** — remove the weaker teaching object from `teachings.json`.
4. Run `renumber.js`, then `validate-catalog.js`. Both must exit `0` before the change is complete.

#### Cross-listing vs. duplication

If a passage is genuinely appropriate in two categories (the classification rules explicitly permit this, or a tie-breaker resolves to cross-listing), the correct resolution is **not** to delete one — it is to ensure each teaching's `text` reflects the distinct angle of its subcategory. Two teachings are only duplicates if they are making the *same point* in *different locations*.

---

## Part 4 — Required Fields Checklist for a New Teaching

Before adding a new teaching to `teachings.json`, verify all fields are present and correct:

| Field | Required | Format | Notes |
|---|---|---|---|
| `id` | Yes — via `renumber.js` | `"{cat}.{sub}.{teaching}"` | Do not assign manually |
| `text` | Yes | String, ≥20 chars | Third-person present tense; 1 sentence editorial summary; no quotation marks |
| `quote` | Yes | String or `null` | Raw KJV text of Jesus's words. Use `null` only if words are paraphrased/indirect |
| `tags` | Yes | Array | `["parable"]` if applicable; otherwise `[]`. See `TAG_RULES.md` |
| `references` | Yes | Array, ≥1 item | At least one reference with `isPrimary: true` |

### Reference object fields

| Field | Required | Format | Notes |
|---|---|---|---|
| `label` | Yes | String | Human-readable: `"Matt 13:31–32"` |
| `book` | Yes | String | Full book name: `"Matthew"` |
| `bookAbbr` | Yes | String | Abbreviated, no spaces: `"Matt"`, `"1Cor"`, `"Rev"` |
| `chapter` | Yes | Integer | Chapter number |
| `ranges` | Yes | Array of `[start, end]` pairs | `[[31, 32]]` for single range; `[[1, 9], [18, 23]]` for discontinuous |
| `isPrimary` | Yes | Boolean | Exactly one reference per teaching must be `true` |

### Grouping Non-Consecutive Verses into a Single Teaching

The `ranges` field supports discontinuous verse spans (e.g., `[[1, 3], [6, 8]]`). Use this when non-adjacent verses belong to the same teaching unit. The following rules govern when to group rather than split:

#### Rule G-A: Interleaved Narrative

When a narrator's description interrupts Jesus's speech within a single pericope, group all red-letter verses into one teaching using a discontinuous range. The narrative interruption does not break the speech unit.

> *Example: Jesus speaks in vv. 1–3, the narrator describes a reaction in v. 4, Jesus resumes in vv. 5–6 → one teaching with `ranges: [[1, 3], [5, 6]]`.*

#### Rule G-B: Question-and-Answer Exchange

When a questioner's words interrupt Jesus's response within a continuous exchange, group the entire exchange into one teaching provided:
1. The exchange concerns a single theological question or situation, and
2. Jesus's answer is thematically unified (he does not pivot to a second topic mid-exchange)

If Jesus pivots to a clearly distinct subject mid-exchange, split at the pivot point.

> *Example: A disciple asks in v. 10, Jesus answers in vv. 11–13, the disciple asks a follow-up in v. 14, Jesus continues in vv. 15–17 — all one exchange on the same subject → one teaching with `ranges: [[11, 13], [15, 17]]`.*

#### Rule G-C: Parallel Repetitions Within the Same Chapter

When the same saying appears in two or more verses of the same chapter (e.g., a refrain repeated at the close of successive sub-sections), represent it as a **single teaching** whose primary reference covers the first occurrence. Add a secondary reference object (with `isPrimary: false`) pointing to the subsequent occurrence(s).

Do **not** use discontinuous ranges for this case — the repeated occurrences are not part of one speech unit; they are parallel restatements.

#### When to Split Instead

Split into separate teachings when:
- The verses address **different theological points**, even if they are adjacent or in the same passage
- An interleaved passage contains a **clear scene break** that resets the context (change of audience, location, or day)
- A Q&A exchange pivots to a **second distinct topic** before Jesus concludes the first

### `bookAbbr` canonical values

| Book | `bookAbbr` |
|---|---|
| Matthew | `Matt` |
| Mark | `Mark` |
| Luke | `Luke` |
| John | `John` |
| Acts | `Acts` |
| 1 Corinthians | `1Cor` |
| 2 Corinthians | `2Cor` |
| Revelation | `Rev` |

### Determining the primary reference

The `isPrimary: true` reference should be the **earliest canonical source** for the teaching. If a teaching appears in multiple synoptic Gospels, prefer Matthew as primary unless the fullest account is clearly in another Gospel. For John-only teachings, John is primary. For Revelation teachings, Revelation is primary.

---

## Part 5 — Validation Gate

**No change to `teachings.json` is complete until:**

1. `node catalog_builds/engine/scripts/renumber.js` exits with code `0`
2. `node catalog_builds/engine/scripts/validate-catalog.js` exits with code `0`

Any exit code `1` means the change is not complete. Do not commit or deploy until both pass.
