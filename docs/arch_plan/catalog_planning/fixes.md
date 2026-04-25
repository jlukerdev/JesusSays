# Teachings JSON — Verification & Missing Data

## Verified Counts

| Item | Expected | Status |
|------|----------|--------|
| Categories | 30 | ✓ |
| Subcategories | 117 | ✓ |
| Parables tagged | 33 | ✓ |

Structure follows schema correctly. All category/subcategory IDs and slugs are properly formatted.

---

## Missing Teachings to Add

| Teaching | References | Notes |
|----------|------------|-------|
| Render to Caesar | Matt 22:15-22, Mark 12:17, Luke 20:25 | Major teaching on authority — not present |
| Barren fig tree parable | Luke 13:6-9 | Distinct from eschatological fig tree; about repentance. Tag as `parable` |
| New wine in old wineskins | Matt 9:17, Mark 2:22, Luke 5:37-39 | Important kingdom metaphor. Tag as `parable` |
| Eunuchs for the kingdom | Matt 19:10-12 | Celibacy teaching following divorce discussion |
| Unclean spirit returns | Matt 12:43-45, Luke 11:24-26 | Warning about moral reformation |
| "I am he" at arrest | John 18:5-6, 8 | Ego eimi declaration, soldiers fall back |
| Martha and Mary | Luke 10:38-42 | "One thing is necessary" — debatable if direct speech |
| Damascus road — Jesus to Paul | Acts 9:4-6, Acts 22:7-10, Acts 26:14-18 | Post-ascension; "Why are you persecuting me?" + commission |
| Vision to Ananias about Paul | Acts 9:10-16 | "Go... he is a chosen instrument... I will show him how much he must suffer" |
| Vision to Paul in Corinth | Acts 18:9-10 | "Do not be afraid... I have many people in this city" |
| Vision to Paul in Temple | Acts 22:18-21 | "Go; I will send you far away to the Gentiles" |
| Vision to Paul in prison | Acts 23:11 | "Take courage! You must also testify in Rome" |
| "My grace is sufficient" | 2 Cor 12:9 | Jesus to Paul re: thorn in flesh — "power made perfect in weakness." Add "2 Corinthians" to sources. |
| Voice to Peter (clean/unclean) | Acts 10:13-15, Acts 11:7-9 | "What God has made clean, do not call common" — debatable if Jesus or Father |
| Alpha/Omega declaration | Rev 1:8 | "I am the Alpha and Omega... who is to come" — debatable if Christ or Father |
| Commission to write | Rev 1:11 | "Write what you see in a book and send it to the seven churches" |
| Explanation of vision | Rev 1:19-20 | "Write the things you have seen... the mystery of the seven stars" |
| "I am coming like a thief" | Rev 16:15 | Interjection mid-narrative; watchfulness |
| "Behold, I am making all things new" | Rev 21:5-8 | Final promises from the throne; Alpha/Omega |

### Seven Last Words from the Cross (6 of 7 missing)

| Teaching | References | Notes |
|----------|------------|-------|
| "Father, forgive them..." | Luke 23:34 | ✓ Already covered (18.2.4) |
| "Today you will be with me in paradise" | Luke 23:43 | **MISSING** — promise to the thief |
| "Woman, behold your son... Behold your mother" | John 19:26-27 | **MISSING** — care for Mary |
| "My God, my God, why have you forsaken me?" | Matt 27:46, Mark 15:34 | **MISSING** — cry of dereliction (Psalm 22:1) |
| "I thirst" | John 19:28 | **MISSING** — fulfillment of Scripture |
| "It is finished" (Tetelestai) | John 19:30 | **MISSING** — declaration of completed work |
| "Father, into your hands I commit my spirit" | Luke 23:46 | **MISSING** — final words (Psalm 31:5) |

---

## Suggested Category Placement

| Teaching | Suggested Category |
|----------|-------------------|
| Render to Caesar | 14 (Righteousness and Ethics) or 21 (Justice and Mercy) |
| Barren fig tree parable | 5 (Repentance and Conversion) |
| New wine in old wineskins | 4 (Kingdom of God) or 9 (New Covenant) |
| Eunuchs for the kingdom | 19 (Marriage and Family) |
| Unclean spirit returns | 17 (Wisdom and Discernment) |
| "I am he" at arrest | 2 (Identity of Jesus Christ) |
| Martha and Mary | 22 (Discipleship) or 10 (Prayer and Communion) |
| Damascus road — Jesus to Paul | 27 (Post-Resurrection Appearances) |
| Vision to Ananias about Paul | 26 (Mission and Witness) |
| Vision to Paul in Corinth | 26 (Mission and Witness) |
| Vision to Paul in Temple | 26 (Mission and Witness) |
| Vision to Paul in prison | 26 (Mission and Witness) |
| "My grace is sufficient" (2 Cor 12:9) | 7 (Faith and Trust) or 23 (Suffering and Persecution) |
| Voice to Peter (clean/unclean) | 26 (Mission and Witness) — if included |
| Alpha/Omega declaration (Rev 1:8) | 2 (Identity) — debatable attribution |
| Commission to write (Rev 1:11) | 30 (Seven Churches) or new subcategory |
| Explanation of vision (Rev 1:19-20) | 30 (Seven Churches) or new subcategory |
| "I am coming like a thief" (Rev 16:15) | 28 (Eschatology) |
| "Making all things new" (Rev 21:5-8) | 28 (Eschatology) or 2 (Identity) |
| **Words from the Cross (6 missing):** | |
| "Today you will be with me in paradise" | 6 (Salvation and Eternal Life) |
| "Woman, behold your son..." | 19 (Marriage and Family) or 13 (Love) |
| "My God, my God, why have you forsaken me?" | 23 (Suffering) or 2 (Identity — Psalm 22:1) |
| "I thirst" | 2 (Identity — fulfilling Scripture) |
| "It is finished" (Tetelestai) | 2 (Identity) or 9 (New Covenant — completed work) |
| "Father, into your hands I commit my spirit" | 7 (Faith and Trust) or 2 (Identity) |

---

## Action Items

1. Generate the json validation script and run it to validate current structure
2. Add **25 missing teachings** with proper schema structure (22 definite + 3 debatable)
   - 19 from previous list
   - 6 from the Words from the Cross
3. Tag 2 new parables (barren fig tree, new wine/wineskins) — will bring total to 35
4. Verify reference format matches existing pattern (`isPrimary: true` for first, `false` for parallels)
5. Update `meta.sources` to add "2 Corinthians"
6. Update `meta.scope` to include:
   - Damascus road and visions to Paul (Acts 9, 18, 22, 23, 26)
   - Vision to Ananias (Acts 9:10-16)
   - Jesus to Paul re: thorn (2 Cor 12:9)
   - Rev 1:8, 1:11, 1:19-20, 16:15, 21:5-8
   - Optionally: Voice to Peter (Acts 10, 11)
7. Consider creating a new subcategory "Words from the Cross" under Category 2 or 23
8. Update `meta.totalCategories` only if structure changes


## Recommended Pre-Change Validation Script

```javascript
const data = require('./teachings.json');

let teachings = 0;
let references = 0;
let parables = 0;

data.categories.forEach(cat => {
  cat.subcategories.forEach(sub => {
    sub.teachings.forEach(t => {
      teachings++;
      if (t.tags.includes('parable')) parables++;
      references += t.references.length;
    });
  });
});

console.log(`Teachings: ${teachings}/335`);
console.log(`References: ${references}/642`);
console.log(`Parables: ${parables}/33`);