import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

export default function Topbar() {
  const { user } = useAuth();

  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email;

  return (
    <header
      className="h-14 flex items-center justify-between px-10 shrink-0"
      style={{
        background: 'rgba(247,246,242,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,223,216,0.8)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left — breadcrumb slot, empty for now */}
      <div />

      {/* Right */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        <div
          className="w-px h-5"
          style={{ background: 'var(--border)' }}
        />

        <div className="text-right">
          <p className="text-sm font-sans font-medium text-t1 leading-none">
            {fullName}
          </p>
          <p
            className="text-xs mt-0.5 leading-none font-sans"
            style={{ color: 'var(--text-3)', letterSpacing: '0.03em' }}
          >
            {user?.role}
          </p>
        </div>
      </div>
    </header>
  );
}