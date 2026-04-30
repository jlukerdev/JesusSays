# B0 — Baseline Snapshot
**Run date:** April 29, 2026
**Catalog snapshot:** 683 teachings · 126 subcategories · 31 categories · 42 parables
**Checks performed:** validate-catalog.js (structural lint), audit-catalog.js (quality audit), parse-catalog.js --stats
**Findings:** 3 total (0 errors, 0 warnings, 0 reviews, 3 info)

---

## 1. Validate-Catalog.js Result

**Status: PASSED — exit code 0**

| Field | Result |
|---|---|
| Errors | 0 |
| Warnings | 0 |
| Passed | true |

No structural errors. B1 is unblocked and may proceed.

---

## 2. Audit-Catalog.js Findings

### 2.1 Structural Issues

No `empty-text`, `short-text`, `missing-quote`, `empty-quote`, or `no-references` findings. Catalog is structurally clean.

---

### 2.2 Duplicate-Text Findings

Two duplicate-text findings were flagged. Both involve cross-category entries of the same verse. Full resolution (true duplicate vs. legitimate cross-listing) deferred to **B6**.

---

#### DUP-001 — Teaching 6.2.2 vs. 2.1.6

- **Teaching 6.2.2:** "I am the way, the truth, and the life — no one comes to the Father except through me"  
  Location: Salvation and Eternal Life > Faith as the Condition of Salvation  
  Reference: John 14:6

- **Teaching 2.1.6:** "I AM the way, the truth, and the life — no one comes to the Father except through me"  
  Location: Identity of Jesus Christ > subcategory (Cat 2)  
  References: John 14:6; John 14:4

**Notes:** Both teach from John 14:6. The text fields differ only in capitalization of "I AM" vs. "I am." These are in different categories (Cat 2 Identity, Cat 6 Salvation) which have distinct theological scopes. This appears to be an **intentional cross-listing** — John 14:6 legitimately serves both categories. Defer to B6 for final classification.

---

#### DUP-002 — Teaching 31.1.2 vs. 2.1.9

- **Teaching 31.1.2:** "I AM the First and the Last, the Living One — dead, and behold alive forevermore; I hold the keys of death and Hades"  
  Location: The Seven Churches > Introduction to the Seven Churches — The Vision of Christ  
  Reference: Rev 1:17–18

- **Teaching 2.1.9:** "I AM the First and the Last, the Living One — dead, and behold alive forevermore; I hold the keys of death and Hades"  
  Location: Identity of Jesus Christ > subcategory (Cat 2)  
  Reference: Rev 1:17–18

**Notes:** Both text and quote fields are identical. Rev 1:17–18 is governed by the G-4 Global Override rule (Rev 1–3 → Cat 31), but also serves as a primary "I AM" declaration fitting Cat 2. This appears to be an **intentional cross-listing**. Defer to B6 for final classification.

---

### 2.3 Parable-Candidate Findings

One parable-candidate was flagged by audit-catalog.js. Cross-referenced against TAG_RULES.md.

---

#### PAR-001 — Teaching 29.2.2 — FALSE POSITIVE

- **Location:** Eschatology and the End Times > The Return of the Son of Man  
- **Audit message:** "Teaching text signals a parable but lacks the 'parable' tag: 'As lightning flashes from east to west, so will his coming be — as sudden and un'"
- **Canonical list check:** Teaching ID 29.2.2 is **not** in the canonical 42-parable reference list.
- **Definition check:** TAG_RULES.md explicitly categorizes this form under "Exclude: Direct Predictions or Commands":
  > "The Son of Man will come like lightning from east to west" — eschatological metaphor, NOT a parable.

**Verdict: FALSE POSITIVE.** The "As…so" construction is a metaphorical comparison, not a narrative parable. No tag should be added. No action required.

---

## 3. Catalog Stats

| Metric | Count |
|---|---|
| Categories | 31 |
| Subcategories | 126 |
| Teachings | 683 |
| Parables (tagged) | 42 |

---

## 4. Summary

| Finding Type | Count | Action |
|---|---|---|
| Validate errors (blocking) | 0 | None — B1 unblocked |
| Validate warnings | 0 | None |
| Duplicate-text | 2 | Defer to B6 for true-dup vs. cross-listing determination |
| Parable-candidate | 1 | FALSE POSITIVE — no action |

**B0 Pass Criterion Met:** `validate-catalog.js` exited 0. No blocking errors. B1 may proceed.
