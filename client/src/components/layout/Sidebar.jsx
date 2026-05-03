import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

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
  const navigate = useNavigate();
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const navItems = isAdmin ? adminNav : studentNav;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email;

  return (
    <aside
      style={{
        background: 'linear-gradient(180deg, #1E2D4A 0%, #0B1120 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
      className="w-60 shrink-0 h-screen flex flex-col"
    >
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <p
          className="text-xl font-display text-white"
          style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          Campus
          <span style={{ color: '#C9A96E' }}>Chain</span>
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'rgba(154,163,186,0.7)', letterSpacing: '0.08em' }}
        >
          ACADEMIC PLATFORM
        </p>
      </div>

      {/* User chip */}
      <div
        className="mx-4 mb-5 px-3 py-3 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-sm font-sans text-white font-medium truncate leading-snug">
          {fullName}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: '#C9A96E', letterSpacing: '0.04em' }}
        >
          {user?.role}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-sans transition-all duration-150 ${
                isActive
                  ? 'text-white font-medium'
                  : 'font-normal hover:text-white'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'rgba(201,169,110,0.15)',
                    color: '#E8D5AA',
                    borderLeft: '2px solid #C9A96E',
                    paddingLeft: '10px',
                  }
                : { color: 'rgba(154,163,186,0.8)' }
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
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