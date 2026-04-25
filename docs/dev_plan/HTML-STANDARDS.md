# HTML Standards Document
## Project: The Teachings of Jesus Christ — A Comprehensive Categorization
**Version:** 1.0  
**Purpose:** This document defines the exact formatting, structure, theming, and behavior rules for generating the final HTML output. All rules here are authoritative and must be followed precisely.

---

## 1. Document Setup

### 1.1 DOCTYPE & Meta
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Teachings of Jesus Christ — A Comprehensive Categorization</title>
```

### 1.2 External Dependencies (CDN — load in this order)
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
```
- No other external frameworks or icon libraries
- All JS is vanilla, inline at bottom of `<body>`
- Bible tooltip data is fetched live from `https://bible-api.com`

---

## 2. Color & Theme System

### 2.1 CSS Custom Properties
Define all colors as CSS variables in `:root`. Do not hardcode hex values outside of this block.

```css
:root {
  --gold:          #9a7b34;
  --gold-light:    #f5eed8;
  --gold-mid:      #d4a84b;
  --navy:          #1b2a40;
  --ink:           #1e1e1e;
  --muted:         #6b7280;
  --surface:       #faf9f6;
  --white:         #ffffff;
  --border:        #e5e0d5;

  /* Application tag colors */
  --tag-blue:         #dbeafe;  --tag-blue-text:   #1e40af;
  --tag-green:        #d1fae5;  --tag-green-text:  #065f46;
  --tag-amber:        #fef3c7;  --tag-amber-text:  #92400e;
  --tag-purple:       #ede9fe;  --tag-purple-text: #5b21b6;
  --tag-rose:         #ffe4e6;  --tag-rose-text:   #9f1239;
}
```

### 2.2 Theme Description
- **Light theme only** — no dark mode
- **Background:** `--surface` (#faf9f6) — warm off-white parchment tone
- **Accent:** Gold (`--gold`, `--gold-mid`, `--gold-light`) used for borders, highlights, links, badges
- **Authority:** Navy (`--navy`) used for header backgrounds, category numbers, table headers
- **Body text:** `--ink` (#1e1e1e)
- **Muted text:** `--muted` (#6b7280) for labels, secondary info

---

## 3. Typography

### 3.1 Font Stack
| Role | Font | Weight |
|---|---|---|
| Page title, category titles, subcategory titles | Playfair Display (serif) | 400, 700 |
| All body text, tables, labels, nav | Source Sans 3 (sans-serif) | 300, 400, 600 |

### 3.2 Font Size Scale
| Element | Size | Weight |
|---|---|---|
| `body` | 15px | 400 |
| Page `h1` (site header) | 2.1rem | 700 |
| Category title `.cat-title` | 1.6rem | 700 |
| Subcategory title `.subcat-title` | 1.1rem | 700 |
| Table body text | 0.865rem | 400 |
| Table header labels | 0.72rem | 600 |
| Scripture links (primary) | 0.85rem | 700 |
| Scripture links (cross-ref) | 0.82rem | 400 |
| Application tags | 0.72rem | 600 |
| Sidebar nav category links | 0.85rem | 600 |
| Sidebar nav subcategory links | 0.80rem | 400 |

---

## 4. Page Layout

### 4.1 Overall Structure
```
<body>
  <header class="site-header">        ← Full-width navy top bar
  <div class="layout-wrap">           ← Flex row container
    <nav class="sidebar">             ← Fixed-width sticky left sidebar
    <main class="main-content">       ← Scrollable content area
```

### 4.2 Site Header
- Full-width, `background: var(--navy)`
- Bottom border: `4px solid var(--gold-mid)`
- Padding: `2.5rem 2rem 2rem`
- Contains:
  - `.sample-banner` pill (only in sample; omit in final)
  - `<h1>` — "The Teachings of Jesus Christ" — Playfair Display, 2.1rem, white, no margin-bottom
  - **No subtitle line** under the h1

```html
<header class="site-header">
  <div class="container-fluid px-4">
    <h1>The Teachings of Jesus Christ</h1>
  </div>
</header>
```

### 4.3 Sidebar
- Width: `270px`, `flex-shrink: 0`
- `position: sticky; top: 0; height: 100vh; overflow-y: auto`
- Background: `var(--white)`
- Right border: `1px solid var(--border)`
- Padding: `1.5rem 1.25rem`
- Custom scrollbar: 4px wide, `var(--border)` color

### 4.4 Main Content
- `flex: 1; min-width: 0`
- Padding: `2.5rem 2.5rem 4rem`
- All category sections render here in vertical order

### 4.5 Responsive Breakpoint
At `max-width: 768px`:
- Sidebar hidden (`display: none`)
- Main content padding reduced to `1.5rem 1rem 3rem`
- H1 font-size reduced to `1.5rem`

---

## 5. Sidebar / Table of Contents

### 5.1 Structure
```html
<nav class="sidebar" id="toc-sidebar">
  <div class="sidebar-label">Table of Contents</div>

  <a href="#cat-1" class="toc-cat">1. The Kingdom of God / Heaven</a>
  <a href="#cat-1-1" class="toc-sub">1.1 Nature of the Kingdom</a>
  <a href="#cat-1-2" class="toc-sub">1.2 Entering the Kingdom</a>
  ...

  <hr class="toc-divider">

  <a href="#cat-2" class="toc-cat">2. Prayer & Communion with God</a>
  ...
</nav>
```

### 5.2 Sidebar Styles
- `.sidebar-label` — 0.68rem, 600 weight, uppercase, letter-spacing .12em, `--muted` color
- `.toc-cat` — block link, 0.85rem, 600 weight, `--ink` color, padding `.3rem .5rem`, border-radius 5px
  - Hover / `.active` state: `background: var(--gold-light)`, `color: var(--gold)`
- `.toc-sub` — block link, 0.80rem, 400 weight, `--muted` color, padding `.2rem .5rem .2rem 1.1rem`, border-radius 4px
  - Hover: `background: var(--gold-light)`, `color: var(--gold)`
- `.toc-divider` — `border-top: 1px solid var(--border)`, margin `.85rem 0`
- All links: `text-decoration: none`, `transition: background .15s, color .15s`

### 5.3 Active State (JS-driven)
On page scroll, add `.active` class to the `.toc-cat` link matching the currently visible category section. Scroll listener is passive.

---

## 6. Category Section Structure

Each of the 20 categories follows this exact structure:

```html
<section class="category-section" id="cat-{N}">

  <!-- Header bar -->
  <div class="category-header">
    <div class="cat-number">{N}</div>
    <div>
      <h2 class="cat-title">{Category Title}</h2>
      <p class="cat-subtitle">{Source books, e.g. Matt · Mark · Luke · John}</p>
    </div>
  </div>

  <!-- Daily life application callout -->
  <div class="application-box">
    <strong>Daily Life Application</strong>
    <p>{Application description}</p>
  </div>

  <!-- Life application tags -->
  <div class="mb-3">
    <span class="tag tag-{color}">{Tag Label}</span>
    ...
  </div>

  <!-- One or more subcategory blocks -->
  <div class="subcat-block" id="cat-{N}-{M}">
    ...
  </div>

</section>

<hr class="section-rule">   ← Between every category except the last
```

### 6.1 Category Header Styles
- `.category-header` — flex row, `gap: 1rem`, border-bottom `2px solid var(--gold-mid)`, padding-bottom `1rem`, margin-bottom `1.25rem`
- `.cat-number` — 48×48px, `background: var(--navy)`, `color: var(--gold-mid)`, Playfair Display 1.3rem 700, border-radius 8px, centered
- `.cat-title` — Playfair Display, 1.6rem, 700, `var(--navy)`, margin 0
- `.cat-subtitle` — 0.82rem, italic, `var(--muted)`, margin 0

### 6.2 Application Box
- `background: var(--gold-light)`, `border-left: 3px solid var(--gold-mid)`
- Padding: `.75rem 1rem`, border-radius `0 8px 8px 0`, margin-bottom `2rem`
- `<strong>` label: `color: var(--gold)`, 0.72rem, uppercase, letter-spacing .08em, displayed as block
- `<p>` text: `color: #5a4a1e`, margin 0

### 6.3 Application Tags
- `.tag` — inline-block, 0.72rem, 600 weight, padding `.2rem .55rem`, border-radius 100px, margin `.15rem .1rem`
- Five color variants (use contextually — see Section 9):
  - `.tag-blue`   → bg `#dbeafe`,  text `#1e40af`
  - `.tag-green`  → bg `#d1fae5`,  text `#065f46`
  - `.tag-amber`  → bg `#fef3c7`,  text `#92400e`
  - `.tag-purple` → bg `#ede9fe`,  text `#5b21b6`
  - `.tag-rose`   → bg `#ffe4e6`,  text `#9f1239`

### 6.4 Section Rule
- Between categories: `<hr class="section-rule">`
- Style: `border: none; border-top: 1px solid var(--border); margin: 2.5rem 0`

---

## 7. Subcategory Block Structure

```html
<div class="subcat-block" id="cat-{N}-{M}">

  <div class="subcat-header">
    <span class="subcat-num">{N}.{M}</span>
    <h3 class="subcat-title">{Subcategory Title}</h3>
  </div>

  <table class="teachings-table">
    <thead>
      <tr>
        <th style="width:58%">Teaching</th>
        <th style="width:42%">Scriptures</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="teaching-text">{Teaching description}</td>
        <td class="ref-cell">{Scripture links}</td>
      </tr>
      ...
    </tbody>
  </table>

</div>
```

### 7.1 Subcategory Header Styles
- `.subcat-header` — flex row, `align-items: center`, `gap: .6rem`, margin-bottom `.75rem`
- `.subcat-num` — 0.70rem, 600 weight, `color: var(--gold)`, `background: var(--gold-light)`, padding `.15rem .45rem`, border-radius 4px
- `.subcat-title` — Playfair Display, 1.1rem, 700, `color: var(--navy)`, margin 0

---

## 8. Teachings Table

### 8.1 Table Styles
```css
.teachings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .865rem;
  margin-bottom: .5rem;
}
.teachings-table thead tr {
  background: var(--navy);
  color: #fff;
}
.teachings-table thead th {
  padding: .55rem .85rem;
  font-weight: 600;
  font-size: .72rem;
  letter-spacing: .07em;
  text-transform: uppercase;
}
.teachings-table thead th:first-child { border-radius: 6px 0 0 0; }
.teachings-table thead th:last-child  { border-radius: 0 6px 0 0; }
.teachings-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background .12s;
}
.teachings-table tbody tr:hover { background: #fdf8ee; }
.teachings-table td {
  padding: .65rem .85rem;
  vertical-align: top;
}
```

### 8.2 Column Widths
| Column | Width | Header Label |
|---|---|---|
| Teaching | 58% | "Teaching" (or context-specific e.g. "Element of the Lord's Prayer") |
| Scriptures | 42% | "Scriptures" |

**Always exactly 2 columns. Never 3.**

### 8.3 Teaching Cell
```html
<td class="teaching-text">
  {Teaching description text}
  <span class="parable-badge">Parable</span>   ← only when applicable
</td>
```
- `.teaching-text` — `color: var(--ink)`, line-height 1.55
- `<em>` within teaching-text — italic, `color: var(--muted)`, 0.82rem (used for parenthetical notes)
- `.parable-badge` — inline-block, `background: #f3e8ff`, `color: #7e22ce`, 0.65rem, 700 weight, uppercase, letter-spacing .07em, padding `.1rem .4rem`, border-radius 3px, `margin-left: .3rem`, `vertical-align: middle`

### 8.4 Scripture Reference Cell
```html
<td class="ref-cell">
  <a class="scripture-ref primary-ref" data-ref="{Full Ref}" href="{BLB URL}" target="_blank">{Short Label}</a>
  <span class="sep">·</span>
  <a class="scripture-ref" data-ref="{Full Ref}" href="{BLB URL}" target="_blank">{Short Label}</a>
  <span class="sep">·</span>
  <a class="scripture-ref" data-ref="{Full Ref}" href="{BLB URL}" target="_blank">{Short Label}</a>
</td>
```

**Rules:**
- Primary reference always first, always `.primary-ref` (bold)
- Cross-references follow on the **same line**, separated by `<span class="sep">·</span>`
- If no cross-references exist, only the primary link is present — no separator, no dash
- All links open in `target="_blank"`
- `.ref-cell` — `font-size: .82rem; line-height: 1.8`
- `.sep` — `color: #bbb; margin: 0 .2rem; font-size: .75rem`

---

## 9. Scripture Reference Links

### 9.1 Link Styles
```css
a.scripture-ref {
  color: var(--gold);
  text-decoration: none;
  font-weight: 400;
  font-size: .82rem;
  border-bottom: 1px dashed var(--gold-mid);
  margin-right: .1rem;
  transition: color .15s, border-color .15s;
}
a.scripture-ref.primary-ref {
  font-weight: 700;
  font-size: .85rem;
}
a.scripture-ref:hover {
  color: #6b5020;
  border-bottom-style: solid;
}
```

### 9.2 Blue Letter Bible URL Format
```
https://www.blueletterbible.org/nkjv/{book}/{chapter}/{verse}/
```

Book abbreviations for BLB URLs:
| Book | Abbreviation |
|---|---|
| Matthew | mat |
| Mark | mar |
| Luke | luk |
| John | jhn |
| Acts | act |
| Romans | rom |
| 1 Corinthians | 1co |
| 2 Corinthians | 2co |
| Galatians | gal |
| Ephesians | eph |
| Philippians | php |
| Colossians | col |
| 1 Thessalonians | 1th |
| 2 Thessalonians | 2th |
| 1 Timothy | 1ti |
| 2 Timothy | 2ti |
| Hebrews | heb |
| James | jas |
| 1 Peter | 1pe |
| 2 Peter | 2pe |
| 1 John | 1jo |
| Revelation | rev |

For verse ranges (e.g. Matt 5:3–12), the BLB link points to the **opening verse only**:
```
https://www.blueletterbible.org/nkjv/mat/5/3/
```

### 9.3 `data-ref` Attribute Format
The `data-ref` attribute on every scripture link must use the **full book name** and **exact verse range** for use by the tooltip fetch system:
```
data-ref="Matthew 5:3-12"
data-ref="Mark 4:30-32"
data-ref="1 Corinthians 13:1-3"
```

### 9.4 Short Label Format (visible link text)
Use standard abbreviations:
```
Matt · Mark · Luke · John · Acts · Rom · 1 Cor · 2 Cor
Gal · Eph · Phil · Col · 1 Thess · 2 Thess · 1 Tim · 2 Tim
Heb · Jas · 1 Pet · 2 Pet · 1 John · Rev
```
Verse ranges use en dash: `Matt 5:3–12` (not hyphen)

---

## 10. Scripture Tooltip System

### 10.1 Tooltip HTML (placed just before closing `</body>`)
```html
<div id="scripture-tooltip">
  <span class="tip-ref"></span>
  <span class="tip-version">New King James Version</span>
  <span class="tip-text"></span>
  <span class="tip-blb">↗ Click to open Blue Letter Bible</span>
</div>
```

### 10.2 Tooltip CSS
```css
#scripture-tooltip {
  position: fixed;
  z-index: 9999;
  background: var(--white);
  border: 1px solid var(--gold-mid);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  max-width: 340px;
  box-shadow: 0 8px 28px rgba(0,0,0,.13);
  pointer-events: none;
  opacity: 0;
  transition: opacity .18s;
  font-size: .82rem;
  line-height: 1.6;
}
#scripture-tooltip.visible { opacity: 1; }
#scripture-tooltip .tip-ref     { font-weight: 700; color: var(--navy); font-family: 'Playfair Display', serif; font-size: .95rem; margin-bottom: .4rem; display: block; }
#scripture-tooltip .tip-version { font-size: .68rem; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: .4rem; display: block; }
#scripture-tooltip .tip-text    { color: var(--ink); font-style: italic; }
#scripture-tooltip .tip-loading { color: var(--muted); font-style: italic; }
#scripture-tooltip .tip-blb     { display: block; margin-top: .6rem; font-size: .7rem; color: var(--gold); text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
```

### 10.3 Tooltip JavaScript
```javascript
const tooltip = document.getElementById('scripture-tooltip');
const tipRef  = tooltip.querySelector('.tip-ref');
const tipText = tooltip.querySelector('.tip-text');
const cache   = {};

function parseRef(ref) {
  const bookMap = {
    'matthew':'matthew','mark':'mark','luke':'luke','john':'john',
    'acts':'acts','romans':'romans',
    '1 corinthians':'1+corinthians','2 corinthians':'2+corinthians',
    'galatians':'galatians','ephesians':'ephesians',
    'philippians':'philippians','colossians':'colossians',
    '1 thessalonians':'1+thessalonians','2 thessalonians':'2+thessalonians',
    '1 timothy':'1+timothy','2 timothy':'2+timothy',
    'hebrews':'hebrews','james':'james',
    '1 peter':'1+peter','2 peter':'2+peter',
    '1 john':'1+john','2 john':'2+john','3 john':'3+john',
    'revelation':'revelation'
  };
  const match = ref.match(/^([1-3]?\s?[a-zA-Z]+(?:\s[a-zA-Z]+)?)\s+(\d+:\d+(?:-\d+)?)$/);
  if (!match) return null;
  const bookRaw = match[1].trim().toLowerCase();
  const bookKey = bookMap[bookRaw] || bookRaw.replace(/\s/g, '+');
  const cv = match[2].replace(/\s/g, '');
  return `${bookKey}+${cv}`;
}

async function fetchVerse(ref) {
  if (cache[ref]) return cache[ref];
  const query = parseRef(ref);
  if (!query) return 'Reference not found.';
  try {
    const r = await fetch(`https://bible-api.com/${query}?translation=nkjv`);
    const data = await r.json();
    if (data.error) return 'Unable to retrieve verse.';
    const txt = data.verses.map(v => `${v.verse}. ${v.text.trim()}`).join(' ');
    cache[ref] = txt;
    return txt;
  } catch(e) {
    return 'Could not load scripture.';
  }
}

let hideTimer;

document.querySelectorAll('a.scripture-ref').forEach(link => {
  link.addEventListener('mouseenter', async (e) => {
    clearTimeout(hideTimer);
    const ref = link.dataset.ref;
    tipRef.textContent = ref;
    tipText.textContent = 'Loading…';
    tipText.classList.add('tip-loading');
    tooltip.classList.add('visible');
    positionTooltip(e);
    const text = await fetchVerse(ref);
    tipText.classList.remove('tip-loading');
    tipText.textContent = text;
    positionTooltip(e);
  });
  link.addEventListener('mousemove', positionTooltip);
  link.addEventListener('mouseleave', () => {
    hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 200);
  });
});

function positionTooltip(e) {
  const pad = 16;
  const tw = tooltip.offsetWidth || 340;
  const th = tooltip.offsetHeight || 100;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + tw > window.innerWidth  - pad) x = e.clientX - tw - pad;
  if (y + th > window.innerHeight - pad) y = e.clientY - th - pad;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}
```

### 10.4 Sidebar Scroll-Spy JavaScript
```javascript
const sections = document.querySelectorAll('section[id]');
const tocLinks = document.querySelectorAll('.sidebar a[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 80) current = s.id;
  });
  tocLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });
```

---

## 11. Application Tag Taxonomy

Use these tags consistently across categories. Each category should have 2–4 tags. Choose the most directly applicable.

| Tag | Class | Use When Teaching Impacts... |
|---|---|---|
| Identity & Worldview | `tag-blue` | How we see ourselves, God, and reality |
| Values & Priorities | `tag-green` | What we treat as important or worth pursuing |
| Money & Possessions | `tag-amber` | Financial decisions, generosity, materialism |
| Relationships | `tag-rose` | Marriage, family, friendships, community |
| Spiritual Disciplines | `tag-purple` | Prayer, fasting, worship, Scripture engagement |
| Inner Life & Character | `tag-blue` | Heart attitudes, motives, emotions |
| Community & Mission | `tag-green` | Church, witness, serving others |
| Ethics & Integrity | `tag-amber` | Honesty, speech, keeping commitments |
| Suffering & Resilience | `tag-rose` | Navigating hardship, persecution, loss |
| Dependence & Trust | `tag-purple` | Surrender, anxiety, faith under pressure |

---

## 12. ID & Anchor Naming Convention

| Element | ID Pattern | Example |
|---|---|---|
| Category section | `cat-{N}` | `cat-1`, `cat-12` |
| Subcategory block | `cat-{N}-{M}` | `cat-1-1`, `cat-3-2` |
| Sidebar TOC | `toc-sidebar` | — |

Sidebar `href` values must exactly match section `id` values with a `#` prefix.

---

## 13. Content Rules

### 13.1 Teaching Descriptions
- Written as concise, third-person summaries of what Jesus taught — not interpretations
- Present tense: "Kingdom like a mustard seed — small beginning, vast growth"
- Do not editorialize or add doctrinal commentary
- Parable indicator: append `<span class="parable-badge">Parable</span>` inline after the text

### 13.2 Scripture Coverage
- Pull from all four Gospels (Matthew, Mark, Luke, John)
- Include relevant post-resurrection words of Jesus (Acts 1, Rev 1–3 letters)
- Include words of Jesus quoted in Epistles where clearly attributed
- All four Gospel parallels should be cross-referenced, not listed as separate teachings

### 13.3 Cross-References
- Always include parallel Gospel accounts as cross-references
- Do not repeat the same teaching in multiple categories — choose the best-fit category and cross-reference if needed
- Maximum ~5 cross-reference links per teaching row to avoid visual clutter

### 13.4 Category Source Book Subtitle
- The `.cat-subtitle` line under the category title lists which NT books are primary sources for that category
- Format: `Matt · Mark · Luke · John · Acts · Rev` (use only those applicable)

---

## 14. Final Document Checklist

Before delivering the final HTML, verify:

- [ ] All 20 categories present with correct IDs
- [ ] All subcategories in TOC sidebar with correct anchor links
- [ ] Every teaching row has a primary scripture link (bold)
- [ ] Cross-refs on same line, separated by `·` separator
- [ ] All BLB URLs use `/nkjv/` in the path
- [ ] All `data-ref` attributes use full book names (for tooltip API)
- [ ] Tooltip JS uses `translation=nkjv`
- [ ] No subtitle text under the `<h1>` in the header
- [ ] No sample banner in final output
- [ ] Scroll-spy JS targets `section[id]` elements correctly
- [ ] Section rules (`<hr class="section-rule">`) between all categories except the last
- [ ] Responsive CSS breakpoint at 768px included
