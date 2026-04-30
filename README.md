# Jesus Says

A comprehensive reference web application cataloging all recorded words of Jesus Christ from the New Testament, organized thematically with full scripture cross-references.

## Project Status

**Pre-implementation/Planning Phase**

This repository contains planning documents, design specifications, and the canonical data catalog. The production React/Vite application is not yet implemented. See the [Planning Documents](#planning-documents) section below to learn about the design and architecture.

## About Jesus Says

Jesus Says is a research and reference tool designed to help readers study Jesus's teachings in context. Every recorded utterance of Jesus in the New Testament—from parables to prayers to his post-resurrection appearances—is cataloged, categorized, and cross-referenced with the scripture locations where each teaching appears.

### Key Stats

For current catalog counts, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

## The Data

The canonical data source is **`teachings.json`**, containing:

```json
{
  "meta": {
    "title": "The Teachings of Jesus Christ",
    "totalCategories": 31,
    "sources": ["Matthew", "Mark", "Luke", "John", "Acts", "1 Corinthians", "2 Corinthians", "Revelation"],
    "scope": [...]
  },
  "categories": [
    {
      "id": 1,
      "slug": "cat-1",
      "title": "God the Father",
      "subcategories": [
        {
          "id": "1.1",
          "slug": "cat-1-1",
          "title": "...",
          "teachings": [
            {
              "id": "1.1.1",
              "text": "If earthly fathers give good gifts, how much more will the heavenly Father give good things to those who ask",
              "quote": "If ye then, being evil, know how to give good gifts unto your children, how much more shall your Father which is in heaven give good things to them that ask him?",
              "tags": [],
              "references": [
                {
                  "label": "Matt 7:11",
                  "book": "Matthew",
                  "bookAbbr": "Matt",
                  "chapter": 7,
                  "ranges": [[11, 11]],
                  "isPrimary": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

The data is organized hierarchically: categories → subcategories → individual teachings. Each teaching pairs an editorial `text` summary with the raw KJV `quote`, plus full scripture citations and parallel cross-references.

The full catalog rebuild pipeline — parsed USFM source, gap reports, and assembly scripts — lives under [bible_datasets/](./bible_datasets/) with details in [catalog-rebuild-plan.md](./bible_datasets/catalog-rebuild-plan.md).

## Catalog Engine

A deterministic ruleset engine governs all reads, writes, and structural changes to `teachings.json`. It lives at `catalog_builds/engine/` and consists of three layers:

| Layer | Files |
|---|---|
| **Rules** | `CLASSIFICATION_RULES.md`, `TAXONOMY_STANDARDS.md`, `TAG_RULES.md` |
| **Scripts** | `scripts/parse-catalog.js`, `validate-catalog.js`, `audit-catalog.js`, `classify.js`, `renumber.js` |
| **Skill** | `skills/catalog-engine/SKILL.md` — Claude Code skill with 5 complete agent workflows |

The engine enforces consistent classification, prevents structural drift, and provides a validated write path for any catalog change. See [`catalog_builds/engine/skills/catalog-engine/SKILL.md`](./catalog_builds/engine/skills/catalog-engine/SKILL.md) for full usage.