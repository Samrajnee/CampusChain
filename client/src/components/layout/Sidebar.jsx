import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = [
  'TEACHER',
  'HOD',
  'LAB_ASSISTANT',
  'LIBRARIAN',
  'PRINCIPAL',
  'SUPER_ADMIN',
];

const studentNav = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Elections', to: '/elections' },
  { label: 'Proposals', to: '/proposals' },
  { label: 'Grievances', to: '/grievances' },
  { label: 'Polls', to: '/polls' },
  { label: 'Events', to: '/events' },
  { label: 'Clubs', to: '/clubs' },
  { label: 'Certificates', to: '/certificates' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Directory', to: '/directory' },
  { label: 'Profile', to: '/profile' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Mentorship', to: '/mentorship' },
  { label: 'Resume', to: '/resume' },
  
];

const adminNav = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Admin', to: '/admin' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Elections', to: '/elections' },
  { label: 'Proposals', to: '/proposals' },
  { label: 'Grievances', to: '/grievances' },
  { label: 'Polls', to: '/polls' },
  { label: 'Events', to: '/events' },
  { label: 'Clubs', to: '/clubs' },
  { label: 'Certificates', to: '/certificates' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Directory', to: '/directory' },
  { label: 'Profile', to: '/profile' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Mentorship', to: '/mentorship' },
  { label: 'Resume', to: '/resume' },

];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-base font-bold text-indigo-600 tracking-tight">
          CampusChain
        </span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-900 truncate">
          {user?.profile?.firstName
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user?.email}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{user?.role}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-left text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}