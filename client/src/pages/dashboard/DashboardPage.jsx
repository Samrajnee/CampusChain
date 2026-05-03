import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats } from '../../api/admin';
import { getAnnouncements } from '../../api/announcements';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import Spinner from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function StatCard({ label, value, accent, delay = 0 }) {
  return (
    <Card
      className="p-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p
        className="text-xs font-sans font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--text-4)' }}
      >
        {label}
      </p>
      <p
        className="font-display text-4xl"
        style={{
          fontWeight: 300,
          color: accent || 'var(--text-1)',
          letterSpacing: '-0.04em',
        }}
      >
        {value ?? (
          <span className="skeleton inline-block w-16 h-9 rounded" />
        )}
      </p>
    </Card>
  );
}

function QuickLink({ label, to, sub }) {
  return (
    <Link to={to}>
      <Card
        hover
        className="p-5 flex items-center justify-between group"
      >
        <div>
          <p className="text-sm font-sans font-medium text-t2 group-hover:text-t1 transition-colors">
            {label}
          </p>
          {sub && (
            <p
              className="text-xs font-sans mt-0.5"
              style={{ color: 'var(--text-4)' }}
            >
              {sub}
            </p>
          )}
        </div>
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: 'var(--text-4)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const { data: announcementsData, isLoading: annLoading } = useQuery({
    queryKey: ['announcements', 1],
    queryFn: () => getAnnouncements({ page: 1, limit: 5 }),
  });

  const stats = statsData?.data;
  const announcements = announcementsData?.data?.announcements ?? [];
  const firstName = user?.profile?.firstName ?? 'there';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${firstName}.`}
        subtitle="Here is what is happening on campus today."
      />

      {/* Stats — admin only */}
      {isAdmin && (
        <section className="mb-10">
          <SectionLabel>Platform overview</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            <StatCard label="Students"     value={stats?.totalStudents}    accent="#1E2D4A" delay={0} />
            <StatCard label="Active clubs" value={stats?.totalClubs}       accent="#C9A96E" delay={60} />
            <StatCard label="Events"       value={stats?.totalEvents}      delay={120} />
            <StatCard label="Certificates" value={stats?.totalCertificates} delay={180} />
          </div>
          {(stats?.pendingBudget > 0 || stats?.pendingClubs > 0) && (
            <div
              className="mt-4 px-5 py-3 rounded-xl flex items-center gap-3 animate-fade-up"
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                animationDelay: '240ms',
              }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: '#D97706' }}
              />
              <p className="text-sm font-sans" style={{ color: '#92400E' }}>
                {[
                  stats.pendingBudget > 0 && `${stats.pendingBudget} budget request${stats.pendingBudget > 1 ? 's' : ''} awaiting approval`,
                  stats.pendingClubs > 0 && `${stats.pendingClubs} club${stats.pendingClubs > 1 ? 's' : ''} pending review`,
                ].filter(Boolean).join(' · ')}
              </p>
              <Link
                to="/admin"
                className="ml-auto text-xs font-sans font-semibold shrink-0 transition-colors"
                style={{ color: '#D97706' }}
              >
                Review
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Student XP card */}
      {!isAdmin && (
        <section className="mb-10 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div
            className="rounded-xl p-7 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #1E2D4A 0%, #0B1120 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div>
              <p
                className="text-xs font-sans font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(154,163,186,0.7)' }}
              >
                Your campus XP
              </p>
              <p
                className="font-display text-5xl text-white"
                style={{ fontWeight: 200, letterSpacing: '-0.05em' }}
              >
                {user?.studentDetail?.xpTotal ?? 0}
              </p>
              <p
                className="text-sm font-sans mt-1"
                style={{ color: '#C9A96E' }}
              >
                Level {user?.studentDetail?.level ?? 1}
              </p>
            </div>
            <div className="text-right">
              <Link
                to="/leaderboard"
                className="text-xs font-sans font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                style={{
                  border: '1px solid rgba(201,169,110,0.4)',
                  color: '#C9A96E',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,169,110,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Announcements */}
        <div className="lg:col-span-2">
          <SectionLabel>Recent announcements</SectionLabel>
          {annLoading ? (
            <Spinner />
          ) : announcements.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm font-sans" style={{ color: 'var(--text-4)' }}>
                No announcements yet
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3 stagger">
              {announcements.map((a) => (
                <Card
                  key={a.id}
                  className="px-5 py-4 animate-fade-up"
                  style={{
                    borderLeft: !a.isRead
                      ? '3px solid #C9A96E'
                      : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {a.isPinned && (
                        <span
                          className="inline-block text-xs font-sans font-semibold px-2 py-0.5 rounded-full mb-1.5"
                          style={{ background: '#FFFBEB', color: '#92400E' }}
                        >
                          Pinned
                        </span>
                      )}
                      <p className="text-sm font-sans font-medium text-t1 leading-snug">
                        {a.title}
                      </p>
                      <p
                        className="text-xs font-sans mt-1 line-clamp-2"
                        style={{ color: 'var(--text-3)' }}
                      >
                        {a.body}
                      </p>
                    </div>
                    {!a.isRead && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-1"
                        style={{ background: '#C9A96E' }}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Link
            to="/announcements"
            className="inline-block mt-4 text-xs font-sans font-semibold transition-colors"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={(e) => (e.target.style.color = '#C9A96E')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-4)')}
          >
            View all announcements
          </Link>
        </div>

        {/* Quick links */}
        <div>
          <SectionLabel>Quick access</SectionLabel>
          <div className="flex flex-col gap-2 stagger">
            <QuickLink label="Elections"    to="/elections"    sub="Vote and stand for positions" />
            <QuickLink label="Events"       to="/events"       sub="RSVP and track attendance" />
            <QuickLink label="Clubs"        to="/clubs"        sub="Join and manage clubs" />
            <QuickLink label="Certificates" to="/certificates" sub="View your achievements" />
            <QuickLink label="Resume"       to="/resume"       sub="Download your PDF resume" />
          </div>
        </div>

      </div>
    </div>
  );
}