# teachings-update-plan.md

## 1. Summary of Changes

- **Teaching count:** 335 → 361 (26 new entries)
- **Reference count:** ~642 → ~700 (approximately 58 new reference objects across 25 teachings)
- **Parable count:** 33 → 35 (items 2 and 3: Barren Fig Tree, New Wine in Old Wineskins)
- **Subcategory count:** 117 → 118 (one new subcategory: "Words from the Cross")
- **New subcategory:** "Words from the Cross" added under Category 2 (The Identity of Jesus Christ)
- **`meta.sources`:** Add `"2 Corinthians"`
- **`meta.scope`:** Add descriptions covering Damascus road appearances, Paul visions in Acts 9/18/22/23/26, vision to Ananias, 2 Cor 12:9, Rev 1:8, Rev 1:11, Rev 1:19–20, Rev 16:15, Rev 21:5–8, and Acts 10–11 (Peter vision)
- **`meta.totalCategories`:** Remains 30 (no new categories added)

---

## 2. Decisions Required

Each item below states the decision and a one-line rationale. The developer does not need to research further.

| # | Item | Decision | Rationale |
|---|------|----------|-----------|
| 1 | Render to Caesar placement | **Category 21 (Justice and Mercy)** | The teaching is fundamentally about civic obligation and God's claim, making it a justice/ethics boundary question rather than a general ethics topic. |
| 2 | Barren fig tree placement | **Category 5 (Repentance and Conversion)** | The parable is explicitly about bearing fruit or facing judgment — a call to repentance before it is too late. |
| 3 | New wine in old wineskins placement | **Category 9 (The New Covenant)** | Jesus uses the image to contrast the incompatibility of the old and new orders; it belongs with covenant transition teaching. |
| 4 | Eunuchs for the kingdom placement | **Category 19 (Marriage and Family)** | The statement arises directly from the divorce/marriage discussion and addresses the marriage vocation. |
| 5 | Unclean spirit returns placement | **Category 17 (Wisdom and Discernment)** | The warning is about the danger of moral vacancy and the need for active spiritual vigilance, not a primary repentance call. |
| 6 | "I am he" at arrest placement | **Category 2 (The Identity of Jesus Christ)** | The statement is a direct self-identification with the divine name (ego eimi), the clearest Christological declaration at the arrest. |
| 7 | Martha and Mary placement | **Category 22 (Discipleship)** | Jesus's rebuke of Martha and praise of Mary defines the priority of sitting at his feet as the essential posture of discipleship. |
| 8 | Damascus road placement | **Category 27 (Post-Resurrection Appearances)** | The appearances to Paul on the Damascus road are post-resurrection Christophanies; Paul explicitly counts them as resurrection appearances (1 Cor 15:8). |
| 9 | Vision to Ananias placement | **Category 26 (Mission and Witness)** | The vision is a direct commissioning speech — Jesus defines Paul's missionary scope to Ananias. |
| 10 | Vision to Paul in Corinth placement | **Category 26 (Mission and Witness)** | The vision is an explicit stay-and-speak command, functioning as a localized mission directive. |
| 11 | Vision to Paul in Temple placement | **Category 26 (Mission and Witness)** | Jesus redirects Paul's witness from Jerusalem to the Gentiles — a mission-scope statement. |
| 12 | Vision to Paul in prison placement | **Category 26 (Mission and Witness)** | Jesus's word of encouragement in custody is tied to Paul's ongoing witness, contextually a mission confirmation. |
| 13 | "My grace is sufficient" placement | **Category 23 (Suffering and Persecution)** | The saying addresses Paul's thorn in the flesh and reframes suffering as the arena of divine strength — squarely a suffering theology statement. |
| 14 | Voice to Peter (clean/unclean) | **Category 26 (Mission and Witness)** | The voice drives the Cornelius mission and the extension of the gospel to Gentiles; it functions as a mission directive and is included as a confirmed word of Christ. |
| 15 | Alpha/Omega declaration (Rev 1:8) | **Category 2 (The Identity of Jesus Christ)** | The Christological reading of Rev 1:8 identifies the speaker with Jesus as the coming one; the declaration belongs with Christ's divine identity statements and is included as a word of Christ. |
| 16 | Commission to write (Rev 1:11) | **Category 30 (The Seven Churches)** | The command "Write what you see in a book" is the structural frame for the seven-church letters; it belongs in the Seven Churches category. |
| 17 | Explanation of vision (Rev 1:19–20) | **Category 30 (The Seven Churches)** | Jesus interprets the lampstands and stars as the seven churches — direct scene-setting for the Seven Churches section. |
| 18 | "I am coming like a thief" (Rev 16:15) | **Category 28 (Eschatology and the End Times)** | The saying is an eschatological warning inserted into the bowl judgments narrative; it is the clearest end-times warning type. |
| 19 | "Behold, I am making all things new" (Rev 21:5–8) | **Category 28 (Eschatology and the End Times)** | The declaration describes the final eschatological renewal and belongs with end-times consummation teaching rather than Christological identity. |
| 20 | Words from the Cross — parent category | **Category 2 (The Identity of Jesus Christ)** | See Section 3 for full rationale. |
| 21–26 | Individual Words from the Cross placement | **New subcategory: Words from the Cross (Category 2)** | See Section 3. |

---

## 3. New Subcategory Spec

### Parent Category: 2 — The Identity of Jesus Christ

**Rationale:** The seven words from the cross are the most concentrated cluster of Christological self-disclosure in the gospels. Each word — whether addressing the Father, a disciple, a thief, or expressing physical anguish — reveals who Jesus is at the moment of his atoning death. Placing them under Category 2 keeps them together as a coherent set and fulfills the note in the first-pass overview that explicitly flagged this subcategory as needed. Category 23 (Suffering and Persecution) would scatter the cross sayings from their primary Christological context.

**Existing subcategory count in Category 2:** Inspect `teachings.json` to find the last subcategory ID under category 2. The new subcategory takes the next integer. For planning purposes this document uses placeholder **`2.N`** where N = (current highest subcategory number in category 2) + 1. The developer must substitute the actual number after inspecting the file.

**Subcategory definition:**

```json
{
  "id": "2.N",
  "slug": "cat-2-N",
  "title": "Words from the Cross",
  "teachings": []
}
```

Teachings within this subcategory are numbered `2.N.1` through `2.N.6` in canonical gospel order:

| # | Teaching | Teaching ID |
|---|----------|-------------|
| 1 | "Father, forgive them" | **Already exists as `18.2.4` — do not duplicate** |
| 2 | "Today you will be with me in paradise" | `2.N.1` |
| 3 | "Woman, behold your son / Behold your mother" | `2.N.2` |
| 4 | "My God, my God, why have you forsaken me?" | `2.N.3` |
| 5 | "I thirst" | `2.N.4` |
| 6 | "It is finished" | `2.N.5` |
| 7 | "Father, into your hands I commit my spirit" | `2.N.6` |

**Note on "Father, forgive them" (teaching `18.2.4`):** This teaching already exists under Category 18 (Forgiveness and Reconciliation). The canonical location stays at `18.2.4`. The new subcategory starts with paradise (`2.N.1`) and contains 6 new teachings, not 7.

---

## 4. Teaching Entries to Add

Instructions for the developer:
- Replace `"2.N"` with the actual subcategory ID determined in Section 3.
- Replace any `"X.Y.Z"` placeholder ID with the correct next sequential number for that subcategory (count existing teachings in that subcategory, then increment).
- The `text` field uses third-person present-tense catalog style throughout.
- The first `reference` object in each array has `"isPrimary": true`; all others have `"isPrimary": false`.
- `ranges` format: `[[verseStart, verseEnd]]`; single verse: `[[v, v]]`.

---

### Teaching 1 — Render to Caesar
**Placement:** Category 21 (Justice and Mercy), existing subcategory for civil/social ethics (inspect file to find correct subcategory and assign next teaching number).

```json
{
  "id": "21.X.Y",
  "text": "Jesus silences his opponents by declaring that Caesar's image on a coin means Caesar's things belong to Caesar, while God's things belong to God, establishing distinct but complementary obligations to earthly authority and to God.",
  "tags": [],
  "references": [
    {
      "label": "Matt 22:15-22",
      "book": "Matthew",
      "bookAbbr": "Matt",
      "chapter": 22,
      "ranges": [[15, 22]],
      "isPrimary": true
    },
    {
      "label": "Mark 12:13-17",
      "book": "Mark",
      "bookAbbr": "Mark",
      "chapter": 12,
      "ranges": [[13, 17]],
      "isPrimary": false
    },
    {
      "label": "Luke 20:20-26",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 20,
      "ranges": [[20, 26]],
      "isPrimary": false
    }
  ]
}
```

---

### Teaching 2 — Barren Fig Tree Parable
**Placement:** Category 5 (Repentance and Conversion), existing subcategory for parables of urgency (inspect file).

```json
{
  "id": "5.X.Y",
  "text": "Jesus tells a parable of a fig tree that bears no fruit for three years: the owner wants to cut it down, but the gardener pleads for one more year to fertilize it, warning that if it still bears no fruit it will be cut down — urging immediate repentance before judgment falls.",
  "tags": ["parable"],
  "references": [
    {
      "label": "Luke 13:6-9",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 13,
      "ranges": [[6, 9]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 3 — New Wine in Old Wineskins
**Placement:** Category 9 (The New Covenant), existing subcategory for new vs. old order contrasts (inspect file).

```json
{
  "id": "9.X.Y",
  "text": "Jesus teaches that new wine must be poured into new wineskins, for pouring it into old wineskins bursts them and loses both wine and skins — illustrating that the new covenant cannot be contained within the structures of the old.",
  "tags": ["parable"],
  "references": [
    {
      "label": "Matt 9:17",
      "book": "Matthew",
      "bookAbbr": "Matt",
      "chapter": 9,
      "ranges": [[17, 17]],
      "isPrimary": true
    },
    {
      "label": "Mark 2:22",
      "book": "Mark",
      "bookAbbr": "Mark",
      "chapter": 2,
      "ranges": [[22, 22]],
      "isPrimary": false
    },
    {
      "label": "Luke 5:37-39",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 5,
      "ranges": [[37, 39]],
      "isPrimary": false
    }
  ]
}
```

---

### Teaching 4 — Eunuchs for the Kingdom
**Placement:** Category 19 (Marriage and Family), existing subcategory (inspect file for correct subcategory and next number).

```json
{
  "id": "19.X.Y",
  "text": "Jesus teaches that some people are incapable of marriage by birth, some by human action, and some have renounced marriage for the sake of the kingdom of heaven, and he calls those who are able to receive this word to do so.",
  "tags": [],
  "references": [
    {
      "label": "Matt 19:10-12",
      "book": "Matthew",
      "bookAbbr": "Matt",
      "chapter": 19,
      "ranges": [[10, 12]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 5 — Unclean Spirit Returns
**Placement:** Category 17 (Wisdom and Discernment), existing subcategory (inspect file).

```json
{
  "id": "17.X.Y",
  "text": "Jesus warns that when an unclean spirit leaves a person it wanders seeking rest, finds none, and returns to find the house swept and put in order; it then brings seven spirits more evil than itself, leaving that person's final state worse than the first.",
  "tags": [],
  "references": [
    {
      "label": "Matt 12:43-45",
      "book": "Matthew",
      "bookAbbr": "Matt",
      "chapter": 12,
      "ranges": [[43, 45]],
      "isPrimary": true
    },
    {
      "label": "Luke 11:24-26",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 11,
      "ranges": [[24, 26]],
      "isPrimary": false
    }
  ]
}
```

---

### Teaching 6 — "I Am He" at the Arrest
**Placement:** Category 2 (The Identity of Jesus Christ), existing subcategory for divine self-identification (inspect file).

```json
{
  "id": "2.X.Y",
  "text": "At his arrest in the garden, Jesus steps forward and twice declares 'I am he' in response to those seeking Jesus of Nazareth, and the power of the utterance causes the arresting party to draw back and fall to the ground.",
  "tags": [],
  "references": [
    {
      "label": "John 18:5-8",
      "book": "John",
      "bookAbbr": "John",
      "chapter": 18,
      "ranges": [[5, 8]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 7 — Martha and Mary
**Placement:** Category 22 (Discipleship), existing subcategory (inspect file).

```json
{
  "id": "22.X.Y",
  "text": "Jesus gently rebukes the distracted Martha and declares that her sister Mary has chosen the one thing necessary — sitting at his feet and listening to his word — and that it will not be taken from her.",
  "tags": [],
  "references": [
    {
      "label": "Luke 10:38-42",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 10,
      "ranges": [[38, 42]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 8 — Damascus Road Appearance
**Placement:** Category 27 (Post-Resurrection Appearances), existing subcategory or next available (inspect file).

```json
{
  "id": "27.X.Y",
  "text": "The risen Jesus appears to Saul on the Damascus road, identifies himself as Jesus whom Saul is persecuting, commissions him to rise and enter the city, and later in Paul's own account extends the commission to bear his name before Gentiles, kings, and the people of Israel.",
  "tags": [],
  "references": [
    {
      "label": "Acts 9:4-6",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 9,
      "ranges": [[4, 6]],
      "isPrimary": true
    },
    {
      "label": "Acts 22:7-10",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 22,
      "ranges": [[7, 10]],
      "isPrimary": false
    },
    {
      "label": "Acts 26:14-18",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 26,
      "ranges": [[14, 18]],
      "isPrimary": false
    }
  ]
}
```

---

### Teaching 9 — Vision to Ananias About Paul
**Placement:** Category 26 (Mission and Witness), existing subcategory (inspect file).

```json
{
  "id": "26.X.Y",
  "text": "In a vision Jesus instructs Ananias to go to Saul of Tarsus, assuring him that Saul is praying and has seen a vision of Ananias coming to restore his sight, and reveals that Saul is a chosen instrument to carry his name before Gentiles, kings, and the people of Israel.",
  "tags": [],
  "references": [
    {
      "label": "Acts 9:10-16",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 9,
      "ranges": [[10, 16]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 10 — Vision to Paul in Corinth
**Placement:** Category 26 (Mission and Witness), same subcategory as Teaching 9 or next teaching number.

```json
{
  "id": "26.X.Y",
  "text": "Jesus appears to Paul in a night vision in Corinth, commanding him not to be afraid but to speak and not be silent, promising that no one will attack him to harm him because many people in the city belong to him.",
  "tags": [],
  "references": [
    {
      "label": "Acts 18:9-10",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 18,
      "ranges": [[9, 10]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 11 — Vision to Paul in the Temple
**Placement:** Category 26 (Mission and Witness), same subcategory, next teaching number.

```json
{
  "id": "26.X.Y",
  "text": "While Paul is praying in the Temple in a trance, Jesus urges him to leave Jerusalem quickly because the people there will not accept his testimony, and redirects his witness to the Gentiles far away.",
  "tags": [],
  "references": [
    {
      "label": "Acts 22:18-21",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 22,
      "ranges": [[18, 21]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 12 — Vision to Paul in Prison
**Placement:** Category 26 (Mission and Witness), same subcategory, next teaching number.

```json
{
  "id": "26.X.Y",
  "text": "The Lord stands by Paul in his Jerusalem custody and encourages him, confirming that just as he has testified about him in Jerusalem he must also testify in Rome.",
  "tags": [],
  "references": [
    {
      "label": "Acts 23:11",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 23,
      "ranges": [[11, 11]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 13 — "My Grace Is Sufficient"
**Placement:** Category 23 (Suffering and Persecution), existing subcategory (inspect file).

```json
{
  "id": "23.X.Y",
  "text": "Jesus tells Paul that his grace is sufficient for him and that his power is made perfect in weakness, reframing Paul's thorn in the flesh as the very condition in which divine strength is most fully displayed.",
  "tags": [],
  "references": [
    {
      "label": "2 Cor 12:9",
      "book": "2 Corinthians",
      "bookAbbr": "2 Cor",
      "chapter": 12,
      "ranges": [[9, 9]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 14 — Voice to Peter (Clean/Unclean)
**Placement:** Category 26 (Mission and Witness), same subcategory as the other Pauline mission visions, next teaching number.

```json
{
  "id": "26.X.Y",
  "text": "A heavenly voice commands Peter to rise, kill, and eat from a sheet of unclean animals, and when Peter protests it is profane, the voice declares that what God has made clean he must not call common — an event Peter later interprets as God's directive to receive Gentiles into the gospel.",
  "tags": [],
  "references": [
    {
      "label": "Acts 10:13-15",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 10,
      "ranges": [[13, 15]],
      "isPrimary": true
    },
    {
      "label": "Acts 11:7-9",
      "book": "Acts",
      "bookAbbr": "Acts",
      "chapter": 11,
      "ranges": [[7, 9]],
      "isPrimary": false
    }
  ]
}
```

---

### Teaching 15 — Commission to Write (Rev 1:11)
**Placement:** Category 30 (The Seven Churches), existing subcategory or introductory subcategory (inspect file for where Rev 1 material is currently placed).

```json
{
  "id": "30.X.Y",
  "text": "The risen Jesus commands John to write in a book what he sees and send it to the seven churches: Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, and Laodicea.",
  "tags": [],
  "references": [
    {
      "label": "Rev 1:11",
      "book": "Revelation",
      "bookAbbr": "Rev",
      "chapter": 1,
      "ranges": [[11, 11]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 16 — Explanation of the Vision (Rev 1:19–20)
**Placement:** Category 30 (The Seven Churches), same subcategory as Teaching 15, next teaching number.

```json
{
  "id": "30.X.Y",
  "text": "Jesus instructs John to write what he has seen, what is, and what is to take place after these things, and explains that the seven stars in his right hand are the angels of the seven churches and the seven golden lampstands are the seven churches themselves.",
  "tags": [],
  "references": [
    {
      "label": "Rev 1:19-20",
      "book": "Revelation",
      "bookAbbr": "Rev",
      "chapter": 1,
      "ranges": [[19, 20]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 17 — "I Am Coming Like a Thief" (Rev 16:15)
**Placement:** Category 28 (Eschatology and the End Times), existing subcategory for parousia warnings (inspect file).

```json
{
  "id": "28.X.Y",
  "text": "Jesus interjects into the bowl-judgment narrative with a warning that he is coming like a thief and pronounces a blessing on those who stay awake and keep their garments so they will not be found naked and exposed to shame.",
  "tags": [],
  "references": [
    {
      "label": "Rev 16:15",
      "book": "Revelation",
      "bookAbbr": "Rev",
      "chapter": 16,
      "ranges": [[15, 15]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 18 — "Behold, I Am Making All Things New" (Rev 21:5–8)
**Placement:** Category 28 (Eschatology and the End Times), existing subcategory for eschatological consummation (inspect file).

```json
{
  "id": "28.X.Y",
  "text": "From the throne the one who sits on it declares that he is making all things new, commands John to write that these words are trustworthy and true, announces that it is done and that he is the Alpha and the Omega, promises free water of life to the thirsty and an inheritance to the conqueror, and warns that the cowardly and unbelieving will face the lake that burns with fire and sulfur.",
  "tags": [],
  "references": [
    {
      "label": "Rev 21:5-8",
      "book": "Revelation",
      "bookAbbr": "Rev",
      "chapter": 21,
      "ranges": [[5, 8]],
      "isPrimary": true
    }
  ]
}
```

---

### Words from the Cross — Teachings 19–24

These six entries go into the new subcategory `"2.N"` (see Section 3). IDs are `2.N.1` through `2.N.6`. The developer assigns the actual value of N after inspecting the file.

---

#### Teaching 19 — "Today You Will Be with Me in Paradise"

```json
{
  "id": "2.N.1",
  "text": "Jesus assures the repentant criminal crucified beside him that on that very day he will be with him in paradise, offering immediate salvation to one who turns to him in his final moments.",
  "tags": [],
  "references": [
    {
      "label": "Luke 23:43",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 23,
      "ranges": [[43, 43]],
      "isPrimary": true
    }
  ]
}
```

---

#### Teaching 20 — "Woman, Behold Your Son / Behold Your Mother"

```json
{
  "id": "2.N.2",
  "text": "From the cross Jesus entrusts his mother to the care of the beloved disciple, saying to her 'Woman, behold your son' and to the disciple 'Behold your mother,' establishing a new family bond at the moment of his death.",
  "tags": [],
  "references": [
    {
      "label": "John 19:26-27",
      "book": "John",
      "bookAbbr": "John",
      "chapter": 19,
      "ranges": [[26, 27]],
      "isPrimary": true
    }
  ]
}
```

---

#### Teaching 21 — "My God, My God, Why Have You Forsaken Me?"

```json
{
  "id": "2.N.3",
  "text": "At the ninth hour Jesus cries out with a loud voice the opening words of Psalm 22 — 'My God, my God, why have you forsaken me?' — giving voice to the full weight of divine abandonment he bears as the sin-bearer on the cross.",
  "tags": [],
  "references": [
    {
      "label": "Matt 27:46",
      "book": "Matthew",
      "bookAbbr": "Matt",
      "chapter": 27,
      "ranges": [[46, 46]],
      "isPrimary": true
    },
    {
      "label": "Mark 15:34",
      "book": "Mark",
      "bookAbbr": "Mark",
      "chapter": 15,
      "ranges": [[34, 34]],
      "isPrimary": false
    }
  ]
}
```

---

#### Teaching 22 — "I Thirst"

```json
{
  "id": "2.N.4",
  "text": "Jesus declares 'I thirst' from the cross, fulfilling Scripture and expressing the full physical humanity of the Son of God in his atoning suffering.",
  "tags": [],
  "references": [
    {
      "label": "John 19:28",
      "book": "John",
      "bookAbbr": "John",
      "chapter": 19,
      "ranges": [[28, 28]],
      "isPrimary": true
    }
  ]
}
```

---

#### Teaching 23 — "It Is Finished"

```json
{
  "id": "2.N.5",
  "text": "Jesus cries out 'It is finished' (tetelestai) as his final public word before death, declaring the complete accomplishment of his atoning work and the full discharge of every obligation his mission required.",
  "tags": [],
  "references": [
    {
      "label": "John 19:30",
      "book": "John",
      "bookAbbr": "John",
      "chapter": 19,
      "ranges": [[30, 30]],
      "isPrimary": true
    }
  ]
}
```

---

#### Teaching 24 — "Father, Into Your Hands I Commit My Spirit"

```json
{
  "id": "2.N.6",
  "text": "With a loud voice Jesus entrusts his spirit to the Father in the words of Psalm 31:5, committing himself to God's care as he breathes his last and demonstrating that his death is a voluntary, trusting surrender into the Father's hands.",
  "tags": [],
  "references": [
    {
      "label": "Luke 23:46",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 23,
      "ranges": [[46, 46]],
      "isPrimary": true
    }
  ]
}
```

---

### Teaching 25 — Alpha/Omega Declaration (Rev 1:8)
**Placement:** Category 2 (The Identity of Jesus Christ), existing subcategory for divine identity declarations (developer must check the actual subcategory number and assign the next teaching number).

```json
{
  "id": "2.X.Y",
  "text": "Jesus declares himself to be the Alpha and the Omega — the first and the last, the beginning and the end — identifying himself as the Lord God who is and who was and who is to come, the Almighty.",
  "tags": [],
  "references": [
    {
      "label": "Rev 1:8",
      "book": "Revelation",
      "bookAbbr": "Rev",
      "chapter": 1,
      "ranges": [[8, 8]],
      "isPrimary": true
    }
  ]
}
```

---

## 5. Meta Updates

### `meta.sources` — Add one string

Locate the `"sources"` array in the `"meta"` object and append:

```json
"2 Corinthians"
```

Maintain alphabetical or canonical order consistent with existing entries.

### `meta.scope` — Add the following strings (one per array element)

Locate the `"scope"` array in the `"meta"` object and append each of the following. Maintain the existing phrasing register (inspect two or three current scope entries to match style):

```json
"Damascus road appearance of Jesus to Saul (Acts 9:4–6; 22:7–10; 26:14–18)",
"Vision to Ananias commissioning Paul's mission (Acts 9:10–16)",
"Vision to Paul in Corinth (Acts 18:9–10)",
"Vision to Paul in the Temple (Acts 22:18–21)",
"Vision to Paul in Jerusalem custody (Acts 23:11)",
"Jesus speaks to Paul: 'My grace is sufficient for you' (2 Cor 12:9)",
"Heavenly voice to Peter on clean and unclean (Acts 10:13–15; 11:7–9)",
"Commission to write to the seven churches (Rev 1:11)",
"Jesus explains the vision of stars and lampstands (Rev 1:19–20)",
"Eschatological warning: 'I am coming like a thief' (Rev 16:15)",
"'Behold, I am making all things new' — new creation declaration (Rev 21:5–8)",
"Alpha and Omega self-declaration: 'I am the Alpha and the Omega... who is to come, the Almighty' (Rev 1:8)"
```

### `meta.totalCategories`

No change. Remains `30`.

### Subcategory count (informational, not stored in meta)

The plan adds 1 subcategory (Words from the Cross), bringing the total from 117 to **118**. If `meta` stores a `totalSubcategories` field, update it accordingly.

---

## 6. Validation Checklist

Run the following JavaScript snippet against the updated `teachings.json` in a Node.js REPL or browser console. All assertions must pass before the update is considered complete.

```js
// const data = require('./teachings.json');  // Node.js
// Or: const data = /* paste JSON */;

const categories = data.categories;

const subcatTotal = categories.reduce((sum, cat) =>
  sum + (cat.subcategories ? cat.subcategories.length : 0), 0);

const teachingTotal = categories.reduce((sum, cat) =>
  sum + (cat.subcategories || []).reduce((s2, sub) =>
    s2 + (sub.teachings ? sub.teachings.length : 0), 0), 0);

const refTotal = categories.reduce((sum, cat) =>
  sum + (cat.subcategories || []).reduce((s2, sub) =>
    s2 + (sub.teachings || []).reduce((s3, t) =>
      s3 + (t.references ? t.references.length : 0), 0), 0), 0);

const parableTotal = categories.reduce((sum, cat) =>
  sum + (cat.subcategories || []).reduce((s2, sub) =>
    s2 + (sub.teachings || []).filter(t =>
      Array.isArray(t.tags) && t.tags.includes('parable')).length, 0), 0);

const primaryRefTotal = categories.reduce((sum, cat) =>
  sum + (cat.subcategories || []).reduce((s2, sub) =>
    s2 + (sub.teachings || []).reduce((s3, t) =>
      s3 + (t.references || []).filter(r => r.isPrimary === true).length, 0), 0), 0);

const catTotal = categories.length;

console.assert(catTotal === 30,         `FAIL: Expected 30 categories, got ${catTotal}`);
console.assert(subcatTotal === 118,     `FAIL: Expected 118 subcategories, got ${subcatTotal}`);
console.assert(teachingTotal === 361,   `FAIL: Expected 361 teachings, got ${teachingTotal}`);
console.assert(refTotal >= 700,         `FAIL: Expected >=700 references, got ${refTotal}`);
console.assert(parableTotal === 35,     `FAIL: Expected 35 parables, got ${parableTotal}`);
console.assert(primaryRefTotal === teachingTotal,
  `FAIL: isPrimary count (${primaryRefTotal}) must equal teaching count (${teachingTotal})`);

console.log('Categories:    ', catTotal);
console.log('Subcategories: ', subcatTotal);
console.log('Teachings:     ', teachingTotal);
console.log('References:    ', refTotal);
console.log('Parables:      ', parableTotal);
console.log('Primary refs:  ', primaryRefTotal);

if (
  catTotal === 30 &&
  subcatTotal === 118 &&
  teachingTotal === 361 &&
  refTotal >= 700 &&
  parableTotal === 35 &&
  primaryRefTotal === teachingTotal
) {
  console.log('\nALL ASSERTIONS PASSED. teachings.json is ready.');
} else {
  console.error('\nONE OR MORE ASSERTIONS FAILED. Review counts above.');
}
```

### Expected output after successful update

```
Categories:     30
Subcategories:  118
Teachings:      361
References:     >=700
Parables:       35
Primary refs:   361

ALL ASSERTIONS PASSED. teachings.json is ready.
```

### Additional manual checks

1. **ID uniqueness:** Verify no two teachings share the same `"id"` string:
   ```js
   const allIds = [];
   categories.forEach(cat => (cat.subcategories || []).forEach(sub =>
     (sub.teachings || []).forEach(t => allIds.push(t.id))));
   const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
   console.log('Duplicate IDs:', dupes.length ? dupes : 'None');
   ```
2. **Meta sources:** Confirm `data.meta.sources` includes `"2 Corinthians"`.
3. **Meta scope:** Confirm `data.meta.scope` contains all 12 new strings added in Section 5.
4. **Words from the Cross subcategory:** Confirm a subcategory titled `"Words from the Cross"` exists under category with `id: 2` and contains exactly 6 teaching entries.
5. **New parables:** Confirm the barren fig tree teaching (Luke 13:6) and new wine teaching carry `"parable"` tags.
6. **Rev 1:8 entry:** Confirm a teaching entry for Rev 1:8 (Alpha/Omega) exists under Category 2 (The Identity of Jesus Christ).
