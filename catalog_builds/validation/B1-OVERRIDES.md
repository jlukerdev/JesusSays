# B1 — Global Override Compliance
**Run date:** April 29, 2026  
**Catalog snapshot:** 683 teachings · 126 subcategories · 31 categories  
**Checks performed:** G-1 (John 17 ↔ Cat 12), G-2 (Passion scope ↔ Cat 27), G-4 (Rev 1–3 ↔ Cat 31)  
**Findings:** 24 total (16 errors, 0 warnings, 8 reviews, 0 info)

> **Note on G-2 scope:** The G-2 rule was revised on 2026-04-29 (see `catalog_builds/audit/reclassify_plan_04292026.md`). The rule is now **event-bound**, not a temporal sweep: only utterances during active Passion events (institution of Lord's Supper, betrayal/denial predictions at table, Gethsemane, arrest, trials, crucifixion) must go to Cat 27. Composite teachings whose primary refs are pre-Passion ministry but include incidental Passion-scope cross-references are rated REVIEW rather than ERROR.

---

## G-1 Check: John 17 ↔ Cat 12 (High Priestly Prayer)

**Methodology:**
- Forward: every teaching with any John 17 reference must be in Cat 12.
- Reverse: every teaching in Cat 12 must have at least one John 17 reference.

**Reverse check result:** PASS — all 15 teachings in Cat 12 reference John 17.

**Forward check result:** 3 ERRORs found.

---

### F-B1001 — ERROR

- **Teaching ID:** 2.4.3
- **Location:** The Identity of Jesus Christ > His Pre-existence and Divine Origin
- **Reference(s):** John 17:5
- **Check:** B1-G1-Forward
- **Description:** Teaching references John 17:5 ("Father, glorify me with the glory I had with you before the world began") but is classified in Cat 2, not Cat 12. John 17 is a hard-capture rule with no exceptions.
- **Rule citation:** G-1: Every teaching that references John 17 in any verse must be in Cat 12 (High Priestly Prayer).
- **Proposed action:** Move to Cat 12 (appropriate subcategory: 12.1 — Personal Petitions, vv. 1–5).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 2.4.3 to Cat 12.1. New ID: **12.1.3**.

---

### F-B1002 — ERROR

- **Teaching ID:** 6.3.1
- **Location:** Salvation and Eternal Life > Eternal Life — Its Nature and Assurance
- **Reference(s):** John 17:3
- **Check:** B1-G1-Forward
- **Description:** Teaching references John 17:3 ("This is eternal life, that they know you, the only true God…") but is classified in Cat 6, not Cat 12. The eternal-life content of John 17:3 is incidental — the verse is part of the High Priestly Prayer and covered by G-1.
- **Rule citation:** G-1: Every teaching that references John 17 in any verse must be in Cat 12.
- **Proposed action:** Move to Cat 12 (appropriate subcategory: 12.1 — Personal Petitions, vv. 1–5).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 6.3.1 to Cat 12.1. New ID: **12.1.4**.

---

### F-B1003 — ERROR

- **Teaching ID:** 25.4.1
- **Location:** The Church > Unity Among Believers
- **Reference(s):** John 17:21–23
- **Check:** B1-G1-Forward
- **Description:** Teaching references John 17:21–23 ("That they may all be one, as you, Father, are in me…") but is classified in Cat 25, not Cat 12. Unity among believers is a significant theme in this verse, but G-1 is a hard override with no topical exceptions.
- **Rule citation:** G-1: Every teaching that references John 17 in any verse must be in Cat 12.
- **Proposed action:** Move to Cat 12 (appropriate subcategory: 12.3 — Intercession for All Believers, vv. 20–26).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 25.4.1 to Cat 12.3. New ID: **12.3.4**.

---

## G-2 Check: Passion Scope ↔ Cat 27 (Passion Narrative)

**Passion scope (per current CLASSIFICATION_RULES.md):**
- Matt 26–27 / Mark 14–15 / Luke 22–23 / John 18–19
- Event-bound: institution of Lord's Supper, betrayal/denial predictions at table, Gethsemane, arrest, trials, crucifixion
- Exception: Farewell Discourse (John 13–16) classified topically

**Reverse check result:** PASS — all teachings in Cat 27 reference Passion scope passages. No non-Passion content detected in Cat 27.

**Forward check result:** 12 findings (8 ERRORs, 4 REVIEWs).

---

### F-B1004 — ERROR

- **Teaching ID:** 2.6.1
- **Location:** The Identity of Jesus Christ > His Messianic Identity
- **Reference(s):** Matt 26:64; Mark 14:62; Luke 22:67–70
- **Check:** B1-G2-Forward
- **Description:** Teaching is Jesus's declaration to the high priest at trial — "I AM the Christ, the Son of God, coming on the clouds in power." These references are squarely within the trial Passion event (Matt 26 / Mark 14 / Luke 22). Must be in Cat 27.
- **Rule citation:** G-2: Utterances spoken during the active events of the Passion (trials) belong to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.3 — The Trials).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 2.6.1 to Cat 27.3. New ID: **27.3.7**.

---

### F-B1005 — ERROR

- **Teaching ID:** 4.1.12
- **Location:** The Kingdom of God > Nature and Character of the Kingdom
- **Reference(s):** John 18:36
- **Check:** B1-G2-Forward
- **Description:** Teaching is Jesus's statement to Pilate: "My kingdom is not of this world — otherwise my servants would fight." John 18:36 is a direct trial utterance (Passion event). Must be in Cat 27.
- **Rule citation:** G-2: Utterances spoken during the active events of the Passion (trials) belong to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.3 — The Trials).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 4.1.12 to Cat 27.3. New ID: **27.3.8**.

---

### F-B1006 — ERROR

- **Teaching ID:** 9.1.1
- **Location:** The New Covenant > Institution of the Lord's Supper
- **Reference(s):** Luke 22:15–16
- **Check:** B1-G2-Forward
- **Description:** Teaching is Jesus's opening words at the Last Supper ("I longed to share this Passover before my suffering…"). Luke 22:15–16 is the institution of the Lord's Supper, which G-2 explicitly names as a Passion event.
- **Rule citation:** G-2: The institution of the Lord's Supper belongs to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.1 — The Last Supper).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 9.1.1 to Cat 27.1. New ID: **27.1.11**.

---

### F-B1007 — ERROR

- **Teaching ID:** 9.1.2
- **Location:** The New Covenant > Institution of the Lord's Supper
- **Reference(s):** Matt 26:26–27; Mark 14:22; Luke 22:17, 19; 1 Cor 11:24
- **Check:** B1-G2-Forward
- **Description:** "Take and eat — this is my body given for you." The bread-breaking words of institution. Matt 26:26–27 / Mark 14:22 / Luke 22:17, 19 are Passion scope references. G-2 explicitly names the institution of the Lord's Supper.
- **Rule citation:** G-2: The institution of the Lord's Supper belongs to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.1 — The Last Supper).
- **Status:** ACCEPTED (NO) 2026-04-29

> **Resolution 2026-04-29:** Approver elected to keep 9.1.2 in Cat 9 (New Covenant). The Eucharistic institution words are retained in Cat 9 for theological coherence. G-2 violation accepted by catalog owner.

---

### F-B1008 — ERROR

- **Teaching ID:** 9.1.3
- **Location:** The New Covenant > Institution of the Lord's Supper
- **Reference(s):** Matt 26:28; Mark 14:24; Luke 22:20; 1 Cor 11:25
- **Check:** B1-G2-Forward
- **Description:** "This cup is my blood of the covenant — the new covenant in my blood." The cup-blessing words of institution. Matt 26:28 / Mark 14:24 / Luke 22:20 are Passion scope. G-2 explicitly names the Lord's Supper institution.
- **Rule citation:** G-2: The institution of the Lord's Supper belongs to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.1 — The Last Supper).
- **Status:** ACCEPTED (NO) 2026-04-29

> **Resolution 2026-04-29:** Approver elected to keep 9.1.3 in Cat 9 (New Covenant). G-2 violation accepted by catalog owner.

---

### F-B1009 — ERROR

- **Teaching ID:** 9.1.4
- **Location:** The New Covenant > Institution of the Lord's Supper
- **Reference(s):** Matt 26:29; Mark 14:25; Luke 22:18
- **Check:** B1-G2-Forward
- **Description:** "I will not drink of the fruit of the vine again until I drink it new in the Father's kingdom." Matt 26:29 / Mark 14:25 / Luke 22:18 are Passion scope references at the Last Supper.
- **Rule citation:** G-2: The institution of the Lord's Supper belongs to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.1 — The Last Supper).
- **Status:** ACCEPTED (NO) 2026-04-29

> **Resolution 2026-04-29:** Approver elected to keep 9.1.4 in Cat 9 (New Covenant). G-2 violation accepted by catalog owner.

---

### F-B1010 — ERROR

- **Teaching ID:** 10.5.2
- **Location:** Prayer and Communion > Corporate Prayer and Watchfulness
- **Reference(s):** Matt 26:36, 38–42, 45–46; Mark 14:32, 34, 36–38, 41–42; Luke 22:40, 42, 46
- **Check:** B1-G2-Forward
- **Description:** Gethsemane prayer scene ("Watch and pray… the spirit is willing but the flesh is weak"). All references are Matt 26 / Mark 14 / Luke 22 — the Gethsemane event, which G-2 explicitly names as a Passion event.
- **Rule citation:** G-2: Gethsemane belongs to Cat 27.
- **Proposed action:** Move to Cat 27 (appropriate subcategory: 27.2 — Gethsemane).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 10.5.2 to Cat 27.2. New ID: **27.2.7**.

---

### F-B1011 — REVIEW

- **Teaching ID:** 15.1.1
- **Location:** Humility and Servanthood > The Nature of Greatness in the Kingdom
- **Reference(s):** Matt 20:21–23, 25–27; Mark 10:38–40, 42–44; Matt 20:16; Mark 10:31; Luke 13:30; Luke 22:25–26
- **Check:** B1-G2-Forward
- **Description:** Composite teaching on kingdom greatness. Primary refs (Matt 20 / Mark 10) are from pre-Passion ministry. Luke 22:25–26 (Last Supper dispute about greatness) is a Passion scope ref but is a synoptic parallel to the same teaching already captured from Matthew and Mark. Primary theological frame is topical (kingdom humility), not Passion event.
- **Rule citation:** G-2 (event-bound): primary frame determines classification when a composite spans both ministry and Passion contexts.
- **Proposed action:** REVIEW — determine if Luke 22:25–26 is the primary ref or a parallel citation to an earlier teaching. If Luke 22:25–26 can be considered a cross-reference to the ministry teaching (Matt 20 / Mark 10) rather than a distinct Last Supper event, classification in Cat 15 may be acceptable. If Luke 22:25–26 is treated as a distinct Passion event utterance, split into separate teachings.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed Luke 22:25–26 from 15.1.1 refs. Created new teaching **27.1.12** in Cat 27.1 for the Last Supper dispute over greatness (Luke 22:25–26).

---

### F-B1012 — REVIEW

- **Teaching ID:** 15.2.1
- **Location:** Humility and Servanthood > Jesus as the Servant Model
- **Reference(s):** Matt 20:28; Mark 10:45; Luke 22:27
- **Check:** B1-G2-Forward
- **Description:** Composite servant-model teaching. Matt 20:28 / Mark 10:45 are pre-Passion ministry refs ("Son of Man came to serve and give his life as a ransom"). Luke 22:27 ("I am among you as one who serves") is a Last Supper utterance (Passion scope) that parallels the same theme. Cross-period composite.
- **Rule citation:** G-2 (event-bound): primary frame is topical servanthood (ministry context); Luke 22:27 is a supporting parallel.
- **Proposed action:** REVIEW — if Luke 22:27 is treated as a cross-reference parallel to Matt 20:28 / Mark 10:45, classification in Cat 15 is defensible. If treated as a distinct Passion event utterance, remove Luke 22:27 and create a separate teaching in Cat 27.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed Luke 22:27 from 15.2.1 refs; updated text to "The Son of Man came not to be served but to serve and give his life as a ransom for many." Created new teaching **27.1.13** in Cat 27.1 for the Last Supper servant declaration (Luke 22:27).

---

### F-B1013 — ERROR

- **Teaching ID:** 18.2.4
- **Location:** Forgiveness and Reconciliation > Forgiving Others
- **Reference(s):** Luke 23:34
- **Check:** B1-G2-Forward
- **Description:** "Father, forgive them, for they know not what they do." Luke 23:34 is the crucifixion — an active Passion event. CLASSIFICATION_RULES.md explicitly directs this to Cat 27.4.
- **Rule citation:** G-2 + explicit CLASSIFICATION_RULES.md routing note: "Forgiveness from the cross ('Father, forgive them') → Cat 27 per G-2."
- **Proposed action:** Move to Cat 27.4 (Words from the Cross).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Teaching 18.2.4 was already present in Cat 27 as 27.4.1 (pre-existing, richer description). The Cat 18 duplicate was removed. Authoritative location: **27.4.1**.

---

### F-B1014 — REVIEW

- **Teaching ID:** 16.3.1
- **Location:** Truth and Integrity > Jesus as Truth
- **Reference(s):** John 14:6; John 18:37
- **Check:** B1-G2-Forward
- **Description:** Cross-period composite: John 14:6 ("I am the way, the truth, and the life") is Farewell Discourse (pre-Passion), John 18:37 ("I came to bear witness to the truth") is from Jesus's trial before Pilate (Passion scope). Primary theological frame is "Jesus as truth" — a topical identity claim that spans both contexts.
- **Rule citation:** G-2 (event-bound): the Farewell Discourse is explicitly exempt; John 18:37 alone might not define the primary frame if it functions as a supporting parallel.
- **Proposed action:** REVIEW — determine whether John 18:37 is the primary frame (→ split and move Passion part to Cat 27.3) or a supporting ref that elaborates the John 14:6 truth claim (→ Cat 16 acceptable). Note that John 14:6 is already cross-listed in Cat 2 and Cat 6 (see DUP-001 from B0).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed John 18:37 from 16.3.1 refs; updated text to "Declares himself the way, the truth, and the life — no one comes to the Father except through him." Created new teaching **27.3.9** in Cat 27.3 for the truth-witness declaration before Pilate (John 18:37).

---

### F-B1015 — REVIEW

- **Teaching ID:** 19.3.3
- **Location:** Marriage and Family > Family Relationships and Kingdom Priority
- **Reference(s):** Matt 19:29; Mark 10:29–30; Luke 18:29–30; Luke 22:28–32
- **Check:** B1-G2-Forward
- **Description:** Composite family/kingdom teaching. Primary refs (Matt 19:29 / Mark 10:29–30 / Luke 18:29–30) are pre-Passion ministry. Luke 22:28–32 ("You are those who have stayed with me in my trials…") is a Last Supper utterance (Passion scope) but constitutes a distinct saying (the apostle-commission/throne promise) rather than a parallel to the Matt 19 / Mark 10 / Luke 18 content.
- **Rule citation:** G-2 (event-bound): Luke 22:28–32 may be a distinct Passion event utterance bundled into this composite.
- **Proposed action:** REVIEW — Luke 22:28–32 appears to be a distinct saying about apostolic thrones (not a parallel to Matt 19:29 / Mark 10:29–30). Consider splitting Luke 22:28–32 into a separate teaching in Cat 27. The remainder (Matt 19:29 / Mark 10 / Luke 18) stays in Cat 19.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed Luke 22:28–32 from 19.3.3 refs. Created new teaching **27.1.14** in Cat 27.1 for the apostolic throne promise and Peter warning (Luke 22:28–32).

---

## G-4 Check: Rev 1–3 ↔ Cat 31 (Seven Churches of Revelation)

**Methodology:**
- Forward: every teaching with any Rev 1–3 reference must be in Cat 31.
- Reverse: every teaching in Cat 31 must have at least one Rev 1–3 reference.

**Reverse check result:** PASS — all teachings in Cat 31 reference Rev 1–3.

**Forward check result:** 9 findings (5 ERRORs, 4 REVIEWs).

---

### F-B1016 — ERROR

- **Teaching ID:** 2.1.9
- **Location:** The Identity of Jesus Christ > The "I AM" Declarations
- **Reference(s):** Rev 1:17–18
- **Check:** B1-G4-Forward
- **Description:** "I AM the First and the Last, the Living One — dead, and behold alive forevermore." Rev 1:17–18 is a Rev 1–3 reference. Teaching is in Cat 2, not Cat 31. Note: B0-BASELINE.md (DUP-002) identified this as a cross-listing with 31.1.2 — that cross-listing itself may be the issue. The teaching exists in both Cat 2 and Cat 31; G-4 means Cat 31 is the authoritative location.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** Resolve DUP-002: Cat 31 (31.1.2) is the authoritative location per G-4. Cat 2 (2.1.9) should be removed or converted to a cross-reference note, not a full duplicate teaching.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Deleted teaching 2.1.9 from Cat 2. DUP-002 resolved. Authoritative location: **31.1.2** (unchanged).

---

### F-B1017 — ERROR

- **Teaching ID:** 2.1.11
- **Location:** The Identity of Jesus Christ > The "I AM" Declarations
- **Reference(s):** Rev 1:8
- **Check:** B1-G4-Forward
- **Description:** "I AM the Alpha and the Omega, the beginning and the end." Rev 1:8 is a Rev 1 reference. Teaching is in Cat 2, not Cat 31. G-4 applies.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** Move to Cat 31 (appropriate subcategory: 31.1 — Introduction / Vision of Christ). Remove from Cat 2.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Moved teaching from Cat 2.1.11 to Cat 31.1. New ID: **31.1.4**.

---

### F-B1018 — REVIEW

- **Teaching ID:** 2.3.4
- **Location:** The Identity of Jesus Christ > His Divine Authority and Mission
- **Reference(s):** Luke 12:49; Matt 10:34; Rev 2:23
- **Check:** B1-G4-Forward
- **Description:** Composite teaching on Jesus's mission ("I came to bring fire/division"). Primary refs are Luke 12:49 and Matt 10:34 (pre-Passion ministry). Rev 2:23 ("I am he who searches minds and hearts and will give to each according to deeds") is a Seven Churches letter verse included as a supporting cross-reference to divine judgment authority. Rev 2:23 is a distinct saying rather than a parallel to Luke 12:49 / Matt 10:34.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31. However, composite teachings including incidental Rev cross-references need judgment.
- **Proposed action:** REVIEW — determine if Rev 2:23 is included as a genuine parallel (unlikely — it's a distinct saying) or as a cross-reference annotation. If a distinct saying, split it out into Cat 31. If incidental cross-reference annotation, remove from references array and the G-4 finding resolves without a teaching move.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed Rev 2:23 from 2.3.4 refs; updated text to "He came to cast fire on the earth — not peace but a sword." Rev 2:23 content is already covered by 31.5.1 (Thyatira letter, Rev 2:19–23 range); no new teaching needed in Cat 31.

---

### F-B1019 — REVIEW

- **Teaching ID:** 5.1.4
- **Location:** Repentance and Conversion > The Call to Repentance
- **Reference(s):** Rev 2:5, 16, 21; Rev 3:3, 19
- **Check:** B1-G4-Forward
- **Description:** Teaching on the call to repent. Rev 2–3 calls to repentance (to the churches at Ephesus, Pergamon, Thyatira, Sardis, Laodicea) are listed as references alongside each other — but there is no primary ministry-era reference. All refs are from Rev 2–3. This teaching may belong entirely in Cat 31, not Cat 5.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** REVIEW — if all refs are Rev 2–3 calls to repentance, this teaching should be in Cat 31 (31.x — Calls to Repentance within the Seven Letters). The Cat 5 classification may be incorrect.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Deleted teaching 5.1.4. Repentance calls from Rev 2–3 are already individually covered in Cat 31 letter subcategories (31.2.1 Ephesus, 31.4.1 Pergamum, 31.5.1 Thyatira, 31.6.1 Sardis, 31.8.1 Laodicea). No net loss of content.

---

### F-B1020 — REVIEW

- **Teaching ID:** 5.3.2
- **Location:** Repentance and Conversion > The Invitation to Come
- **Reference(s):** John 6:37; Rev 3:20
- **Check:** B1-G4-Forward
- **Description:** "Whoever comes to me I will not cast out" (John 6:37) + "Behold, I stand at the door and knock" (Rev 3:20). Cross-period composite. John 6:37 is a ministry-era invitation teaching; Rev 3:20 is the Seven Churches letter to Laodicea — an invitation saying that parallels the ministry theme.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31. However, Rev 3:20 also has strong parallels to pre-ministry invitation themes.
- **Proposed action:** REVIEW — Rev 3:20 ("behold I stand at the door and knock") is a Seven Churches utterance that parallels the invitation theme of Cat 5. Determine whether to: (a) remove Rev 3:20 from this teaching and add a separate Cat 31 teaching for it, or (b) keep as a composite cross-listing. G-4 technically requires it to be in Cat 31; verify if Rev 3:20 already appears in Cat 31.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Removed Rev 3:20 from 5.3.2 refs; updated text to "Promises that all whom the Father gives him will come to him, and whoever comes he will never cast out." Rev 3:20 is already covered by **31.8.2** (Laodicea letter). No new teaching needed in Cat 31.

---

### F-B1021 — ERROR

- **Teaching ID:** 17.1.1
- **Location:** Wisdom and Discernment > Hearing and Perceiving Spiritually
- **Reference(s):** Matt 11:15; Matt 13:9, 43; Mark 4:9, 23; Luke 8:8; Luke 14:35; Rev 2:7, 11, 17, 29; Rev 3:6, 13, 22
- **Check:** B1-G4-Forward
- **Description:** Teaching on the "he who has ears to hear, let him hear" formula. Ministry-era refs (Matt/Mark/Luke) are the primary occurrences; Rev 2–3 occurrences are the same formula repeated in each of the Seven Letters. The Rev 2–3 references are not incidental — they constitute half the references and represent a distinct body of utterances in Rev 1–3.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** ERROR — the "ears to hear" formula in Rev 2–3 is a significant body of Rev 1–3 content. Consider splitting: (a) ministry-era "ears to hear" stays in Cat 17.1.1, (b) Seven Letters "ears to hear" repetitions go to Cat 31 as a separate teaching. If kept composite, must move to Cat 31 per G-4.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed all Rev 2–3 refs from 17.1.1; updated text to "He who has ears to hear, let him hear — a call to spiritual attention repeated throughout his ministry." Created new teaching **31.1.5** in Cat 31.1 for the Seven Letters formula (Rev 2:7, 11, 17, 29; Rev 3:6, 13, 22).

---

### F-B1022 — ERROR

- **Teaching ID:** 22.4.1
- **Location:** Discipleship > Remaining Faithful to the End
- **Reference(s):** Matt 10:22; Matt 24:13; Mark 13:13; Rev 2:10
- **Check:** B1-G4-Forward
- **Description:** Teaching on perseverance/faithfulness. Primary refs (Matt 10:22, Matt 24:13, Mark 13:13) are ministry-era. Rev 2:10 ("Be faithful unto death and I will give you the crown of life") is the Smyrna letter — a Passion-scope promise that functionally parallels but is a distinct utterance.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** ERROR — Rev 2:10 is a distinct promise from the Seven Churches letters. Split: remove Rev 2:10 from 22.4.1 and ensure it exists as a teaching in Cat 31. If it is already there, just remove the Rev 2:10 cross-reference from 22.4.1.
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** SPLIT. Removed Rev 2:10 from 22.4.1 refs; updated text to "Promises that those who endure to the end will be saved." Rev 2:10 ("Be faithful unto death and I will give you the crown of life") is already covered by **31.3.1** (Smyrna letter, Rev 2:9–10). No new teaching needed in Cat 31.

---

### F-B1023 — ERROR

- **Teaching ID:** 22.4.2
- **Location:** Discipleship > Remaining Faithful to the End
- **Reference(s):** Rev 2:25; Rev 3:11
- **Check:** B1-G4-Forward
- **Description:** Teaching refs are entirely Rev 2:25 and Rev 3:11 — no ministry-era refs. This teaching is entirely sourced from Rev 1–3 (Thyatira letter: "hold fast until I come"; Philadelphia letter: "hold fast what you have"). Must be in Cat 31.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** Move entirely to Cat 31 (appropriate subcategory matching Thyatira/Philadelphia letters).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Deleted teaching 22.4.2. Content (Rev 2:25 + Rev 3:11 "hold fast" directives) is already individually covered in Cat 31: **31.5.2** (Thyatira, Rev 2:25–28) and **31.7.2** (Philadelphia, Rev 3:11–12). No net loss of content.

---

### F-B1024 — ERROR

- **Teaching ID:** 22.4.3
- **Location:** Discipleship > Remaining Faithful to the End
- **Reference(s):** Rev 2:7, 17, 26; Rev 3:5, 12, 21
- **Check:** B1-G4-Forward
- **Description:** Teaching refs are entirely Rev 2–3 overcomers' promises — all seven letters' "to him who overcomes" promises. No ministry-era refs. Must be in Cat 31.
- **Rule citation:** G-4: Every teaching referencing Rev 1–3 must be in Cat 31.
- **Proposed action:** Move entirely to Cat 31 (appropriate subcategory for the Seven Letters overcomers' promises).
- **Status:** RESOLVED 2026-04-29

> **Resolution 2026-04-29:** Deleted teaching 22.4.3. All overcomer promises (Rev 2:7, 17, 26; Rev 3:5, 12, 21) are already individually covered across Cat 31 letter subcategories: **31.2.2**, **31.4.2**, **31.5.2**, **31.6.2**, **31.7.2**, **31.8.2**. No net loss of content.

---

## Summary

| Check | Pass/Fail | ERRORs | REVIEWs | WARNINGs | INFOs |
|---|---|---|---|---|---|
| G-1 Forward | FAIL | 3 | 0 | 0 | 0 |
| G-1 Reverse | PASS | 0 | 0 | 0 | 0 |
| G-2 Forward | FAIL | 8 | 4 | 0 | 0 |
| G-2 Reverse | PASS | 0 | 0 | 0 | 0 |
| G-4 Forward | FAIL | 5 | 4 | 0 | 0 |
| G-4 Reverse | PASS | 0 | 0 | 0 | 0 |
| **Total** | | **16** | **8** | **0** | **0** |

**B1 status:** DONE — all findings resolved or accepted (2026-04-29)  
**validate-catalog.js:** ✓ PASSED — 683 teachings, 126 subcategories, 31 categories

### Open ERROR findings requiring catalog changes:

| Finding | Teaching | Issue | Approver Decision |
|---|---|---|---|
| F-B1001 | 2.4.3 | John 17:5 in Cat 2 — move to Cat 12.1 |yes|
| F-B1002 | 6.3.1 | John 17:3 in Cat 6 — move to Cat 12.1 |yes|
| F-B1003 | 25.4.1 | John 17:21–23 in Cat 25 — move to Cat 12.3 |yes|
| F-B1004 | 2.6.1 | Trial declaration (Matt 26:64 etc.) in Cat 2 — move to Cat 27.3 |yes|
| F-B1005 | 4.1.12 | John 18:36 (Pilate) in Cat 4 — move to Cat 27.3 |yes|
| F-B1006 | 9.1.1 | Lord's Supper opening (Luke 22:15–16) in Cat 9 — move to Cat 27.1 |yes|
| F-B1007 | 9.1.2 | Bread of institution (Matt 26:26–27 etc.) in Cat 9 — move to Cat 27.1 |no|
| F-B1008 | 9.1.3 | Cup of institution (Matt 26:28 etc.) in Cat 9 — move to Cat 27.1 |no|
| F-B1009 | 9.1.4 | Kingdom pledge (Matt 26:29 etc.) in Cat 9 — move to Cat 27.1 |no|
| F-B1010 | 10.5.2 | Gethsemane prayer (Matt 26:36 etc.) in Cat 10 — move to Cat 27.2 |yes|
| F-B1013 | 18.2.4 | "Father, forgive them" (Luke 23:34) in Cat 18 — move to Cat 27.4 |yes|
| F-B1016 | 2.1.9 | Rev 1:17–18 in Cat 2 (cross-list of 31.1.2) — resolve DUP-002; remove from Cat 2 |yes|
| F-B1017 | 2.1.11 | Rev 1:8 in Cat 2 — move to Cat 31.1 |yes|
| F-B1021 | 17.1.1 | Rev 2–3 "ears to hear" in Cat 17 — split or move to Cat 31 |split|
| F-B1022 | 22.4.1 | Rev 2:10 in Cat 22 — split Rev 2:10 to Cat 31 |split|
| F-B1023 | 22.4.2 | All refs Rev 2–3 in Cat 22 — move to Cat 31 |yes|
| F-B1024 | 22.4.3 | All refs Rev 2–3 in Cat 22 — move to Cat 31 |yes|

### Open REVIEW findings requiring judgment:

| Finding | Teaching | Issue | Approver Decision |
|---|---|---|---|
| F-B1011 | 15.1.1 | Luke 22:25–26 parallel to ministry teaching — split or accept |split|
| F-B1012 | 15.2.1 | Luke 22:27 parallel to Matt 20:28 / Mark 10:45 — split or accept |split|
| F-B1014 | 16.3.1 | John 18:37 + John 14:6 composite — split or accept |split|
| F-B1015 | 19.3.3 | Luke 22:28–32 distinct saying bundled with Matt 19 / Mark 10 — split or accept |split|
| F-B1018 | 2.3.4 | Rev 2:23 distinct saying in Cat 2 composite — split or remove |split|
| F-B1019 | 5.1.4 | All refs Rev 2–3 calls to repent — may need full move to Cat 31 |delete 5.1.4|
| F-B1020 | 5.3.2 | Rev 3:20 + John 6:37 composite — split or verify Rev 3:20 in Cat 31 |remove ref from 5.3.2|
