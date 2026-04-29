/**
 * classify.js
 *
 * Classification helper. Read-only advisory tool that:
 *   1. Accepts a verse reference and/or descriptive text
 *   2. Checks whether the verse already exists in the catalog
 *   3. Suggests the most appropriate category and subcategory
 *   4. Returns neighboring teachings for context
 *
 * This script NEVER writes to the catalog.
 *
 * Usage:
 *   node catalog_builds/engine/scripts/classify.js --ref "Matt 13:31-32"
 *   node catalog_builds/engine/scripts/classify.js --text "mustard seed parable"
 *   node catalog_builds/engine/scripts/classify.js --ref "Matt 13:31" --text "mustard seed" --json
 *
 * The output is advisory. Final placement must be confirmed by consulting
 * CLASSIFICATION_RULES.md and TAXONOMY_STANDARDS.md.
 */

import { fileURLToPath } from 'url';
import { loadCatalog } from './parse-catalog.js';

// ─── Reference parser ─────────────────────────────────────────────────────────

/**
 * Parse a human-readable ref like "Matt 13:31-32" or "John 3:16" into components.
 * @param {string} refStr
 * @returns {{ bookAbbr: string, chapter: number, verseStart: number, verseEnd: number } | null}
 */
function parseRef(refStr) {
  if (!refStr) return null;
  // Normalize "1 Cor" → "1Cor" etc.
  const normalized = refStr.trim().replace(/\s+/g, ' ');
  // Pattern: BOOK CHAPTER:VERSE[-VERSE]
  const match = normalized.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  return {
    bookAbbr: match[1].replace(/\s+/g, ''),
    chapter: parseInt(match[2], 10),
    verseStart: parseInt(match[3], 10),
    verseEnd: match[4] ? parseInt(match[4], 10) : parseInt(match[3], 10),
  };
}

/**
 * Normalize a bookAbbr for comparison (lowercase, no spaces).
 */
function normAbbr(abbr) {
  return abbr.replace(/\s+/g, '').toLowerCase();
}

// ─── Catalog search ──────────────────────────────────────────────────────────

/**
 * Check if a parsed reference already exists in the catalog.
 * Returns all matching teachings (a verse may appear as primary or cross-ref).
 */
function findExistingTeachings(catalog, parsedRef) {
  if (!parsedRef) return [];
  const results = [];
  const { bookAbbr, chapter, verseStart } = parsedRef;
  const targetAbbr = normAbbr(bookAbbr);

  for (const cat of catalog.categories) {
    for (const sub of cat.subcategories) {
      for (const t of sub.teachings) {
        for (const ref of t.references) {
          if (normAbbr(ref.bookAbbr) !== targetAbbr) continue;
          if (ref.chapter !== chapter) continue;
          // Check if verseStart falls within any range
          const inRange = ref.ranges.some(([s, e]) => verseStart >= s && verseStart <= e);
          if (inRange) {
            results.push({
              teachingId: t.id,
              text: t.text,
              categoryId: cat.id,
              categoryTitle: cat.title,
              subcategoryId: sub.id,
              subcategoryTitle: sub.title,
              refLabel: ref.label,
              isPrimary: ref.isPrimary,
            });
          }
        }
      }
    }
  }
  return results;
}

// ─── Keyword-based category scoring ─────────────────────────────────────────
//
// Each category has associated keyword patterns. When --text is provided,
// the text is scored against these patterns and the top match is returned.
// This is a heuristic aid — consult CLASSIFICATION_RULES.md for final decisions.

const CATEGORY_KEYWORDS = {
  1: { title: 'God the Father', keywords: ['father', 'fatherhood', 'heavenly father', 'sovereignty', 'worship', "god's love", 'spirit and truth', 'creator'] },
  2: { title: 'The Identity of Jesus Christ', keywords: ['i am', 'son of god', 'messiah', 'christ', 'pre-existence', 'before abraham', 'divine', 'authority', 'bread of life', 'light of the world', 'good shepherd', 'resurrection and the life', 'way truth life', 'identity', 'nature of jesus'] },
  3: { title: 'The Holy Spirit', keywords: ['holy spirit', 'spirit', 'helper', 'counselor', 'comforter', 'advocate', 'paraclete', 'spirit of truth', 'blasphemy against', 'pentecost'] },
  4: { title: 'The Kingdom of God', keywords: ['kingdom', 'kingdom of heaven', 'kingdom of god', 'enter the kingdom', 'beatitude', 'blessed are', 'mustard seed', 'leaven', 'treasure', 'pearl', 'net', 'sower', 'tares', 'wheat', 'narrow gate', 'narrow way'] },
  5: { title: 'Repentance and Conversion', keywords: ['repent', 'repentance', 'return', 'lost', 'prodigal', 'sinner', 'turn', 'zacchaeus', 'barren fig tree', 'lost sheep', 'lost coin', 'lost son', 'come to me', 'invitation'] },
  6: { title: 'Salvation and Eternal Life', keywords: ['eternal life', 'saved', 'salvation', 'born again', 'new birth', 'believe', 'perish not', 'narrow way', 'sheep hear my voice', 'everlasting', 'life abundant'] },
  7: { title: 'Faith and Trust', keywords: ['faith', 'believe', 'doubt', 'trust', 'fear not', 'be not afraid', 'little faith', 'mustard seed faith', 'move mountains', 'anxiety', 'worry', 'seek first'] },
  8: { title: 'The Old Covenant', keywords: ['law', 'moses', 'scripture', 'old covenant', 'torah', 'fulfill the law', 'prophets', 'jot or tittle', 'temptation of jesus', 'deuteronomy'] },
  9: { title: 'The New Covenant', keywords: ['new covenant', "lord's supper", 'communion', 'eucharist', 'bread of life', 'my body', 'my blood', 'cup', 'passover', 'new wine', 'wineskins'] },
  10: { title: 'Prayer and Communion', keywords: ['pray', 'prayer', 'our father', "lord's prayer", 'ask', 'seek', 'knock', 'persistent', 'fasting', 'praying in my name', 'two or three gathered', 'gethsemane', 'persistent widow', 'midnight friend'] },
  11: { title: 'Abiding in Christ', keywords: ['abide', 'abiding', 'vine', 'branch', 'branches', 'remain', 'apart from me', 'bear fruit', 'vinedresser', 'john 15'] },
  12: { title: 'High Priestly Prayer', keywords: ['high priestly prayer', 'john 17', 'father glorify', 'sanctify them', 'unity of believers', 'that they may be one', 'eternal life knowing you', 'prays for disciples'] },
  13: { title: 'Love', keywords: ['love', 'love one another', 'love your neighbor', 'love your enemy', 'greatest commandment', 'new commandment', 'good samaritan', 'lay down life', 'golden rule'] },
  14: { title: 'Righteousness and Ethics', keywords: ['righteousness', 'salt and light', 'sermon on the mount', 'antitheses', 'you have heard', 'but i say', 'anger', 'lust', 'oaths', 'retaliation', 'ethics', 'golden rule', 'two ways', 'piety', 'fasting', 'giving in secret'] },
  15: { title: 'Humility and Servanthood', keywords: ['humility', 'humble', 'servant', 'servanthood', 'greatness', 'least', 'first shall be last', 'washing feet', 'childlike', 'exalt', 'seat of honor', 'pharisee and tax collector', 'unworthy servants'] },
  16: { title: 'Truth and Integrity', keywords: ['truth', 'truthful', 'oaths', 'vows', 'let your yes be yes', 'words', 'defile', 'integrity', 'set you free', 'truth sets free'] },
  17: { title: 'Wisdom and Discernment', keywords: ['wisdom', 'discernment', 'blind guide', 'blind', 'eyes to see', 'ears to hear', 'signs of the times', 'false prophet', 'wolf in sheep', 'leaven of pharisees', 'hidden', 'revealed', 'lamp'] },
  18: { title: 'Forgiveness and Reconciliation', keywords: ['forgive', 'forgiveness', 'reconcile', 'reconciliation', 'unforgiving', 'debtor', 'seventy times seven', 'father forgive them', 'adultery accusation', 'go and sin no more'] },
  19: { title: 'Marriage and Family', keywords: ['marriage', 'divorce', 'family', 'husband', 'wife', 'children', 'adultery', 'sexual purity', 'eunuch', 'honor father mother', 'mother and brothers', 'let children come'] },
  20: { title: 'Wealth and Generosity', keywords: ['wealth', 'money', 'riches', 'treasure', 'mammon', 'stewardship', 'generosity', 'rich fool', 'talents', 'minas', 'camel through needle', 'give to the poor', 'two masters', 'dishonest manager', 'widow mite', 'lazarus and rich man'] },
  21: { title: 'Justice and Mercy', keywords: ['justice', 'mercy', 'compassion', 'poor', 'oppressed', 'sheep and goats', 'least of these', 'caesar', 'render unto caesar', 'woe to the rich', 'merciful'] },
  22: { title: 'Discipleship', keywords: ['follow me', 'disciple', 'discipleship', 'cross', 'deny yourself', 'cost of discipleship', 'great commission', 'fishers of men', 'call', 'fruit bearing', 'endure to the end'] },
  23: { title: 'Suffering and Persecution', keywords: ['persecution', 'persecuted', 'suffer', 'tribulation', 'martyr', 'thorn in the flesh', 'grace is sufficient', 'hate you', 'take up your cross', 'hated by all'] },
  24: { title: 'Religious Hypocrisy', keywords: ['hypocrite', 'hypocrisy', 'woe', 'pharisee', 'scribe', 'whitewashed tomb', 'clean outside', 'traditions of men', 'corban', 'sabbath controversy', 'blind guide', 'brood of vipers'] },
  25: { title: 'The Church', keywords: ['church', 'ekklesia', 'foundation', 'rock', 'gates of hell', 'bind and loose', 'church discipline', 'two or three gathered', 'unity', 'divided kingdom'] },
  26: { title: 'Mission and Witness', keywords: ['mission', 'witness', 'harvest', 'workers few', 'go and proclaim', 'sending', 'twelve', 'seventy', 'wolves', 'acknowledge me', 'deny me', 'proclaim on housetops', 'visions to paul', 'ananias', 'damascus'] },
  27: { title: 'The Passion Narrative', keywords: ['passion', 'gethsemane', 'betrayal', 'arrest', 'trial', 'pilate', 'cross', 'crucifixion', 'words from the cross', 'last supper', 'my body', 'my blood', 'it is finished', 'father forgive', 'today with me in paradise'] },
  28: { title: 'Post-Resurrection Appearances', keywords: ['resurrection appearance', 'post-resurrection', 'risen', 'thomas', 'doubt', 'emmaus', 'peace to you', 'restore peter', 'do you love me', 'feed my sheep', 'great commission'] },
  29: { title: 'Eschatology and the End Times', keywords: ['end times', 'olivet discourse', 'signs of the end', 'second coming', 'son of man coming', 'tribulation', 'fig tree', 'ten virgins', 'faithful servant', 'watchfulness', 'no one knows the day', 'abomination of desolation', 'all things new'] },
  30: { title: 'Judgment and Hell', keywords: ['judgment', 'hell', 'gehenna', 'outer darkness', 'weeping and gnashing', 'depart from me', 'fire', 'eternal punishment', 'account for every word', 'resurrection of judgment'] },
  31: { title: 'The Seven Churches', keywords: ['seven churches', 'revelation', 'ephesus', 'smyrna', 'pergamum', 'thyatira', 'sardis', 'philadelphia', 'laodicea', 'first love', 'lukewarm', 'overcome', 'i stand at the door', 'white stone', 'tree of life', 'crown of life'] },
};

/**
 * Score a text description against category keyword lists.
 * Returns an array of { categoryId, title, score } sorted descending.
 */
function scoreTextAgainstCategories(text) {
  const lower = text.toLowerCase();
  const scores = [];
  for (const [idStr, data] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0) scores.push({ categoryId: parseInt(idStr), title: data.title, score });
  }
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Get neighboring teachings within a subcategory (context for placement).
 */
function getNeighbors(catalog, catId, subId, limit = 3) {
  const cat = catalog.categories.find(c => c.id === catId);
  if (!cat) return [];
  const sub = cat.subcategories.find(s => s.id === subId);
  if (!sub) return [];
  return sub.teachings.slice(0, limit).map(t => ({
    id: t.id,
    text: t.text,
  }));
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');

  const refIdx = args.indexOf('--ref');
  const textIdx = args.indexOf('--text');
  const refStr = refIdx !== -1 ? args[refIdx + 1] : null;
  const textStr = textIdx !== -1 ? args[textIdx + 1] : null;

  if (!refStr && !textStr) {
    console.error('Usage: classify.js [--ref "Matt 13:31"] [--text "description"] [--json]');
    process.exit(1);
  }

  const catalog = loadCatalog();
  const parsedRef = parseRef(refStr);

  // 1. Check if the verse already exists
  const existing = parsedRef ? findExistingTeachings(catalog, parsedRef) : [];

  // 2. Score text against category keywords
  const combinedText = [textStr, refStr].filter(Boolean).join(' ');
  const categoryScores = scoreTextAgainstCategories(combinedText);

  const topCategory = categoryScores[0] || null;
  const topCategoryData = topCategory ? catalog.categories.find(c => c.id === topCategory.categoryId) : null;
  const topSubcat = topCategoryData ? topCategoryData.subcategories[0] : null;

  // Build result
  const result = {
    input: { ref: refStr || null, text: textStr || null },
    parsedRef: parsedRef || null,
    alreadyPresent: existing.length > 0,
    existingMatches: existing,
    suggestion: topCategory ? {
      categoryId: topCategory.categoryId,
      categoryTitle: topCategory.title,
      subcategoryId: topSubcat ? topSubcat.id : null,
      subcategoryTitle: topSubcat ? topSubcat.title : null,
      confidence: topCategory.score,
      note: 'Keyword-based heuristic. Consult CLASSIFICATION_RULES.md to confirm placement.',
      alternativeCategories: categoryScores.slice(1, 4),
    } : null,
    neighbors: topCategoryData && topSubcat ? getNeighbors(catalog, topCategory.categoryId, topSubcat.id) : [],
  };

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nInput: ${refStr ? `ref="${refStr}"` : ''}${textStr ? ` text="${textStr}"` : ''}`);

    if (result.alreadyPresent) {
      console.log(`\n⚠ Already present in catalog (${existing.length} match${existing.length > 1 ? 'es' : ''}):`);
      for (const m of existing) {
        console.log(`  [${m.teachingId}] ${m.categoryTitle} > ${m.subcategoryTitle}`);
        console.log(`    "${m.text.substring(0, 80)}"`);
        console.log(`    Ref: ${m.refLabel} (primary: ${m.isPrimary})`);
      }
    } else {
      console.log('\n✓ Not found in catalog — appears to be a new teaching.');
    }

    if (result.suggestion) {
      console.log(`\nSuggested placement:`);
      console.log(`  Category:    [${result.suggestion.categoryId}] ${result.suggestion.categoryTitle}`);
      console.log(`  Subcategory: [${result.suggestion.subcategoryId}] ${result.suggestion.subcategoryTitle}`);
      console.log(`  Confidence:  ${result.suggestion.confidence} keyword match(es)`);
      console.log(`  NOTE: ${result.suggestion.note}`);

      if (result.suggestion.alternativeCategories.length > 0) {
        console.log('\n  Alternative categories:');
        for (const alt of result.suggestion.alternativeCategories) {
          console.log(`    [${alt.categoryId}] ${alt.title} (score: ${alt.score})`);
        }
      }

      if (result.neighbors.length > 0) {
        console.log(`\n  Neighboring teachings in suggested subcategory:`);
        for (const n of result.neighbors) {
          console.log(`    [${n.id}] ${n.text.substring(0, 80)}`);
        }
      }
    } else {
      console.log('\n⚠ Could not suggest placement — try adding more descriptive --text.');
    }

    console.log('\n─ Consult CLASSIFICATION_RULES.md to finalize placement. ─');
  }
}
