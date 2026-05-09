# Teaching Titles Project — Complete Roadmap

**Project Goal:** Add a condensed `"title"` property to all 654 teachings, display titles in UI (search, browser, detail view), and enhance search to match against titles.

**Status:** Planning Phase Complete  
**Created:** 2026-05-09  
**Estimated Total Duration:** 3–4 weeks (phased implementation)

---

## Executive Summary

| Phase | Duration | Effort | Status |
|---|---|---|---|
| **Phase 1:** Data Curation | 2–3 days | 14–18 hours | 📋 Planned |
| **Phase 2:** Data Implementation | 1–2 days | 3–6 hours | 📋 Planned |
| **Phase 3:** Data Validation | 1 day | 2–4 hours | 📋 Planned |
| **Phase 4:** UI Implementation | 3–5 days | 12–20 hours | 📋 Planned |
| **Phase 5:** Testing & QA | 2–3 days | 8–12 hours | 📋 Planned |
| **Phase 6:** Documentation & Release | 1 day | 2–4 hours | 📋 Planned |
| **TOTAL** | **3–4 weeks** | **41–64 hours** | 📋 Planned |

---

## Phase-by-Phase Breakdown

### Phase 1: Data Curation (2–3 days, 14–18 hours)

**Goal:** Compile all 654 teaching titles into lookup tables.

**Deliverables:**
- `parable_titles.json` (37 entries) — extracted from TAG_RULES.md
- `i-am_titles.json` (~7 entries) — extracted from John gospel + teaching data
- `woe_titles.json` (~8 entries) — derived from Matt 23 context
- `other_titles.json` (~600 entries) — derived from teaching text + category context

**Breakdown:**
- Parable titles: 0.5 hours (direct extraction from TAG_RULES)
- I AM statements: 1 hour (read John passages, map IDs)
- Woe teachings: 1 hour (read Matt 23, format consistently)
- Other 600 teachings: 8–12 hours (review teaching text per category, derive titles)
- QA/validation: 2–3 hours (check length, consistency, spelling)

**Methodology:**
- Manual review by category
- Ensure titles ≤10 words
- Validate consistency within category type
- Document any ambiguous/challenging titles for review

**Output artifacts:**
- 4 JSON lookup files (stored in `catalog_builds/teaching_titles/data/`)
- QA report with any flagged titles

**Success criteria:**
- All 654 teaching IDs have a corresponding title
- All titles are ≤10 words
- No duplicate IDs across lookups (except cross-listed parables)
- All JSON files are syntactically valid

---

### Phase 2: Data Implementation (1–2 days, 3–6 hours)

**Goal:** Add `"title"` property to all teachings in `public/teachings.json`.

**Deliverables:**
- Updated `public/teachings.json` with `"title"` property on all 654 teachings

**Two implementation options:**

**Option A: Manual JSON edit**
- Effort: 3–4 hours (less script development, full control)
- Approach: Load lookup tables, edit JSON directly in editor, use find-replace if editor supports it
- Pros: Simpler, auditable, no script bugs
- Cons: Time-intensive, error-prone for large dataset

**Option B: Create `add-titles.js` script**
- Effort: 5–6 hours (script dev + testing)
- Approach: Write Node.js script to iterate teachings, lookup titles, insert property
- Pros: Fast execution, repeatable, auditable output
- Cons: Script development overhead, potential for bugs

**Recommendation:** Use **Option B** for 600+ entries. Script provides speed, auditability, and reusability.

**Script pseudocode:**
```bash
node catalog_builds/engine/scripts/add-titles.js \
  --parable-titles ./parable_titles.json \
  --i-am-titles ./i-am_titles.json \
  --woe-titles ./woe_titles.json \
  --other-titles ./other_titles.json \
  --output ./public/teachings.json \
  --dry-run  # Preview first
```

**Workflow:**
1. Load lookup tables
2. Read current `public/teachings.json`
3. Iterate teachings; insert `"title"` property
4. Write updated JSON
5. Hand off to Phase 3 (validation)

**Success criteria:**
- All 654 teachings have `"title"` property
- No structural damage to IDs, UIDs, or references
- JSON is syntactically valid (parseable)

---

### Phase 3: Data Validation (1 day, 2–4 hours)

**Goal:** Confirm data integrity and schema compliance.

**Deliverables:**
- Validation report (pass/fail)
- Updated `catalog_stats.md` (if schema version changed)

**Validation checklist:**
1. Run `node catalog_builds/engine/scripts/validate-catalog.js`
   - Must exit code 0
   - Confirms schema, IDs, UIDs, references intact
   
2. Length audit: Verify all titles ≤10 words
   - Script or grep to count words in each title
   - Flag any violations
   
3. Spot-check by category: Manual review
   - 5 teachings per major category type
   - Verify parable titles match TAG_RULES
   - Verify I AM phrasing matches John
   - Verify woes follow "Woe for" format
   
4. Cross-list verification:
   - Confirm cross-listed parables (Good Samaritan, Pharisee & Tax Collector, Ten Virgins) have identical titles

**Success criteria:**
- `validate-catalog.js` exits with code 0
- No titles exceed 10 words
- No missing or duplicate IDs
- Cross-lists are consistent
- All tests pass

---

### Phase 4: UI Implementation (3–5 days, 12–20 hours)

**Goal:** Integrate titles into Modern navigation UI; update search to match titles.

**Deliverables:**
- Updated `HomeScreen.jsx` (search results + search logic)
- Updated `CategoryBrowser.jsx` (teaching list display)
- Updated `TeachingDetail.jsx` (page header display)
- New/updated CSS in `base.css` and `theme-classic.css`
- Optional: `src/utils/searchTeachings.js` (search utility)

**Component-level changes:**

| Component | Change | Hours |
|---|---|---|
| `HomeScreen.jsx` | Display title in search results; update search filter logic; integrate ranking | 3–4 |
| `CategoryBrowser.jsx` | Display title in teaching list items | 1–2 |
| `TeachingDetail.jsx` | Display title in page header; style prominently | 1–2 |
| `base.css` + `theme-classic.css` | Add `.teaching-title` classes; define custom properties | 1–2 |
| `searchTeachings.js` (utility) | Extract search logic; add title matching; optional ranking | 2–3 |
| Testing & refinement | Manual testing, responsive design, edge cases | 4–6 |

**Workflow:**
1. Start dev server: `npm run dev`
2. Implement search results display
3. Test search functionality (title matching, ranking)
4. Implement category browser display
5. Implement detail view display
6. Refine CSS and responsive design
7. Manual QA testing (all screens, mobile, desktop)
8. Fix bugs and polish

**Success criteria:**
- All three UI contexts display titles correctly
- Search matches and ranks titles appropriately
- Responsive design works mobile to desktop
- No console errors
- All manual tests pass

---

### Phase 5: Testing & QA (2–3 days, 8–12 hours)

**Goal:** Comprehensive validation across all functionality and devices.

**Deliverables:**
- Test report (pass/fail)
- Bug log and fixes
- Performance metrics

**Testing categories:**

1. **Functional testing** (4–5 hours)
   - Search: parable names, I AM statements, woes, other teachings
   - Browse: navigate category → subcategory → verify titles display
   - Detail: click teaching → verify title shows in header
   - Edge cases: very long titles, special characters, cross-lists

2. **UI/UX testing** (2–3 hours)
   - Visual consistency: titles styled identically across three contexts
   - Layout: no overflow, text wrapping OK on mobile
   - Readability: font sizes, contrast, spacing adequate
   - Responsive: test on 375px (mobile), 768px (tablet), 1920px (desktop)

3. **Accessibility testing** (1–2 hours)
   - Color contrast: verify WCAG AA minimum (4.5:1)
   - Semantic markup: check heading hierarchy
   - Screen reader: test with NVDA or VoiceOver
   - Keyboard navigation: all interactive elements reachable

4. **Performance testing** (1 hour)
   - Search speed: < 50ms for 654 teachings
   - Render performance: no jank on list updates
   - Bundle size: verify no unexpected growth

5. **Browser compatibility** (1–2 hours)
   - Chrome/Edge, Firefox, Safari
   - Mobile Chrome, Mobile Safari
   - No special polyfills needed

**Success criteria:**
- All functional tests pass
- No critical bugs remaining
- UI is visually consistent and responsive
- Accessibility meets WCAG AA
- Performance meets targets
- No console errors in production build

---

### Phase 6: Documentation & Release (1 day, 2–4 hours)

**Goal:** Document changes, update version history, prepare for release.

**Deliverables:**
- Updated `catalog_stats.md` (if version changed)
- Git commit with clear message
- Optional: release notes or changelog entry

**Workflow:**
1. Update `catalog_stats.md` if schema version changed
   - Run `node catalog_builds/engine/scripts/parse-catalog.js --stats`
   - Update counts and version in CLAUDE.md
   
2. Create comprehensive git commit
   ```bash
   git add public/teachings.json src/components/ModernApp/* src/styles/* src/utils/searchTeachings.js
   git commit -m "feat: add teaching titles and title-based search
   
   - Add 'title' property to all 654 teachings in teachings.json
   - Parables use canonical names from TAG_RULES
   - I AM statements use John gospel phrasing
   - Woes follow consistent 'Woe for [accusation]' format
   - Other teachings derive from content + category context
   - Display titles in search results, category browser, and detail view
   - Update search to match against titles with relevance ranking
   - Add title styling and responsive design
   
   Closes #XYZ"
   ```

3. Verify production build
   ```bash
   npm run build
   npm run preview
   ```

4. Manual smoke test in preview environment

5. Optional: Create release notes or changelog entry

**Success criteria:**
- Commit message is clear and comprehensive
- Production build succeeds without warnings
- Smoke test passes
- No unexpected side effects

---

## Critical Path & Dependencies

```
Phase 1 (Data Curation)
    ↓
Phase 2 (Data Implementation)
    ↓
Phase 3 (Data Validation) ← must pass before proceeding
    ↓
Phase 4 (UI Implementation) ← can start while Phase 3 is in progress
    ↓
Phase 5 (Testing & QA)
    ↓
Phase 6 (Documentation & Release)
```

**Key dependency:** Phase 4 (UI) can begin while Phase 3 is finalizing, using a local copy of updated `teachings.json` from Phase 2.

---

## Resource Allocation

| Role | Phase | Hours | Notes |
|---|---|---|---|
| Data curator | Phase 1 | 14–18 | Manual review of 600+ teachings; high attention to detail |
| Developer | Phase 2 | 3–6 | Script development or manual JSON editing |
| QA | Phase 3 | 2–4 | Schema validation, audit scripts, spot-checking |
| Frontend dev | Phase 4 | 12–20 | Component updates, styling, search integration |
| QA/Tester | Phase 5 | 8–12 | Comprehensive testing across browsers, devices, accessibility |
| Release manager | Phase 6 | 2–4 | Documentation, commit, verification |

**Recommendation:** All roles can be one person (you) working through phases sequentially, or split across team members working in parallel on Phases 1–3 and Phase 4.

---

## Risk Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| Title curation takes longer than estimated | Medium | Start with highest-confidence categories (parables, I AMs); allow buffer time |
| Data validation reveals structural issues | Low | Use `validate-catalog.js` early and often; test script on sample data first |
| UI implementation requires more components to update | Low | Audit component tree early; use consistent CSS classes across all displays |
| Search performance degrades with 654 teachings | Low | Implement scoring efficiently; debounce input; profile with dev tools |
| Mobile responsiveness issues | Medium | Test responsive design early and often; use established breakpoints |
| Accessibility violations | Low | Test with contrast checker and screen reader from start of Phase 4 |

---

## Timeline Estimate (Optimistic → Realistic)

| Phase | Optimistic | Realistic | Pessimistic |
|---|---|---|---|
| Phase 1 | 2 days | 2–3 days | 4 days |
| Phase 2 | 1 day | 1–2 days | 3 days |
| Phase 3 | 0.5 day | 1 day | 2 days |
| Phase 4 | 2 days | 3–5 days | 7 days |
| Phase 5 | 1 day | 2–3 days | 5 days |
| Phase 6 | 0.5 day | 1 day | 2 days |
| **TOTAL** | **7 days** | **10–15 days** | **23 days** |

**Most likely duration:** 2–3 weeks (2–3 hours/day on average, or 1 full day/week)

---

## Deliverables Checklist

### By End of Project

- [ ] `public/teachings.json` updated with `"title"` property on all 654 teachings
- [ ] All titles ≤10 words; formatting consistent with category type
- [ ] Teaching titles display in search results cards
- [ ] Teaching titles display in category browser list
- [ ] Teaching titles display in detail view header
- [ ] Search functionality matches against titles
- [ ] Title matches ranked high in search results
- [ ] All styling is responsive (mobile, tablet, desktop)
- [ ] Accessibility meets WCAG AA
- [ ] All tests pass (functional, UI, performance, accessibility)
- [ ] Production build succeeds (`npm run build`)
- [ ] Git commit with comprehensive message
- [ ] Documentation updated (`catalog_stats.md`, optional release notes)

---

## Next Steps (Immediate)

1. **Review this entire planning package:**
   - `PLAN.md` (main strategic plan)
   - `TITLE_EXAMPLES.md` (concrete examples)
   - `LOOKUP_STRUCTURE.md` (data structure spec)
   - `UI_IMPLEMENTATION.md` (component-by-component guide)
   - `PROJECT_ROADMAP.md` (this document)

2. **Provide feedback on planning:**
   - Confirm data curation strategy
   - Approve UI display locations
   - Answer open questions (parable format, woe format, search ranking, etc.)
   - Select implementation approach (Option A manual vs. Option B script)

3. **Prepare for Phase 1:**
   - Gather reference materials (TAG_RULES.md, John gospel, Matt 23)
   - Set up lookup table template files
   - Establish QA criteria for title quality

4. **Estimate realistic timeline:**
   - Determine available hours per week
   - Schedule phases with realistic buffer
   - Identify any blockers or dependencies

5. **Begin Phase 1 when ready:**
   - Compile parable titles (quick win)
   - Then I AM statements
   - Then woes
   - Finally, work through other 600 teachings by category

---

## Contact & Questions

For questions, clarifications, or changes to this roadmap:
- Review relevant documentation sections (linked in each phase)
- Refer to example titles and guidelines in `TITLE_EXAMPLES.md`
- Consult component file paths in `UI_IMPLEMENTATION.md`

**This roadmap is a living document.** Update it as phases complete, risks are discovered, or scope changes.

---

## Appendix: File Structure

```
catalog_builds/teaching_titles/
├── PLAN.md                      # Main strategic plan (Phases 1–4)
├── TITLE_EXAMPLES.md            # Concrete title examples by category
├── LOOKUP_STRUCTURE.md          # Data structure spec for lookup tables
├── UI_IMPLEMENTATION.md         # Component-by-component UI guide
├── PROJECT_ROADMAP.md           # This file
├── data/                        # Lookup tables (created during Phase 1)
│   ├── parable_titles.json
│   ├── i-am_titles.json
│   ├── woe_titles.json
│   └── other_titles.json
├── scripts/                     # Optional scripts (Phase 2)
│   └── add-titles.js            # Script to add titles to teachings.json
└── notes/                       # Work-in-progress notes (optional)
    ├── curation_progress.md
    ├── qa_report.md
    └── bugs_and_fixes.md
```

---

**Prepared:** 2026-05-09  
**Catalog Version:** 1.4 (654 teachings, 37 parables, 31 categories)  
**Next Review Date:** After Phase 1 completion (estimated 2026-05-12–15)
