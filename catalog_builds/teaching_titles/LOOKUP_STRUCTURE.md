# Lookup Table Structure Guide

This document defines the structure and format of the lookup tables needed for the title assignment implementation.

---

## Overview

The implementation phase (Phase 2) will require three JSON lookup tables plus one catch-all for all remaining teachings:

| Lookup Table | Purpose | Source | Entries | Priority |
|---|---|---|---|---|
| `parable_titles.json` | Map parable ID → canonical title | TAG_RULES.md lines 47–91 | 37 | 🔴 High |
| `i-am_titles.json` | Map I AM teaching ID → I AM declaration | John gospel + CLASSIFICATION_RULES | ~7 | 🔴 High |
| `woe_titles.json` | Map woe teaching ID → woe title | Matt 23 context + CLASSIFICATION_RULES | ~8 | 🟡 Medium |
| `other_titles.json` | Map teaching ID → derived title | Teaching text + category context | ~600 | 🟡 Medium |

---

## 1. `parable_titles.json`

**Source:** Extract from `TAG_RULES.md` Canonical Parable Reference List (rows 47–91).

**Structure:**
```jsonc
{
  "4.1.1": "The Parable of the Mustard Seed",
  "4.1.2": "The Parable of the Leaven",
  "4.1.3": "The Hidden Treasure and Pearl of Great Price",
  "4.1.4": "The Parable of the Net",
  "4.1.5": "The Wedding Banquet",
  // ... 32 more entries (37 total)
  "29.4.1": "The Lesson of the Fig Tree"
}
```

**Extraction rule:**
- Key: `"id"` column from TAG_RULES table (e.g., "4.1.1")
- Value: `"Parable Title"` column from TAG_RULES table
- **Important:** TAG_RULES already has the authoritative names — transcribe them exactly, with no modification

**All 37 parable IDs:**
```
4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5, 4.1.6, 4.1.11, 
4.2.1, 4.2.2, 4.2.3, 4.2.5, 
4.5.1, 4.5.2, 4.5.3, 
5.1.4, 5.2.1, 5.2.2, 5.2.3, 
9.3.1, 
10.3.2, 10.3.3, 
13.1.2, 
14.6.2, 
15.3.1, 15.3.2, 15.3.3, 
18.1.3, 18.2.3, 
20.2.1, 20.3.3, 20.3.4, 
21.3.2 (cross-list: Good Samaritan = 13.1.2),
22.2.4, 
24.2.3 (cross-list: Pharisee & Tax Collector = 15.3.2),
29.3.2, 29.3.3 (cross-list: Ten Virgins = 4.1.6), 29.3.6, 29.4.1
```

**Cross-listed parables:**
- `13.1.2` (Good Samaritan) and `21.3.2` → same title: "The Good Samaritan"
- `15.3.2` (Pharisee & Tax Collector) and `24.2.3` → same title: "The Pharisee and the Tax Collector"
- `4.1.6` (Ten Virgins) and `29.3.3` → same title: "The Ten Virgins"

**Total entries:** 37 (unique IDs, including cross-lists)

---

## 2. `i-am_titles.json`

**Source:** Category 2.1 (The "I AM" Declarations) from the live catalog; cross-referenced with John gospel text.

**Structure:**
```jsonc
{
  "2.1.1": "I Am the Bread of Life",
  "2.1.2": "I Am the Light of the World",
  "2.1.3": "I Am the Door",
  "2.1.4": "I Am the Good Shepherd",
  "2.1.5": "I Am the Resurrection and the Life",
  "2.1.6": "I Am the Way, the Truth, and the Life",
  "2.1.7": "I Am the True Vine"
}
```

**Derivation rule:**
- Key: Teaching ID in Category 2.1
- Value: The canonical "I AM + predicate" statement as it appears in the teaching's primary reference (usually John)
- **Important:** Use Jesus's exact phrasing from the Johannine text; do not paraphrase or abbreviate

**Discovery process:**
1. Run `node catalog_builds/engine/scripts/parse-catalog.js --stats` to get current count
2. Manually iterate through Category 2.1 in the live `public/teachings.json`
3. For each teaching, read the `"text"` field and primary `"references"` to identify the exact I AM statement
4. Transcribe the statement with proper capitalization ("I Am the..." not "i am the...")

**Expected count:** ~7 teachings (may vary if additional I AM-related teachings exist)

---

## 3. `woe_titles.json`

**Source:** Category 24.1 (Denunciations / Seven Woes) and Matthew 23 text context.

**Structure:**
```jsonc
{
  "24.1.1": "Woe for Shutting the Kingdom",
  "24.1.2": "Woe for Devouring Widows' Houses",
  "24.1.3": "Woe for Making Converts Twice as Much Hell's Children",
  "24.1.4": "Woe for Blindness and Oaths",
  "24.1.5": "Woe for Neglecting Mercy and Justice",
  "24.1.6": "Woe for Inner Filthiness",
  "24.1.7": "Woe for Hypocrisy",
  "24.1.8": "Woe for Persecuting the Prophets"
}
```

**Format rule:** `"Woe for [specific accusation]"`

**Derivation process:**
1. Read each teaching's primary reference (usually Matthew 23 verses)
2. Identify the core accusation or failing Jesus highlights
3. Phrase as "Woe for [accusation]" (verb form when possible: "Neglecting" not "Neglect")
4. Keep to ≤5 words per title

**Expected count:** ~8 teachings (one woe per Matthew 23 passage)

---

## 4. `other_titles.json`

**Source:** All remaining teachings (654 - 37 parables - 7 I AMs - 8 woes = ~602 teachings).

**Structure:**
```jsonc
{
  "1.1.1": "Blessed Are the Poor in Spirit",
  "1.1.2": "Do Not Be Anxious; Trust God",
  "1.1.3": "You Are Worth More Than Sparrows",
  "1.2.1": "Worship God in Spirit and Truth",
  "1.3.1": "God So Loved the World",
  // ... 597 more entries
  "31.4.2": "The Time of Worship Is Now"
}
```

**Derivation process:**
1. **Category-first approach:** Iterate through categories in order (1–31)
2. **Within category:** Process subcategories in order
3. **Within subcategory:** Review each teaching's `"text"` field (the thematic summary)
4. **Derive title:** Extract the core theological or instructional theme, keeping ≤10 words
5. **Consistency check:** Verify title format aligns with the category's established style

**Guidelines by category type:**

| Category Type | Title Format | Example |
|---|---|---|
| Positive virtues / beatitudes | "[Virtue/Action] is blessed" or "Blessed [criterion]" | "Blessed Are the Poor in Spirit" |
| Commands / instructions | "[Verb] [object]" or "Do [action]" | "Love Your Enemies", "Give Generously" |
| Warnings / cautions | "Do not [negative]" or "Avoid [pitfall]" | "Do Not Worry", "Beware of Hypocrisy" |
| Promises / assurances | "[Outcome] for [condition]" or "[Subject] will [promise]" | "Ask and You Will Receive" |
| Declarations / identity | "[Subject] is/am [predicate]" | "I Am the Good Shepherd" (I AMs) |
| Comparative teachings | "[Thing A] vs. [Thing B]" | "The Wise and Foolish Builders" |
| Eschatological | "The [event/sign]" | "The Sign of the Son of Man" |

**Examples by category:**

```jsonc
// Category 1: God the Father
{
  "1.1.1": "Blessed Are the Poor in Spirit",
  "1.1.2": "Your Father Knows What You Need"
}

// Category 5: Repentance
{
  "5.1.1": "Repent or You Will Perish",
  "5.1.2": "Remove the Plank from Your Eye"
}

// Category 6: Salvation
{
  "6.1.1": "Come to Me, All Who Are Weary",
  "6.1.2": "Believe in Me for Eternal Life"
}

// Category 10: Prayer
{
  "10.1.1": "The Lord's Prayer",
  "10.2.1": "Ask and You Will Receive"
}

// Category 13: Love
{
  "13.1.1": "Love God and Love Your Neighbor",
  "13.2.1": "Love Your Enemies"
}

// Category 20: Wealth
{
  "20.1.1": "No One Can Serve Two Masters",
  "20.3.1": "Give to Those Who Ask"
}

// Category 26: Great Commission
{
  "26.1.1": "Go and Make Disciples of All Nations"
}

// Category 30: Judgment
{
  "30.1.1": "Whatever You Did for the Least",
  "30.2.1": "The Outer Darkness and Weeping"
}
```

**Expected count:** ~600 teachings

---

## Integration with Implementation Script

If using **Option B** (new `add-titles.js` script), the script will:

```javascript
// Pseudocode
const parabletitles = loadJSON('parable_titles.json');
const iamTitles = loadJSON('i-am_titles.json');
const woeTitles = loadJSON('woe_titles.json');
const otherTitles = loadJSON('other_titles.json');

for (const teaching of teachings) {
  let title = null;

  // Priority 1: Parable
  if (teaching.tags.includes('parable')) {
    title = parableTitles[teaching.id];
  }
  // Priority 2: I AM (by category)
  else if (teaching.id.startsWith('2.1')) {
    title = iamTitles[teaching.id];
  }
  // Priority 3: Woe (by category)
  else if (teaching.id.startsWith('24.1')) {
    title = woeTitles[teaching.id];
  }
  // Priority 4: Other
  else {
    title = otherTitles[teaching.id];
  }

  // Validate and assign
  if (!title) {
    throw new Error(`No title found for teaching ${teaching.id}`);
  }
  if (title.split(' ').length > 10) {
    throw new Error(`Title for ${teaching.id} exceeds 10 words: "${title}"`);
  }

  teaching.title = title;
}
```

---

## File Format

All lookup tables are **JSON objects** (not arrays), with teaching ID as key and title string as value.

**Validation rules:**
- Keys must be valid teaching IDs (matching regex: `\d+\.\d+(\.\d+)?`)
- Values must be non-empty strings
- Values must not exceed 10 words
- All IDs in the teaching should have a key in one of the four lookups
- No duplicate IDs across lookup tables (except cross-listed parables, which use same title)

---

## Manual vs. Automated Creation

### Option 1: Manual creation (safer, slower)
1. Open `public/teachings.json` and `TITLE_EXAMPLES.md` side-by-side
2. For each teaching, manually write or copy the title
3. Paste into the corresponding lookup JSON file
4. Validate JSON syntax

### Option 2: CSV intermediate (structured, auditable)
1. Export each lookup type to CSV with columns: `id`, `title`, `notes` (optional)
2. Fill in titles manually or with AI assistance
3. Review and validate all titles in CSV
4. Convert CSV back to JSON
5. Integrate into script

### Option 3: Programmatic extraction (fastest for parables)
For parables, extract directly from TAG_RULES.md:
```bash
# Pseudocode (extract from TAG_RULES.md table rows 51–91)
grep "^|" TAG_RULES.md | awk -F'|' '{print $2 ": " $3}' | ...
```

---

## Checklist for Completeness

Before implementation, verify:

- [ ] `parable_titles.json`: All 37 parable IDs present, titles match TAG_RULES exactly
- [ ] `i-am_titles.json`: All ~7 I AM IDs in Category 2.1 present, titles match John gospel phrasing
- [ ] `woe_titles.json`: All ~8 woe IDs in Category 24.1 present, titles follow "Woe for [accusation]" format
- [ ] `other_titles.json`: All ~600 remaining IDs present, no duplicates across lookups
- [ ] All titles: ≤10 words, title case, no trailing punctuation
- [ ] No IDs appear in multiple lookup tables (except cross-listed parables)
- [ ] All JSON syntax valid (test with `jq` or Node.js)
- [ ] No teaching without a title mapping

---

## Notes

- **Cross-listed teachings:** The Good Samaritan, Pharisee & Tax Collector, and Ten Virgins appear in two categories each. They must have the *same* title in both locations (store in one lookup, reference in both).
- **Case sensitivity:** Teaching IDs are case-insensitive in practice but should be stored in lowercase (e.g., "1.1.1" not "1.1.1").
- **Sorting:** Not required for lookup table JSON (objects are unordered), but optional for readability if you prefer IDs sorted numerically.
