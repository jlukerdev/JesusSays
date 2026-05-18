import { NT_BOOKS } from '../utils/bookOrder.js'

const DB_NAME = 'jesus-says-bible'
const DB_VERSION = 1
const STORE_CHAPTERS = 'chapters'
const STORE_META = 'download_meta'
const CONCURRENCY = 3
const MAX_RETRIES = 3

export class OfflineOnlyError extends Error {
  constructor() {
    super('Bible text unavailable. Offline storage is not accessible in this browser.')
    this.name = 'OfflineOnlyError'
  }
}

class BibleOfflineStore {
  constructor() {
    this._dbPromise = null
  }

  _openDB() {
    if (this._dbPromise) return this._dbPromise
    this._dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = (e) => {
        const db = e.target.result
        if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
          db.createObjectStore(STORE_CHAPTERS)
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META)
        }
      }
      req.onsuccess = (e) => resolve(e.target.result)
      req.onerror = () => {
        reject(req.error)
      }
    })
    return this._dbPromise
  }

  async isAvailable() {
    try {
      await this._openDB()
      return true
    } catch {
      return false
    }
  }

  _key(translation, book, chapter) {
    return `${translation}:${book}:${chapter}`
  }

  async getChapter(translation, book, chapter) {
    const db = await this._openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly')
      const req = tx.objectStore(STORE_CHAPTERS).get(this._key(translation, book, chapter))
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  }

  async saveChapter(translation, book, chapter, html) {
    const db = await this._openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readwrite')
      const req = tx.objectStore(STORE_CHAPTERS).put(html, this._key(translation, book, chapter))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      req.onerror = () => reject(req.error)
    })
  }

  async getDownloadedBooks(translation) {
    const db = await this._openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly')
      const req = tx.objectStore(STORE_META).get(translation)
      req.onsuccess = () => resolve(req.result?.downloadedBooks ?? [])
      req.onerror = () => reject(req.error)
    })
  }

  async _saveMetaBook(translation, bookAbbr) {
    const db = await this._openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readwrite')
      const store = tx.objectStore(STORE_META)
      const req = store.get(translation)
      req.onsuccess = () => {
        const meta = req.result ?? { downloadedBooks: [] }
        if (!meta.downloadedBooks.includes(bookAbbr)) {
          meta.downloadedBooks.push(bookAbbr)
        }
        const putReq = store.put(meta, translation)
        putReq.onerror = () => reject(putReq.error)
      }
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getStorageBytes(translation) {
    const db = await this._openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly')
      const store = tx.objectStore(STORE_CHAPTERS)
      const prefix = `${translation}:`
      const range = IDBKeyRange.bound(prefix, prefix + '￿')
      let bytes = 0
      const req = store.openCursor(range)
      req.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          bytes += (cursor.value?.length ?? 0) * 2
          cursor.continue()
        }
      }
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => resolve(bytes)
      tx.onerror = () => reject(tx.error)
    })
  }

  async deleteTranslation(translation) {
    const db = await this._openDB()
    const prefix = `${translation}:`
    const range = IDBKeyRange.bound(prefix, prefix + '￿')
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readwrite')
      const req = tx.objectStore(STORE_CHAPTERS).openCursor(range)
      req.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) { cursor.delete(); cursor.continue() }
      }
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readwrite')
      tx.objectStore(STORE_META).delete(translation)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async _fetchWithRetry(fetchRaw, translation, bookAbbr, chapterNum) {
    let delay = 1000
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await fetchRaw(translation, bookAbbr, chapterNum)
      } catch (err) {
        if (attempt === MAX_RETRIES - 1) throw err
        await new Promise(r => setTimeout(r, delay))
        delay *= 2
      }
    }
  }

  async downloadBooks(translation, bookAbbrArray, fetchRaw, onProgress) {
    const total = bookAbbrArray.reduce((sum, abbr) => {
      const book = NT_BOOKS.find(b => b.abbr === abbr)
      return sum + (book?.chapters ?? 0)
    }, 0)
    let done = 0

    for (const abbr of bookAbbrArray) {
      const book = NT_BOOKS.find(b => b.abbr === abbr)
      if (!book) continue

      const chapterNums = Array.from({ length: book.chapters }, (_, i) => i + 1)

      for (let i = 0; i < chapterNums.length; i += CONCURRENCY) {
        const batch = chapterNums.slice(i, i + CONCURRENCY)
        await Promise.all(batch.map(async (chapterNum) => {
          const existing = await this.getChapter(translation, abbr, chapterNum)
          if (existing !== null) {
            done++
            onProgress?.({ done, total })
            return
          }
          const html = await this._fetchWithRetry(fetchRaw, translation, abbr, chapterNum)
          await this.saveChapter(translation, abbr, chapterNum, html)
          done++
          onProgress?.({ done, total })
        }))
      }

      await this._saveMetaBook(translation, abbr)
    }
  }
}

export const bibleOfflineStore = new BibleOfflineStore()
