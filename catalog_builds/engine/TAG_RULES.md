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

These are the 35 teachings currently tagged `"parable"`. This list is the authoritative standard. Do not remove the tag from any of these, and do not add the tag to a teaching not resembling these in form and function.

| UID | ID | Parable Title | Category | Notes |
|---|---|---|---|---|
| b1ea8af6-a119-4549-a619-1beff4373c3e | 4.1.3 | The Mustard Seed | The Kingdom of God | Classic kingdom parable |
| 2373279b-48ef-491d-ad76-c79507b82be3 | 4.1.4 | The Leaven | The Kingdom of God | Classic kingdom parable |
| efc63fc0-e21b-4777-9cbf-04640c468496 | 4.1.5 | The Hidden Treasure | The Kingdom of God | Figurative parable of Kingdom value |
| a3dbe24e-91bc-466c-8165-565c07aa5d1c | 4.1.6 | The Net | The Kingdom of God | Classic kingdom parable |
| 9e803488-64bc-4b64-9690-4c99de1bfd1c | 4.1.7 | The Trained Scribe | The Kingdom of God | Brief comparison |
| 125835e1-2cf0-47c2-9d61-22a3f020f0c8 | 4.1.8 | The Wedding Banquet | The Kingdom of God | Narrative parable of invitation and rejection |
| 4cdd25c3-266b-44a3-bb27-052117046101 | 4.1.9 | The Ten Virgins | The Kingdom of God | Parable of readiness |
| 2de13c9a-74cd-4331-a552-f5ca0e9b8822 | 4.2.1 | The Sower | The Kingdom of God | Foundational kingdom parable |
| 85fbbcda-ad09-4ddb-b40e-98b9fac46a33 | 4.2.3 | The Wheat and Tares | The Kingdom of God | Extended narrative with interpretation |
| 902ba1b3-fc63-4020-ae9b-10bfa8a780a5 | 4.2.4 | The Meaning of the Sower | The Kingdom of God | Tagged parable because it is the interpretive key to the parable itself |
| d105e1fd-3e23-4aa8-b0d8-543a7f92caef | 4.2.5 | The Seed Growing Secretly | The Kingdom of God | Mark-only parable |
| 959645b0-e4e6-4649-9ff1-20b794f00dab | 4.5.1 | The Workers in the Vineyard | The Kingdom of God | Extended narrative |
| 32d1d115-a46a-4b11-a0e7-fd1d35f8030a | 4.5.2 | The Two Sons | The Kingdom of God | Narrative with contrast |
| eacf953b-19b8-4a40-9b8f-ca1b94c994a8 | 4.5.3 | The Wicked Tenants | The Kingdom of God | Narrative parable of judgment |
| 3da339f3-cdf0-405e-96ab-c26910c3f8c0 | 5.1.7 | The Barren Fig Tree | Repentance and Conversion | Narrative: owner, gardener, one-year extension |
| 2695c47f-2467-4be4-96c6-82ad97d43b35 | 5.2.1 | The Lost Sheep | Repentance and Conversion | Narrative: shepherd seeks, finds, rejoices |
| aceaad58-b604-49fa-a07d-0bf8291d5ea4 | 5.2.2 | The Lost Coin | Repentance and Conversion | Narrative: woman seeks, finds, rejoices |
| 0a17981c-fa65-4754-adab-a566f9f409d1 | 5.2.3 | The Prodigal Son | Repentance and Conversion | Extended narrative parable |
| 5a7b7741-b3bc-4b9e-b054-9957c2c6cb27 | 9.3.1 | New Wine in Old Wineskins | The New Covenant | Brief narrative action with consequence; tagged as parable |
| 0728e135-4e15-449f-815c-02487ee09c15 | 10.3.3 | The Persistent Friend at Midnight | Prayer and Communion | Narrative: man, door, bread |
| 5baa9b3b-5ba9-4f69-b649-795c1b647ee1 | 10.3.4 | The Persistent Widow and Unjust Judge | Prayer and Communion | Extended narrative |
| 8d047a5e-8aeb-4ad9-a785-05073e3c7dc1 | 13.1.2 | The Good Samaritan | Love | Extended narrative parable |
| f590d6ef-cf59-40de-8927-e75b4a02bd9d | 14.6.2 | The Wise and Foolish Builders | Righteousness and Ethics | Two-part narrative parable |
| 5bd10dcc-1622-4528-b206-02ed63a60a9d | 15.3.1 | The Great Banquet | Humility and Servanthood | Two-part instructional parable |
| 03619cdb-6483-480a-97b6-9dd4de9c23b0 | 15.3.2 | The Unworthy Servants | Humility and Servanthood | Brief instructional narrative |
| f752c5ed-679f-4964-aa03-e7d9d4c3241e | 18.1.2 | The Two Debtors | Forgiveness and Reconciliation | Brief narrative comparison |
| 3d3a14f8-3cad-47ba-a556-7aea8d74a564 | 18.2.3 | The Unforgiving Servant | Forgiveness and Reconciliation | Extended narrative parable |
| 9575853d-bf31-468e-a8f0-539e35b9ae5e | 20.2.3 | The Rich Fool | Wealth and Generosity | Brief narrative: man, barns, soul required |
| 25d9a453-e22d-403d-9750-30c9819911d2 | 20.3.4 | The Parable of the Talents | Wealth and Generosity | Extended narrative with judgment |
| 5a4f7467-0f93-4863-8618-ec383ea56397 | 20.3.6 | The Dishonest Manager | Wealth and Generosity | Extended narrative parable |
| fc005f97-b476-494f-957b-85d99ecda63b | 22.2.7 | The Tower Builder and King at War | Discipleship | Double parable of counting the cost |
| c91800ad-27a2-440c-a2e7-0bb65d50e42d | 24.2.8 | The Pharisee and the Tax Collector | Religious Hypocrisy | Narrative contrast parable |
| 4aa8f158-95d9-45e3-8244-ddb93833ee2a | 29.3.2 | The Faithful and Unfaithful Servant | Eschatology and the End Times | Narrative contrast |
| e7ed4184-06f3-4feb-8eb5-a02b12cd974a | 29.3.3 | The Servants with Lamps Lit | Eschatology and the End Times | Brief narrative of readiness |
| 9a4ba31c-9023-449c-9d6d-bd0bdbf87baf | 29.4.1 | The Fig Tree | Eschatology and the End Times | Extended comparison; tagged parable |

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

## Known False Positive Audit Flags

The `audit-catalog.js` script flags teachings as `parable-candidate` when their `text` contains figurative language that resembles parable phrasing. The following teachings are **not parables** and should not be tagged. Future audit runs will continue to flag these; document them here by `uid` (stable across renumbering) to avoid re-tagging.

| UID | ID | Teaching | Reason for Non-Parable Status |
|---|---|---|---|
| 7ed028dc-3ba7-4258-8488-b26345ff4a67 | 27.1.3 | Jesus sends his disciples into the city to a certain man with the message that the Passover is at his house. | Direct instructional directive within the Passion narrative; not a figurative story standing for something else. |
| a46d1fb7-3dc0-4a2a-8957-b5f035645bb6 | 29.2.3 | Jesus declares the Son of Man's coming will be like lightning from east to west, visible to all from east to west. | Eschatological prophecy/metaphor (not figurative narrative). The comparison is descriptive, not a self-contained story with narrative structure. See TAG_RULES.md § Exclude: Direct Predictions. |
| 7d089632-e67d-4b00-a8d0-50f63ff9c015 | 20.4.1 | The Rich Man and Lazarus — A Great Gulf Fixed | Eschatological narrative — functions as prophetic/didactic teaching about afterlife reality, not a figurative story about something else. Removed from canonical list v1.3. |
| 81d9f263-683a-49df-aa2e-3891749fc044 | 21.2.1 | The Sheep and Goats: Final Judgment of Nations | Final judgment scene presented as literal eschatological event, not a figurative comparison; fails "figurative intent" criterion. Removed from canonical list v1.3. |
