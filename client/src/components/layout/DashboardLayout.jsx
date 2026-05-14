import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';

function Layout() {
  const { open, close } = useSidebar();
  const location = useLocation();

  // Close drawer on every route change
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">

      {/* ── Desktop sidebar — always visible lg+ ─────────────────────── */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* ── Mobile drawer overlay ─────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={close}
        className="lg:hidden fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(11,17,32,0.5)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Drawer */}
      <div
        className="lg:hidden fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-out"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <Sidebar />
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-5 py-8 lg:px-10 lg:py-10 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <Layout />
    </SidebarProvider>
  );
}