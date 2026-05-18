import useStore from '../../../store.js'
import { ENABLE_OFFLINE_BIBLE } from '../../../featureFlags.js'

export default function BibleDownloadBanner() {
  const bibleTranslation = useStore(s => s.bibleTranslation)
  const status = useStore(s => s.bibleDownloadStatus[bibleTranslation])

  if (!ENABLE_OFFLINE_BIBLE) return null
  if (status.state !== 'downloading' && status.state !== 'checking') return null

  const pct = Math.round(status.progress * 100)

  return (
    <div className="bible-download-banner">
      <span className="bible-download-banner__text">
        {status.state === 'checking'
          ? `Checking ${bibleTranslation}…`
          : `Caching ${bibleTranslation} — ${pct}%`}
      </span>
      {status.state === 'downloading' && (
        <div className="bible-download-progress">
          <div className="bible-download-progress__fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
