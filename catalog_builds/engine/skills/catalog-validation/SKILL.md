---
name: catalog-validation
description: >
  Interactive skill for executing the Jesus Says catalog validation plan. Runs structured batch reviews of all 683 teachings against CLASSIFICATION_RULES.md and TAXONOMY_STANDARDS.md. Supports multi-session progress tracking via STATUS.md. Use this skill when running, continuing, or completing any validation batch (B0–B6).
---

# Catalog Validation Skill

**Skill name:** `catalog-validation`  
**Depends on:** `catalog_builds/engine/skills/catalog-engine/SKILL.md` (load for any catalog write operations that result from resolved findings)  
**Plan file:** `catalog_builds/validation/PLAN.md`  
**Status dashboard:** `catalog_builds/validation/STATUS.md`

---

## Overview

This skill executes the validation plan in `PLAN.md` interactively. Batches are designed to run in one or more sessions; STATUS.md tracks progress across runs.

**Rule of thumb:** Automated checks (script execution) are handled by this skill directly. Classification judgment calls (B2–B4) require reading each teaching and applying `CLASSIFICATION_RULES.md` — that work happens in conversation with the user.

### Batch map

| Batch | File | Type | Blocking? |
|---|---|---|---|
| B0 — Baseline | `B0-BASELINE.md` | Automated | Yes |
| B1 — Global Overrides | `B1-OVERRIDES.md` | Script-assisted + rules | Yes |
| B2 — Categories 1–10 | `B2-CATS01-10.md` | Manual AI review | No |
| B3 — Categories 11–20 | `B3-CATS11-20.md` | Manual AI review | No |
| B4 — Categories 21–31 | `B4-CATS21-31.md` | Manual AI review | No |
| B5 — Parable Tags | `B5-PARABLES.md` | Script-assisted + TAG_RULES | No |
| B6 — Taxonomy Compliance | `B6-TAXONOMY.md` | Script-assisted + manual | No |

All output files live in `catalog_builds/validation`.

---

## Before Starting Any Batch

**Always do these two things first:**

```
1. Read catalog_builds/validation/STATUS.md
   → Identify which batches are complete, in progress, or not started
   → Do not re-run a DONE batch unless the catalog has changed

2. If the batch uses the catalog, load it:
   node catalog_builds/engine/scripts/parse-catalog.js --json > /tmp/catalog-snapshot.json
```

---

## WORKFLOW 1: Run B0 — Baseline Snapshot

**Trigger:** "Start validation" / "Run B0" / "Run the baseline"

**Steps:**

```
1. Run both engine scripts and save their JSON output:

   node catalog_builds/engine/scripts/validate-catalog.js --json > catalog_builds/validation/b0-validate-output.json
   node catalog_builds/engine/scripts/audit-catalog.js --json > catalog_builds/validation/b0-audit-output.json

2. Parse both outputs.

3. Create B0-BASELINE.md in catalog_builds/validation/:
   a. Record the pass/fail of validate-catalog.js
   b. List every error (must be fixed before proceeding to B1)
   c. List every warning
   d. List audit findings grouped by type:
      - structural issues (empty-text, short-text, missing-quote, empty-quote, no-references)
      - parable-candidate findings
      - duplicate-text findings
   e. For parable-candidate findings: cross-reference TAG_RULES.md
      → If the text/quote matches the three-part definition AND is in the canonical 42-parable list → "CONFIRMED — tag is missing"
      → If it matches definition but is NOT in canonical list → "REVIEW — may be unlisted parable"
      → If it does not match definition → "FALSE POSITIVE"
   f. Record current catalog stats (from parse-catalog.js --stats)

4. Update STATUS.md:
   → B0 row: status = "DONE" (if no errors) or "COMPLETE — PENDING RESOLUTION" (if errors exist)
   → Update running totals
   → Add session log entry
```

**Pass criterion:** `validate-catalog.js` exits 0. If it does not, record errors in B0-BASELINE.md and stop — all errors must be fixed using the catalog-engine skill before B1 can begin.

---

## WORKFLOW 2: Run B1 — Global Override Compliance

**Trigger:** "Run B1" / "Check global overrides" / "Validate G-1, G-2, G-4"

**Prerequisite:** B0 must be DONE.

**Steps:**

```
1. Load the full catalog JSON:
   node catalog_builds/engine/scripts/parse-catalog.js --json

2. Run three checks — forward and reverse — for each global override rule.
   See check definitions below.

3. Create B1-OVERRIDES.md in catalog_builds/validation/.
   Record each violation as a finding (see Finding Format section).

4. Update STATUS.md.
```

### G-1 Check: John 17 ↔ Cat 12

**Forward (must all be in Cat 12):**
- Iterate all teachings across all categories
- For any teaching with a reference where `bookAbbr === "John"` and `chapter === 17`
- If the teaching's parent category ID is NOT 12 → **ERROR finding**

**Reverse (Cat 12 must only contain John 17):**
- Iterate all teachings in category 12
- For any teaching with no reference matching `bookAbbr === "John"` and `chapter === 17`
- → **ERROR finding**

### G-2 Check: Passion scope ↔ Cat 27

**Passion scope definition:**
```
{ bookAbbr: "Matt", chapters: [26, 27] }
{ bookAbbr: "Mark", chapters: [14, 15] }
{ bookAbbr: "Luke", chapters: [22, 23] }
{ bookAbbr: "John", chapters: [18, 19] }
```

**Farewell Discourse exception (do NOT flag as violations):**
```
{ bookAbbr: "John", chapters: [13, 14, 15, 16] }
```
These are classified topically, NOT by G-2. John 13–16 content found in Cat 27 must be reviewed individually — flag as **REVIEW** (not ERROR) if it appears to be a Farewell Discourse passage rather than an actual Passion event.

**Forward check:** Any teaching referencing a Passion scope passage AND not in Cat 27 → **ERROR**

**Reverse check:** Any teaching in Cat 27 with no reference matching Passion scope → **WARNING** (may be Farewell Discourse content that was misrouted)

**Special attention:** Teachings in Cat 27 that reference John 13–16 — individually review whether the content is:
- An actual Passion event (Judas's departure, denial prediction at table) → ACCEPT
- Topical teaching from the Farewell Discourse → **ERROR** (must move to topical category)

### G-4 Check: Rev 1–3 ↔ Cat 31

**Forward check:** Any teaching referencing `bookAbbr === "Rev"` and `chapter` in [1, 2, 3] AND not in Cat 31 → **ERROR**

**Reverse check:** Any teaching in Cat 31 with no reference matching `bookAbbr === "Rev"` and `chapter` in [1, 2, 3] → **ERROR**

**Pass criterion:** Zero ERROR findings. REVIEW findings may remain open for human judgment.

---

## WORKFLOW 3: Run Topical Batch (B2, B3, or B4)

**Trigger:** "Run B2" / "Review categories 1–10" / "Continue B3" / etc.

**Prerequisite:** B1 must be DONE (no open ERRORs).

**Steps:**

```
1. Determine which batch to run (B2, B3, or B4) and which categories it covers.
   B2 = cats 1–10 | B3 = cats 11–20 | B4 = cats 21–31

2. Read the corresponding check definitions from PLAN.md (section for that batch).

3. For each category in scope:
   a. Load all teachings in that category via parse-catalog.js --json output
   b. Read the category's rules from CLASSIFICATION_RULES.md:
      - Theological scope
      - Guiding principle
      - Inclusion themes
      - Explicit exclusions
      - Tie-breaker rules
      - Subcategory scope descriptions
   c. For each teaching, evaluate:
      i.  Does the teaching's primary theological thrust match the category's scope? If not → WARNING or ERROR
      ii. Does the teaching's content match an explicit EXCLUSION pointing to another category? → WARNING
      iii. Does the tie-breaker rule apply? If yes, does the teaching comply? If not → WARNING
      iv. Is the teaching in the most specific matching subcategory? If a more specific one exists → REVIEW
   d. Record any findings.

4. Create / append to the batch output file (B2-CATS01-10.md, etc.).
   - Begin with a header: "## Category [ID] — [Title]" for each category reviewed
   - List all findings under that header
   - If no findings for a category: write "No findings."

5. Batches can be run in segments — one category at a time is acceptable.
   When pausing mid-batch:
   → Note the last category reviewed in STATUS.md session log
   → Status = "IN PROGRESS" until all categories in the batch are reviewed

6. Update STATUS.md when the batch is complete.
```

### Key checks by batch — quick reference

These are the highest-priority flag patterns. Consult PLAN.md for the full per-category check list.

**B2 highlights (cats 1–10):**
- Matt 4:1–11 / Luke 4:1–13 (Temptation) → must be in Cat 23.1, NOT Cat 8.1
- John 6 (Bread of Life) → must be in Cat 9.2, NOT Cat 6
- John 15:12 ("love one another") → must be in Cat 13.4, NOT Cat 11
- John 15:16 ("ask in my name") → must be in Cat 10.4, NOT Cat 11
- Lost sheep / lost coin / prodigal son → Cat 5 not Cat 4
- Beatitudes (Matt 5:3–12) → must be in Cat 4.4 (formal list only)

**B3 highlights (cats 11–20):**
- John 15:18–27 (world's hatred) → Cat 26 / Cat 3, NOT Cat 11
- John 17 subcategory routing (12.1 = vv.1–5; 12.2 = vv.6–19; 12.3 = vv.20–26)
- "Love your enemies" within Antitheses block → Cat 14.3, NOT Cat 13.3
- Matt 5:33–37 (oaths) as standalone → Cat 16.2; within Antitheses → Cat 14.3
- Matt 18:15–17 routing → Cat 25.2 (discipline) or Cat 18.3 (reconciliation) per primary frame
- Forgiveness from the cross ("Father forgive them") → Cat 27 per G-2, NOT Cat 18

**B4 highlights (cats 21–31):**
- Matt 25:31–46 (Sheep and Goats) → Cat 21.2, NOT Cat 29 or Cat 30
- Matt 4:1–11 / Luke 4:1–13 → Cat 23.1 (confirm here too)
- All Matt 23:13–36 woes → Cat 24.1
- Great Commission (Matt 28:18–20) → Cat 26.5, NOT Cat 28
- Thomas encounter (John 20:27–29) → Cat 7, NOT Cat 28 (may cross-list)
- Olivet Discourse (Matt 24 / Mark 13 / Luke 21) → Cat 29
- Rich Man and Lazarus → Cat 20.4, NOT Cat 30
- Rev 1–3 subcategory internal routing (verify correct letter per subcategory)

---

## WORKFLOW 4: Run B5 — Parable Tag Audit

**Trigger:** "Run B5" / "Audit parables" / "Check parable tags"

**Steps:**

```
1. Load the full catalog JSON.
2. Extract all teachings where tags includes "parable" → call this the TAGGED SET.
3. Load the canonical 42-parable reference list from TAG_RULES.md.

4. Run three checks:

   CHECK A — Count
   Expected count: 42. Actual count of TAGGED SET.
   If actual ≠ 42 → note the delta; the next two checks will identify why.

   CHECK B — Missing tags (canonical parables not in TAGGED SET)
   For each parable in the canonical 42-parable list:
   → Look up that ID in the catalog
   → If found but not tagged "parable" → ERROR finding
   → If not found at all → ERROR finding (teaching may have been deleted or ID changed)

   CHECK C — Unexpected tags (TAGGED SET not in canonical list)
   For each teaching in the TAGGED SET:
   → Check if its ID matches a canonical list entry
   → If NOT found in the canonical list → REVIEW finding
     (Apply three-part definition from TAG_RULES.md to determine if it legitimately qualifies)

   CHECK D — Placement check for tagged parables
   Cross-list known routing rules:
   → Lost sheep/coin/son (5.2.x) — must be in Cat 5, not Cat 4
   → Kingdom-value parables (hidden treasure, pearl) — must be in Cat 4, not Cat 5
   → Cross-listed parables must appear in BOTH expected locations

5. Create B5-PARABLES.md.
6. Update STATUS.md.
```

---

## WORKFLOW 5: Run B6 — Taxonomy Compliance

**Trigger:** "Run B6" / "Check taxonomy" / "Structural compliance check"

**Steps:**

```
1. Load the full catalog JSON.

2. CHECK A — Subcategory volume
   For each subcategory:
   → Count teachings. If count < 3 → INFO finding (potential merge candidate)
   → Note: a subcategory with 0 teachings → WARNING

3. CHECK B — Text field format
   For each teaching:
   → text must be ≥ 20 chars → already in B0; skip if B0 caught it
   → text must NOT start with a quotation mark → flag if it does
   → text should not contain direct scripture quotes inline (it's a summary, not a quote)

4. CHECK C — isPrimary source order (synoptic parallels)
   For each teaching with multiple references:
   → If references include both Matt and another synoptic (Mark or Luke) with overlapping content
   → Matt should be isPrimary: true UNLESS the fullest account is clearly in another gospel
   → If a non-Matt synoptic is primary when Matt is present → REVIEW finding

5. CHECK D — Reference label format
   For each reference object:
   → label should use en-dash (–) for ranges, not hyphen (-)
     e.g. "Matt 13:31–32" not "Matt 13:31-32"
   → Flag any label containing a plain hyphen between verse numbers → INFO finding (formatting)

6. CHECK E — bookAbbr canonical values
   Valid values: Matt | Mark | Luke | John | Acts | 1Cor | 2Cor | Rev
   Any bookAbbr not in this list → ERROR finding

7. CHECK F — Unexpected tag values
   For each teaching, for each tag in tags array:
   → If tag is not "parable" AND not in informational tag list (i-am, healing, prayer, prophecy, woe, blessing)
   → → ERROR finding (unknown tag value)

8. CHECK G — Duplicate text resolution (from B0)
   Revisit duplicate-text findings from B0-BASELINE.md:
   → Classify each as: TRUE DUPLICATE (mark for deletion) or LEGITIMATE CROSS-LISTING (accept)
   → Apply TAXONOMY_STANDARDS.md Part 3 duplicate resolution rules
   → For true duplicates: identify keeper vs. candidate for deletion

9. Create B6-TAXONOMY.md.
10. Update STATUS.md.
```

---

## WORKFLOW 6: Record a Finding

**Trigger:** Use this template whenever a finding is identified during any batch review.

**Finding record format:**

```markdown
### F-[BATCH][NNN] — [SEVERITY]

- **Teaching ID:** [e.g., 4.5.3]
- **Location:** [Category Title > Subcategory Title]
- **Reference(s):** [e.g., Matt 13:31–32]
- **Check:** [e.g., B1-G2 | B2-Cat6-vs-Cat9 | B4-Cat21-SheepGoats]
- **Description:** [What was found and why it's a concern]
- **Rule citation:** [Exact rule from CLASSIFICATION_RULES.md or TAXONOMY_STANDARDS.md]
- **Proposed action:** [Move to X.Y | Review primary frame | Fix field value | Accept]
- **Status:** OPEN
```

**Severity:**
- `ERROR` — hard rule violation (Global Override breach, wrong required field value)
- `WARNING` — probable misclassification based on explicit exclusion or tie-breaker
- `REVIEW` — ambiguous; requires judgment on primary theological thrust
- `INFO` — observation (subcategory below threshold, formatting inconsistency)

**Numbering:** NNN is zero-padded three-digit sequence within the batch (e.g., F-B1001, F-B2003).

---

## WORKFLOW 7: Resolve a Finding

**Trigger:** "Resolve finding F-B1002" / "Accept finding as cross-listing" / "Move teaching X to cat Y"

**Steps:**

```
1. Locate the finding in the batch output file.

2. Determine resolution type:
   a. CATALOG CHANGE (move, delete, field edit)
      → Load catalog-engine skill
      → Execute the appropriate catalog-engine workflow (Workflow 4 or 5)
      → After renumber.js + validate-catalog.js both pass:
        Update finding status in the batch file:
          Status: OPEN → RESOLVED [date]
          Add resolution note:
          > **Resolution [date]:** Moved teaching [ID] from [old location] to [new location].

   b. ACCEPTED (no catalog change; finding is valid classification or intentional cross-listing)
      → Update finding status:
          Status: OPEN → ACCEPTED [date]
          Add resolution note:
          > **Resolution [date]:** [Rationale — e.g., "Primary frame confirmed as Cat 6; Cat 9 reference is secondary."]

   c. FALSE POSITIVE (finding was incorrect)
      → Update finding status:
          Status: OPEN → ACCEPTED (FALSE POSITIVE) [date]
          Add resolution note with explanation.

3. After updating the batch file, update STATUS.md:
   → Decrement open count, increment resolved or accepted count for that batch
   → Update Running Summary totals
```

---

## WORKFLOW 8: Update STATUS.md

**Trigger:** After completing a batch, after resolving findings, or when resuming a session.

**Steps:**

```
1. Count findings in each batch output file:
   - Open findings (Status: OPEN or IN REVIEW)
   - Resolved (Status: RESOLVED)
   - Accepted (Status: ACCEPTED or ACCEPTED (FALSE POSITIVE))
   - Total = open + resolved + accepted

2. Update the Batch Progress table:
   → Batch status:
      NOT STARTED  — batch file does not exist
      IN PROGRESS  — batch file exists but not all categories/checks complete
      COMPLETE — PENDING RESOLUTION — all checks run, open findings remain
      DONE         — all findings resolved or accepted

3. Update Running Summary table with cross-batch totals by severity.

4. Update Catalog State table if any teachings were moved, deleted, or fields fixed.
   → Increment the appropriate change counter

5. Add a Session Log entry:
   | [today's date] | [batches worked] | [findings added] | [actions taken] |
```

---

## Batch Resumption Protocol

When continuing a batch started in a previous session:

```
1. Read STATUS.md to confirm which batch is IN PROGRESS.
2. Read the batch output file (e.g., B2-CATS01-10.md).
3. Find the last category that has a findings section (or "No findings.") — that is where the prior session ended.
4. Resume from the next category.
5. Do not re-review categories already covered.
```

---

## Decision Guide: When to Use Which Skill

| Situation | Use skill |
|---|---|
| Running a validation batch | `catalog-validation` (this skill) |
| Moving a teaching to fix a finding | `catalog-engine` Workflow 5A |
| Fixing a field value (text, quote, bookAbbr) | `catalog-engine` Workflow 4 (step 4 only) + renumber + validate |
| Checking if a verse is already in the catalog | `catalog-engine` Workflow 3 |
| Adding a net-new teaching (not a reclassification) | `catalog-engine` Workflow 4 |
| After any catalog write: update docs | `catalog-engine` Workflow 6 |

---

## Quick Command Reference

```bash
# B0 — generate baseline files
node catalog_builds/engine/scripts/validate-catalog.js --json > catalog_builds/validation/b0-validate-output.json
node catalog_builds/engine/scripts/audit-catalog.js --json > catalog_builds/validation/b0-audit-output.json

# Read full catalog as JSON (for B1–B6 checks)
node catalog_builds/engine/scripts/parse-catalog.js --json

# Current stats
node catalog_builds/engine/scripts/parse-catalog.js --stats

# After any catalog change during resolution
node catalog_builds/engine/scripts/renumber.js
node catalog_builds/engine/scripts/validate-catalog.js

# Classify a specific verse (read-only)
node catalog_builds/engine/scripts/classify.js --ref "John 17:1" --json
```

---

## Output File Headers

Each batch output file should begin with this header block:

```markdown
# [Batch ID] — [Batch Name]
**Run date:** [date]
**Catalog snapshot:** [teaching count] teachings · [subcat count] subcategories · [cat count] categories
**Checks performed:** [list from PLAN.md]
**Findings:** [N] total ([E] errors, [W] warnings, [R] reviews, [I] info)

---
```
