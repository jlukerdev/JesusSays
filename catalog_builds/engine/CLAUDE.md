# CLAUDE.md — Catalog Engine

This directory is the **governance and operations layer** for `public/teachings.json`. Every catalog operation — classification, validation, auditing, structural modification, and documentation maintenance — is governed here. Read this file fully before taking any catalog action.

---

## What This Folder Is

`catalog_builds/engine/` contains:

| File / Folder | Role |
|---|---|
| `CLASSIFICATION_RULES.md` | Authoritative rules for placing every teaching in the 31-category, 117-subcategory taxonomy |
| `TAXONOMY_STANDARDS.md` | Structural governance: thresholds and required fields for creating or modifying categories/subcategories |
| `TAG_RULES.md` | Governed definition and canonical list for the `"parable"` tag |
| `REVISION.md` | Version history of all structural changes |
| `catalog_stats.md` | Live catalog metrics — single source of truth for counts |
| `scripts/` | Five Node.js CLI scripts (ESM, no external dependencies) |
| `skills/catalog-engine/SKILL.md` | The operational playbook; defines 6 workflows for all catalog tasks |
| `skills/catalog-validation/SKILL.md` | Focused validation workflow |

The **data file itself** is `public/teachings.json` at the project root. This engine directory does not contain data — it contains the rules and tools that govern it.

---

## Mandatory: Load the Skill Before Any Catalog Operation

```
skills/catalog-engine/SKILL.md
```

Read this file completely before performing any classify, add, restructure, audit, or validate task. It defines 6 workflows with exact step sequences and universal guardrails. Do not invent a workflow; use the ones defined there.

---

## The Five Scripts

All scripts run from the **project root** (`c:\src\personal\JesusSays`). They are read-only except `renumber.js` and `sort-teachings.js`.

```bash
node catalog_builds/engine/scripts/parse-catalog.js --stats     # Live counts
node catalog_builds/engine/scripts/validate-catalog.js          # Lint schema + IDs
node catalog_builds/engine/scripts/audit-catalog.js             # Quality audit
node catalog_builds/engine/scripts/classify.js --ref "Matt 13:31"  # Placement advisor
node catalog_builds/engine/scripts/renumber.js                  # write script
node catalog_builds/engine/scripts/sort-teachings.js            # write script
```

`renumber.js` - Run it after every manual JSON edit. Use `--dry-run` to preview without writing.
`sort-teachings.js` - Never run this script unless specifically prompted by the user to resort the teachings.

---

## Standard Workflow Sequence

Never skip steps. Never reorder.

```
parse-catalog.js        ← Get current state
      ↓
classify.js             ← Confirm placement (consult CLASSIFICATION_RULES.md)
      ↓
[Manual JSON edit]      ← Edit public/teachings.json directly
      ↓
renumber.js             ← Normalize all IDs and slugs
      ↓
validate-catalog.js     ← Must exit code 0 before task is complete
```

After any **structural change** (new category, new subcategory, rename, merge, split, relocate), also run Workflow 6 from the SKILL.md to update `CLASSIFICATION_RULES.md`, `catalog_stats.md`, and `REVISION.md`.

---

## Universal Rules — Never Violate

1. **Never read raw JSON.** Use `parse-catalog.js` to inspect the catalog. Direct reads of `teachings.json` miss structural context.
2. **Never write without classifying first.** Run `classify.js` and consult `CLASSIFICATION_RULES.md` before any edit.
3. **Never manually assign IDs or slugs.** `renumber.js` owns all IDs and slugs. Set them to `null` in any new teaching; `renumber.js` will assign correct values.
4. **Always run `renumber.js` after any JSON edit**, even a single teaching addition.
5. **Always run `validate-catalog.js` after `renumber.js`.** Task is not complete until exit code is 0.
6. **Exactly one `isPrimary: true`** per teaching's references array.
7. **After any structural change,** update documentation (Workflow 6) — this is mandatory, not optional.
8. **Never update `catalog_stats.md` by hand.** Run `parse-catalog.js --stats` and copy the output.

---

## Structural Modification Thresholds

Before creating new subcategories or categories, verify against `TAXONOMY_STANDARDS.md`:

- **New subcategory:** 3+ distinct teachings, clearly distinct theme, fits an existing category
- **New category:** 2+ subcategories of material, theologically independent, not already covered

Renaming, merging, splitting, and relocating also have specific rules in `TAXONOMY_STANDARDS.md`.

---

## What Not To Do

- Do not add features, comments, or abstractions to the scripts beyond what the task requires.
- Do not modify `CLASSIFICATION_RULES.md` or `TAXONOMY_STANDARDS.md` during a routine add/classify operation — only update them during Workflow 6 after a structural change.
- Do not create new scripts without user direction.
- Do not push changes to `public/teachings.json` without running the full validate workflow first.
