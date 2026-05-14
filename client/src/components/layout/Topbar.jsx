import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import NotificationBell from '../notifications/NotificationBell';

function HamburgerIcon({ open }) {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );
}

export default function Topbar() {
  const { user } = useAuth();
  const { open, toggle } = useSidebar();

  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email;

  return (
    <header
      className="h-14 flex items-center justify-between px-5 lg:px-10 shrink-0"
      style={{
        background: 'rgba(247,246,242,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,223,216,0.8)',
      }}
    >
      {/* Left — hamburger on mobile, empty on desktop */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-2)';
            e.currentTarget.style.color = 'var(--text-1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <HamburgerIcon open={open} />
        </button>

        {/* Brand name visible on mobile only (sidebar is hidden) */}
        <p
          className="lg:hidden font-display text-lg text-t1"
          style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          Campus<span style={{ color: '#C9A96E' }}>Chain</span>
        </p>
      </div>

      {/* Right — bell + user */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div
          className="w-px h-5 hidden sm:block"
          style={{ background: 'var(--border)' }}
        />

        <div className="text-right hidden sm:block">
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