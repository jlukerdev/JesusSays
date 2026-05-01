---
name: catalog-engine
description: >
  This skill governs all interaction with the Jesus Says data catalog. Load this skill before any catalog read, audit, classification, or write operation.
  It provides capabilities for validating, auditing, classifying, adding, restructuring, and schema-modifying teachings within the catalog.
  Use this skill to ensure data integrity, maintain thematic consistency, and manage the catalog effectively.
---

# Catalog Engine Skill

**Skill name:** `catalog-engine`  
**Scope:** `d:\git\Personal\JesusSays`  
**Owned catalog:** `public/teachings.json`

This skill governs all interaction with the Jesus Says data catalog. Load this skill before any catalog read, audit, classification, or write operation.

---

## What This Skill Provides

| Capability | Description |
|---|---|
| Validate | Structural lint — required fields, ID integrity, reference integrity |
| Audit | Thematic audit — data quality flags, untagged parable candidates |
| Classify | Placement advisor — is a verse already present? Where should it go? |
| Add teaching | Full workflow to add a new teaching to the correct location |
| Restructure | Workflow to move, merge, split, or rename categories/subcategories |
| Modify schema | Workflow to add, remove, rename, or retype fields on teaching objects |

---

## Engine Files — Always Available

| File | Purpose |
|---|---|
| `catalog_builds/engine/CLASSIFICATION_RULES.md` | Thematic rules for all categories and subcategories |
| `catalog_builds/engine/TAXONOMY_STANDARDS.md` | Standards for creating new categories/subcategories; required fields; validation gate |
| `catalog_builds/engine/TAG_RULES.md` | Parable tag definition + canonical reference list of all 42 parables |
| `catalog_builds/engine/REVISION.md` | Version history of all structural catalog changes, newest version first |
| `catalog_builds/engine/scripts/README.md` | Script usage, options, and sample output for all 5 scripts |

---

## WORKFLOW 1: Validate the Catalog

**Trigger:** "Validate the catalog" / "Check the catalog for errors" / "Lint the catalog"

**Steps:**

```
1. node catalog_builds/engine/scripts/validate-catalog.js --json
2. Parse the JSON output
3. Report: errors array + warnings array + summary
4. If errors.length > 0: list each error by path and message
5. If no errors: confirm "✓ Catalog passed validation"
```

**Output to user:** Summary of errors/warnings. For errors, show the `path` and `message` for each. Do not attempt to fix errors automatically — report them.

---

## WORKFLOW 2: Audit the Catalog

**Trigger:** "Audit the catalog" / "What's inconsistent?" / "Find data quality issues"

**Steps:**

```
1. node catalog_builds/engine/scripts/audit-catalog.js --json
2. Parse findings array
3. Group by type: empty-text, missing-quote, parable-candidate, duplicate-text, etc.
4. Report each finding with its teachingId, location, and message
5. For parable-candidate findings: cross-reference TAG_RULES.md definition
   → If it qualifies, flag it as "confirmed parable candidate"
   → If it does not, flag as "false positive"
```

**Output to user:** Categorized findings report. Flag confirmed parable candidates separately from structural issues.

---

## WORKFLOW 3: Classify a Teaching

**Trigger:** "Where does [verse/description] belong?" / "Classify [verse]" / "Is [verse] already in the catalog?"

**Steps:**

```
1. node catalog_builds/engine/scripts/classify.js --ref "[ref]" --text "[description]" --json
2. If alreadyPresent: true
   → Report existing location(s): categoryTitle, subcategoryTitle, teachingId
   → No further action unless user asks to add a cross-reference or move it
3. If alreadyPresent: false
   a. Read CLASSIFICATION_RULES.md section for the suggested category
   b. Verify the suggestion against: scope statement, inclusion themes, exclusions, tie-breaker rules
   c. If suggestion is correct: confirm with reasoning
   d. If suggestion is wrong: identify correct category based on CLASSIFICATION_RULES.md and explain
   e. Identify the correct subcategory based on the subcategory scope descriptions
4. Report: suggested category ID + title, subcategory ID + title, reasoning, neighbor teachings for context
```

**Output to user:** Whether the verse is present, and if new — the recommended placement with reasoning from the ruleset.

---

## WORKFLOW 4: Add a Teaching

**Trigger:** "Add [verse] to the catalog" / "Add teaching [description] from [reference]"

**Steps:**

```
1. Run classify workflow (Workflow 3) to determine placement
   → If already present: stop and report duplicate
   → Confirm target category + subcategory with the user before writing

2. Read public/teachings.json
   → Find the target subcategory's teachings array
   → Determine insertion position (end of array is default; adjust for canonical order if needed)

3. Construct the new teaching object — ALL fields required:
   {
     "id": "[temporary — will be fixed by renumber.js]",
     "text": "[third-person present tense, 1 sentence, no quotes, ≥20 chars]",
     "quote": "[KJV text of Jesus's words, or null if only paraphrase available]",
     "tags": ["parable"] or [],
     "references": [
       {
         "label": "[e.g. Matt 13:31–32]",
         "book": "[full name e.g. Matthew]",
         "bookAbbr": "[e.g. Matt]",
         "chapter": [integer],
         "ranges": [[startVerse, endVerse]],
         "isPrimary": true
       }
     ]
   }
   → Cross-references: add additional reference objects with isPrimary: false
   → Verify bookAbbr uses canonical values from TAXONOMY_STANDARDS.md Part 4
   → Verify tags against TAG_RULES.md

4. Insert the new teaching object into public/teachings.json at the target position

5. node catalog_builds/engine/scripts/renumber.js
   → If exit code 1: report errors, DO NOT PROCEED

6. node catalog_builds/engine/scripts/validate-catalog.js
   → If exit code 1: report errors, DO NOT PROCEED

7. Report success: new teaching ID (post-renumber), location, and quote snippet
```

**Output to user:** Confirmation of the new teaching's final ID and location, or a clear error report if validation failed.

---

## WORKFLOW 5: Restructure the Catalog

**Trigger:** "Move [subcategory] to [category]" / "Rename [category]" / "Split [subcategory]" / "Merge [subcategories]" / "Should I split/merge [category]?"

### Sub-workflow A: Move a subcategory

```
1. Verify destination category scope in CLASSIFICATION_RULES.md
   → Confirm the subcategory's teachings fit the destination's scope
2. Move the subcategory object in public/teachings.json to the destination category's subcategories array
   → Insert at the position that respects canonical/logical ordering
3. node catalog_builds/engine/scripts/renumber.js
4. node catalog_builds/engine/scripts/validate-catalog.js — must pass
```

### Sub-workflow B: Rename a category or subcategory

```
1. Verify new name conforms to TAXONOMY_STANDARDS.md naming standards
2. Update the "title" field only in public/teachings.json (slug/id are unaffected by rename)
3. node catalog_builds/engine/scripts/validate-catalog.js — must pass
```

### Sub-workflow C: Split a subcategory

```
1. Check split threshold: current subcategory has 8+ teachings AND a clear thematic divide exists
   → If threshold not met: report that split is not warranted
2. Determine the boundary: which teachings stay, which move to new subcategory
3. Create new subcategory object with title, empty id/slug (renumber.js will assign), teachings array
4. Remove moved teachings from original subcategory
5. node catalog_builds/engine/scripts/renumber.js
6. node catalog_builds/engine/scripts/validate-catalog.js — must pass
```

### Sub-workflow D: Merge subcategories

```
1. Check merge threshold: two subcategories have <3 combined teachings OR themes are genuinely the same
   → If threshold not met: report that merge is not warranted
2. Combine teachings arrays into the destination subcategory
3. Remove the source subcategory object
4. node catalog_builds/engine/scripts/renumber.js
5. node catalog_builds/engine/scripts/validate-catalog.js — must pass
```

**Output to user:** Confirmation of the structural change and post-renumber IDs, or a reasoned explanation of why the proposed change does not meet the standards.

---

## WORKFLOW 6: Maintain Documentation After Structural Changes

**Trigger:** Automatically after any Workflow 5 operation (move, rename, split, merge) completes. **This workflow is mandatory — a restructuring operation is not complete until all documentation is updated.**

**Steps:**

```
1. Identify what changed structurally:
   - Subcategory added → new scope description needed in CLASSIFICATION_RULES.md
   - Subcategory removed → section to delete from CLASSIFICATION_RULES.md
   - Subcategory moved → parent section(s) to update + all cross-references
   - Subcategory renamed → title to update in CLASSIFICATION_RULES.md + any references

2. Update catalog_builds/engine/CLASSIFICATION_RULES.md:
   a. Add / remove / rename the affected subcategory block under the correct category heading
      New subcat template:
        "#### [new ID] [Title]
        [1–2 sentences: what belongs here + how it differs from its nearest sibling subcategory]"
   b. Update ALL ID references in tie-breaker rules, exclusions, and inclusion themes
      throughout the file if subcategory numbering shifted (e.g., 23.1 → 23.2)
   c. Update any Global Override cross-list references (G-1 through G-4) if a
      referenced subcategory ID changed

3. Update `catalog_builds/engine/catalog_stats.md`:
   a. Run `node catalog_builds/engine/scripts/parse-catalog.js --stats` to get live counts
   b. Update the "Current Live Stats" table with the new values
   c. Update the "Last verified" date and version label
   **Note: catalog_stats.md is the ONLY file where counts should be updated.**
      Do NOT update counts in CLASSIFICATION_RULES.md, SKILL.md, CLAUDE.md, or scripts/README.md.

4. Verify: run `node catalog_builds/engine/scripts/parse-catalog.js --stats` and confirm
   the live counts match the values recorded in `catalog_stats.md`

5. Update catalog_builds/engine/REVISION.md:
   a. Determine if a version bump is warranted:
      - ANY add, delete, move, rename, split, or merge of a category or subcategory = YES
      - Text/quote wording edits on individual teachings = NO
   b. If yes: prepend a new version block above the "Add new versions above this line" comment.
      Version number: increment the minor version (e.g., v1.0 → v1.1). Bump major version
      only for complete catalog re-architectures (31+ category-level changes at once).
      Required block fields:
        - Version header: `## v[X.Y] — [Date]`
        - Catalog state table (categories, subcategories, teachings, parables)
        - One sub-section per distinct structural change, titled descriptively
        - Each sub-section: what changed, why, which teachings moved (with truncated text),
          net count delta (e.g., "Cat 23: 3 → 4 subcategories")   c. Prepend a new line to the Table of Contents (after the existing entries) in the format:
        `- [v[X.Y] \u2014 [Date]](#v[xy]--[month]-[day]-[year])`
      (GitHub-style anchor: lowercase, spaces \u2192 hyphens, dots and em-dashes dropped)```

**Output to user:** Confirmation that documentation is updated and consistent with the live catalog.
```

---

## WORKFLOW 7: Modify the Catalog JSON Schema

**Trigger:** "Add a new field" / "Remove the [field] field" / "Rename [field] to [newName]" / "Change the type of [field]"

**Scope:** Covers field-level changes to meta, category, subcategory, and teaching objects

### Step 0 — Design gate (always required)

```
Before touching any file, answer all of the following:
  a. What is the exact field name being added / removed / renamed / retyped?
  b. Which object level does it live on? (teaching | reference | top-level catalog)
  c. What is the new type / allowed values / default value?
  d. Is the change additive-only (new optional field), or does it break existing consumers?
  e. Does validate-catalog.js enforce this field? (check the script source)
  f. Does src/data/loader.js read or transform this field? (check the source)
Do NOT proceed until all six questions are answered.
```

---

### Sub-workflow A: Add a new field

```
1. Confirm the field does not already exist on any targeted object:
   node catalog_builds/engine/scripts/parse-catalog.js --json
   → Scan a sample of targeted objects to verify absence

2. Choose migration strategy:
   BULK (field must be present on every targeted object):
     a. Write a one-off migration script at catalog_builds/validation/apply-schema-[fieldName].cjs
        Pattern: read teachings.json → iterate all targeted objects → set field → write file
     b. Run: node catalog_builds/validation/apply-schema-[fieldName].cjs
   SMALL (field is top-level or structural, ≤5 affected objects):
     a. Edit public/teachings.json directly, inserting the field at each affected location

3. Set the initial schemaVersion bump in public/teachings.json:
   → If a top-level "schemaVersion" field exists: increment it (e.g., "1.0" → "1.1")
   → If it does not exist: add "schemaVersion": "1.1" as the first key after the opening brace

4. Update validate-catalog.js:
   → If the new field is required: add a check that errors when the field is missing or wrong type
   → If the new field is optional: add a check that warns when the type is wrong if present

5. Update src/data/loader.js:
   → If the field needs to be read, normalized, or surfaced to the app: add handling
   → If it is a backend-only metadata field: no change needed — document this decision

6. Update TAXONOMY_STANDARDS.md:
   → Add the new field to the "Required fields" or "Optional fields" table in Part 2
   → Include: field name, type, allowed values, description, required/optional

7. node catalog_builds/engine/scripts/validate-catalog.js
   → If exit code 1: fix errors before proceeding

8. Update catalog_builds/engine/CLAUDE.md:
   → If the field is surfaced to the UI or affects data loading: note it under the Data Architecture section
```

---

### Sub-workflow B: Remove a field

```
1. STOP — confirm with the user that removal is intentional and irreversible.
   State exactly which field will be deleted from every targeted object.

2. Check consumers before removing:
   a. grep src/ for the field name — list every file that references it
   b. Check validate-catalog.js for any check that references the field
   → If any consumer reads the field: update or remove that code BEFORE deleting the field

3. Write a migration script at catalog_builds/validation/apply-schema-remove-[fieldName].cjs
   Pattern: read teachings.json → iterate all targeted objects → delete field → write file
   Run: node catalog_builds/validation/apply-schema-remove-[fieldName].cjs

4. Bump schemaVersion in public/teachings.json (same rule as Sub-workflow A, step 3)

5. Remove the field's validation check from validate-catalog.js

6. Remove the field's entry from TAXONOMY_STANDARDS.md Part 2 field tables

7. node catalog_builds/engine/scripts/validate-catalog.js
   → If exit code 1: fix errors before proceeding
```

---

### Sub-workflow C: Rename a field

```
1. Treat a rename as: Sub-workflow A (add new field) + Sub-workflow B (remove old field), run in that order.
   Do NOT skip the consumer audit in Sub-workflow B step 2 — both names must be grep'd.

2. Migration script must:
   a. Copy the value from oldField to newField on every targeted object
   b. Delete oldField
   Both operations in a single atomic pass — do NOT run separate add/remove scripts.

3. Bump schemaVersion once (not twice) after the combined operation.

4. Update validate-catalog.js: replace the old field check with a new one for the renamed field.

5. Update TAXONOMY_STANDARDS.md: replace the old field row with the new name.

6. node catalog_builds/engine/scripts/validate-catalog.js — must pass.
```

---

### Sub-workflow D: Change a field's type or allowed values

```
1. Document the before/after contract:
   OLD: fieldName — type: X, allowed: [...]
   NEW: fieldName — type: Y, allowed: [...]

2. Grep src/ and validate-catalog.js for the field name — list every location that
   assumes the old type or performs type-specific operations (e.g., .length, parseInt).

3. Write a migration script to coerce existing values to the new type/shape.
   Run it. Spot-check 5 random teachings in the output to verify correctness.

4. Update every consumer file identified in step 2.

5. Update validate-catalog.js to enforce the new type.

6. Bump schemaVersion in public/teachings.json.

7. Update TAXONOMY_STANDARDS.md Part 2 to reflect the new type/allowed values.

8. node catalog_builds/engine/scripts/validate-catalog.js — must pass.
```

---

### Mandatory close-out for all schema sub-workflows

```
1. node catalog_builds/engine/scripts/validate-catalog.js --json
   → summary.passed must be true before reporting completion

2. Update catalog_builds/engine/REVISION.md:
   → Schema field additions, removals, renames, and type changes always warrant a version entry
   → Follow the same REVISION.md block format described in Workflow 6 step 5
   → Label the section: "Schema: [Add|Remove|Rename|Retype] field '[fieldName]'"

3. Update catalog_builds/engine/catalog_stats.md schema documentation:
   a. Update the "meta.version" value in the schema block to match the new version
   b. For Add: insert the new field in the correct object block with a // comment
      describing its type, allowed values, and purpose
   c. For Remove: delete the field line from the schema block
   d. For Rename: update the field name in the schema block
   e. For Retype: update the // comment to reflect the new type/allowed values

4. Update catalog_builds/engine/CLAUDE.md if the change affects how data is loaded or displayed.
```

**Output to user:** Confirmation of the field change, the new schemaVersion value, which consumer files were updated, and that validation passed. If any consumer file was intentionally NOT updated (e.g., backend-only field), explain why.

---

## Universal Rules for All Operations

1. **Never read `public/teachings.json` directly.** Always use `node catalog_builds/engine/scripts/parse-catalog.js` (with `--json` or `--stats` as needed) to read catalog data. Reading the raw file bypasses ID validation, normalization, and live count tracking.
2. **Never write without classifying first.** Run Workflow 3 before any add operation.
3. **Always renumber after any structural edit.** Run `renumber.js` after every insertion, deletion, or move.
4. **Always validate after renumber.** Run `validate-catalog.js` after every renumber. Exit code `1` = operation is not complete.
5. **Never manually assign IDs or slugs.** These are managed exclusively by `renumber.js`.
6. **One `isPrimary: true` per teaching.** Validate this before inserting a new teaching.
7. **`bookAbbr` must use canonical values.** See TAXONOMY_STANDARDS.md Part 4.
8. **After any structural change, run Workflow 6.** Update `catalog_builds/engine/catalog_stats.md` with live counts, and update `CLASSIFICATION_RULES.md` and `REVISION.md` to reflect the new structure before reporting completion.

---

## Interpreting Script JSON Output

### validate-catalog.js `--json`

```json
{
  "errors": [ { "level": "error", "path": "categories[30].subcategories[0]", "message": "id should be ..." } ],
  "warnings": [ { "level": "warning", "path": "...", "message": "..." } ],
  "summary": { "errors": 0, "warnings": 0, "passed": true }
}
```
→ `summary.passed === true` means validation gate is clear.

### audit-catalog.js `--json`

```json
{
  "findings": [ { "type": "parable-candidate", "teachingId": "9.3.1", "location": "...", "message": "..." } ],
  "summary": { "total": 5, "byType": { "parable-candidate": 2, "missing-quote": 3 } }
}
```
→ Consult `TAG_RULES.md` for `parable-candidate` findings.

### classify.js `--json`

```json
{
  "input": { "ref": "Matt 13:31", "text": null },
  "alreadyPresent": true,
  "existingMatches": [ { "teachingId": "4.1.1", "categoryTitle": "...", ... } ],
  "suggestion": null
}
```
→ `alreadyPresent: true` means stop — do not add a duplicate. If `alreadyPresent: false`, use `suggestion` as the starting point, then verify against `CLASSIFICATION_RULES.md`.

### renumber.js `--json`

```json
{ "success": true, "dryRun": false, "written": true, "stats": { "categories": 31, "subcategories": 126, "teachings": 685 }, "warnings": 0 }
```
→ `success: false` means the write was aborted. Read the `errors` array in the output.

---

## Quick Reference: Catalog Dimensions

For current catalog counts, see [`catalog_builds/engine/catalog_stats.md`](../catalog_stats.md).

| Dimension | Value |
|---|---|
| NT books covered | Matt, Mark, Luke, John, Acts, 1Cor, 2Cor, Rev |

*Run `node catalog_builds/engine/scripts/parse-catalog.js --stats` for live values.*
