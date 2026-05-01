# Jesus Says

A comprehensive reference web application cataloging all recorded words of Jesus Christ from the New Testament, organized thematically with scripture cross-references.

## Project Status

**In active development with current MVP deployed at https://jlukerdev.github.io/JesusSays**

## About Jesus Says

Jesus Says is a research and reference tool designed to help readers study Jesus's teachings in context. Every recorded utterance of Jesus in the New Testament—from parables to prayers to his post-resurrection appearances—is cataloged, categorized, and cross-referenced with the scripture locations where each teaching appears.

### Key Stats

For current catalog counts, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

## The Data

The catalog data source is [`public/teachings.json`](./public/teachings.json)

The data is organized hierarchically: categories → subcategories → individual teachings

## Catalog Engine

A deterministic ruleset engine governs all reads, writes, and structural changes to `teachings.json`. It lives at `catalog_builds/engine/` and consists of three layers:

| Layer | Files |
|---|---|
| **Rules** | `CLASSIFICATION_RULES.md`, `TAXONOMY_STANDARDS.md`, `TAG_RULES.md` |
| **Scripts** | `scripts/parse-catalog.js`, `validate-catalog.js`, `audit-catalog.js`, `classify.js`, `renumber.js`, `sort-teachings.js` |
| **Skill** | `skills/catalog-engine/SKILL.md` — Claude Code skill with 5 complete agent workflows |

The engine enforces consistent classification, prevents structural drift, and provides a validated write path for any catalog change. See [`catalog_builds/engine/skills/catalog-engine/SKILL.md`](./catalog_builds/engine/skills/catalog-engine/SKILL.md) for full usage.