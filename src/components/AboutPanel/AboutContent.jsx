import { Mail, ChevronRight } from 'lucide-react'

const CONTACT_EMAIL = 'hello@jesussays.app'

const HOW_TO_USE = [
  'Choose a Topic to explore teachings grouped by theme.',
  'Search by keyword to find specific teachings across all topics.',
  'Click on a teaching to view the full detail.',
  'Tap scripture references to view the verse in context.',
]

export default function AboutContent({ onShowVersion }) {
  return (
    <div className="about-content">

      {/* ── Hero ── */}
      <div className="about-hero">
        <span className="about-hero__cross" aria-hidden="true">✝</span>
        <h1 className="about-hero__title">Jesus Says</h1>
      </div>

      {/* ── Body ── */}
      <div className="about-body">

        {/* About the App */}
        <section className="about-section">
          <div className="about-section__label">About the App</div>
          <p className="about-section__text">
            Jesus Says is a comprehensive catalog of the teachings of Jesus Christ
            — organized across thematic topics with scripture cross-references.
            Every red-letter verse is represented, making this a reference for anyone who
            wants to explore the teachings of Christ. It is not a commentary or devotional, but a clean collection of Jesus' words. 
            The most important words ever spoken.
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
          <div className="about-section__label">About the Developer</div>
          <p className="about-section__text">
            I am a bivocational Southern Baptist pastor and Senior Software Engineer with a passion for Scripture and technology.
            This started as a personal project to create a reference for the teachings of Jesus — 
            something I could use for my own studies. My hope is that others will find it useful as well.
            Of special note is this project is mostly AI-created — I used AI tools to generate and refine the dataset and create the application.
          </p>
        </section>

        {/* Contact - disabled for now */}
        {/* <section className="about-section">
          <a
            className="about-contact-btn"
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label={`Send email to ${CONTACT_EMAIL}`}
          >
            <Mail size={15} aria-hidden="true" />
            Contact me with suggestions or feedback
          </a>
        </section> */}

        <hr className="about-divider" />

        {/* Version Info link */}
        <button className="about-version-btn" onClick={onShowVersion} aria-label="View version and catalog info">
          <div>
            <div className="about-version-btn__label">Version &amp; Catalog Info</div>
            <div className="about-version-btn__meta">App version, catalog revisions</div>
          </div>
          <ChevronRight size={16} className="about-version-btn__arrow" aria-hidden="true" />
        </button>

      </div>
    </div>
  )
}
