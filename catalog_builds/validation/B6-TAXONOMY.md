# B6 — Taxonomy Compliance

**Date:** April 30, 2026  
**Catalog state at run time:** 31 categories · 124 subcategories · 666 teachings · 38 parables  
**Validator:** validate-catalog.js passes clean (exit 0) before this batch.  
**Script:** `catalog_builds/validation/run-b6-checks.cjs`  
**Output JSON:** `catalog_builds/validation/b6-check-output.json`

---

## Summary

| Check | Description | ERROR | WARNING | REVIEW | INFO | Total |
|---|---|---|---|---|---|---|
| A | Subcategory volume | 0 | 1 | 0 | 34 | **35** |
| B | Text field format | 0 | 0 | 0 | 1 | **1** |
| C | isPrimary source order | 0 | 0 | 20 | 0 | **20** |
| D | Reference label format | 0 | 0 | 0 | 21 | **21** |
| E | bookAbbr canonical values | 0 | 0 | 0 | 0 | **0** |
| F | Tag array validity | 0 | 0 | 0 | 0 | **0** |
| G | Duplicate text (B0 cross-reference) | 0 | 0 | 2 | 0 | **2** |
| **Total** | | **0** | **1** | **22** | **56** | **79** |

**Checks E and F are CLEAN.** No invalid bookAbbr values and no invalid tag values found in the catalog.

---

## Check A — Subcategory Volume

*Flag subcategories with < 3 teachings (INFO = below threshold; WARNING = 0 teachings).*

### F-B6001 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 1 "God the Father" > "True Worship of God" (1.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the 3-teaching threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Both teachings (true worship vs. Samaritan-woman / spirit and truth) are theologically distinct from the Father-character subcategory and justify a separate grouping.
- **Status:** ACCEPTED — 04/30/2026. Theologically distinct; no appropriate merge target within Cat 1.

---

### F-B6002 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 3 "The Holy Spirit" > "The Spirit in Witness and Trial" (3.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review for merger with Cat 3.4 (Blasphemy Against the Spirit) or Cat 26 if further Spirit-witness teachings are ever added. For now, accept — the single teaching (Matt 10:19–20 / Spirit speaking in trials) is theologically distinct from Cat 3.1–3.2.
- **Status:** RESOLVED — 04/30/2026. Teaching 3.3.1 moved to Cat 7.3; subcat 3.3 "The Spirit in Witness and Trial" deleted; renumber.js run.

---

### F-B6003 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 3 "The Holy Spirit" > "Blasphemy Against the Spirit" (3.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Blasphemy against the Spirit is a singular, critically important teaching that warrants its own subcategory regardless of count. No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026. Theological gravity of the single teaching (Matt 12:31–32 / Mark 3:28–29) justifies standalone status.

---

### F-B6004 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 5 "Repentance and Conversion" > "The Invitation to Come" (5.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. "Come to me, all who labor" and the "Come, follow me" invitation are distinct from repentance parables (5.2) and the parable of the barren fig tree (5.1). No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6005 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 8 "The Old Covenant" > "The Law's Fulfillment in Love" (8.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. The single teaching (Greatest Commandment summary) may be better located in Cat 13.1 (Love for God and Neighbor). Cross-list decision made in B3 (teaching 13.2.1 consolidated there). If Cat 8.4 teaching is the Old Covenant framing of love, it is legitimate here. If it duplicates 13.2.1, consider merging.
- **Status:** RESOLVED — 04/30/2026. Teaching 8.2.1 deleted; teaching 13.1.1 Luke ref extended to Luke 10:27–28; subcat 8.2 "The Law's Fulfillment in Love" deleted; renumber.js run.

---

### F-B6006 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 8 "The Old Covenant" > "Moses and the Scriptures Pointing to Jesus" (8.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Moses/Scripture-pointing-to-Jesus is a distinct theological theme (OT testimony to Christ) that belongs in Cat 8 rather than Cat 2 (Identity). No appropriate merge target within Cat 8.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6007 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 9 "The New Covenant" > "New and Old — The Covenant Transition" (9.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The new wine / new wineskins parable (9.3.1) is the canonical teaching on Old→New covenant transition. Its singularity is a catalog coverage issue, not a classification error. Tagged "parable" in canonical list.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6008 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 10 "Prayer and Communion" > "Corporate Prayer and Watchfulness" (10.5)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. "Where two or three are gathered" (Matt 18:20) is currently the only teaching here. If it overlaps with Cat 25.3 (Corporate Prayer and Presence), consider routing it there and deleting this subcategory.
- **Status:** RESOLVED — 04/30/2026. Teaching 10.5.1 and subcat 10.5 "Corporate Prayer and Watchfulness" deleted; renumber.js run.

---

### F-B6009 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 13 "Love" > "Love for God and Neighbor" (13.1)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The two Greatest Commandment teachings (paired summary of the Law) are theologically foundational. The below-threshold count reflects deliberate restraint — only genuine "love for God AND neighbor as greatest commandment" teachings belong here.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6010 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 13 "Love" > "Love for Enemies" (13.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. "Love your enemies" is a cardinal ethical teaching with standalone forms outside the Antitheses block (Luke 6:27, 35). No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6011 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 14 "Righteousness and Ethics" > "Salt and Light" (14.1)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Salt and Light are the opening metaphors of the Sermon on the Mount, forming a natural pairing. No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6012 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 14 "Righteousness and Ethics" > "The Law and Righteousness" (14.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Matt 5:17–19 (fulfillment of Law) and Matt 5:20 (surpassing Pharisaic righteousness) are the theological foundation for the Antitheses block (14.3) and naturally precede it. Merging into 14.3 would dilute the logical flow.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6013 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 14 "Righteousness and Ethics" > "Authentic Piety — Giving, Prayer, Fasting" (14.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold. (Giving [Matt 6:1–4] and Fasting [Matt 6:16–18]; prayer instruction is in Cat 10.)
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The two teachings cover giving and fasting — the third act (prayer) was correctly routed to Cat 10.2. The count reflects correct classification, not a gap.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6014 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 14 "Righteousness and Ethics" > "The Golden Rule and Two Ways" (14.6)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Golden Rule + Wise/Foolish Builders are the closing ethical imperatives of the Sermon on the Mount, forming a natural pairing. No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6015 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 15 "Humility and Servanthood" > "Childlikeness as a Kingdom Virtue" (15.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Childlikeness as a specific virtue (receiving the kingdom as a child) is distinct from the humility parables (15.3) and servanthood (15.2). No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6016 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 16 "Truth and Integrity" > "The Power and Accountability of Words" (16.1)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Word-accountability (Matt 12:36–37) and heart-defilement (Matt 15:18) are the two canonical "words from the heart" teachings. They form a coherent pair.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6017 — WARNING

- **Teaching ID:** n/a
- **Location:** Cat 16 "Truth and Integrity" > "Truthfulness and Oaths" (16.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** Subcategory has **0 teachings**. The oath/truthfulness teaching (Matt 5:33–37) was correctly classified in Cat 14.3.4 (within the Antitheses block per CLASSIFICATION_RULES.md). No standalone oath teaching outside the Antitheses exists in the catalog scope. This subcategory was created in anticipation of content that is now correctly routed elsewhere.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3; a subcategory with 0 teachings should be deleted.
- **Proposed action:** **Delete Cat 16.2 "Truthfulness and Oaths"** from `teachings.json`. Run `renumber.js` and `validate-catalog.js` after deletion.
- **Status:** RESOLVED — 04/30/2026. Subcategory deleted; renumber.js run; validate-catalog.js passes.

---

### F-B6018 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 17 "Wisdom and Discernment" > "Hidden Things Revealed" (17.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. "Nothing hidden that will not be revealed" teachings form a distinct eschatological/wisdom theme that does not merge cleanly with hearing/perceiving (17.1) or spiritual blindness (17.2). Accept.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6019 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 19 "Marriage and Family" > "Sexual Purity" (19.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. The lust/adultery-of-the-heart teaching (Matt 5:27–30) is the only content here. It is already in Cat 14.3.2 (Antitheses block — lust). This may be a **cross-listing duplicate** rather than a standalone routing. Verify that 19.2's teaching has a distinct family/marriage angle vs. Cat 14.3.2.
- **Status:** ACCEPTED — 04/30/2026. No action taken per approver.

---

### F-B6020 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 19 "Marriage and Family" > "Care for Children" (19.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Protecting children from stumbling blocks (Matt 18:6) and warning against despising children (Matt 18:10) form a natural pair. Distinct from childlikeness-as-virtue (Cat 15.4).
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6021 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 20 "Wealth and Generosity" > "The Rich Man and Lazarus" (20.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The Rich Man and Lazarus parable is a major teaching unit that spans multiple exchanges. The below-threshold count reflects its canonical status as a single narrative event rather than a classification gap.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6022 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 21 "Justice and Mercy" > "The Blessing on the Poor and Woe to the Rich" (21.1)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The Lukan Blessings (Luke 6:20–21) and Woes (Luke 6:24–26) are paired and form the distinctive social-contrast dimension of Cat 21.1, intentionally separate from the Matthean Beatitudes (Cat 4.4). No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6023 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 21 "Justice and Mercy" > "The Judgment of the Nations — Sheep and Goats" (21.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The Sheep and Goats pericope (Matt 25:31–46) is a single extended narrative. Two teachings cover the judgment scene and its principle. Below-threshold count reflects the unity of the pericope.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6024 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 22 "Discipleship" > "Remaining Faithful to the End" (22.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. Verify that this subcategory contains a teaching that is genuinely about ongoing faithfulness (not eschatological master-return framing → Cat 29.3). If the single teaching is better placed in Cat 29.3 or Cat 22.2, consider relocating and deleting this subcategory.
- **Status:** RESOLVED — 04/30/2026. Teaching 22.4.1 moved to Cat 29.2; subcat 22.4 "Remaining Faithful to the End" deleted; renumber.js run.

---

### F-B6025 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 23 "Suffering and Persecution" > "Taking Up the Cross" (23.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Cross-bearing as a discipleship virtue (Matt 16:24–25 / Mark 8:34–35 / Luke 9:23–24) is a theologically foundational concept that warrants its own subcategory.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6026 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 25 "The Church" > "The Foundation of the Church" (25.1)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Peter's confession and the "rock" saying (Matt 16:18–19) form the sole locus of Jesus's direct statement about founding his church. The below-threshold count reflects the canonical singularity of the event.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6027 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 25 "The Church" > "Church Discipline" (25.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. Matt 18:15–17 (binding and loosing / church discipline process) is the sole content. Consider whether this is better in Cat 18.3 (Reconciliation) as primary and Cat 25.2 as a cross-listing only.
- **Status:** RESOLVED — 04/30/2026. Teaching 25.2.1 deleted (content already covered by 18.3.2); subcat 25.2 "Church Discipline" deleted; renumber.js run.

---

### F-B6028 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 25 "The Church" > "Corporate Prayer and Presence" (25.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. "Where two or three are gathered" (Matt 18:20) is in this subcategory. Cross-reference with F-B6008 (Cat 10.5 also has only 1 teaching). Verify these are not the same teaching routed twice, or that both aren't needed. If Matt 18:20 is in Cat 25.3, Cat 10.5 may be redundant.
- **Status:** ACCEPTED — 04/30/2026. No action taken per approver.

---

### F-B6029 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 25 "The Church" > "Unity Among Believers" (25.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Unity (John 17:21–23 area) is already canonically in Cat 12 (High Priestly Prayer). The single teaching here may reflect a cross-listing or a distinct unity-focused teaching outside John 17. Verify it does not duplicate Cat 12.3 content.
- **Status:** ACCEPTED — 04/30/2026. No action taken per approver.

---

### F-B6030 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 26 "Mission and Witness" > "The Great Commission" (26.5)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Matt 28:18–20 and parallel commission texts (Mark 16:15–18, Luke 24:47–49) are among the most theologically significant teachings in the catalog. Below-threshold count is a coverage characteristic, not a classification error.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6031 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 26 "Mission and Witness" > "Fear and Courage in Witness" (26.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The "do not fear those who kill the body" teachings (Matt 10:28, Luke 12:4–5) form a natural pair addressing courage under persecution. No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6032 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 28 "Post-Resurrection Appearances" > "Thomas — Doubt Confronted by Evidence" (28.2)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Thomas's encounter (John 20:26–29) spans a dialogue and a pronouncement. Two teachings reflect the two distinct moments. This is a canonical resurrection appearance — no appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6033 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 28 "Post-Resurrection Appearances" > "The Final Commission and Ascension" (28.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 1 teaching — well below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Review. Verify this isn't a duplicate of Cat 26.5 (Great Commission). If the content is post-ascension commission content distinct from Matt 28:18–20, accept. If it overlaps, consider cross-listing or deleting.
- **Status:** RESOLVED — 04/30/2026. Teaching 28.3.1 content absorbed into 3.1.4 (Acts refs consolidated to Acts 1:4–8); subcat 28.3 "The Final Commission and Ascension" deleted; renumber.js run.

---

### F-B6034 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 29 "Eschatology and the End Times" > "The Fig Tree and the Unknown Hour" (29.4)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. The Fig Tree lesson (Matt 24:32–35) and "no one knows the hour" (Matt 24:36) form the paired closing of the Olivet Discourse — lesson and caveat. No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6035 — INFO

- **Teaching ID:** n/a
- **Location:** Cat 30 "Judgment and Hell" > "The Resurrection and Final Destiny" (30.3)
- **Check:** B6-CheckA-SubcatVolume
- **Description:** 2 teachings — below the threshold.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 1: volume threshold = 3.
- **Proposed action:** Accept. Resurrection/final-destiny teachings (John 5:28–29; "I am the resurrection") form a distinct doctrinal anchor distinct from Gehenna (30.2) and general judgment (30.1). No appropriate merge target.
- **Status:** ACCEPTED — 04/30/2026.

---

## Check B — Text Field Format

*Flag text fields starting with a quote mark or unusually long (> 250 chars, potential direct quote).*

### F-B6036 — INFO

- **Teaching ID:** 27.1.10
- **Location:** Cat 27 "The Passion Narrative" > "The Last Supper"
- **Reference(s):** Luke 22:17–20, Matt 26:26–29, Mark 14:22–25
- **Check:** B6-CheckB-TextField
- **Description:** text field is 254 characters. Heuristic flag for length. Actual text: *"At the Last Supper Jesus takes the cup, gives thanks, and says he will not drink of the fruit of the vine until the kingdom of God comes; then he gives the bread — this is my body given for you — and the cup, the new testament in his blood shed for them."*
- **Rule citation:** TAXONOMY_STANDARDS.md: text should be a concise editorial summary.
- **Analysis:** The text is written in third-person narrative (not a direct quote). The length reflects the multi-element nature of the Last Supper scene this teaching covers — eschatological cup-promise + bread institution + cup institution. The summary is legitimate.
- **Proposed action:** Accept. The length is justified by the complexity of the teaching. No condensation needed that would lose meaningful content.
- **Status:** ACCEPTED — 04/30/2026.

---

## Check C — isPrimary Source Order

*Flag teachings with multiple synoptic references where a non-Matt synoptic is marked isPrimary when Matt is also present.*

**Note:** The default rule is Matt should be isPrimary for synoptic parallels unless the fuller account is clearly in another gospel. All 20 flagged cases involve teachings where the cataloger assigned a non-Matt primary. Each is evaluated below.

---

### F-B6037 — REVIEW

- **Teaching ID:** 2.3.4
- **Location:** Cat 2 "Identity of Jesus Christ" > "The Authority and Mission of the Son"
- **Reference(s):** *Luke 12:49* (primary), Matt 10:34
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Teaching covers "I came to cast fire on the earth" (Luke 12:49) and "not peace but a sword" (Matt 10:34). Luke 12:49–53 is the fuller passage with fire + division imagery; Matt 10:34–36 is the more concise version. Luke primary is justified by the fire metaphor being unique to Luke 12:49.
- **Proposed action:** Accept current isPrimary assignment — Luke 12:49 is the fuller locus for this compound teaching.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6038 — REVIEW

- **Teaching ID:** 2.5.5
- **Location:** Cat 2 "Identity of Jesus Christ" > "Messianic Identity and Predictions"
- **Reference(s):** *Luke 18:31–33* (primary), Luke 24:46, Matt 20:18–19, Mark 10:33–34
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Teaching covers the detailed Passion prediction. Luke 18:31–33 has a fuller sequence (betrayed to Gentiles, mocked, flogged, spat upon, flogged, killed, three days — 5 steps). Matt 20:18–19 is shorter (handed over, condemned, mocked, flogged, crucified). Luke 18:31–33 has the added "everything written by the prophets" framing unique to Luke. Luke primary is justified.
- **Proposed action:** Accept current isPrimary assignment.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6039 — REVIEW

- **Teaching ID:** 2.6.14
- **Location:** Cat 2 "Identity of Jesus Christ" > "Messianic Fulfillment of Old Testament Prophecy"
- **Reference(s):** *Mark 9:12–13* (primary), Matt 17:11–12
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "Elijah must come first and restore all things" — Mark 9:12–13 includes the additional phrase "and how is it written of the Son of Man that he should suffer many things and be treated with contempt?" which is not in Matt 17:11–12. Mark has distinctly more content.
- **Proposed action:** Accept current isPrimary assignment — Mark has additional content.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6040 — REVIEW

- **Teaching ID:** 2.7.4
- **Location:** Cat 2 "Identity of Jesus Christ" > "The Miraculous Works of Jesus"
- **Reference(s):** *Mark 5:39–41* (primary), Matt 9:24–25, Luke 8:52–54
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Raising of Jairus's daughter. Mark 5:39–41 uniquely preserves the Aramaic "Talitha cumi" and the specific command "Talitha cumi; which is, Damsel, I say unto thee, arise." This distinctive textual detail is present only in Mark. Mark is clearly the fullest and most historically specific account.
- **Proposed action:** Accept current isPrimary assignment — Mark uniquely contains the Aramaic words.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6041 — REVIEW

- **Teaching ID:** 2.7.13
- **Location:** Cat 2 "Identity of Jesus Christ" > "The Miraculous Works of Jesus"
- **Reference(s):** *Mark 6:37–38* (primary), Luke 9:13–14, Matt 14:16
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Feeding of 5,000 dialogue. Mark 6:37–38 contains the fuller exchange: "Give them something to eat." "Shall we go and buy 200 denarii worth of bread?" "How many loaves do you have? Go and see." Matt 14:16 is the briefer command form. Mark's dialogue is the fullest.
- **Proposed action:** Accept current isPrimary assignment — Mark has the fuller dialogue.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6042 — REVIEW

- **Teaching ID:** 2.7.15
- **Location:** Cat 2 "Identity of Jesus Christ" > "The Miraculous Works of Jesus"
- **Reference(s):** *Mark 8:2–3* (primary), Matt 15:32
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Feeding of 4,000 — "I have compassion on the crowd; they have been with me three days and have nothing to eat." Mark 8:2–3 includes the additional detail "some of them have come a long way" not in Matt 15:32. Both are short sayings, but Mark is slightly fuller.
- **Proposed action:** Accept current isPrimary assignment.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6043 — REVIEW

- **Teaching ID:** 4.1.8
- **Location:** Cat 4 "The Kingdom of God" > "The Kingdom Proclaimed"
- **Reference(s):** *Mark 1:15* (primary), Matt 4:17
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Opening proclamation of the Kingdom. Mark 1:15 says "The time is fulfilled, and the kingdom of God is at hand; repent and believe the gospel." Matt 4:17 says "Repent, for the kingdom of heaven is at hand." Mark has two additional theological elements: "the time is fulfilled" and "believe the gospel." Mark 1:15 is the theologically richer statement.
- **Proposed action:** Accept current isPrimary assignment — Mark 1:15 has more content.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6044 — REVIEW

- **Teaching ID:** 5.2.1
- **Location:** Cat 5 "Repentance and Conversion" > "Parables of the Lost"
- **Reference(s):** *Luke 15:4–7* (primary), Matt 18:12–14
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Lost Sheep parable. Luke 15:4–7 is the full parable in its "Lost" chapter context with the rejoicing of neighbors and the explicit joy-in-heaven application (v.7). Matt 18:12–14 is a briefer version in a different context (child-protection discourse). Luke is clearly the fuller and more developed account.
- **Proposed action:** Accept current isPrimary assignment.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6045 — REVIEW

- **Teaching ID:** 7.2.1
- **Location:** Cat 7 "Faith and Trust" > "Overcoming Fear and Doubt"
- **Reference(s):** *Mark 4:40* (primary), Matt 8:26, Matt 14:31, Mark 5:36, Luke 8:25, 50
- **Check:** B6-CheckC-isPrimary
- **Analysis:** This is a composite teaching gathering multiple "do not fear / why did you doubt" sayings from different episodes. Mark 4:40 (stilling the storm) is the anchor event and is assigned primary. Matt 8:26 is the parallel. Given the composite nature, the anchor event reference as primary is appropriate.
- **Proposed action:** Accept current isPrimary assignment — composite teaching; anchor event is first.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6046 — REVIEW

- **Teaching ID:** 8.1.2
- **Location:** Cat 8 "The Old Covenant" > "The Old Covenant Era"
- **Reference(s):** *Luke 16:16* (primary), Matt 11:12–13
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "The law and prophets were until John; since then the good news of the kingdom of God is proclaimed." Luke 16:16 is a clean, direct statement of the covenant-hinge principle. Matt 11:12–13 adds the "kingdom suffers violence / violent men take it by force" saying which significantly complicates interpretation and shifts the theological focus. Luke 16:16 is the cleaner locus for the covenant-transition claim this teaching catalogues.
- **Proposed action:** Accept current isPrimary assignment — Luke 16:16 is the cleaner primary statement.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6047 — REVIEW

- **Teaching ID:** 17.1.3
- **Location:** Cat 17 "Wisdom and Discernment" > "Hearing and Perceiving"
- **Reference(s):** *Mark 4:24–25* (primary), Luke 8:18, Matt 13:12, Matt 25:29
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "Pay attention to what you hear; with the measure you use, it will be measured to you, and still more will be added." Mark 4:24–25 contains the "measure you use" saying plus "to him who has more will be given and from him who has not, even what he has will be taken away." Matt 13:12 / 25:29 have the second half only. Mark 4:24–25 is the fullest version of this compound saying.
- **Proposed action:** Accept current isPrimary assignment — Mark 4:24–25 is the fullest.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6048 — REVIEW

- **Teaching ID:** 17.3.3
- **Location:** Cat 17 "Wisdom and Discernment" > "Distinguishing True from False"
- **Reference(s):** *Luke 12:1* (primary), Matt 16:6, Matt 16:11–12
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "Beware of the leaven of the Pharisees, which is hypocrisy." Luke 12:1 has the explicit interpretation built in ("which is hypocrisy"). Matt 16:6 gives the warning without interpretation; Matt 16:11–12 adds the delayed explanation. **Matt 16:6, 11–12 together form a richer narrative** — misunderstanding then correction — that teaches how to recognize false leaven. Luke 12:1 is cleaner but Matt's arc includes the interpretive process. This is genuinely debatable.
- **Proposed action:** Flag for human judgment. Either assignment is defensible. If the cataloger's intent is to capture the *definition* of the leaven = hypocrisy (Luke gives this explicitly), Luke 12:1 is fine. If the intent is the narrative arc of warning + explanation, Matt 16:6, 11–12 would be preferred.
- **Status:** RESOLVED — 04/30/2026. isPrimary swapped to Matt 16:6, 11–12; refs reordered.

---

### F-B6049 — REVIEW

- **Teaching ID:** 18.2.1
- **Location:** Cat 18 "Forgiveness and Reconciliation" > "The Unforgiving Heart"
- **Reference(s):** *Luke 6:37* (primary), Matt 6:14–15
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "Forgive and you will be forgiven / if you do not forgive others, your Father will not forgive you." Luke 6:37 says "forgive and you will be forgiven" as part of the broader Sermon on the Plain judge/condemn/give chain. Matt 6:14–15 gives the **explicit positive and negative conditional**: "if you forgive… your Father will forgive; if you do not forgive… your Father will not forgive." Matt 6:14–15 is the fuller conditional statement that directly captures what this teaching is cataloguing.
- **Proposed action:** Consider swapping isPrimary to Matt 6:14–15, which has the explicit bi-directional conditional. Luke 6:37 is part of a broader chain and less focused. If Matt 6:14–15 is swapped to primary, update the text field to match.
- **Status:** RESOLVED — 04/30/2026. isPrimary swapped to Matt 6:14–15; refs reordered; text and quote updated to reflect Matt's bi-directional conditional formulation.

---

### F-B6050 — REVIEW

- **Teaching ID:** 21.1.1
- **Location:** Cat 21 "Justice and Mercy" > "The Blessing on the Poor and Woe to the Rich"
- **Reference(s):** *Luke 6:20–21, 26* (primary), Matt 5:3
- **Check:** B6-CheckC-isPrimary
- **Analysis:** This subcategory (Cat 21.1) is specifically the **Lukan Blessings/Woes** — the social-contrast dimension. Matt 5:3 ("Blessed are the poor in spirit") is the spiritualized parallel. Luke 6:20 ("Blessed are you who are poor") is the social/economic dimension that defines Cat 21.1's scope. The Luke primary is intentional and correct for this subcategory.
- **Proposed action:** Accept — Luke is deliberately primary for this Lukan-social-contrast subcategory.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6051 — REVIEW

- **Teaching ID:** 21.3.3
- **Location:** Cat 21 "Justice and Mercy" > "Mercy and Compassion"
- **Reference(s):** *Luke 11:42* (primary), Matt 23:23
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "Woe to you Pharisees who tithe mint/rue but neglect justice and love of God." Luke 11:42 is in the Lucan woe series (Luke 11:39–52). Matt 23:23 is in the formal Seven Woes context and includes "mercy and faithfulness" (not just "love of God") — a three-item formulation vs. Luke's two-item. **Matt 23:23 is fuller** with the additional "mercy" element that is directly relevant to the Cat 21 (mercy) context.
- **Proposed action:** Consider swapping isPrimary to Matt 23:23, which has the fuller formulation directly relevant to the mercy theme of Cat 21.3.
- **Status:** RESOLVED — 04/30/2026. isPrimary swapped to Matt 23:23; refs reordered.

---

### F-B6052 — REVIEW

- **Teaching ID:** 24.3.1
- **Location:** Cat 24 "Religious Hypocrisy" > "Traditions Over the Word of God"
- **Reference(s):** *Mark 7:9–13* (primary), Matt 15:3–6
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Corban tradition controversy. Mark 7:9–13 explicitly names and explains "Corban" (ὅ ἐστιν δῶρον) — a technical term not in Matt 15:3–6. Mark's explanation of the Corban mechanism is the fullest account.
- **Proposed action:** Accept current isPrimary assignment — Mark uniquely explains the Corban term.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6053 — REVIEW

- **Teaching ID:** 24.4.1
- **Location:** Cat 24 "Religious Hypocrisy" > "Sabbath in Right Perspective"
- **Reference(s):** *Mark 2:27–28* (primary), Matt 12:8, Luke 6:5
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "The Sabbath was made for man, not man for the Sabbath — the Son of Man is Lord of the Sabbath." Mark 2:27 ("The Sabbath was made for man") is **unique to Mark** — Matt 12:8 and Luke 6:5 have only "the Son of Man is Lord of the Sabbath." Mark 2:27 is the humanistic principle that grounds the authority claim. Mark is clearly the fullest and most theologically rich account.
- **Proposed action:** Accept current isPrimary assignment — Mark 2:27 is unique and essential to the teaching.
- **Status:** ACCEPTED — 04/30/2026.

---

### F-B6054 — REVIEW

- **Teaching ID:** 27.1.9
- **Location:** Cat 27 "The Passion Narrative" > "The Last Supper"
- **Reference(s):** *Mark 14:22–25* (primary), Matt 26:26–29, Luke 22:17–20
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Institution of the Lord's Supper (earlier bread/cup tradition). Mark 14:22–25 and Matt 26:26–29 are closely parallel. Matt 26:28 adds "for the forgiveness of sins" (εἰς ἄφεσιν ἁμαρτιῶν) — a theologically significant phrase absent from Mark 14:24. This phrase is directly relevant to the salvific significance of the Supper. **Matt's addition of "for the forgiveness of sins" may make it the theologically richer primary for the institution formula.** This is a genuine judgment call.
- **Proposed action:** Flag for human judgment. Consider whether Matt 26:26–29 (with "forgiveness of sins") should be the primary reference for 27.1.9 rather than Mark 14:22–25.
- **Status:** RESOLVED — 04/30/2026. Resolved per F-B6055: 27.1.9 and 27.1.10 merged with Matt 26:26–29 as primary.

---

### F-B6055 — REVIEW

- **Teaching ID:** 27.1.10
- **Location:** Cat 27 "The Passion Narrative" > "The Last Supper"
- **Reference(s):** *Luke 22:17–20* (primary), Matt 26:26–29, Mark 14:22–25
- **Check:** B6-CheckC-isPrimary
- **Analysis:** Note: 27.1.9 and 27.1.10 both cover the Last Supper institution (same references). 27.1.10 appears to capture the Lukan order (cup-then-bread) and the "not drink of the fruit of the vine until the kingdom" saying. Luke 22:17–18 has the eschatological cup-vow before the institution words. Luke primary is appropriate because the teaching is emphasizing the Lukan sequence and the eschatological promise unique to Luke's ordering.

  **Also flag:** Consider whether 27.1.9 and 27.1.10 should be consolidated. They share all three references and cover the same pericope. If they represent genuinely distinct moments (27.1.9 = institution formula; 27.1.10 = eschatological cup-vow), the split is justified. If they are substantively duplicating the same event, consolidation may be appropriate.
- **Proposed action:** Accept Luke as primary for 27.1.10 (Lukan sequence and eschatological promise). Flag the 27.1.9/27.1.10 split for human review to confirm both are needed.
- **Status:** RESOLVED — 04/30/2026. 27.1.9 and 27.1.10 merged into 27.1.9; Matt 26:26–29 is now primary; refs reordered (Matt, Mark, Luke); text and quote updated; teaching 27.1.10 deleted.

---

### F-B6056 — REVIEW

- **Teaching ID:** 27.4.7
- **Location:** Cat 27 "The Passion Narrative" > "The Seven Last Words"
- **Reference(s):** *Luke 23:46* (primary), Matt 27:50, Mark 15:37
- **Check:** B6-CheckC-isPrimary
- **Analysis:** "Father, into your hands I commit my spirit." This saying is **unique to Luke 23:46** — Matt 27:50 and Mark 15:37 record only "cried out with a loud voice and breathed his last" without the specific words. Luke primary is not just justified — it is the only gospel that contains the actual saying.
- **Proposed action:** Accept current isPrimary assignment — Luke is the only source for this specific word.
- **Status:** ACCEPTED — 04/30/2026.

---

## Check D — Reference Label Format

*Flag reference labels using a plain hyphen (-) between verse numbers. Convention: en-dash (–) required.*

All 21 findings are INFO-level formatting issues. All are **proposed for mechanical fix** — replace hyphen `-` with en-dash `–` in the label strings.

| Finding | Teaching ID | Label to fix |
|---|---|---|
| F-B6057 | 2.7.21 | John 5:6-8 → John 5:6–8 |
| F-B6058 | 5.1.4 | Luke 13:6-9 → Luke 13:6–9 |
| F-B6059 | 5.1.11 | Matt 12:43-45 → Matt 12:43–45 |
| F-B6060 | 5.1.11 | Luke 11:24-26 → Luke 11:24–26 |
| F-B6061 | 19.1.4 | Matt 19:10-12 → Matt 19:10–12 |
| F-B6062 | 20.3.6 | Matt 22:15-22 → Matt 22:15–22 |
| F-B6063 | 20.3.6 | Mark 12:13-17 → Mark 12:13–17 |
| F-B6064 | 20.3.6 | Luke 20:20-26 → Luke 20:20–26 |
| F-B6065 | 22.1.4 | Luke 10:38-42 → Luke 10:38–42 |
| F-B6066 | 26.3.1 | Acts 9:10-16 → Acts 9:10–16 |
| F-B6067 | 26.3.2 | Acts 18:9-10 → Acts 18:9–10 |
| F-B6068 | 26.3.3 | Acts 22:18-21 → Acts 22:18–21 |
| F-B6069 | 26.3.5 | Acts 10:13-15 → Acts 10:13–15 |
| F-B6070 | 26.3.5 | Acts 11:7-9 → Acts 11:7–9 |
| F-B6071 | 26.3.6 | Acts 9:4-6 → Acts 9:4–6 |
| F-B6072 | 26.3.6 | Acts 22:7-10 → Acts 22:7–10 |
| F-B6073 | 26.3.6 | Acts 26:14-18 → Acts 26:14–18 |
| F-B6074 | 27.2.6 | John 18:5-8 → John 18:5–8 |
| F-B6075 | 27.4.3 | John 19:26-27 → John 19:26–27 |
| F-B6076 | 29.2.4 | Rev 21:5-8 → Rev 21:5–8 |
| F-B6077 | 31.1.3 | Rev 1:19-20 → Rev 1:19–20 |

**Status:** RESOLVED — 04/30/2026. All 21 label strings updated in `teachings.json`.

---

## Check E — bookAbbr Canonical Values

**CLEAN. No findings.** All `bookAbbr` values in the catalog use the canonical set: `Matt`, `Mark`, `Luke`, `John`, `Acts`, `1Cor`, `2Cor`, `Rev`.

---

## Check F — Tag Array Validity

**CLEAN. No findings.** All teachings have valid `tags` arrays. All tag values are within the governed set (`parable`) or the informational set (`i-am`, `healing`, `prayer`, `prophecy`, `woe`, `blessing`). No null tags, no missing arrays, no unknown tag values.

**Approver:** delete all tag values EXCEPT for 'parable'

**Status:** RESOLVED — 04/30/2026. All non-parable tags (i-am, healing, prayer, prophecy, woe, blessing) removed from 73 teachings; only "parable" tag retained catalog-wide.

---

## Check G — Duplicate Text Detection (B0 Cross-Reference)

*Re-examine the two duplicate-text findings from B0-BASELINE.md in light of post-B1–B5 catalog state.*

### F-B6078 — REVIEW

- **Teaching IDs:** 6.2.2 and 2.1.6
- **Location:** 6.2.2 in Cat 6 "Salvation and Eternal Life" > "Faith as the Condition of Salvation"; 2.1.6 in Cat 2 "Identity of Jesus Christ" > "I AM Declarations"
- **Reference(s):** Both: John 14:6
- **Check:** B6-CheckG-DuplicateText
- **Description:** Teaching 6.2.2 text: *"I am the way, the truth, and the life — no one comes to the Father except through me."* Teaching 2.1.6 text: *"I AM the way, the truth, and the life — no one comes to the Father except through me."* The texts are functionally identical (only "I am" vs. "I AM" capitalization difference). A third routing exists at 16.3.1 (*"Declares himself the way, the truth, and the life — no one comes to the Father"*) with a distinct summary text.
- **Rule citation:** TAXONOMY_STANDARDS.md Part 3: cross-listing integrity — each version's text must reflect the distinct angle of its subcategory. Identical texts (6.2.2 = 2.1.6) constitute a true duplicate, not a legitimate cross-listing.
- **Analysis:** John 14:6 legitimately serves three subcategories: (a) Cat 2.1 as an I AM declaration, (b) Cat 6.2 as a salvation-exclusivity claim ("no one comes to the Father"), (c) Cat 16.3 as a truth claim. Cat 16.3.1 has a distinct summary text. The problem is that 6.2.2 and 2.1.6 have the same text — 6.2.2 does not reflect the distinct salvation angle of Cat 6.2.
- **Proposed action:** **Delete teaching 6.2.2** from Cat 6.2. The salvific claim is already captured at 16.3.1 (Cat 16.3) in the "no one comes to the Father" formulation, and the I AM declaration is at 2.1.6. Cat 6.2's salvific coverage of John 14:6 is adequately represented by 16.3.1 as a cross-reference. If the cataloger wishes to retain John 14:6 in Cat 6.2 as a cross-listing, the text of 6.2.2 must be rewritten to reflect the salvation angle distinctly (e.g., *"Declares that he alone is the way to the Father — the exclusive condition for salvation"*).
- **Status:** RESOLVED — 04/30/2026. Teaching 6.2.2 deleted; John 14:6 salvific angle covered by 16.3.1.

---

### F-B6079 — REVIEW

- **Teaching IDs:** 31.1.2 and 2.1.9 (as recorded in B0 audit)
- **Location:** 31.1.2 in Cat 31 "The Seven Churches" > "Introduction to the Seven Churches"; 2.1.9 in Cat 2 "Identity of Jesus Christ" > "I AM Declarations" (current state)
- **Reference(s):** 31.1.2: Rev 1:17–18; current 2.1.9: Rev 22:13, 16
- **Check:** B6-CheckG-DuplicateText
- **Description:** B0 audit flagged a duplicate-text match between 31.1.2 and teaching 2.1.9. The B0 audit ran against the pre-B1 catalog. Teaching 2.1.9 was **deleted during B1** (listed in STATUS.md B1 deletions). After post-B1 renumbering, the ID 2.1.9 was reassigned to a completely different teaching (*"I AM the Alpha and the Omega, the root and offspring of David, the bright morning star"* — Rev 22:13, 16). This is not a duplicate of 31.1.2 (*"I AM the First and the Last, the Living One — dead, and behold alive forevermore"* — Rev 1:17–18).
- **Analysis:** The B0 finding references an ID that no longer maps to the same teaching. This is a stale finding caused by ID drift from B1–B4 renumbering. The current teachings at these two IDs have distinct texts and references.
- **Proposed action:** Accept as FALSE POSITIVE — stale finding from B0 ID drift. No action needed on the catalog.
- **Status:** ACCEPTED (FALSE POSITIVE) — 04/30/2026. Current 2.1.9 is a different teaching (Rev 22:13, 16) from what B0 flagged. The original 2.1.9 was deleted in B1.

---

## Findings Summary — All Resolved

| Finding | Severity | Check | Resolution |
|---|---|---|---|
| F-B6002 | INFO | Check A | RESOLVED — 3.3.1 moved to Cat 7.3; subcat 3.3 deleted |
| F-B6005 | INFO | Check A | RESOLVED — 8.2.1 deleted; 13.1.1 Luke ref extended; subcat 8.2 deleted |
| F-B6008 | INFO | Check A | RESOLVED — 10.5.1 and subcat 10.5 deleted |
| F-B6019 | INFO | Check A | ACCEPTED — no action (ignore) |
| F-B6024 | INFO | Check A | RESOLVED — 22.4.1 moved to Cat 29.2; subcat 22.4 deleted |
| F-B6027 | INFO | Check A | RESOLVED — 25.2.1 deleted; subcat 25.2 deleted |
| F-B6028 | INFO | Check A | ACCEPTED — no action (ignore) |
| F-B6029 | INFO | Check A | ACCEPTED — no action (ignore) |
| F-B6033 | INFO | Check A | RESOLVED — 3.1.4 Acts refs consolidated; 28.3.1 and subcat 28.3 deleted |
| F-B6048 | REVIEW | Check C | RESOLVED — isPrimary swapped to Matt 16:6, 11–12 |
| F-B6049 | REVIEW | Check C | RESOLVED — isPrimary swapped to Matt 6:14–15; text + quote updated |
| F-B6051 | REVIEW | Check C | RESOLVED — isPrimary swapped to Matt 23:23 |
| F-B6054 | REVIEW | Check C | RESOLVED — per F-B6055 (Matt 26:26–29 primary in merged teaching) |
| F-B6055 | REVIEW | Check C | RESOLVED — 27.1.9 + 27.1.10 merged; Matt primary; 27.1.10 deleted |
| F-B6078 | REVIEW | Check G | RESOLVED — 6.2.2 deleted |
| Check F  | —     | Check F | RESOLVED — non-parable tags removed from 73 teachings |
