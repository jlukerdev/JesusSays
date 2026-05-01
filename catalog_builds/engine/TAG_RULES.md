# Tag Rules

This document defines the controlled tag taxonomy for the teachings catalog. Currently only one tag is governed: `"parable"`. All other tags (`"i-am"`, `"healing"`, `"prayer"`, `"prophecy"`, `"woe"`, `"blessing"`) are legacy/informational and are **not** part of the governed ruleset.

---

## The `"parable"` Tag

### Definition

A **parable** is a brief narrative or extended comparison in which a story drawn from ordinary life or nature is used to convey a single primary spiritual truth. To qualify as a parable, the teaching must have **all three** of the following characteristics:

1. **Narrative or comparison structure** — It tells a story (characters, action, setting) or draws an explicit "A is like B" comparison with some elaboration
2. **Figurative intent** — The story is not meant to be taken literally; it stands for something else (a spiritual reality, kingdom truth, or ethical principle)
3. **Self-contained meaning** — The parable makes its point without requiring the surrounding context to function as a spiritual illustration

### Exclude: Similitudes

A **similitude** is a compressed comparison that does not develop into a story. Similitudes are figurative but do not qualify as parables:
- "You are the salt of the earth" — metaphor/similitude, NOT a parable
- "As Jonah was three days in the whale's belly, so will the Son of Man be..." — typological comparison, NOT a parable
- "Beware of the leaven of the Pharisees" — metaphorical warning, NOT a parable

### Exclude: Illustrative Sayings

An **illustrative saying** uses a concrete image to make a general point but tells no story:
- "No one puts new wine into old wineskins" — this IS tagged `"parable"` in the catalog (it has a brief narrative element: *person doing an action with a result*); borderline cases already resolved in the reference list below

### Exclude: Direct Predictions or Commands

Teachings that use figurative language but are direct prophetic statements or commands:
- "The Son of Man will come like lightning from east to west" — eschatological metaphor, NOT a parable
- "I am the good shepherd" — "I AM" declaration with extended metaphor; the *shepherd/hireling* narrative portions ARE tagged parable (see reference list)

### Edge Case Protocol

When a teaching is uncertain:

1. Does it tell a brief story (even 1–2 sentences) with a character doing an action and a consequence? → **Lean parable**
2. Does it use a single image or metaphor without any action sequence? → **Not a parable** (similitude)
3. Is the teaching already in the reference list below? → **Use the reference list as the authoritative standard**

For genuinely ambiguous cases not in the reference list, default to **not tagging** rather than over-tagging. The `audit-catalog.js` script flags potential untagged candidates for human review.

---

## Canonical Parable Reference List

These are the 38 teachings currently tagged `"parable"`. This list is the authoritative standard. Do not remove the tag from any of these, and do not add the tag to a teaching not resembling these in form and function.

| ID | Parable Title | Category | Notes |
|---|---|---|---|
| 4.1.1 | Mustard Seed | Kingdom of God | Classic kingdom parable |
| 4.1.2 | Leaven in Flour | Kingdom of God | Classic kingdom parable |
| 4.1.3 | Hidden Treasure / Pearl of Great Price | Kingdom of God | Double parable |
| 4.1.4 | The Net (dragnet) | Kingdom of God | Classic kingdom parable |
| 4.1.5 | The Wedding Banquet | Kingdom of God | Narrative parable of invitation and rejection |
| 4.1.6 | The Ten Virgins | Kingdom of God | Parable of readiness |
| 4.1.11 | The Trained Scribe (householder) | Kingdom of God | Brief comparison |
| 4.2.1 | Seed Growing Secretly | Kingdom of God | Mark-only parable |
| 4.2.2 | The Sower | Kingdom of God | Foundational kingdom parable |
| 4.2.3 | Wheat and Tares | Kingdom of God | Extended narrative with interpretation |
| 4.2.5 | Explanation of the Sower | Kingdom of God | Tagged parable because it is the interpretive key to the parable itself |
| 4.5.1 | The Two Sons | Kingdom of God | Narrative with contrast |
| 4.5.2 | Workers in the Vineyard | Kingdom of God | Extended narrative |
| 4.5.3 | The Wicked Tenants | Kingdom of God | Narrative parable of judgment |
| 5.1.4 | The Barren Fig Tree | Repentance and Conversion | Narrative: owner, gardener, one-year extension |
| 5.2.1 | The Lost Sheep | Repentance and Conversion | Narrative: shepherd seeks, finds, rejoices |
| 5.2.2 | The Lost Coin | Repentance and Conversion | Narrative: woman seeks, finds, rejoices |
| 5.2.3 | The Lost Son (Prodigal Son) | Repentance and Conversion | Extended narrative parable |
| 9.3.1 | New Wine in Old Wineskins | The New Covenant | Brief narrative action with consequence; tagged as parable |
| 10.3.2 | The Persistent Friend at Midnight | Prayer and Communion | Narrative: man, door, bread |
| 10.3.3 | The Persistent Widow and Unjust Judge | Prayer and Communion | Extended narrative |
| 13.1.2 | The Good Samaritan | Love | Extended narrative parable |
| 14.6.2 | The Wise and Foolish Builders | Righteousness and Ethics | Two-part narrative parable |
| 15.3.1 | The Seat of Honor / Great Banquet | Humility and Servanthood | Two-part instructional parable |
| 15.3.2 | The Pharisee and the Tax Collector | Humility and Servanthood | Narrative contrast parable |
| 15.3.3 | The Unworthy Servants | Humility and Servanthood | Brief instructional narrative |
| 18.1.3 | Two Debtors | Forgiveness and Reconciliation | Brief narrative comparison |
| 18.2.3 | The Unforgiving Servant | Forgiveness and Reconciliation | Extended narrative parable |
| 20.2.1 | The Rich Fool | Wealth and Generosity | Brief narrative: man, barns, soul required |
| 20.3.3 | The Talents / Minas | Wealth and Generosity | Extended narrative with judgment |
| 20.3.4 | The Dishonest Manager | Wealth and Generosity | Extended narrative parable |
| 21.3.2 | The Good Samaritan | Justice and Mercy | Cross-listed from Cat 13; same teaching |
| 22.2.4 | The Tower Builder / King Going to War | Discipleship | Double parable of counting the cost |
| 24.2.3 | The Pharisee and the Tax Collector | Religious Hypocrisy | Cross-listed from Cat 15; same teaching |
| 29.3.2 | The Faithful and Unfaithful Servant | Eschatology | Narrative contrast |
| 29.3.3 | The Ten Virgins | Eschatology | Cross-listed from Cat 4; same teaching |
| 29.3.6 | The Servants with Lamps Lit | Eschatology | Brief narrative of readiness |
| 29.4.1 | The Fig Tree (lesson from the fig tree) | Eschatology | Extended comparison; tagged parable |

**Note on cross-listed parables:** The Good Samaritan appears at both 13.1.2 and 21.3.2; the Pharisee and Tax Collector at both 15.3.2 and 24.2.3; the Ten Virgins at both 4.1.6 and 29.3.3. These are intentional cross-classifications where the same teaching serves two distinct thematic purposes in the catalog.

---

### Removed from Canonical List (False Positives)

The following teachings were removed from the canonical parable list after B5 Pass 2 review (04/30/2026). The `"parable"` tag has been removed from each. They fail the three-part definition because their primary form is either eschatological narrative/prophecy or extended metaphor within an I AM declaration — not a parable in the strict sense.

| ID | Title | Reason for Removal |
|---|---|---|
| 2.1.11 | True Shepherd vs. Thief (entering by the door) | Extended metaphor embedded in an I AM declaration (John 10:1–5); primary identity claim, not a standalone parable |
| 2.1.13 | The Hireling (hired hand flees from the wolf) | Same discourse as 2.1.11; figurative contrast within the I AM / Good Shepherd declaration, not a self-contained parable |
| 20.4.1 | The Rich Man and Lazarus | Eschatological narrative — functions as prophetic/didactic teaching about afterlife reality, not a figurative story about something else |
| 21.2.1 | The Sheep and the Goats | Final judgment scene presented as literal eschatological event, not a figurative comparison; fails "figurative intent" criterion |

---

## Adding the `"parable"` Tag to a New Teaching

1. Run `audit-catalog.js --type parable-candidate` to see engine-flagged candidates
2. Evaluate each candidate against the three-part definition above
3. If it qualifies, add `"parable"` to the `tags` array in `teachings.json`
4. Run `renumber.js` (no ID changes expected, but validates the change)
5. Run `validate-catalog.js` — must pass

## Removing the `"parable"` Tag

Only remove the `"parable"` tag from a teaching if it clearly fails all three criteria of the definition AND it is not in the canonical reference list above. Removals from the reference list require explicit justification.

---

## Other Tags (Informational, Not Governed)

These tags exist in the catalog but are outside the governed ruleset. They may be added or removed without this process:

| Tag | Current use |
|---|---|
| `"i-am"` | Teachings containing an explicit "I AM" (ἐγώ εἰμι) declaration |
| `"healing"` | Teachings spoken in the context of a healing miracle |
| `"prayer"` | Teachings that are themselves prayers or direct quotations of Jesus praying |
| `"prophecy"` | Teachings with an explicit predictive or typological element |
| `"woe"` | Teachings that pronounce a woe (οὐαί) |
| `"blessing"` | Teachings that pronounce a blessing (μακάριος) |
