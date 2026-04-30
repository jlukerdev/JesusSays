# Scripts README — Catalog Engine

All scripts live in `catalog_builds/engine/scripts/`. Run from the **project root**:

```
node catalog_builds/engine/scripts/<script-name>.js [options]
```

All scripts use **ESM** (`import`/`export`) and require Node.js 18+. No external dependencies. The project's `package.json` already sets `"type": "module"`.

---

## parse-catalog.js

**Purpose:** Standard catalog reader and outline generator. Foundational — all other scripts import `loadCatalog()` from this file.

### Options

| Flag | Description |
|---|---|
| *(none)* | Print full outline: Category → Subcategory with teaching counts |
| `--stats` | Print aggregate totals only |
| `--json` | Output in machine-readable JSON |
| `--stats --json` | JSON stats only |

### Sample output

```
[1] God the Father
  [1.1] God's Fatherhood and Care (5 teachings)
  [1.2] True Worship of God (2 teachings)
  [1.3] God's Sovereignty and Love (4 teachings)
...
─────────────────────────────────────
Total: 31 categories · 126 subcategories · 685 teachings · 42 parables
```

### JSON output (`--stats --json`)

```json
{
  "totalCategories": 31,
  "totalSubcategories": 126,
  "totalTeachings": 685,
  "totalParables": 42
}
```

*Values shown reflect the catalog state at last update. Run the script for live values; for canonical current counts see [`catalog_builds/engine/catalog_stats.md`](../catalog_stats.md).*

### Imported functions

```js
import { loadCatalog, catalogStats, CATALOG_PATH } from './parse-catalog.js';
```

---

## validate-catalog.js

**Purpose:** Schema + structural linter. Checks required fields, ID sequence integrity, slug format, and reference integrity. Exits with code `1` if any errors are found.

### Options

| Flag | Description |
|---|---|
| *(none)* | Human-readable error/warning list |
| `--json` | Machine-readable JSON report |

### Checks performed

- All required fields present on categories, subcategories, and teachings
- Category IDs are sequential integers `1..n`; slug matches `cat-{id}`
- Subcategory IDs follow `{catId}.{1..n}`; slug matches `cat-{catId}-{subcatIndex}`
- Teaching IDs follow `{catId}.{subcatId}.{1..n}`
- Exactly one `isPrimary: true` per teaching's references array
- `ranges` entries are valid `[start, end]` pairs with `start ≤ end`
- `quote` field exists (required since v2; missing = warning)

### Sample output

```
✓ No errors. 0 warning(s).
```

### JSON output (`--json`)

```json
{
  "errors": [],
  "warnings": [],
  "summary": { "errors": 0, "warnings": 0, "passed": true }
}
```

### Imported functions

```js
import { validateCatalog } from './validate-catalog.js';
```

---

## audit-catalog.js

**Purpose:** Thematic audit tool. Flags data quality issues and potential misclassifications.

### Options

| Flag | Description |
|---|---|
| *(none)* | All findings, grouped by type |
| `--type <type>` | Filter to a specific finding type |
| `--json` | Machine-readable JSON report |

### Finding types

| Type | Description |
|---|---|
| `empty-text` | Teaching has no `text` summary |
| `short-text` | `text` is under 20 characters |
| `missing-quote` | No `quote` field (required since v2) |
| `empty-quote` | `quote` is an empty string (should be `null` or populated) |
| `no-references` | Teaching has zero scripture references |
| `parable-candidate` | Text signals a parable narrative but lacks the `"parable"` tag |
| `duplicate-text` | Same `text` summary appears in two different subcategories |

### Sample usage

```
node catalog_builds/engine/scripts/audit-catalog.js --type parable-candidate
node catalog_builds/engine/scripts/audit-catalog.js --json
```

### JSON output structure

```json
{
  "findings": [
    {
      "type": "parable-candidate",
      "teachingId": "9.3.1",
      "location": "The New Covenant > New and Old — The Covenant Transition",
      "message": "Teaching text signals a parable but lacks the 'parable' tag: ..."
    }
  ],
  "summary": {
    "total": 1,
    "byType": { "parable-candidate": 1 }
  }
}
```

### Imported functions

```js
import { auditCatalog } from './audit-catalog.js';
```

---

## classify.js

**Purpose:** Read-only classification advisor. Checks if a verse is already in the catalog and suggests the best category/subcategory placement for a new teaching. **Never writes to the catalog.**

### Options

| Flag | Description |
|---|---|
| `--ref "Matt 13:31"` | Parse a scripture reference for lookup |
| `--text "description"` | Keyword-based category matching |
| `--json` | Machine-readable JSON output |

Either `--ref` or `--text` (or both) must be provided.

### Sample usage

```
node catalog_builds/engine/scripts/classify.js --ref "Matt 13:31-32" --text "mustard seed parable kingdom"
node catalog_builds/engine/scripts/classify.js --ref "John 3:16" --json
```

### Sample output

```
Input: ref="Matt 13:31-32" text="mustard seed parable kingdom"

⚠ Already present in catalog (1 match):
  [4.1.1] The Kingdom of God > Nature and Character of the Kingdom
    "Kingdom of heaven compared to a mustard seed — smallest of seeds grows..."
    Ref: Matt 13:31–32 (primary: true)

─ Consult CLASSIFICATION_RULES.md to finalize placement. ─
```

### JSON output structure

```json
{
  "input": { "ref": "Matt 13:31", "text": null },
  "parsedRef": { "bookAbbr": "Matt", "chapter": 13, "verseStart": 31, "verseEnd": 31 },
  "alreadyPresent": true,
  "existingMatches": [
    {
      "teachingId": "4.1.1",
      "text": "Kingdom of heaven compared to a mustard seed...",
      "categoryId": 4,
      "categoryTitle": "The Kingdom of God",
      "subcategoryId": "4.1",
      "subcategoryTitle": "Nature and Character of the Kingdom",
      "refLabel": "Matt 13:31–32",
      "isPrimary": true
    }
  ],
  "suggestion": null,
  "neighbors": []
}
```

---

## renumber.js

**Purpose:** The only write script. Strips hidden items, renumbers all IDs and slugs sequentially based on current array order, validates the result, and writes back to `public/teachings.json`. Exits with code `1` if post-renumber validation fails.

> **Always run this script after manually editing the catalog JSON.**

### Options

| Flag | Description |
|---|---|
| *(none)* | Renumber and write |
| `--dry-run` | Preview what would be written — no file changes |
| `--json` | Machine-readable output |

### Sample output

```
✓ Catalog renumbered and written to .../public/teachings.json
  Categories:    31
  Subcategories: 126
  Teachings:     700
  ✓ Validation passed
```

### JSON output

```json
{
  "success": true,
  "dryRun": false,
  "written": true,
  "stats": { "categories": 31, "subcategories": 126, "teachings": 685 },
  "warnings": 0
}
```

---

## Agent Workflow Reference

When an AI agent uses this engine, the standard workflow for **any write operation** is:

```
1. node parse-catalog.js --json          → understand current structure
2. [consult CLASSIFICATION_RULES.md]     → determine target location
3. node classify.js --ref "..." --json   → confirm placement, detect duplicates
4. [edit public/teachings.json directly] → insert/modify teaching object
5. node renumber.js                      → fix all IDs, validate, write
6. if exit code 1 → report errors, do not complete
```

For **read-only** workflows (validate, audit, classify):

```
node validate-catalog.js --json          → structural lint
node audit-catalog.js --json             → thematic findings
node classify.js --ref "..." --json      → placement check
```

See `catalog_builds/engine/skills/SKILL.md` for full workflow definitions.
