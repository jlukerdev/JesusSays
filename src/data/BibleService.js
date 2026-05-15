// Abstract base — defines the contract any Bible API adapter must implement
export class BibleService {
  /**
   * Fetch all verses for a single chapter.
   * @param {string} translationKey  — 'KJV' | 'NKJV' | 'NIV'
   * @param {string} bookAbbr        — app abbreviation e.g. 'Matt', 'Rev'
   * @param {number} chapterNum      — 1-based chapter number
   * @returns {Promise<Array<{ verse: number, text: string, sectionHead?: string }>>}
   */
  async getChapter(translationKey, bookAbbr, chapterNum) {
    throw new Error('BibleService.getChapter() not implemented')
  }

  /**
   * Fetch a passage by reference string.
   * @param {string} translationKey  — 'KJV' | 'NKJV' | 'NIV'
   * @param {string} reference       — api.bible passage ID e.g. 'MAT.5.3-MAT.5.12'
   * @returns {Promise<Array<{ verse: number, text: string, sectionHead?: string }>>}
   */
  async getPassage(translationKey, reference) {
    throw new Error('BibleService.getPassage() not implemented')
  }
}
