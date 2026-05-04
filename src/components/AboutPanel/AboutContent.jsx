import { Mail, ChevronRight } from 'lucide-react'

const CONTACT_EMAIL = 'hello@jesussays.app'

const HOW_TO_USE = [
  'Choose a Topic from the home screen to explore teachings grouped by theme.',
  'Search by keyword to find specific teachings across all 31 categories.',
  'Tap any scripture reference to view the surrounding passage in context.',
  'Use the link icon on any teaching to copy a shareable permalink.',
]

export default function AboutContent({ onShowVersion }) {
  return (
    <div className="about-content">

      {/* ── Hero ── */}
      <div className="about-hero">
        <span className="about-hero__cross" aria-hidden="true">✝</span>
        <h1 className="about-hero__title">Jesus Says</h1>
        <hr className="about-hero__rule" />
        <p className="about-hero__subtitle">
          All recorded words of Jesus Christ<br />from the New Testament
        </p>
      </div>

      {/* ── Body ── */}
      <div className="about-body">

        {/* About the App */}
        <section className="about-section">
          <div className="about-section__label">About the App</div>
          <p className="about-section__text">
            Jesus Says is a comprehensive reference cataloging every recorded word of Jesus
            Christ from the New Testament — organized across 31 thematic categories with full
            scripture cross-references. Every red-letter verse in Matthew, Mark, Luke, John,
            Acts, 1&nbsp;&amp;&nbsp;2&nbsp;Corinthians, and Revelation is represented, making
            this the most complete single-source reference for the teachings of Christ.
          </p>
        </section>

        {/* How to Use */}
        <section className="about-section">
          <div className="about-section__label">How to Use</div>
          <ul className="about-how-list">
            {HOW_TO_USE.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* About the Creator */}
        <section className="about-section">
          <div className="about-section__label">About the Creator</div>
          <p className="about-section__text">
            This app was created by Joshua Luker — a developer and student of Scripture
            who wanted a single, well-organized reference for everything Jesus taught.
            Built as a personal study tool and offered freely, it is a non-commercial
            project driven by a desire to make the words of Christ more accessible.
          </p>
        </section>

        {/* Contact */}
        <section className="about-section">
          <div className="about-section__label">Contact</div>
          <a
            className="about-contact-btn"
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label={`Send email to ${CONTACT_EMAIL}`}
          >
            <Mail size={15} aria-hidden="true" />
            Contact the Developer
          </a>
        </section>

        <hr className="about-divider" />

        {/* Version Info link */}
        <button className="about-version-btn" onClick={onShowVersion} aria-label="View version and catalog info">
          <div>
            <div className="about-version-btn__label">Version &amp; Catalog Info</div>
            <div className="about-version-btn__meta">App version, catalog revision, build details</div>
          </div>
          <ChevronRight size={16} className="about-version-btn__arrow" aria-hidden="true" />
        </button>

      </div>
    </div>
  )
}
