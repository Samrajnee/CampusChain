import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/elections': 'Elections',
  '/proposals': 'Proposals',
  '/grievances': 'Grievances',
  '/events': 'Events',
  '/clubs': 'Clubs',
  '/certificates': 'Certificates',
  '/leaderboard': 'Leaderboard',
  '/directory': 'Student Directory',
  '/announcements': 'Announcements',
  '/polls': 'Polls',
  '/admin/students': 'Student Management',
  '/admin/certificates': 'Certificate Management',
  '/admin/budget': 'Budget Requests',
  '/admin/reports': 'Reports',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'CampusChain'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden flex flex-col gap-1 p-1"
      >
        <span className="block w-4 h-0.5 bg-gray-400" />
        <span className="block w-4 h-0.5 bg-gray-400" />
        <span className="block w-4 h-0.5 bg-gray-400" />
      </button>

      <h1 className="text-sm font-semibold text-gray-800 flex-1">{title}</h1>

      <button className="relative w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
        <span className="text-xs text-gray-500 font-medium">N</span>
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
      </button>
    </header>
  )
}