import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      {/* Left — page context breadcrumb slot (empty for now) */}
      <div />

      {/* Right — bell + user */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-5 w-px bg-gray-200" />

        <div className="text-right">
          <p className="text-xs font-semibold text-gray-800 leading-none">
            {user?.profile?.firstName
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : user?.email}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 leading-none">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}