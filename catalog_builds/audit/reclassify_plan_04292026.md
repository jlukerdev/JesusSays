**ignore this file for any future catalog decisions**

# Reclassify Plan: Revise G-2 and G-3 Override Rules

**Status:** Complete — CLASSIFICATION_RULES.md updated  
**Date:** 2026-04-29  
**Scope:** `catalog_builds/engine/CLASSIFICATION_RULES.md` only — no teachings.json changes in this phase

---

## Background and Findings

### G-2 (Passion Narrative → Cat 27)
- Cat 27 currently has 29 teachings — all are event-bound: Last Supper institution, betrayal/denial predictions, Gethsemane, arrest, trial, cross words
- John 13–16 passages are already classified in topical categories (Cat 2, 3, 11, 13, etc.) — G-2 was not being followed for the Upper Room Discourse in practice
- G-2 as written ("ALL teachings spoken from Last Supper through Crucifixion") conflicted with actual catalog practice and caused a documented exception for I AM declarations in 2.1 that was never generalized
- The catalog had already de facto classified all John 13–16 theological discourse topically

### G-3 (Post-Resurrection → Cat 28)
- Cat 28 has 18 teachings; many fit clearly in other categories:
  - Thomas encounter (28.2.x) → Cat 7 (Faith and Trust)
  - Great Commission (28.4.1) → already cross-listed in Cat 26.5
  - Acts 1:4–8 (28.4.2) → Cat 26.6
  - Peter restoration/commission (28.3.1–28.3.2) → Cat 22.1 / Cat 26
  - Damascus road (28.1.4) → Cat 26.6
- Appearance-narrative utterances (showing wounds, eating fish, Emmaus road) have a natural home in Cat 28 without an override rule forcing everything there

---

## Phase 1 — Revise G-2

**Status:** ✅ Complete

**Change:** Replace the temporal sweep with an event-bound rule.

**New G-2 text:**
> Utterances spoken during the active events of the Passion — the institution of the Lord's Supper, betrayal and denial predictions at table, Gethsemane, the arrest, the trials, and the Crucifixion — belong to **Cat 27 (Passion Narrative)**. Scope: synoptic Passion (Matt 26–27 / Mark 14–15 / Luke 22–23) + John 18–19. The Farewell Discourse (John 13:31–16:33) is classified by primary topical content. John 17 remains under G-1.

**Files changed:** `catalog_builds/engine/CLASSIFICATION_RULES.md`
- [x] Global override table: G-2 row updated
- [x] Cat 27 theological scope and guiding principle updated
- [x] Inclusion themes: removed "Upper Room Discourse (John 13–16)" and "Foot washing"
- [x] "Note on Upper Room Discourse" block removed
- [x] Subcategory 27.1 description updated
- [x] Quick-reference table: "Any teaching in John 13–16" row updated
- [x] Cat 2.1 G-2 Exception note removed (now moot)
- [x] Cat 3.1 stale G-2 reference updated

---

## Phase 2 — Remove G-3, Redefine Cat 28

**Status:** ✅ Complete

**Change:** Remove G-3 as a hard override rule. Replace with a descriptive classification principle for Cat 28.

**New Cat 28 guiding principle:**
> Cat 28 is the home for words of the risen Christ whose primary meaning is tied to the resurrection appearance context — greetings, proofs of bodily resurrection, and appearance-bound interactions. Teachings that happen to occur post-resurrection but are topically self-contained classify to their topical category.

**Teachings that migrate out of Cat 28 (for future catalog pass):**

| Teaching | Current Location | Moves To |
|---|---|---|
| Thomas encounter (28.2.x) | Cat 28.2 | Cat 7 (Faith and Trust) |
| "Feed my sheep" / "Follow me" (28.3.1–2) | Cat 28.3 | Cat 22.1 / Cat 26 |
| Great Commission (28.4.1) | Cat 28.4 | Cat 26.5 only |
| Acts 1:4–8 (28.4.2) | Cat 28.4 | Cat 26.6 |
| Damascus road (28.1.4) | Cat 28.1 | Cat 26.6 |

**Teachings that stay in Cat 28:**
- Emmaus road dialogue (28.1.5–28.1.7)
- Proof-of-body appearances / greetings to gathered disciples (28.1.1, 28.1.8–28.1.9)
- Appearance-narrative fishing scene, John 21 (28.3.3–28.3.5)

**Subcategory decision:** Cat 28.4 ("Final Commission and Ascension") removed. Great Commission lives only in Cat 26.5 (Option A).

**Files changed:** `catalog_builds/engine/CLASSIFICATION_RULES.md`
- [x] Global override table: G-3 row removed
- [x] "How to Use" step 6: Cat 28 removed from list of hard-capture categories
- [x] Cat 28 theological scope and guiding principle rewritten
- [x] Inclusion themes updated to reflect appearance-narrative scope
- [x] Explicit routing notes added for migrating teachings
- [x] Subcategory 28.4 removed
- [x] Quick-reference table: G-3 rows updated
- [x] Cat 25 / Cat 26 stale 28.4 cross-references removed

---

## Phase 3 — Future Catalog Pass (Not in scope for this plan)

The following teaching migrations are documented above but require a separate catalog operation on `public/teachings.json`:
- Move 28.2.x → Cat 7
- Move 28.3.1–2 → Cat 22.1 / Cat 26
- Move 28.4.1 → Cat 26.5 primary
- Move 28.4.2 and 28.1.4 → Cat 26.6

---

## Verification Checklist

- [x] G-2 text no longer says "ALL teachings spoken from the Last Supper through the Crucifixion" — reads "active events of the Passion"
- [x] G-3 is absent from the global overrides table
- [x] "How to Use" step 6 no longer lists Cat 28 as a hard-capture category
- [x] Cat 27 no longer claims John 13–16 as its scope
- [x] "Note on Upper Room Discourse" block is gone from Cat 27
- [x] Cat 28 description explicitly scopes to appearance-narrative utterances
- [x] Cat 28.4 subcategory is gone
- [x] Quick-reference table: "Any teaching in John 13–16" updated to topical classification
- [x] Quick-reference table: "Any teaching in Matt 28 / Mark 16 / Luke 24 / John 20–21" no longer references G-3
- [x] Quick-reference table: "The Great Commission" row shows Cat 26.5 only
