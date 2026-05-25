import { BibleService } from './BibleService.js'
import { ENABLE_OFFLINE_BIBLE, ENABLE_API_FALLBACK } from '../featureFlags.js'
import { bibleOfflineStore, OfflineOnlyError } from './BibleOfflineStore.js'

const BASE_URL = 'https://rest.api.bible/v1'

const BIBLE_IDS = {
  KJV:  'de4e12af7f28f599-02',
  NKJV: '63097d2a0a2f7db3-01',
  NIV:  '78a9f6124f344018-01',
}

const OSIS_IDS = {
  'Matt': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
  'Acts': 'ACT', 'Rom': 'ROM', '1Cor': '1CO', '2Cor': '2CO',
  'Gal': 'GAL', 'Eph': 'EPH', 'Phil': 'PHP', 'Col': 'COL',
  '1Thess': '1TH', '2Thess': '2TH', '1Tim': '1TI', '2Tim': '2TI',
  'Titus': 'TIT', 'Phlm': 'PHM', 'Heb': 'HEB', 'Jas': 'JAS',
  '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN', '2John': '2JN',
  '3John': '3JN', 'Jude': 'JUD', 'Rev': 'REV',
}

export class ApiBibleClient extends BibleService {
  constructor(apiKey) {
    super()
    this.apiKey = apiKey
    this.cache  = new Map()
  }

  getChapter(translationKey, bookAbbr, chapterNum) {
    const cacheKey = `${translationKey}-${bookAbbr}-${chapterNum}`
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)

    // Cache the promise immediately so concurrent calls share one in-flight request.
    // On failure, evict so the next call can retry.
    const promise = this._resolveChapter(translationKey, bookAbbr, chapterNum)
      .catch(err => { this.cache.delete(cacheKey); throw err })
    this.cache.set(cacheKey, promise)
    return promise
  }

  async _resolveChapter(translationKey, bookAbbr, chapterNum) {
    if (!ENABLE_OFFLINE_BIBLE) {
      const html = await this._fetchRaw(translationKey, bookAbbr, chapterNum)
      return this._parseHtml(html, translationKey)
    }

    const available = await bibleOfflineStore.isAvailable()
    if (!available) {
      if (!ENABLE_API_FALLBACK) throw new OfflineOnlyError()
      const html = await this._fetchRaw(translationKey, bookAbbr, chapterNum)
      return this._parseHtml(html, translationKey)
    }

    const cachedHtml = await bibleOfflineStore.getChapter(translationKey, bookAbbr, chapterNum)
    if (cachedHtml !== null) {
      return this._parseHtml(cachedHtml, translationKey)
    }

    // Not in IDB — fetch from API and cache for future use
    const html = await this._fetchRaw(translationKey, bookAbbr, chapterNum)
    await bibleOfflineStore.saveChapter(translationKey, bookAbbr, chapterNum, html)
    return this._parseHtml(html, translationKey)
  }

  async _fetchRaw(translationKey, bookAbbr, chapterNum) {
    const bibleId = BIBLE_IDS[translationKey]
    const osisId  = OSIS_IDS[bookAbbr]
    if (!bibleId) throw new Error(`Unknown translationKey: ${translationKey}`)
    if (!osisId)  throw new Error(`Unknown bookAbbr: ${bookAbbr}`)
    const chapterId = `${osisId}.${chapterNum}`
    const url = `${BASE_URL}/bibles/${bibleId}/chapters/${chapterId}` +
                `?content-type=html&include-notes=false&include-titles=true` +
                `&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`
    const res = await fetch(url, { headers: { 'api-key': this.apiKey } })
    if (!res.ok) throw new Error(`api.bible error: ${res.status} for ${chapterId} (${translationKey})`)
    const json = await res.json()
    return json.data.content
  }

  // Used by BibleOfflineStore bulk-download to fetch raw HTML without the offline layer.
  fetchRawChapter(translationKey, bookAbbr, chapterNum) {
    return this._fetchRaw(translationKey, bookAbbr, chapterNum)
  }

  clearCache(translationKey) {
    for (const key of [...this.cache.keys()]) {
      if (key.startsWith(`${translationKey}-`)) this.cache.delete(key)
    }
  }

  async getPassage(translationKey, reference) {
    const bibleId = BIBLE_IDS[translationKey]
    if (!bibleId) throw new Error(`Unknown translationKey: ${translationKey}`)
    const url     = `${BASE_URL}/bibles/${bibleId}/passages/${reference}` +
                    `?content-type=html&include-verse-numbers=true`
    const res     = await fetch(url, { headers: { 'api-key': this.apiKey } })
    if (!res.ok) {
      throw new Error(`api.bible error: ${res.status} for passage ${reference} (${translationKey})`)
    }
    const json = await res.json()
    return this._parseHtml(json.data.content, translationKey)
  }

  _parseHtml(html, translationKey) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const verses = []
    const seen = new Map() // verseId → entry object

    // Recursively extract verse text as HTML, preserving only <i> (implied words)
    // and <span class="wj"> (words of Jesus) markup.
    function extractVerseHtml(el) {
      let out = ''
      for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          out += child.textContent
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName.toLowerCase() === 'br') {
            out += ' '
          } else if (child.classList.contains('wj')) {
            out += '<span class="wj">' + extractVerseHtml(child) + '</span>'
          } else if (child.classList.contains('it')) {
            out += '<i>' + extractVerseHtml(child) + '</i>'
          } else {
            out += extractVerseHtml(child)
          }
        }
      }
      return out
    }

    if (translationKey === 'NKJV') {
      // NKJV: span-by-span approach — all verse text lives inside span.verse-span, and we
      // preserve <i> tags (implied words) and <span class="wj"> (words of Jesus).
      // Other translations (NIV in particular) wrap text in span.wj siblings of
      // span.verse-span, so they need the document-order walk below.
      doc.querySelectorAll('span.verse-span[data-verse-id]').forEach(span => {
        const verseId = span.getAttribute('data-verse-id')

        if (!seen.has(verseId)) {
          const parts = verseId.split('.')
          const verseNum = parseInt(parts[parts.length - 1], 10)
          if (isNaN(verseNum)) return

          let sectionHead
          const para = span.closest('p')
          if (para && para.querySelector('span.verse-span[data-verse-id]') === span) {
            let prev = para.previousElementSibling
            while (prev) {
              const tag = prev.tagName?.toLowerCase()
              if (tag === 'h3' || tag === 'h4' || (tag === 'p' && prev.classList.contains('s'))) { sectionHead = prev.textContent.trim(); break }
              if (prev.querySelector('span.verse-span')) break
              prev = prev.previousElementSibling
            }
          }

          const entry = { verse: verseNum, text: '' }
          if (sectionHead) entry.sectionHead = sectionHead
          seen.set(verseId, entry)
          verses.push(entry)
        }

        const clone = span.cloneNode(true)
        clone.querySelectorAll(':scope > span[data-number]').forEach(el => el.remove())

        const entry = seen.get(verseId)

        // Whitespace-only spacer span — carry the space between text segments
        if (!clone.textContent.replace(/[\r\n\s]+/g, '').length) {
          if (entry._html != null && !entry._html.endsWith(' ')) entry._html += ' '
          return
        }

        // Wrap in <i> or <span class="wj"> when this span lives inside .it or .wj ancestors.
        // In NKJV, .wj and .it are parents of verse-spans (not children), so we check upward.
        const isItalic = span.parentElement?.classList.contains('it') ||
                         span.parentElement?.classList.contains('add')
        const isWj = !!span.closest('.wj')
        let inner = extractVerseHtml(clone)

        // NKJV puts spaces as inter-element text nodes (not inside verse-span text), so
        // the span-by-span traversal misses them. Inject a space at word boundaries when
        // neither the accumulated text nor the new inner content supplies one.
        if (entry._html != null && inner.length > 0 && inner[0] !== ' ') {
          const prevText = entry._html.replace(/<[^>]+>/g, '')
          if (prevText.length > 0 && prevText[prevText.length - 1] !== ' ') {
            inner = ' ' + inner
          }
        }

        let chunk = isItalic ? `<i>${inner}</i>` : inner
        if (isWj) chunk = `<span class="wj">${chunk}</span>`
        // Content is from a controlled API parse; dangerouslySetInnerHTML is safe.
        entry._html = (entry._html ?? '') + chunk
      })

      for (const entry of verses) {
        if (entry._html != null) {
          entry.text = entry._html.replace(/\s+/g, ' ').trim()
          delete entry._html
        } else {
          entry.text = entry.text.replace(/\s+/g, ' ').trim()
        }
      }

      return verses
    }

    // KJV / NIV: document-order walk tracking the current verse as we encounter
    // span.verse-span[data-verse-id] markers, collecting all text nodes along the way.
    // This handles NIV's pattern where span.wj siblings (and p[data-vid] continuations)
    // contain verse text outside of any span.verse-span wrapper.

    // Pre-collect section headings (p.s1/s2 for NIV, h3/h4 for others) keyed by the
    // verseId of the first verse that follows each heading.
    const sectionHeadForVerse = new Map()
    doc.querySelectorAll('p.s1, p.s2, h3, h4').forEach(heading => {
      let next = heading.nextElementSibling
      while (next) {
        const vs = next.matches('span.verse-span[data-verse-id]')
          ? next
          : next.querySelector('span.verse-span[data-verse-id]')
        if (vs) {
          const vid = vs.getAttribute('data-verse-id')
          if (!sectionHeadForVerse.has(vid)) sectionHeadForVerse.set(vid, heading.textContent.trim())
          break
        }
        if (next.querySelector('span.verse-span')) break
        next = next.nextElementSibling
      }
    })

    // Recursive walk; returns the current verseId after processing node and its subtree.
    function walk(node, curVerseId) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (curVerseId) {
          const entry = seen.get(curVerseId)
          if (entry) {
            const text = node.textContent.replace(/[\r\n]+/g, ' ')
            if (text.trim()) {
              if (entry.text && !/\s$/.test(entry.text) && !/^\s/.test(text)) {
                entry.text += ' ' + text
              } else {
                entry.text += text
              }
            }
          }
        }
        return curVerseId
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return curVerseId

      // Skip verse-number markers (span.v) and their entire subtree
      if (node.matches('span.v')) return curVerseId

      // Skip section headings — captured separately in sectionHeadForVerse; prevent
      // their text from being appended to the preceding verse's content
      if (node.matches('p.s1, p.s2, h3, h4')) return curVerseId

      // Entering a verse-span: update the current verse (and register it if new)
      if (node.matches('span.verse-span[data-verse-id]')) {
        const vid = node.getAttribute('data-verse-id')
        curVerseId = vid
        if (!seen.has(vid)) {
          const parts = vid.split('.')
          const verseNum = parseInt(parts[parts.length - 1], 10)
          if (!isNaN(verseNum)) {
            const entry = { verse: verseNum, text: '' }
            if (sectionHeadForVerse.has(vid)) entry.sectionHead = sectionHeadForVerse.get(vid)
            seen.set(vid, entry)
            verses.push(entry)
          }
        }
      }

      // Words of Jesus: collect the whole span's text and emit it as a wj span
      if (node.classList.contains('wj') && curVerseId) {
        const entry = seen.get(curVerseId)
        if (entry) {
          const wjText = node.textContent.replace(/[\r\n]+/g, ' ')
          if (wjText.trim()) {
            if (entry.text && !/\s$/.test(entry.text)) entry.text += ' '
            entry.text += `<span class="wj">${wjText}</span>`
          }
        }
        return curVerseId
      }

      let v = curVerseId
      for (const child of node.childNodes) {
        v = walk(child, v)
      }
      return v
    }

    walk(doc.body, null)

    for (const entry of verses) {
      entry.text = entry.text.replace(/\s+/g, ' ').trim()
    }

    return verses
  }
}
