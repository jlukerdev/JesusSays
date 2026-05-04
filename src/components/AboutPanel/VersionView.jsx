import { ChevronLeft } from 'lucide-react'
import useStore from '../../store.js'

// __APP_VERSION__ and __BUILD_DATE__ are replaced at build time by vite.config.js define
export default function VersionView({ onBack }) {
  const meta = useStore((s) => s.meta)
  const categories = useStore((s) => s.categories ?? [])

  const totalTeachings = categories.reduce(
    (sum, cat) => sum + cat.subcategories.reduce((s2, sub) => s2 + sub.teachings.length, 0),
    0
  )

  return (
    <div className="about-version-view">

      {/* Header */}
      <div className="about-version-view__header">
        <button
          className="about-version-view__back"
          onClick={onBack}
          aria-label="Back to About"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="about-version-view__heading">Version &amp; Catalog Info</h2>
      </div>

      <div className="about-version-body">

        {/* App Version */}
        <section>
          <div className="about-version-block__label">App</div>
          <div className="about-version-block">
            <div className="about-version-row">
              <span className="about-version-row__key">Version</span>
              <span className="about-version-row__val">{__APP_VERSION__}</span>
            </div>
            <div className="about-version-row">
              <span className="about-version-row__key">Build date</span>
              <span className="about-version-row__val">{__BUILD_DATE__}</span>
            </div>
            <div className="about-version-row">
              <span className="about-version-row__key">Platform</span>
              <span className="about-version-row__val">React 18 · Vite · PWA</span>
            </div>
          </div>
        </section>

        {/* Catalog Version */}
        <section>
          <div className="about-version-block__label">Catalog</div>
          <div className="about-version-block">
            <div className="about-version-row">
              <span className="about-version-row__key">Version</span>
              <span className="about-version-row__val">{meta?.version ?? '—'}</span>
            </div>
            <div className="about-version-row">
              <span className="about-version-row__key">Categories</span>
              <span className="about-version-row__val">{meta?.totalCategories ?? '—'}</span>
            </div>
            <div className="about-version-row">
              <span className="about-version-row__key">Total teachings</span>
              <span className="about-version-row__val">{totalTeachings > 0 ? totalTeachings.toLocaleString() : '—'}</span>
            </div>
            <div className="about-version-row">
              <span className="about-version-row__key">NT sources</span>
              <span className="about-version-row__val">Matt · Mark · Luke · John · Acts · 1–2 Cor · Rev</span>
            </div>
          </div>
        </section>

        {/* Revision Notes */}
        <section>
          <div className="about-version-block__label">Revision Notes</div>
          <div className="about-revision-notes">
            <p><strong>App v0.1.0</strong> — Initial release. Modern mobile-first navigation,
            31 thematic categories, complete NT red-letter coverage. PWA-enabled with
            offline support.</p>
            <br />
            <p><strong>Catalog v1.3</strong> — Full audit and reclassification pass.
            Parable tagging complete (42 canonical parables). All subcategory IDs
            stabilized; permalink anchors finalized.</p>
          </div>
        </section>

      </div>
    </div>
  )
}
