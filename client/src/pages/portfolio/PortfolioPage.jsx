import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPortfolio } from '../../api/identity';
import SkillsPanel from '../../components/skills/SkillsPanel';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short', year: 'numeric',
  });
}

function fmtFull(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Type styles ───────────────────────────────────────────────────────────────

const CERT_TYPE = {
  PARTICIPATION: { bg: '#EEF2FF', color: '#4338CA' },
  ACHIEVEMENT:   { bg: '#FFFBEB', color: '#92400E' },
  LEADERSHIP:    { bg: '#F0FDF4', color: '#15803D' },
  ACADEMIC:      { bg: '#EFF6FF', color: '#1D4ED8' },
  CUSTOM:        { bg: '#F1F5F9', color: '#64748B' },
};

const BADGE_CAT = {
  GOVERNANCE: { bg: '#EEF2FF', color: '#4338CA' },
  SOCIAL:     { bg: '#FFF1F2', color: '#BE123C' },
  ACADEMIC:   { bg: '#EFF6FF', color: '#1D4ED8' },
  LEADERSHIP: { bg: '#F0FDF4', color: '#15803D' },
  EVENTS:     { bg: '#F0FDFA', color: '#0F766E' },
  FUN:        { bg: '#FFF7ED', color: '#C2410C' },
};

const ROLE_STYLE = {
  PRESIDENT: { bg: '#F0FDF4', color: '#15803D' },
  SECRETARY: { bg: '#EFF6FF', color: '#1D4ED8' },
  MEMBER:    { bg: '#F1F5F9', color: '#64748B' },
};

const XP_LABEL = {
  VOTE_CAST:              'Cast a vote',
  PROPOSAL_SUBMITTED:     'Submitted a proposal',
  PROPOSAL_UPVOTED:       'Proposal upvoted',
  EVENT_ATTENDED:         'Attended an event',
  CLUB_JOINED:            'Joined a club',
  BADGE_EARNED:           'Earned a badge',
  CERTIFICATE_ISSUED:     'Certificate issued',
  GRIEVANCE_RESOLVED:     'Grievance resolved',
  PEER_ENDORSED:          'Peer endorsement',
  ELECTION_ORGANIZED:     'Organised an election',
  MENTORSHIP_COMPLETED:   'Completed mentorship',
  POLL_PARTICIPATED:      'Participated in poll',
  ANNOUNCEMENT_READ:      'Read announcement',
  CUSTOM:                 'Activity',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <p
          className="text-xs font-sans font-semibold uppercase"
          style={{ color: 'var(--text-4)', letterSpacing: '0.1em' }}
        >
          {title}
        </p>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl ${className}`}
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(11,17,32,0.05)',
      }}
    >
      {children}
    </div>
  );
}

// ── Not found state ───────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--surface)' }}
    >
      <p
        className="font-display text-2xl text-t1 mb-2"
        style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
      >
        Portfolio not found
      </p>
      <p className="text-sm font-sans mb-8" style={{ color: 'var(--text-3)' }}>
        This portfolio does not exist or is set to private.
      </p>
      <Link
        to="/"
        className="text-sm font-sans font-medium transition-colors"
        style={{ color: '#C9A96E' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#B8934A')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A96E')}
      >
        Go to CampusChain
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { slug } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portfolio', slug],
    queryFn: () => getPortfolio(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--surface)' }}
      >
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: '#C9A96E' }}
        />
      </div>
    );
  }

  if (isError) return <NotFound />;

  const portfolio = data?.data?.portfolio;
  if (!portfolio) return <NotFound />;

  const profile = portfolio;
  const user    = portfolio.user;
  const detail  = user?.studentDetail;

  const name = profile.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : 'Student';

  const certificates  = user?.certificates  ?? [];
  const badges        = user?.userBadges    ?? [];
  const clubs         = user?.clubMembers   ?? [];
  const mentorships   = user?.mentorships   ?? [];
  const xpLog         = user?.xpLedger     ?? [];
  const xpTotal       = detail?.xpTotal    ?? 0;
  const level         = detail?.level      ?? 1;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>

      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: 'rgba(247,246,242,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/">
          <p
            className="font-display text-xl text-t1"
            style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            Campus<span style={{ color: '#C9A96E' }}>Chain</span>
          </p>
        </Link>

        <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
          Public portfolio
        </p>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="px-6 md:px-10 py-14"
        style={{
          background: 'linear-gradient(160deg, #1E2D4A 0%, #0B1120 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">

            {/* Identity */}
            <div>
              {/* Avatar initial */}
            <Avatar
              avatarUrl={profile.avatarUrl}
              name={name}
              size="xl"
              className="mb-5"
            />

              <h1
                className="font-display text-4xl md:text-5xl text-white mb-2"
                style={{ fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                {name}
              </h1>

              {detail?.department && (
                <p className="text-sm font-sans mt-2" style={{ color: 'rgba(154,163,186,0.8)' }}>
                  {detail.department}
                  {detail.year ? ` · Year ${detail.year}` : ''}
                  {detail.section ? ` · Section ${detail.section}` : ''}
                </p>
              )}

              {profile.bio && (
                <p
                  className="text-sm font-sans mt-4 leading-relaxed max-w-lg"
                  style={{ color: 'rgba(154,163,186,0.7)' }}
                >
                  {profile.bio}
                </p>
              )}
            </div>

            {/* XP stats */}
            <div className="flex gap-6 shrink-0">
              {[
                { label: 'Campus XP', value: xpTotal.toLocaleString() },
                { label: 'Level',     value: level },
                ...(detail?.cgpa && profile.showCgpa !== false
                  ? [{ label: 'CGPA', value: detail.cgpa }]
                  : []),
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className="font-display text-3xl text-white"
                    style={{ fontWeight: 200, letterSpacing: '-0.04em' }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs font-sans uppercase tracking-widest mt-1"
                    style={{ color: 'rgba(154,163,186,0.5)' }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Badges strip */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {badges.map((ub) => {
                const bs = BADGE_CAT[ub.badge.category] ?? BADGE_CAT.FUN;
                return (
                  <span
                    key={ub.id}
                    className="text-xs font-sans font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    {ub.badge.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-0">

            {/* Certificates */}
            {certificates.length > 0 && (
              <Section title="Certificates">
                <div className="flex flex-col gap-3">
                  {certificates.map((cert) => {
                    const ts = CERT_TYPE[cert.type] ?? CERT_TYPE.CUSTOM;
                    const typeLabel = cert.type.charAt(0) + cert.type.slice(1).toLowerCase();
                    return (
                      <Card key={cert.id} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span
                                className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full"
                                style={{ background: ts.bg, color: ts.color }}
                              >
                                {typeLabel}
                              </span>
                            </div>
                            <p className="text-sm font-sans font-semibold text-t1">
                              {cert.title}
                            </p>
                            <p className="text-xs font-sans mt-0.5" style={{ color: 'var(--text-3)' }}>
                              Issued by {cert.issuedBy}
                            </p>
                            {cert.description && (
                              <p className="text-sm font-sans mt-2 leading-relaxed"
                                style={{ color: 'var(--text-3)' }}>
                                {cert.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
                              {fmt(cert.createdAt)}
                            </p>
                            <a
                              href={`/verify/${cert.uniqueCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-2 text-xs font-sans font-semibold transition-colors"
                              style={{ color: '#C9A96E' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#B8934A')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A96E')}
                            >
                              Verify
                            </a>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Clubs */}
            {clubs.length > 0 && (
              <Section title="Clubs and Activities">
                <div className="flex flex-col gap-3">
                  {clubs.map((cm) => {
                    const rs = ROLE_STYLE[cm.role] ?? ROLE_STYLE.MEMBER;
                    const roleLabel = cm.role.charAt(0) + cm.role.slice(1).toLowerCase();
                    return (
                      <Card key={cm.id} className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-sans font-semibold text-t1">
                              {cm.club.name}
                            </p>
                            {cm.joinedAt && (
                              <p className="text-xs font-sans mt-0.5" style={{ color: 'var(--text-4)' }}>
                                Joined {fmt(cm.joinedAt)}
                              </p>
                            )}
                          </div>
                          <span
                            className="text-xs font-sans font-semibold px-2.5 py-1 rounded-full shrink-0"
                            style={{ background: rs.bg, color: rs.color }}
                          >
                            {roleLabel}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Mentorships */}
            {mentorships.length > 0 && (
              <Section title="Completed Mentorships">
                <div className="flex flex-col gap-3">
                  {mentorships.map((m, i) => (
                    <Card key={i} className="px-5 py-4">
                      <p className="text-sm font-sans font-semibold text-t1">{m.topic}</p>
                      {m.completedAt && (
                        <p className="text-xs font-sans mt-0.5" style={{ color: 'var(--text-4)' }}>
                          Completed {fmt(m.completedAt)}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </Section>
            )}

            {/* Empty left column */}
            {certificates.length === 0 && clubs.length === 0 && mentorships.length === 0 && (
              <div
                className="rounded-xl py-16 text-center"
                style={{ border: '1px solid var(--border)' }}
              >
                <p className="text-sm font-sans" style={{ color: 'var(--text-4)' }}>
                  No public achievements yet
                </p>
                {user?.id && (
                  <Section title="Skills">
                    <SkillsPanel targetUserId={user.id} isOwn={false} />
                  </Section>
                )}
              </div>
            )}
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8">

            {/* Badges */}
            {badges.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-sans font-semibold uppercase"
                    style={{ color: 'var(--text-4)', letterSpacing: '0.1em' }}>
                    Badges
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {badges.map((ub) => {
                    const bs = BADGE_CAT[ub.badge.category] ?? BADGE_CAT.FUN;
                    return (
                      <span
                        key={ub.id}
                        title={`+${ub.badge.xpReward} XP`}
                        className="text-xs font-sans font-semibold px-2.5 py-1 rounded-full cursor-default"
                        style={{ background: bs.bg, color: bs.color }}
                      >
                        {ub.badge.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent XP activity */}
            {xpLog.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-sans font-semibold uppercase"
                    style={{ color: 'var(--text-4)', letterSpacing: '0.1em' }}>
                    Recent activity
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <div className="flex flex-col gap-2">
                  {xpLog.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: 'var(--white)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <p className="text-xs font-sans" style={{ color: 'var(--text-2)' }}>
                        {XP_LABEL[entry.eventType] ?? entry.eventType}
                      </p>
                      <span
                        className="text-xs font-sans font-bold shrink-0"
                        style={{ color: '#C9A96E' }}
                      >
                        +{entry.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member since */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-sans font-semibold uppercase"
                  style={{ color: 'var(--text-4)', letterSpacing: '0.1em' }}>
                  Member since
                </p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <p className="text-sm font-sans" style={{ color: 'var(--text-2)' }}>
                {fmtFull(user?.createdAt)}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-10 py-8 flex items-center justify-between mt-8"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
          Verified by CampusChain · Techno India Batanagar
        </p>
        <Link
          to="/"
          className="text-xs font-sans font-medium transition-colors"
          style={{ color: '#C9A96E' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#B8934A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A96E')}
        >
          campuschain.in
        </Link>
      </footer>
    </div>
  );
}