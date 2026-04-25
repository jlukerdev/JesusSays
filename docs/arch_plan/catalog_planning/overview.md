# Christ's Teachings — Project Notes

---

## Catalog Overview

**Source:** `teachings.json`
**Total categories:** 30
**Total subcategories:** 118
**Total teachings:** 361
**Total scripture references:** ~700
**Parables tagged:** 35

---

## Scope

All recorded spoken words of Jesus Christ as found in:
- The four Gospels (Matthew, Mark, Luke, John) — including parables, discourses, and dialogue
- The Seven Words from the Cross (Matthew 27, Mark 15, Luke 23, John 19)
- Post-resurrection appearances (Matthew 28, Luke 24, John 20–21, Acts 1)
- The High Priestly Prayer (John 17)
- Paul's direct quotation of Jesus (Acts 20:35)
- The institution of the Lord's Supper as quoted by Paul (1 Corinthians 11:23–25)
- Jesus to Paul re: thorn in flesh (2 Corinthians 12:9)
- The Damascus road encounter (Acts 9:4–6, 22:7–10, 26:14–18)
- Visions of Jesus to Ananias (Acts 9:10–16) and Paul (Acts 18:9–10, 22:18–21, 23:11)
- Vision to Peter on clean and unclean (Acts 10:13–15, 11:7–9)
- The letters to the seven churches and other direct speech in Revelation (Revelation 1–3, 1:8, 1:11, 1:19–20, 16:15, 21:5–8, 22)

Where a teaching appears in multiple Gospels, it is recorded once with parallel cross-references. Teachings are described in concise, third-person present tense without editorial interpretation.


---

## Category Order

| # | Title | Notes |
|---|---|---|
| 1 | God the Father | |
| 2 | The Identity of Jesus Christ | *Includes subcategory: Words from the Cross* |
| 3 | The Holy Spirit | |
| 4 | The Kingdom of God | Organizing center of Jesus's teaching |
| 5 | Repentance and Conversion | |
| 6 | Salvation and Eternal Life | |
| 7 | Faith and Trust | |
| 8 | The Old Covenant | |
| 9 | The New Covenant | Includes Lord's Supper and Bread of Life |
| 10 | Prayer and Communion | |
| 11 | Abiding in Christ | John 15 — Vine and Branches |
| 12 | The High Priestly Prayer | John 17 — recorded spoken prayer |
| 13 | Love | |
| 14 | Righteousness and Ethics | Sermon on the Mount / Plain |
| 15 | Humility and Servanthood | |
| 16 | Truth and Integrity | |
| 17 | Wisdom and Discernment | |
| 18 | Forgiveness and Reconciliation | |
| 19 | Marriage and Family | |
| 20 | Wealth and Generosity | |
| 21 | Justice and Mercy | |
| 22 | Discipleship | |
| 23 | Suffering and Persecution | |
| 24 | Religious Hypocrisy | |
| 25 | The Church | |
| 26 | Mission and Witness | *Includes visions to Paul and Ananias in Acts* |
| 27 | Post-Resurrection Appearances | Bridge between ministry and eschatology; includes Damascus road |
| 28 | Eschatology and the End Times | Olivet Discourse primary source |
| 29 | Judgment and Hell | |
| 30 | The Seven Churches | Revelation 2–3; *includes Rev 1:11, 1:19–20* |

---

## JSON Schema

```json
{
  "meta": {
    "title": "string",
    "subtitle": "string",
    "totalCategories": 30,
    "sources": ["string"],
    "scope": ["string"]
  },
  "categories": [
    {
      "id": 1,
      "slug": "cat-1",
      "title": "string",
      "sources": ["string"],
      "description": "string | null",
      "subcategories": [
        {
          "id": "1.1",
          "slug": "cat-1-1",
          "title": "string",
          "teachings": [
            {
              "id": "1.1.1",
              "text": "string",
              "tags": ["parable"],
              "references": [
                {
                  "label": "Matt 13:31–32",
                  "book": "Matthew",
                  "bookAbbr": "Matt",
                  "chapter": 13,
                  "ranges": [[31, 32]],
                  "isPrimary": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Schema Notes
- `tags` — open-ended array; `"parable"` is the only value currently used
- `ranges` — array of `[verseStart, verseEnd]` pairs; single verse = `[[35, 35]]`; discontinuous ranges in same chapter = `[[1, 9], [18, 23]]`
- `isPrimary` — first reference per teaching is always `true`; cross-references are `false`
- `description` — present on categories with a prose introduction; `null` otherwise
- `blbUrl` — not stored; build dynamically from `bookAbbr`, `chapter`, and first verse of first range

### BLB URL Pattern (for UI use)
```
https://www.blueletterbible.org/nkjv/{bookSlug}/{chapter}/{verse}/
```

| Abbr | BLB Slug |
|---|---|
| Matt | mat |
| Mark | mar |
| Luke | luk |
| John | jhn |
| Acts | act |
| 1 Cor | 1co |
| 2 Cor | 2co |
| Rev | rev |

---

## HTML Conversion Notes

- Category section IDs: `cat-{N}` (e.g. `cat-1` through `cat-30`)
- Subcategory block IDs: `cat-{N}-{M}` (e.g. `cat-1-1`, `cat-4-3`)
- Slugs in JSON match these ID patterns exactly
- Parable badge: `<span class="parable-badge">Parable</span>` — triggered by `tags` array containing `"parable"`
- Table structure: 2 columns only — Teaching (58%) | Scriptures (42%)
- Primary reference renders bold (`.primary-ref`); cross-references follow on same line separated by `<span class="sep">·</span>`
- Category sections separated by `<hr class="section-rule">`
- See `HTML-STANDARDS.md` for full styling, layout, tooltip JS, sidebar scroll-spy, and tag taxonomy