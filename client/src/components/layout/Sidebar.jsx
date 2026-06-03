import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import Avatar from '../ui/Avatar';

const ADMIN_ROLES = [
  'TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN',
];

const studentNav = [
  { label: 'Dashboard',     to: '/dashboard' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Elections',     to: '/elections' },
  { label: 'Proposals',     to: '/proposals' },
  { label: 'Grievances',    to: '/grievances' },
  { label: 'Polls',         to: '/polls' },
  { label: 'Events',        to: '/events' },
  { label: 'Clubs',         to: '/clubs' },
  { label: 'Mentorship',    to: '/mentorship' },
  { label: 'Certificates',  to: '/certificates' },
  { label: 'Leaderboard',   to: '/leaderboard' },
  { label: 'Directory',     to: '/directory' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Profile',       to: '/profile' },
  { label: 'Resume',        to: '/resume' },
];

const adminNav = [
  { label: 'Dashboard',     to: '/dashboard' },
  { label: 'Admin',         to: '/admin' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Elections',     to: '/elections' },
  { label: 'Proposals',     to: '/proposals' },
  { label: 'Grievances',    to: '/grievances' },
  { label: 'Polls',         to: '/polls' },
  { label: 'Events',        to: '/events' },
  { label: 'Clubs',         to: '/clubs' },
  { label: 'Mentorship',    to: '/mentorship' },
  { label: 'Certificates',  to: '/certificates' },
  { label: 'Leaderboard',   to: '/leaderboard' },
  { label: 'Directory',     to: '/directory' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Profile',       to: '/profile' },
  { label: 'Resume',        to: '/resume' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { close }        = useSidebar();
  const navigate         = useNavigate();

  const isAdmin  = ADMIN_ROLES.includes(user?.role);
  const navItems = isAdmin ? adminNav : studentNav;

  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside
      className="w-60 h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1E2D4A 0%, #0B1120 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Brand + mobile close ───────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 pt-7 pb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p
          className="font-display text-xl text-white"
          style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          Campus<span style={{ color: '#C9A96E' }}>Chain</span>
        </p>

        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
          style={{ color: 'rgba(154,163,186,0.6)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(154,163,186,0.6)';
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── User chip ──────────────────────────────────────────────────── */}
      <div
        className="mx-4 mt-4 mb-4 px-3 py-3 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
      <Avatar
        avatarUrl={user?.profile?.avatarUrl}
        name={fullName}
        size="sm"
        className="mb-2"
      />
        <p className="text-sm font-sans text-white font-medium truncate leading-snug">
          {fullName}
        </p>
        <p
          className="text-xs mt-0.5 truncate font-sans"
          style={{ color: '#C9A96E', letterSpacing: '0.04em' }}
        >
          {user?.role}
        </p>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="block rounded-lg text-sm font-sans transition-all duration-150"
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'rgba(201,169,110,0.15)',
                    color: '#E8D5AA',
                    borderLeft: '2px solid #C9A96E',
                    padding: '8px 12px 8px 10px',
                    fontWeight: 500,
                  }
                : {
                    color: 'rgba(154,163,186,0.8)',
                    padding: '8px 12px',
                    fontWeight: 400,
                  }
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.borderLeft) {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.style.borderLeft) {
                e.currentTarget.style.color = 'rgba(154,163,186,0.8)';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Sign out ───────────────────────────────────────────────────── */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm font-sans text-left rounded-lg transition-all duration-150"
          style={{ color: 'rgba(154,163,186,0.6)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F87171';
            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(154,163,186,0.6)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}