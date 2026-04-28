# catalog/output

Generated JSON files — one per NT book — produced by `catalog/scripts/parse-usfm-nt.js` (which calls `parse-usfm.js` per file).

## Naming convention

```
##_ABBR.json
```

- `##` — numeric prefix from the source USFM filename (70–96), preserving NT canonical order
- `ABBR` — book abbreviation as declared in the USFM `\id` tag (e.g. MAT, MRK, JHN, REV)

**Example:** `70_MAT.json`, `73_JHN.json`, `96_REV.json`

## Schema

```json
{
  "book": "Matthew",
  "bookAbbr": "MAT",
  "verses": [
    {
      "book": "Matthew",
      "bookAbbr": "MAT",
      "chapter": 1,
      "verse": 1,
      "text": "The book of the generation of Jesus Christ..."
    },
    {
      "book": "Matthew",
      "bookAbbr": "MAT",
      "chapter": 3,
      "verse": 15,
      "text": "And Jesus answering said unto him, Suffer it to be so now...",
      "jesusIsSpeaking": true,
      "jesusText": [
        "Suffer it to be so now: for thus it becometh us to fulfil all righteousness."
      ]
    }
  ]
}
```

### Fields

| Field | Type | Present on |
|---|---|---|
| `book` | string | all verses |
| `bookAbbr` | string | all verses |
| `chapter` | number | all verses |
| `verse` | number | all verses |
| `text` | string | all verses — full verse, USFM markup stripped |
| `jesusIsSpeaking` | boolean (`true`) | only verses containing `\wj` markers |
| `jesusText` | string[] | only verses containing `\wj` markers |

`jesusIsSpeaking` and `jesusText` are **omitted entirely** on verses with no Words of Christ — never `false` or `null`.

`jesusText` is always an **array**. Most verses have one element. Verses where a narrator interrupts mid-speech produce multiple elements (e.g. MAT 9:6, MAT 21:31).

## Source

- Input USFM: `catalog/bibles/eng-kjv2006_usfm/` (KJV 2006, files 70–96)
- Parser scripts: `catalog/scripts/parse-usfm.js`, `catalog/scripts/parse-usfm-nt.js`
- Translation: King James Version (KJV) — `\add` translator-supplied words are included in plain text

## Stats (as of last generation)

| Books | Total verses | Words of Christ verses |
|---|---|---|
| 27 | 7,957 | 2,028 |

Red-letter content is concentrated in the four Gospels (MAT, MRK, LUK, JHN), with smaller counts in Acts (27), 1–2 Corinthians (3), and Revelation (62).
