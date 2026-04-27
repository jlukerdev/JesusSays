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

- **30 thematic categories** spanning God the Father through the Seven Churches of Revelation
- **118 subcategories** providing more specific topical focus
- **361 teachings** representing all recorded spoken words of Jesus
- **~700 scripture references** including primary sources and parallel Gospel accounts
- **35 parables** tagged and findable across all categories

## Scope

The catalog includes all spoken words of Jesus Christ found in:

- **The Four Gospels** (Matthew, Mark, Luke, John) — parables, discourses, and dialogue
- **The Seven Words from the Cross** (Matthew 27, Mark 15, Luke 23, John 19)
- **Post-Resurrection Appearances** (Matthew 28, Luke 24, John 20–21, Acts 1)
- **Other New Testament Passages**
  - The High Priestly Prayer (John 17)
  - Paul's direct quotations of Jesus (Acts 20:35)
  - The institution of the Lord's Supper (1 Corinthians 11:23–25)
  - The Damascus road encounter (Acts 9:4–6, 22:7–10, 26:14–18)
  - Visions and revelations (Acts 9, 10, 18, 22–23; 2 Corinthians 12)
  - The letters to the Seven Churches and direct speech in Revelation (Revelation 1–3, 16:15, 21:5–8, 22)

Where a teaching appears in multiple Gospels, it is recorded once with complete parallel cross-references.

## The Data

The canonical data source is **`teachings.json`**, containing:

```json
{
  "meta": {
    "title": "Jesus Says",
    "totalCategories": 30,
    "sources": ["Matthew", "Mark", "Luke", "John", ...],
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
              "text": "...",
              "tags": ["parable"],
              "references": [
                {
                  "label": "Matt 13:31–32",
                  "book": "Matthew",
                  "chapter": 13,
                  "ranges": [[31, 32]],
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

The data is organized hierarchically: categories → subcategories → individual teachings, each with full scripture citations and cross-references.

---

**Last updated:** April 2026  
**Status:** Planning Phase — Ready for implementation