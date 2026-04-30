# Catalog Validation Plan — April 29, 2026

**Scope:** Full validation of `public/teachings.json` (683 teachings, 126 subcategories, 31 categories) against `CLASSIFICATION_RULES.md` and `TAXONOMY_STANDARDS.md`.  
**Output folder:** `catalog_builds/validation/`  
**Status tracking:** `STATUS.md` in this folder

---

## Guiding Principles

The existing engine scripts handle **schema and data quality**. This validation plan covers **theological classification correctness** — the layer the scripts cannot mechanically verify.

| Layer | Tool |
|---|---|
| Schema integrity (IDs, slugs, required fields) | `validate-catalog.js` — existing |
| Data quality (short text, missing quotes, parable tagging) | `audit-catalog.js` — existing |
| Classification correctness (this plan) | Manual review per batch |

Each batch is designed to be run in a single session. Batches are independent — any can be revisited without re-running others.

---

## Batch Overview

| Batch | Name | Scope | Categories / Checks |
|---|---|---|---|
| B0 | Baseline Snapshot | Prerequisite run | All (automated scripts) |
| B1 | Global Override Compliance | Highest priority | G-1, G-2, G-4 hard-capture rules |
| B2 | God → Prayer | Cats 1–10 | Topical classification review |
| B3 | Abiding → Wealth | Cats 11–20 | Topical classification review |
| B4 | Justice → Seven Churches | Cats 21–31 | Topical classification review |
| B5 | Parable Tag Audit | All categories | 42-parable canon check |
| B6 | Taxonomy Compliance | All categories | Structural + field-level standards |

Run order: B0 → B1 → B2/B3/B4 (any order) → B5 → B6  
B0 and B1 are **blocking**: findings must be resolved before B2–B4 are meaningful.

---

## Batch Definitions

---

### B0 — Baseline Snapshot

**Purpose:** Capture current state from existing automated tools before any manual review. Any errors here must be fixed first.

**Steps:**
1. `node catalog_builds/engine/scripts/validate-catalog.js --json > catalog_builds/validation/b0-validate-output.json`
2. `node catalog_builds/engine/scripts/audit-catalog.js --json > catalog_builds/validation/b0-audit-output.json`
3. `node catalog_builds/engine/scripts/parse-catalog.js --stats`
4. Record all findings in `B0-BASELINE.md`
5. Fix any validation errors before proceeding to B1

**Pass criterion:** `validate-catalog.js` exits 0.

---

### B1 — Global Override Compliance

**Purpose:** Verify the three hard-capture rules are universally honored. These are binary violations — a teaching either belongs in the override category or it does not.

**Checks:**

#### B1-G1: John 17 → Cat 12 (High Priestly Prayer)
- **Forward check:** Every teaching with any reference to `John` chapter `17` must be in category 12.
- **Reverse check:** Every teaching in category 12 must reference John 17 (and only John 17).
- **Error class:** Misrouted John 17 verse OR non-John-17 content inside Cat 12.

#### B1-G2: Passion Scope → Cat 27 (Passion Narrative)
- **Forward check:** Every teaching referencing the following ranges must be in Cat 27:
  - Matt 26, Matt 27
  - Mark 14, Mark 15
  - Luke 22, Luke 23
  - John 18, John 19
- **Exception carve-out (must verify):** The Farewell Discourse (John 13:31–16:33) is explicitly excluded from G-2. Any John 13–16 reference in Cat 27 must be an actual Passion event (Judas departure, denial prediction) — not topical teaching.
- **Reverse check:** Every teaching in Cat 27 must reference a Passion scope passage.
- **Error class:** Misrouted Passion verse OR non-Passion content inside Cat 27.

#### B1-G4: Rev 1:10–3:22 → Cat 31 (Seven Churches)
- **Forward check:** Every teaching referencing Revelation chapters 1–3 must be in Cat 31.
- **Reverse check:** Every teaching in Cat 31 must reference Rev 1–3.
- **Error class:** Misrouted Rev 1–3 verse OR non-Rev-1-3 content inside Cat 31.

**Output file:** `B1-OVERRIDES.md`  
**Pass criterion:** Zero violations of G-1, G-2, or G-4.

---

### B2 — Categories 1–10

**Purpose:** Verify topical classification for the God/Christ/Spirit/Kingdom/Repentance/Salvation/Faith/Old Covenant/New Covenant/Prayer block.

**Checks by category:**

#### Cat 1 — God the Father
- Flag any teaching whose primary content is prayer *instruction* (→ Cat 10), not God's character.
- Flag any Father-sending-Son teaching where the emphasis is Jesus's identity (→ Cat 2.2).
- Check Cat 1.2 (True Worship) vs Cat 14.4 (Authentic Piety): worship theology vs. devotional practice.

#### Cat 2 — Identity of Jesus Christ
- Cat 2.1 ("I AM" Declarations): Verify these are the formal metaphorical I AM statements, not relational assertions (which go 2.2).
- Cat 2.7 (Miraculous Works): These must be performative commands — any interpretive authority statements should be in 2.3.
- Flag any vine/branches teaching in Cat 2.1 that should be Cat 11 (the disciple's relationship is the emphasis).
- Check Cat 2.5 (Passion predictions) are not actual Passion events (those go Cat 27 per G-2).

#### Cat 3 — Holy Spirit
- Cat 3.3 (Spirit in Witness/Trial) vs Cat 26.3 (Courage in Witness): the distinguishing mark is whether *the Spirit speaking* or *the disciple's courage* is the subject.
- Cat 3.4 (Blasphemy against Spirit): verify it's not duplicated in Cat 16 or Cat 17.

#### Cat 4 — Kingdom of God
- Cat 4.3 (Entering Kingdom) vs Cat 6 (Salvation): overlapping territory — the Kingdom threshold vs. the salvation transaction.
- Cat 4.4 (Beatitudes): Must be the formal Beatitudes list (Matt 5:3–12 / Luke 6:20–26) only.
- Cat 4.5 (Parables of Kingdom's People) vs Cat 4.3: *life inside* Kingdom vs. *entry* into it.
- Flag any "lost things" parable (sheep/coin/son) that has been placed in Cat 4 — those belong in Cat 5 per tie-breaker.

#### Cat 5 — Repentance and Conversion
- Verify Cat 5.2 (Parables of the Lost) contains lost sheep, lost coin, prodigal son, and not Kingdom-value parables (hidden treasure, pearl of great price → Cat 4).
- Verify Cat 5.3 (Invitation to Come) vs Cat 22.1 (Call to Follow): the distinction is relational warmth/invitation (Cat 5) vs. the discipleship summons (Cat 22).

#### Cat 6 — Salvation and Eternal Life
- Cat 6.1 (New Birth) vs Cat 3 (Holy Spirit): if the Spirit is the agent of new birth but the teaching is about the Spirit's work more broadly, Cat 3 may be more appropriate.
- Cat 6.2 (Faith as Condition) vs Cat 7 (Faith and Trust): apply tie-breaker — is the promise the *outcome* (eternal life → Cat 6) or *instruction on believing* (Cat 7)?
- Cat 6.4 (Narrow Way) vs Cat 14.6: narrow way as path-to-life (Cat 6.4) vs. as ethical call / two-ways framing (Cat 14.6).
- John 6 bread-of-life: must be in Cat 9.2, not Cat 6.

#### Cat 7 — Faith and Trust
- Cat 7.2 (Overcoming Fear/Doubt) vs Cat 23.3 (Courage under Suffering): distinguishing mark is whether the crisis is persecution-driven (Cat 23) or general fear/doubt (Cat 7).
- Cat 7.3 (Trust Over Anxiety) vs Cat 1.1 (God's Fatherhood and Care): if the teaching is about God's character (he knows your needs), Cat 1.1 is appropriate; if about releasing worry, Cat 7.3.

#### Cat 8 — Old Covenant
- Verify Temptation of Jesus (Matt 4:1–11 / Luke 4:1–13) is **not** in Cat 8.1 — it belongs in Cat 23.1.
- Cat 8.1 vs Cat 14.3 (Antitheses): if the teaching is primarily quoting the Law, Cat 8.1; if the primary act is Jesus's new pronouncement ("but I say"), Cat 14.3.
- Cat 8.3 (Moses/Scriptures pointing to Jesus) vs Cat 2.6 (Messianic Identity): former is OT interpretation; latter is self-declaration.

#### Cat 9 — New Covenant
- Cat 9.1 (Institution of Lord's Supper) must not contain Last Supper Passion-scope content (that goes Cat 27 per G-2). This subcategory is for pre-Passion teaching only.
- Verify John 6 is in Cat 9.2, not Cat 6 or Cat 27.
- Cat 9.3 (New/Old transition) vs Cat 8 (Old Covenant): metaphorical transition teachings (new wine/wineskins) belong in Cat 9.3; direct Law commentary belongs in Cat 8.

#### Cat 10 — Prayer and Communion
- Cat 10.4 (Praying in Jesus's Name) vs Cat 11 (Abiding): name-prayer from John 14–16 → Cat 10.4. Any John 15:16 "ask in my name" must not be in Cat 11.
- Cat 10.5 (Corporate Prayer/Watchfulness) vs Cat 25.3 (Church/Presence): "where two or three gathered" — if prayer power is primary → Cat 10.5; if Christ's presence in community is primary → Cat 25.3.
- Cat 10.2 (How to Pray) vs Cat 14.4 (Authentic Piety): hypocrisy-exposing frame → Cat 14.4; positive prayer instruction → Cat 10.2.

**Output file:** `B2-CATS01-10.md`

---

### B3 — Categories 11–20

**Purpose:** Verify topical classification for the Abiding/Prayer/High Priestly Prayer/Love/Righteousness/Humility/Truth/Wisdom/Forgiveness/Marriage/Wealth block.

**Checks by category:**

#### Cat 11 — Abiding in Christ
- Verify John 15:12 ("love one another") is **not** in Cat 11 — it belongs in Cat 13.4.
- Verify John 15:16 ("ask in my name") is **not** in Cat 11 — it belongs in Cat 10.4.
- Verify John 15:18–27 (world's hatred, Spirit's witness) is **not** in Cat 11 — it belongs in Cat 26 / Cat 3.
- Cat 11.2 (Abiding in Love) vs Cat 13.4 (New Commandment): the mechanism of union (Cat 11) vs. the love command itself (Cat 13).

#### Cat 12 — High Priestly Prayer
- Verify subcategory verse assignments:
  - Cat 12.1 must contain John 17:1–5 only
  - Cat 12.2 must contain John 17:6–19 only
  - Cat 12.3 must contain John 17:20–26 only
- (B1-G1 already checks that all John 17 content is in Cat 12; this check verifies internal subcategory routing.)

#### Cat 13 — Love
- Cat 13.1 (Love for God) + Cat 13.2 (Love for Neighbor): when they appear as paired summary of the Law, both together → assign to both subcategories or 13.1 as primary.
- Cat 13.3 (Love for Enemies): Verify "love your enemies" *within* the Antitheses block is **not** here — it belongs in Cat 14.3. Cat 13.3 holds only standalone instances.
- Cat 13.4 (New Commandment): Verify it's from Upper Room context (John 13–15); Passion-scope instances go Cat 27.
- The Good Samaritan parable: must be in Cat 13.2 (or Cat 21.3 if mercy-to-vulnerable is primary frame).

#### Cat 14 — Righteousness and Ethics
- Cat 14.3 (Antitheses): Should contain all six antitheses (Matt 5:21–48) — murder/anger, adultery/lust, divorce, oaths, retaliation, love of enemies — as a block.
- Cat 14.4 (Authentic Piety): The three acts — alms, prayer, fasting — should all be in Matt 6:1–18 scope. Prayer section here → distinguish from Cat 10.
- Cat 14.5 (Judging/Discernment) vs Cat 17 (Wisdom): ethical relational practice (Cat 14.5) vs. spiritual perceptual capacity (Cat 17).
- Cat 14.6 (Golden Rule and Two Ways) vs Cat 6.4 (Narrow Way): ethical call (Cat 14.6) vs. eschatological path-to-life (Cat 6.4).

#### Cat 15 — Humility and Servanthood
- Cat 15.4 (Childlikeness) vs Cat 4.3 (Entering Kingdom): childlike posture as a virtue → Cat 15.4; childlikeness as condition of Kingdom entry → Cat 4.3.
- Cat 15 vs Cat 22 (Discipleship): when the virtue praised is servanthood/humility itself → Cat 15; when the sacrifice required to follow is the point → Cat 22.
- Pharisee and Tax Collector parable: verify in Cat 15.3 (Parables of Humility), not Cat 24 (Religious Hypocrisy).

#### Cat 16 — Truth and Integrity
- Cat 16.2 (Truthfulness/Oaths) vs Cat 14.3: oath teaching *within* the Antitheses block → Cat 14.3; standalone oath/truthfulness teaching → Cat 16.2.
- Cat 16.3 (Jesus as Truth) should be cross-listed with Cat 2.1; verify "I am the way, truth, life" (John 14:6) appears in Cat 2.1 as primary.

#### Cat 17 — Wisdom and Discernment
- Cat 17.1 (Hearing/Perceiving) should contain the Parable of the Sower explanation and "ears to hear" calls.
- Cat 17.2 (Spiritual Blindness Rebuked) vs Cat 24 (Religious Hypocrisy): genuine perceptual failure → Cat 17.2; willful pretense → Cat 24.
- Cat 17.3 (True from False) should contain the fruit-test and wolves-in-sheep's-clothing teaching.

#### Cat 18 — Forgiveness and Reconciliation
- Cat 18.1 (God's Forgiveness) vs Cat 5: if the act of *turning* is the punch line → Cat 5; if the *grant of forgiveness* is → Cat 18.1.
- Cat 18.3 (Reconciliation) should reference Matt 5:23–24 and Matt 18:15–17. Verify Matt 18:15–17 is not in Cat 25.2 (Church Discipline) instead — or if it is there, that it's appropriately cross-listed/routed.
- Forgiveness from the cross ("Father forgive them") → Cat 27 per G-2. Should **not** be in Cat 18.

#### Cat 19 — Marriage and Family
- Cat 19.1 (Marriage/Divorce) should include all synoptic divorce texts.
- Cat 19.2 (Sexual Purity) should include lust/adultery-of-the-heart (from Antitheses block — verify not *also* in Cat 14.3 as a duplicate).
- Cat 19.3 (Family/Kingdom Priority): "I came not to bring peace but a sword" (Matt 10:34–36) — verify placement; if emphasis is division caused by witness → Cat 23.2; if Kingdom's claim on family → Cat 19.3.
- Cat 19.4 (Care for Children) vs Cat 15.4 (Childlikeness): protecting children vs. childlike posture as virtue.

#### Cat 20 — Wealth and Generosity
- Cat 20.4 (Rich Man and Lazarus): must be here, not Cat 21 (Justice/Mercy) or Cat 30 (Judgment).
- Talents/Minas parable: apply tie-breaker — if focus is investment of literal resources → Cat 20.3; if eschatological master's return is the frame → Cat 29; if practical Kingdom faithfulness → Cat 22.
- Widow's offering: verify in Cat 20.3 (Generosity/Stewardship).
- "Render to Caesar" teaching: verify placement — Cat 20.3 or Cat 8 (Old Covenant); primary issue determines.

**Output file:** `B3-CATS11-20.md`

---

### B4 — Categories 21–31

**Purpose:** Verify topical classification for the Justice/Discipleship/Suffering/Hypocrisy/Church/Mission/Passion/Resurrection/Eschatology/Judgment/Seven Churches block.

**Checks by category:**

#### Cat 21 — Justice and Mercy
- Cat 21.2 (Sheep and Goats, Matt 25:31–46): must be here, **not** Cat 30 (Judgment). Verify this.
- Cat 21.1 (Lukan Blessings/Woes) vs Cat 4.4 (Beatitudes): Luke 6:20–26 in its social-contrast dimension → Cat 21.1; formal Beatitudes listing → Cat 4.4. These may legitimately overlap.
- Cat 21.3 (Mercy/Compassion) vs Cat 13.2 (Love for Neighbor): Good Samaritan routing — check where it is and whether the primary frame is mercy-to-vulnerable (Cat 21.3) or neighbor-love (Cat 13.2).

#### Cat 22 — Discipleship
- Cat 22.1 (Call to Follow) vs Cat 5.3 (Invitation to Come): relational warmth (Cat 5.3) vs. discipleship summons (Cat 22.1).
- Cat 22.2 (Counting the Cost) vs Cat 23.4 (Taking Up the Cross): cost of following without persecution framing → Cat 22.2; cross-bearing in the context of suffering/witness → Cat 23.4.
- Cat 22.3 (Fruit-Bearing) vs Cat 11.1 (Vine/Branches): verify fruitless fig tree is in Cat 22.3 rather than Cat 11.
- Cat 22.4 (Remaining Faithful) vs Cat 29.3 (Readiness/Watchfulness): watchful servant parable — if eschatological master's return is the explicit frame → Cat 29.3; if practical ongoing faithfulness → Cat 22.4.

#### Cat 23 — Suffering and Persecution
- Cat 23.1 (Temptation of Jesus): must be **only** Matt 4:1–11 / Luke 4:1–13. Verify it's not in Cat 8.1.
- Cat 23.2 (Promise of Persecution) vs Cat 26.4 (Persecution of Witnesses): preparatory/prophetic nature → Cat 23.2; specifically tied to active witness/proclamation → Cat 26.4.
- Cat 23.4 (Taking Up the Cross) vs Cat 22.2 (Counting the Cost): cross-bearing with suffering context → Cat 23.4; general cost framing → Cat 22.2.

#### Cat 24 — Religious Hypocrisy
- Cat 24.1 (Seven Woes): all Matt 23:13–36 woes should be in this subcategory, not scattered.
- Cat 24.4 (Sabbath in Right Perspective): Sabbath healing controversies → Cat 24.4. Verify any Sabbath-authority claims that emphasize Jesus's authority (not the conflict with Pharisees) are in Cat 2.3 instead.
- Cat 24.5 (Hypocrisy in Leadership) vs Cat 24.1: individual leadership-behavior rebukes outside the formal woe-series.

#### Cat 25 — The Church
- Cat 25.1 (Foundation of the Church): the Peter/rock saying (Matt 16:18–19).
- Cat 25.2 (Church Discipline) vs Cat 18.3 (Reconciliation): Matt 18:15–17 binding and loosing — if authority/discipline frame is primary → Cat 25.2; if relational restoration is primary → Cat 18.3.
- Cat 25.3 (Corporate Prayer/Presence) vs Cat 10.5: re-verify "where two or three gathered" routing.

#### Cat 26 — Mission and Witness
- Cat 26.5 (Great Commission) must reference Matt 28:18–20 and parallel texts.
- Cat 26.6 (Visions/Commissions in Acts): post-ascension appearances — Damascus road, Cornelius vision, etc.
- Cat 26 vs Cat 28: post-resurrection mission instructions — if topically self-contained (Great Commission → Cat 26.5), not Cat 28. Verify no overlap/duplication.

#### Cat 27 — Passion Narrative
- Verify subcategory routing:
  - Cat 27.1 (Last Supper): institution words + betrayal/denial predictions. Must reference Passion-scope chapters.
  - Cat 27.2 (Gethsemane/Arrest): the prayer as narrative event + arrest dialogue.
  - Cat 27.3 (Trial/Crucifixion): words before Caiaphas, Pilate; words en route to Golgotha.
  - Cat 27.4 (Seven Last Words): exactly seven cross sayings.
- Verify Farewell Discourse (John 13:31–16:33) content is **not** in Cat 27 — it should be in topical categories (Cat 3, Cat 10, Cat 11, Cat 13).
- Count that Cat 27.4 has exactly 7 teachings (the seven last words).

#### Cat 28 — Post-Resurrection Appearances
- Cat 28.2 (Thomas): John 20:26–29 → topical home is Cat 7 (Faith/Trust). Verify it is in Cat 7 and cross-listed/noted in Cat 28.2, or confirm routing decision.
- Cat 28.3 (Restoration of Peter): John 21:15–23. Verify "Feed my sheep" / "Follow me" commissions are routed to Cat 22.1 / Cat 26 as well.
- Flag any topically self-contained post-resurrection teaching mistakenly placed here instead of its topical category (Thomas → Cat 7; Great Commission → Cat 26.5).

#### Cat 29 — Eschatology and End Times
- Olivet Discourse scope: Matt 24 / Mark 13 / Luke 21 teachings should be in Cat 29.
- Cat 29.3 (Readiness/Watchfulness) vs Cat 22.4 (Remaining Faithful): explicit eschatological master's-return frame → Cat 29.3.
- Verify Sheep and Goats (Matt 25:31–46) is **not** in Cat 29 — it belongs in Cat 21.2.
- Cat 29 vs Cat 30: when teaching combines end-times signs and hell description, assign by dominant image.

#### Cat 30 — Judgment and Hell
- Cat 30.2 (Hell/Its Reality): Gehenna, outer darkness, weeping/gnashing of teeth teachings.
- Cat 30.3 (Resurrection/Final Destiny): "I am the resurrection and the life" → confirm this is primarily in Cat 2.1 (I AM) or Cat 30.3, not duplicated unclearly.
- Verify Rich Man and Lazarus is **not** here — it belongs in Cat 20.4.

#### Cat 31 — Seven Churches
- Verify each subcategory contains the correct Revelation letter:
  - 31.1 → Rev 1:11–20
  - 31.2 → Rev 2:1–7 (Ephesus)
  - 31.3 → Rev 2:8–11 (Smyrna)
  - 31.4 → Rev 2:12–17 (Pergamum)
  - 31.5 → Rev 2:18–29 (Thyatira)
  - 31.6 → Rev 3:1–6 (Sardis)
  - 31.7 → Rev 3:7–13 (Philadelphia)
  - 31.8 → Rev 3:14–22 (Laodicea)
- (B1-G4 already verifies all Rev 1–3 content is in Cat 31; this checks internal routing.)

**Output file:** `B4-CATS21-31.md`

---

### B5 — Parable Tag Audit

**Purpose:** Verify the 42 canonical parables are all tagged and correctly tagged, and no non-canonical teachings carry the `"parable"` tag.

**Canonical 42-parable reference list:** Per `TAG_RULES.md`.

**Checks:**
1. Extract all teachings tagged `"parable"` — count must match 42.
2. Verify each canonical parable appears in the catalog and is tagged.
3. Verify each tagged teaching is on the canonical list (no extra tags).
4. For each tagged parable, verify it is in the correct category per classification rules (e.g., lost-things parables in Cat 5, not Cat 4).
5. Flag any parable-candidate findings from B0's `audit-catalog.js` run that are still unresolved.

**Output file:** `B5-PARABLES.md`

---

### B6 — Taxonomy Compliance

**Purpose:** Verify structural and field-level standards from `TAXONOMY_STANDARDS.md`.

**Checks:**
1. **Subcategory volume:** Flag any subcategory with fewer than 3 teachings (potential merge candidate per taxonomy threshold).
2. **Teaching text format:** `text` field should be third-person present tense, at least 20 chars, no quotation marks.
3. **isPrimary source order:** For synoptic parallels, Matthew should be `isPrimary: true` unless fuller account is clearly in another gospel. Flag any teaching where a non-Matt synoptic parallel is primary when Matt is present.
4. **Reference label format:** Should follow `"Book ch:v–v"` convention (e.g., `"Matt 13:31–32"` using en-dash, not hyphen). Flag inconsistencies.
5. **bookAbbr canonical values:** Must match exactly: `Matt`, `Mark`, `Luke`, `John`, `Acts`, `1Cor`, `2Cor`, `Rev`. No spaces, no periods.
6. **Duplicate text detection (refined):** Cross-list the audit-catalog.js `duplicate-text` findings. Classify each as:
   - True duplicate → mark for deletion per taxonomy resolution rule
   - Legitimate cross-listing → mark as accepted with rationale
7. **Cross-listing integrity:** When a teaching is intentionally in two locations, verify each version's `text` reflects the distinct angle of its subcategory.
8. **Tag array check:** `tags` must be an array (not null, not missing). Only `"parable"` is currently a valid tag value. Flag any unexpected tag values.

**Output file:** `B6-TAXONOMY.md`

---

## Findings Format

All findings are recorded in the batch output files using this format.

### Severity levels

| Level | Meaning |
|---|---|
| **ERROR** | Hard rule violation (e.g., Global Override breach, wrong category for a verse with an override rule) |
| **WARNING** | Probable misclassification based on tie-breaker or exclusion rules |
| **REVIEW** | Ambiguous case — requires human judgment on primary theological thrust |
| **INFO** | Observation, not a violation (e.g., teaching count below threshold but above minimum) |

### Finding record format

Each finding in a batch output file:

```
### F-[BATCH][NNN] — [Severity]

- **Teaching ID:** [e.g., 4.5.3]
- **Location:** [Category Title > Subcategory Title]
- **Reference(s):** [e.g., Matt 13:31–32]
- **Check:** [Short name of check, e.g., B1-G1 | B2-Cat4-vs-Cat5]
- **Description:** [What was found and why it's a concern]
- **Rule citation:** [Relevant rule from CLASSIFICATION_RULES.md or TAXONOMY_STANDARDS.md]
- **Proposed action:** [Move to X.Y | Review | Accept | Fix field]
- **Status:** OPEN
```

Status values: `OPEN` → `IN REVIEW` → `RESOLVED [date]` or `ACCEPTED [date]`

---

## Resolution Process

When a finding is acted on:

1. Update the finding's `**Status:**` line in the batch file.
2. Add a **Resolution note** below the finding:
   ```
   > **Resolution [date]:** [What was done — moved to Cat X.Y / accepted as cross-listing / field corrected / etc.]
   ```
3. If a teaching is moved: run `renumber.js` then `validate-catalog.js`. Both must exit 0.
4. After all findings in a batch are resolved or accepted, update `STATUS.md`.

---

## File Index

| File | Purpose |
|---|---|
| `PLAN.md` | This document — the full validation roadmap |
| `STATUS.md` | Live dashboard — batch progress + finding counts |
| `b0-validate-output.json` | Raw output from `validate-catalog.js` (generated in B0) |
| `b0-audit-output.json` | Raw output from `audit-catalog.js` (generated in B0) |
| `B0-BASELINE.md` | B0 findings summary |
| `B1-OVERRIDES.md` | Global override compliance findings |
| `B2-CATS01-10.md` | Classification findings for categories 1–10 |
| `B3-CATS11-20.md` | Classification findings for categories 11–20 |
| `B4-CATS21-31.md` | Classification findings for categories 21–31 |
| `B5-PARABLES.md` | Parable tag audit findings |
| `B6-TAXONOMY.md` | Taxonomy compliance findings |
