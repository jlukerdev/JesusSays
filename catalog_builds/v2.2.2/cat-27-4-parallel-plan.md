# cat 27.4 Parallel Audit — Implementation Plan

## Caveat — read first

`d:/git/Personal/JesusSays/catalog_builds/CLAUDE.md` declares the entire `catalog_builds/` tree out of scope for any future changes, with `public/teachings.json` named as the live edit target. The user explicitly directed new artifacts into `catalog_builds/v2.2.2/` mirroring v2.1/v2.1.1, so this plan proceeds — but flagging in Open Questions in case it should redirect to `public/teachings.json` directly.

---

## 1. Findings Table

KJV text cited briefly to corroborate. Order = current 27.4.N.

### 27.4.1 — Luke 23:43 — "Today shalt thou be with me in paradise"

| Gospel | Verse | Status | Notes |
|---|---|---|---|
| Luke | 23:43 | already in catalog (primary) | "Verily I say unto thee, To day shalt thou be with me in paradise." |
| Matt | — | n/a | No parallel — Matthew records two thieves reviling (Matt 27:44) but no repentant thief saying. |
| Mark | — | n/a | No parallel — Mark 15:32 records both robbers reviling, no saying. |
| John | — | n/a | No parallel. |

**Verdict:** Single-gospel saying. **No additions needed.**

---

### 27.4.2 — John 19:26-27 — "Woman, behold thy son! Behold thy mother!"

| Gospel | Verse | Status | Notes |
|---|---|---|---|
| John | 19:26–27 | already in catalog (primary) | "Woman, behold thy son! ... Behold thy mother!" |
| Matt / Mark / Luke | — | n/a | No synoptic parallel. The synoptics mention women (incl. Mary) at the cross but no saying. |

**Verdict:** Single-gospel saying. **No additions needed.**

---

### 27.4.3 — Matt 27:46 / Mark 15:34 — "Eli, Eli, lama sabachthani?"

| Gospel | Verse | Status | Notes |
|---|---|---|---|
| Matt | 27:46 | already in catalog (primary) | "Eli, Eli, lama sabachthani? that is to say, My God, my God, why hast thou forsaken me?" |
| Mark | 15:34 | already in catalog | "Eloi, Eloi, lama sabachthani? which is, being interpreted, My God, my God, why hast thou forsaken me?" |
| Luke / John | — | n/a | No parallel. |

**Verdict:** Both attestations present, primary correctly Matthew. **No additions needed.**

---

### 27.4.4 — John 19:28 — "I thirst."

| Gospel | Verse | Status | Notes |
|---|---|---|---|
| John | 19:28 | already in catalog (primary) | "After this, Jesus knowing that all things were now accomplished, that the scripture might be fulfilled, saith, I thirst." |
| Matt / Mark / Luke | — | n/a | The vinegar-on-a-sponge moment is recorded in Matt 27:48 / Mark 15:36 / Luke 23:36, but only **John records the saying itself**. The synoptics narrate the response, not the cry. |

**Verdict:** Single-gospel saying. **No additions needed** (synoptic vinegar-sponge verses are reactions, not parallels of the saying).

---

### 27.4.5 — John 19:30 — "It is finished:"

| Gospel | Verse | Status | Notes |
|---|---|---|---|
| John | 19:30 | already in catalog (primary) | "When Jesus therefore had received the vinegar, he said, It is finished: and he bowed his head, and gave up the ghost." |
| Matt / Mark / Luke | — | n/a | The synoptics record the death moment but not this saying. |

**Verdict:** Single-gospel saying. **No additions needed.**

---

### 27.4.6 — Luke 23:46 — "Father, into thy hands I commend my spirit:"

| Gospel | Verse | Status | Notes |
|---|---|---|---|
| Luke | 23:46 | already in catalog (primary) | "And when Jesus had cried with a loud voice, he said, Father, into thy hands I commend my spirit: and having said thus, he gave up the ghost." |
| Matt | 27:50 | **MISSING** | "Jesus, when he had cried again with a loud voice, yielded up the ghost." — same death-cry moment, no quoted words. |
| Mark | 15:37 | **MISSING** | "And Jesus cried with a loud voice, and gave up the ghost." — same death-cry moment, no quoted words. |
| John | 19:30b | (already at 27.4.5) | "he bowed his head, and gave up the ghost" — but John attaches it to "It is finished," not to a Father-prayer. |

**Verdict:** Only existing teaching with a real parallel-attestation gap. Matt 27:50 and Mark 15:37 narrate the same loud-cry-then-expired moment. They do not record the *words* (only Luke does), but per the catalog's existing pattern (e.g. 27.4.3 attaches both Matt and Mark for the Eli cry), they are legitimate parallel refs for the same moment. **Recommend adding both as parallel refs.**

---

## 2. Recommended Ref Additions

Only one teaching needs ref additions. Patch:

```json
[
  {
    "teachingId": "27.4.6",
    "addRefs": [
      {
        "label": "Matt 27:50",
        "book": "Matthew",
        "bookAbbr": "Matt",
        "chapter": 27,
        "ranges": [[50, 50]],
        "isPrimary": true
      },
      {
        "label": "Mark 15:37",
        "book": "Mark",
        "bookAbbr": "Mark",
        "chapter": 15,
        "ranges": [[37, 37]],
        "isPrimary": false
      }
    ],
    "demoteExistingPrimary": "Luke 23:46"
  }
]
```

**Resulting refs after patch (27.4.6, sorted Matt > Mark > Luke > John):**

| Order | label | book | chapter | ranges | isPrimary |
|---|---|---|---|---|---|
| 1 | Matt 27:50 | Matthew | 27 | `[[50,50]]` | **true** |
| 2 | Mark 15:37 | Mark | 15 | `[[37,37]]` | false |
| 3 | Luke 23:46 | Luke | 23 | `[[46,46]]` | false |

Note: the canonical-order rule (Matt > Mark > Luke > John) demotes Luke from primary even though Luke is the only gospel that quotes the actual saying. Consistent with v2.1 decision-1. If the user prefers a content-quoting exception, this can flip — see Open Question #4.

No other 27.4.N teaching requires additions.

---

## 3. Recommendation on Luke 23:34a — "Father, forgive them"

### KJV text (verified)
> "Then said Jesus, Father, forgive them; for they know not what they do. And they parted his raiment, and cast lots." — Luke 23:34

### Critical-edition note
Luke 23:34a is bracketed/double-bracketed in NA28/UBS5 (omitted by P75, B, etc.). The catalog uses KJV, which retains it without brackets — treat as fully canonical for this dataset.

### Already-present concern
**Luke 23:34 is already in the catalog at teaching 18.2.4** (cat-18 Forgiveness, subcat 18.2). Quote there: "Father, forgive them; for they know not what they do." Not a blocker — it's normal in this catalog for a saying to appear in a thematic category and again in cat-27 as a passion-narrative entry. But worth flagging because the catalog has no cross-reference mechanism — 18.2.4 and a new 27.4.X would be independent records.

### Recommendation
**Add Luke 23:34a as part of cat 27.4** — yes. The traditional Seven Last Words framing is incomplete without it.

### Placement — two options

**Option A — Append as 27.4.7 (zero churn, recommended).** No existing IDs change. The current 27.4 ordering is not strictly chronological today (27.4.1 is Luke, 27.4.2 is John, 27.4.3 is Matt/Mark...), so appending keeps every existing ID stable and avoids invalidating bookmarks/permalinks.

**Option B — Insert at 27.4.1 (true chronological order).** "Father, forgive them" is the First Word. Re-sorted strictly chronologically:

| Chronological | Saying | Primary ref |
|---|---|---|
| 1 | Father, forgive them | Luke 23:34 |
| 2 | Today shalt thou be with me in paradise | Luke 23:43 |
| 3 | Woman, behold thy son | John 19:26-27 |
| 4 | Eli, Eli, lama sabachthani | Matt 27:46 |
| 5 | I thirst | John 19:28 |
| 6 | It is finished | John 19:30 |
| 7 | Father, into thy hands I commend my spirit | Luke 23:46 (or Matt 27:50) |

Renumber map for Option B (old → new):

| Old ID | New ID |
|---|---|
| (new) | 27.4.1 — Father, forgive them |
| 27.4.1 | 27.4.2 |
| 27.4.2 | 27.4.3 |
| 27.4.3 | 27.4.4 |
| 27.4.4 | 27.4.5 |
| 27.4.5 | 27.4.6 |
| 27.4.6 | 27.4.7 |

If Option B is chosen, mirror v2.1's pattern and emit a `redirects.json` mapping old → new.

**Recommendation: Option A.** Lowest risk, no link breakage.

### Draft entry (for either option)

```json
{
  "id": "27.4.7",
  "text": "From the cross Jesus prays for those who are crucifying him, asking the Father to forgive them on the ground that they do not understand what they are doing — extending mercy to his executioners at the very moment of his suffering.",
  "tags": [],
  "references": [
    {
      "label": "Luke 23:34",
      "book": "Luke",
      "bookAbbr": "Luke",
      "chapter": 23,
      "ranges": [[34, 34]],
      "isPrimary": true
    }
  ],
  "quote": "Father, forgive them; for they know not what they do."
}
```

Single-gospel saying — no parallel attestation in Matt / Mark / John. Matches existing single-attestation Luke entries (27.4.1, 27.4.6).

---

## 4. Implementation Steps

1. **Create the v2.2.2 build folder structure** (mirroring v2.1):
   ```
   catalog_builds/v2.2.2/
     scripts/apply-cat27-4-parallels.mjs
     output/teachings_v2_2_2.json
     reports/cat-27-4-patch-summary.json
     reports/redirects.json   (only if Option B chosen)
   ```

2. **Author `apply-cat27-4-parallels.mjs`** modeled on `catalog_builds/v2.1/scripts/apply-cat27-changes.mjs`:
   - Read input catalog (see Open Question #3 for which file).
   - Locate cat-27 → subcat 27.4.
   - Patch 27.4.6 references: add `Matt 27:50` (`isPrimary: true`), add `Mark 15:37` (`isPrimary: false`), set `Luke 23:46.isPrimary` to `false`.
   - Add new teaching for Luke 23:34. Option A: append as 27.4.7. Option B: unshift to position 0 and renumber.
   - Sort 27.4.6 refs Matt > Mark > Luke > John.
   - Write full patched catalog to `output/teachings_v2_2_2.json`.
   - Write `reports/cat-27-4-patch-summary.json` describing what changed.

3. **Validate** (sanity-print at end of script):
   - Old 27.4 teaching count = 6, new = 7.
   - 27.4.6 ref count: 1 → 3, primary now Matt 27:50.
   - New entry exists with primary Luke 23:34.
   - Every other category byte-identical to input.

4. **Promote to live** (separate manual step the user does): copy `catalog_builds/v2.2.2/output/teachings_v2_2_2.json` over `public/teachings.json`. Script must NOT touch `public/teachings.json` directly.

5. **Smoke test:** load 27.4 in the UI, confirm new entry renders, confirm 27.4.6 shows 3 refs with Matt as primary.

---

## 5. Open Questions for the User

1. **Append vs. insert (Option A vs. Option B)?** Default recommendation is Option A. Confirm.

2. **`catalog_builds/CLAUDE.md` says the directory is out of scope.** Proceed with `catalog_builds/v2.2.2/` (overriding for this build), or skip the build folder and patch `public/teachings.json` directly?

3. **Input file for the script:** `catalog_builds/teachings_v2.json` or `public/teachings.json`? They may have drifted — I can diff and report.

4. **Primary-ref rule for 27.4.6:** strict v2.1 rule (Matt 27:50 becomes primary even though Luke is the only gospel quoting the saying), or content-quoting exception (Luke 23:46 stays primary)?

5. **18.2.4 duplication:** Luke 23:34 already lives at 18.2.4 (Forgiveness). Acceptable to duplicate into 27.4, or leave it only at 18.2.4?

6. **`tags` field:** keep empty (consistent with existing 27.4 entries) or add `"cross"` / `"forgiveness"`?
