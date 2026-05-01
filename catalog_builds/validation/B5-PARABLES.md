# B5 — Parable Tag Audit

> **Pass 2 completed 04/30/2026.** After Pass 1, the user manually reviewed the canonical list and flagged 4 false positives in `TAG_RULES.md`. Pass 2 applied those removals. See [Pass 2 section](#pass-2--false-positive-resolution-04302026) below.

**Date:** April 30, 2026  
**Catalog state at Pass 1:** 31 categories · 124 subcategories · 666 teachings · 42 parables  
**Catalog state after Pass 2:** 31 categories · 124 subcategories · 666 teachings · **38 parables**  
**Reviewer:** AI agent (catalog-validation skill)  
**Status:** DONE

---

## Summary

| Check | Result | Findings |
|---|---|---|
| A — Count (42 expected) | PASS — 42 tagged | 0 |
| B — Canonical IDs in catalog but untagged | 5 stale IDs (see below) | 5 INFO |
| C — Tagged IDs not on canonical list | 5 shifted IDs (same parables) | 5 INFO (linked to B) |
| D — Placement (subcategory routing) | PASS — all correct | 0 |
| B0 parable-candidate backlog | 1 finding — already FALSE POSITIVE | 0 open |

**Root cause of all findings:** Four `renumber.js` runs executed during B1–B4 resolutions caused IDs to shift for 5 parables. The parable tagging in the catalog is **100% correct**. The `TAG_RULES.md` canonical list carries stale pre-renumber IDs for those 5 entries. No catalog changes are required — only a documentation update to `TAG_RULES.md`.

**Net finding severity: 5 INFO — all resolvable by updating TAG_RULES.md.**

---

## Check A — Tag Count

**Expected:** 42  
**Actual:** 42 ✓  

Pass. No count discrepancy.

---

## Check B — Canonical IDs Missing from Tagged Set

Five IDs from the `TAG_RULES.md` canonical list are not present as tagged teachings in the catalog. For each: the ID either does not exist, or exists but contains different content (a new teaching that acquired that slot after renumbering). In every case, the correct parable has shifted to an adjacent ID.

---

## Check C — Tagged IDs Not on Canonical List

Five tagged teachings carry IDs not listed in the `TAG_RULES.md` canonical list. Each is a correctly-identified canonical parable at its post-renumber ID. Checks B and C are mirror images of the same five ID-drift cases.

---

## Findings

All five findings share the same check type (`B5-ID-DRIFT`), same root cause (renumbering), and same resolution (update `TAG_RULES.md`). They are linked as a group.

---

### F-B5001 — INFO

- **Current catalog ID:** 2.1.11
- **Stale canonical ID:** 2.1.14
- **Location:** The Identity of Jesus Christ > The "I AM" Declarations
- **Teaching:** Contrasts the true shepherd who enters by the door and is known by his sheep — the sheep follow him, and he calls them by name.
- **Reference:** John 10:1–5
- **Check:** B5-ID-DRIFT
- **Description:** `TAG_RULES.md` lists this parable at ID 2.1.14, but the catalog teaching at that position now reads "Promises to lay down his life for the sheep and to gather other sheep not of this fold." The True Shepherd / entering-by-door parable is at 2.1.11. ID shifted because B1 resolution deleted old teaching 2.1.9, causing 2.1.10 onward to renumber down.
- **Rule citation:** TAG_RULES.md canonical list — entry for "True Shepherd vs. Thief (entering by the door)"
- **Proposed action:** Update `TAG_RULES.md` canonical list: change ID `2.1.14` → `2.1.11`
- **Status:** RESOLVED 04/30/2026

> **Resolution 04/30/2026:** TAG_RULES.md canonical list updated — entry for "True Shepherd vs. Thief" corrected from ID 2.1.14 to 2.1.11. Root cause: B1 deletion of old 2.1.9 caused downstream renumbering.

---

### F-B5002 — INFO

- **Current catalog ID:** 2.1.13
- **Stale canonical ID:** 2.1.16
- **Location:** The Identity of Jesus Christ > The "I AM" Declarations
- **Teaching:** The hireling, who is not the shepherd, sees the wolf coming and flees — the wolf scatters the sheep.
- **Reference:** John 10:12–13
- **Check:** B5-ID-DRIFT
- **Description:** `TAG_RULES.md` lists this parable at ID 2.1.16, but that ID no longer exists in the catalog (only 14 teachings in subcat 2.1). The Hireling parable is at 2.1.13. Same B1 renumbering cause as F-B5001.
- **Rule citation:** TAG_RULES.md canonical list — entry for "The Hireling (hired hand flees from the wolf)"
- **Proposed action:** Update `TAG_RULES.md` canonical list: change ID `2.1.16` → `2.1.13`
- **Status:** RESOLVED 04/30/2026

> **Resolution 04/30/2026:** TAG_RULES.md canonical list updated — entry for "The Hireling" corrected from ID 2.1.16 to 2.1.13.

---

### F-B5003 — INFO

- **Current catalog ID:** 5.1.4
- **Stale canonical ID:** 5.1.5
- **Location:** Repentance and Conversion > The Call to Repentance
- **Teaching:** Parable of the barren fig tree — the owner gives one final year to bear fruit or the tree will be cut down.
- **Reference:** Luke 13:6–9
- **Check:** B5-ID-DRIFT
- **Description:** `TAG_RULES.md` lists this parable at ID 5.1.5, but the catalog teaching at that position now reads "Pronounces woe on Chorazin and Bethsaida..." The Barren Fig Tree is at 5.1.4. ID shifted because B1 resolution deleted old teaching 5.1.4 (a different teaching), causing old 5.1.5 to renumber to 5.1.4.
- **Rule citation:** TAG_RULES.md canonical list — entry for "The Barren Fig Tree"
- **Proposed action:** Update `TAG_RULES.md` canonical list: change ID `5.1.5` → `5.1.4`
- **Status:** RESOLVED 04/30/2026

> **Resolution 04/30/2026:** TAG_RULES.md canonical list updated — entry for "The Barren Fig Tree" corrected from ID 5.1.5 to 5.1.4.

---

### F-B5004 — INFO

- **Current catalog ID:** 13.1.2
- **Stale canonical ID:** 13.2.2
- **Location:** Love > Love for God and Neighbor
- **Teaching:** The Good Samaritan — a despised outsider shows mercy to the man left for dead; he is the true neighbor.
- **References:** Luke 10:30–37
- **Check:** B5-ID-DRIFT
- **Description:** `TAG_RULES.md` lists this parable at ID 13.2.2, but that subcat no longer exists as subcat 2 — it is now subcat 1. During B3 resolution, old Cat 13.1 ("Love for God") was deleted and merged into old Cat 13.2 ("Love for God and Neighbor"), which was then renumbered to Cat 13.1. The Good Samaritan, previously at 13.2.2, is now at 13.1.2. Cross-listing at 21.3.2 is unchanged and correct. ✓
- **Rule citation:** TAG_RULES.md canonical list — entry for "The Good Samaritan (Cat 13 entry)"
- **Proposed action:** Update `TAG_RULES.md` canonical list: change ID `13.2.2` → `13.1.2` (and update the Note on cross-listed parables)
- **Status:** RESOLVED 04/30/2026

> **Resolution 04/30/2026:** TAG_RULES.md canonical list updated — Good Samaritan (Cat 13 entry) corrected from ID 13.2.2 to 13.1.2. Cross-list note updated accordingly. Root cause: B3 deletion of Cat 13.1 and renumbering of former Cat 13.2 → 13.1.

---

### F-B5005 — INFO

- **Current catalog ID:** 18.1.3
- **Stale canonical ID:** 18.1.4
- **Location:** Forgiveness and Reconciliation > God's Forgiveness of Sin
- **Teaching:** Two debtors forgiven by a creditor — the one forgiven most loves most; used to explain the woman who anointed Jesus.
- **Reference:** Luke 7:41–43
- **Check:** B5-ID-DRIFT
- **Description:** `TAG_RULES.md` lists this parable at ID 18.1.4, but that ID no longer exists in the catalog (only 3 teachings in subcat 18.1). The Two Debtors is at 18.1.3. During B3 resolution, old teaching 18.1.3 was moved to Cat 18.2, causing old 18.1.4 to renumber to 18.1.3.
- **Rule citation:** TAG_RULES.md canonical list — entry for "Two Debtors"
- **Proposed action:** Update `TAG_RULES.md` canonical list: change ID `18.1.4` → `18.1.3`
- **Status:** RESOLVED 04/30/2026

> **Resolution 04/30/2026:** TAG_RULES.md canonical list updated — "Two Debtors" corrected from ID 18.1.4 to 18.1.3. Root cause: B3 movement of old 18.1.3 to subcat 18.2 caused renumbering.

---

## Check D — Placement Verification

All placement checks pass. Full results:

### Cross-listed parables

| Parable | Location A | Location B | Status |
|---|---|---|---|
| Good Samaritan | 13.1.2 (Love > Love for God and Neighbor) | 21.3.2 (Justice and Mercy > Mercy and Compassion) | ✓ Both present |
| Pharisee and Tax Collector | 15.3.2 (Humility > Parables of Humility) | 24.2.3 (Hypocrisy > Outward vs. Inward Religion) | ✓ Both present |
| Ten Virgins | 4.1.6 (Kingdom > Nature and Character) | 29.3.3 (Eschatology > Readiness and Watchfulness) | ✓ Both present |

### Category routing checks

| Rule | IDs | Status |
|---|---|---|
| Lost-things parables must be in Cat 5, not Cat 4 | 5.2.1, 5.2.2, 5.2.3 | ✓ All Cat 5 |
| Kingdom-value parables must be in Cat 4 | 4.1.1, 4.1.2, 4.1.3 | ✓ All Cat 4 |
| Shepherd discourse parables in Cat 2.1 (I AM) | 2.1.11, 2.1.13 | ✓ Correct — John 10 Good Shepherd discourse |
| Barren Fig Tree in Cat 5.1 (Call to Repentance) | 5.1.4 | ✓ Correct |
| Two Debtors in Cat 18.1 (God's Forgiveness) | 18.1.3 | ✓ Correct |

### All 42 tagged parables — placement table

| ID | Category | Subcategory |
|---|---|---|
| 2.1.11 | The Identity of Jesus Christ | The "I AM" Declarations |
| 2.1.13 | The Identity of Jesus Christ | The "I AM" Declarations |
| 4.1.1 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.1.2 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.1.3 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.1.4 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.1.5 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.1.6 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.1.11 | The Kingdom of God | Nature and Character of the Kingdom |
| 4.2.1 | The Kingdom of God | Growth and Presence of the Kingdom |
| 4.2.2 | The Kingdom of God | Growth and Presence of the Kingdom |
| 4.2.3 | The Kingdom of God | Growth and Presence of the Kingdom |
| 4.2.5 | The Kingdom of God | Growth and Presence of the Kingdom |
| 4.5.1 | The Kingdom of God | Parables of the Kingdom's Judgment |
| 4.5.2 | The Kingdom of God | Parables of the Kingdom's Judgment |
| 4.5.3 | The Kingdom of God | Parables of the Kingdom's Judgment |
| 5.1.4 | Repentance and Conversion | The Call to Repentance |
| 5.2.1 | Repentance and Conversion | Parables of the Lost |
| 5.2.2 | Repentance and Conversion | Parables of the Lost |
| 5.2.3 | Repentance and Conversion | Parables of the Lost |
| 9.3.1 | The New Covenant | New and Old — The Covenant Transition |
| 10.3.2 | Prayer and Communion | Persistence in Prayer |
| 10.3.3 | Prayer and Communion | Persistence in Prayer |
| 13.1.2 | Love | Love for God and Neighbor |
| 14.6.2 | Righteousness and Ethics | The Golden Rule and Two Ways |
| 15.3.1 | Humility and Servanthood | Parables of Humility |
| 15.3.2 | Humility and Servanthood | Parables of Humility |
| 15.3.3 | Humility and Servanthood | Parables of Humility |
| 18.1.3 | Forgiveness and Reconciliation | God's Forgiveness of Sin |
| 18.2.3 | Forgiveness and Reconciliation | Forgiving Others |
| 20.2.1 | Wealth and Generosity | The Danger of Riches |
| 20.3.3 | Wealth and Generosity | Generosity and Stewardship |
| 20.3.4 | Wealth and Generosity | Generosity and Stewardship |
| 20.4.1 | Wealth and Generosity | The Rich Man and Lazarus |
| 21.2.1 | Justice and Mercy | The Judgment of the Nations |
| 21.3.2 | Justice and Mercy | Mercy and Compassion |
| 22.2.4 | Discipleship | Counting the Cost |
| 24.2.3 | Religious Hypocrisy | Outward Versus Inward Religion |
| 29.3.2 | Eschatology and the End Times | Readiness and Watchfulness |
| 29.3.3 | Eschatology and the End Times | Readiness and Watchfulness |
| 29.3.6 | Eschatology and the End Times | Readiness and Watchfulness |
| 29.4.1 | Eschatology and the End Times | The Fig Tree and the Unknown Hour |

---

## B0 Parable-Candidate Backlog

From B0's `audit-catalog.js` run, one parable-candidate finding was logged. Per `B0-BASELINE.md`, it was classified **FALSE POSITIVE** and accepted. No open items remain.

---

## Pass 1 Resolution Actions

1. `TAG_RULES.md` canonical list updated — 5 ID corrections applied (2.1.14→2.1.11, 2.1.16→2.1.13, 5.1.5→5.1.4, 13.2.2→13.1.2, 18.1.4→18.1.3).
2. Cross-list note in TAG_RULES.md updated (Good Samaritan Cat 13 entry now 13.1.2).
3. No catalog (`teachings.json`) changes required.

---

## Pass 2 — False Positive Resolution (04/30/2026)

After Pass 1, the user reviewed the full canonical parable list in `TAG_RULES.md` and added a **False Positive** column, marking 4 teachings as false positives. Pass 2 applied those determinations.

### False Positives Identified by User Review

| ID | Title | Reason |
|---|---|---|
| 2.1.11 | True Shepherd vs. Thief | Extended metaphor embedded in the I AM / Good Shepherd declaration (John 10:1–5); primary theological function is identity claim, not standalone figurative narrative |
| 2.1.13 | The Hireling | Same discourse as 2.1.11; figurative contrast within the I AM declaration; fails "self-contained meaning" criterion when separated from John 10 context |
| 20.4.1 | The Rich Man and Lazarus | Eschatological narrative presented as a literal account of afterlife realities; fails "figurative intent" criterion — the story is not meant to stand for something else |
| 21.2.1 | The Sheep and the Goats | Final judgment scene framed as a literal eschatological event (not a comparison — "as a shepherd separates" is a simile introducing a literal scene); fails "figurative intent" criterion |

### Pass 2 Checks

| Check | Result |
|---|---|
| A — Count (38 expected after removal) | PASS — 38 tagged ✓ |
| B — Canonical IDs present and tagged | PASS — all 38 present and tagged ✓ |
| C — No unexpected tags | PASS — no extra parable tags ✓ |
| D — Placement (cross-lists and routing) | PASS — all 38 correctly placed ✓ |
| validate-catalog.js | PASS — no errors or warnings ✓ |

### Pass 2 Actions Taken

1. `teachings.json` — `"parable"` tag removed from 4 teachings: 2.1.11, 2.1.13, 20.4.1, 21.2.1.
   - 2.1.11 tags: `["parable","i-am"]` → `["i-am"]`
   - 2.1.13 tags: `["parable","i-am"]` → `["i-am"]`
   - 20.4.1 tags: `["parable"]` → `[]`
   - 21.2.1 tags: `["parable"]` → `[]`
2. `TAG_RULES.md` canonical list updated — count 42 → 38; False Positive column removed; 4 removed entries moved to new "Removed from Canonical List" section with stated rationale.
3. `validate-catalog.js` passed clean. Catalog: 666 teachings · 38 parables.

**B5 status: DONE** — all findings resolved; canonical parable count is 38.
