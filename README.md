# Jesus Says

A comprehensive reference web application cataloging all recorded words of Jesus Christ from the New Testament, organized thematically with full scripture cross-references.

## Project Status

**Pre-implementation/Planning Phase**

This repository contains planning documents, design specifications, and the canonical data catalog. The production React/Vite application is not yet implemented. See the [Planning Documents](#planning-documents) section below to learn about the design and architecture.

## Quick Start: Deployment to GitHub Pages

Got a React + Vite app ready to deploy? Here's the 5-minute setup:

### 1. Configure Base Path (vite.config.js)
```js
export default {
  base: '/your-repo-name/',  // Match your GitHub repo name
  plugins: [react()],
}
```

### 2. Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 3. Enable Pages
Go to repo **Settings** → **Pages** → Select source: **GitHub Actions**

### 4. Push to Main
```bash
git push origin main
```

**Done!** Your site deploys automatically. Check the **Actions** tab to monitor.

👉 **For comprehensive guide** (multi-environment, troubleshooting, etc.): See [DEPLOYMENT-GUIDE.md](./docs/DEPLOYMENT-GUIDE.md)

## About Jesus Says

Jesus Says is a research and reference tool designed to help readers study Jesus's teachings in context. Every recorded utterance of Jesus in the New Testament—from parables to prayers to his post-resurrection appearances—is cataloged, categorized, and cross-referenced with the scripture locations where each teaching appears.

### Key Stats

For current catalog counts, see [`catalog_builds/engine/catalog_stats.md`](catalog_builds/engine/catalog_stats.md).

- **100% coverage** of red-letter (Words of Christ) verses across the New Testament
- **42 parables** tagged and findable across all categories
- Scripture cross-references include primary sources and parallel Gospel accounts

## Scope

The catalog includes all spoken words of Jesus Christ found in:

- **The Four Gospels** (Matthew, Mark, Luke, John) — parables, discourses, and dialogue
- **The Passion Narrative** — the Last Supper, Gethsemane, the trial, and the Seven Words from the Cross
- **Post-Resurrection Appearances** (Matthew 28, Luke 24, John 20–21, Acts 1)
- **Other New Testament Passages**
  - The High Priestly Prayer (John 17)
  - Paul's direct quotations of Jesus (Acts 20:35)
  - The institution of the Lord's Supper (1 Corinthians 11:23–25)
  - "My grace is sufficient for you" (2 Corinthians 12:9)
  - The Damascus road encounter (Acts 9:4–6, 22:7–10, 26:14–18)
  - Visions and revelations (Acts 9, 10, 18, 22–23)
  - The letters to the Seven Churches and direct speech in Revelation (Revelation 1–3, 16:15, 21:5–8, 22)

Where a teaching appears in multiple Gospels, it is recorded once with complete parallel cross-references.

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

---

**Last updated:** April 2026  
**Status:** Phase 1 complete (Stage 8 QA pending) — Catalog Engine live