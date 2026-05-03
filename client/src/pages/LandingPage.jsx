import { Link } from 'react-router-dom';

const features = [
  {
    label: 'Governance',
    desc: 'Elections, proposals, grievances, and polls with full audit trails.',
  },
  {
    label: 'Identity',
    desc: 'XP ledger, certificates, badges, and a verifiable public portfolio.',
  },
  {
    label: 'Community',
    desc: 'Clubs, events, mentorship, and campus-wide announcements.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center px-10 py-6">
        {/* Brand — larger, more presence */}
        <p
          className="font-display text-3xl text-t1"
          style={{ fontWeight: 300, letterSpacing: '-0.03em' }}
        >
          Campus<span style={{ color: '#C9A96E' }}>Chain</span>
        </p>

        {/* Nav right intentionally empty — login link lives below the hero CTA */}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-10 pt-20 pb-28 max-w-4xl mx-auto text-center">

        {/* Eyebrow pill */}
        <p
          className="inline-block text-xs font-sans font-semibold px-3 py-1 rounded-full mb-8"
          style={{
            background: 'rgba(201,169,110,0.12)',
            color: '#C9A96E',
            border: '1px solid rgba(201,169,110,0.3)',
            letterSpacing: '0.08em',
          }}
        >
          ACADEMIC PLATFORM
        </p>

        {/* Headline */}
        <h1
          className="font-display text-6xl md:text-7xl text-t1 mb-8 animate-fade-up"
          style={{
            fontWeight: 200,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
          }}
        >
          Campus life,
          <br />
          <em style={{ color: '#C9A96E', fontStyle: 'italic' }}>
            beautifully
          </em>{' '}
          managed.
        </h1>

        {/* Subheading */}
        <p
          className="text-lg font-sans leading-relaxed mb-12 animate-fade-up mx-auto"
          style={{
            color: 'var(--text-3)',
            maxWidth: '520px',
            animationDelay: '80ms',
          }}
        >
          One platform for governance, identity, and community. Every action
          you take builds your permanent campus record.
        </p>

        {/* Hero CTA — single button only. Login is in the nav and below as a text link. */}
        <div
          className="flex items-center justify-center animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          <Link
            to="/register"
            className="px-10 py-4 rounded-xl text-sm font-sans font-semibold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #C9A96E 0%, #B8934A 100%)',
              boxShadow: '0 2px 8px rgba(184,147,74,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,147,74,0.45)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,147,74,0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Create your account
          </Link>
        </div>

        {/* Already have account — text link, not a button */}
        <p
          className="text-sm font-sans mt-5 animate-fade-up"
          style={{ color: 'var(--text-4)', animationDelay: '220ms' }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="transition-colors"
            style={{ color: '#C9A96E' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#B8934A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A96E')}
          >
            Login
          </Link>
        </p>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section
        className="px-10 py-20"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 stagger">
          {features.map((f) => (
            <div key={f.label} className="animate-fade-up">
              <p
                className="font-display text-xl text-t1 mb-3"
                style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
              >
                {f.label}
              </p>
              <p
                className="text-sm font-sans leading-relaxed"
                style={{ color: 'var(--text-3)' }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="px-10 py-8 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
          CampusChain · By Samrajnee Bhattacharjee
        </p>
        <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
          {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}