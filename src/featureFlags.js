// Feature flags for Jesus Says app

// ENABLE_ABOUT_PAGE: About panel with app info, creator bio, and version details.
export const ENABLE_ABOUT_PAGE = true // import.meta.env.DEV

// ENABLE_OFFLINE_BIBLE: Cache Bible chapter HTML in IndexedDB for offline access.
// When false, all Bible text is fetched live from api.bible on every request.
export const ENABLE_OFFLINE_BIBLE = true

// ENABLE_API_FALLBACK: When ENABLE_OFFLINE_BIBLE is true but IndexedDB is unavailable
// (e.g. private browsing, storage quota exceeded), allow serving Bible text directly
// from the API without caching. When false, show a warning instead.
export const ENABLE_API_FALLBACK = false

// RESTRICT_TO_CATALOG: When true, offline caching and Bible browser navigation are
// limited to the books and chapters listed in CATALOG_CHAPTERS (bookOrder.js).
// Prevents downloading or browsing NT content outside the red-letter dataset.
export const RESTRICT_TO_CATALOG = true
