import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const studentNav = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'My Profile', path: '/profile' },
  { label: 'Elections', path: '/elections' },
  { label: 'Proposals', path: '/proposals' },
  { label: 'Grievances', path: '/grievances' },
  { label: 'Events', path: '/events' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Certificates', path: '/certificates' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Directory', path: '/directory' },
  { label: 'Announcements', path: '/announcements' },
  { label: 'Polls', path: '/polls' },
]

const adminNav = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Students', path: '/admin/students' },
  { label: 'Elections', path: '/elections' },
  { label: 'Proposals', path: '/proposals' },
  { label: 'Grievances', path: '/grievances' },
  { label: 'Events', path: '/events' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Certificates', path: '/admin/certificates' },
  { label: 'Announcements', path: '/announcements' },
  { label: 'Budget', path: '/admin/budget' },
  { label: 'Reports', path: '/admin/reports' },
]

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN']

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const navItems = isAdmin ? adminNav : studentNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">CC</span>
          </div>
          <span className="font-bold text-gray-900">CampusChain</span>
          <button
            onClick={onClose}
            className="ml-auto text-gray-300 hover:text-gray-500 lg:hidden text-sm"
          >
            Close
          </button>
        </div>

        {/* User pill */}
        <div className="mx-3 mt-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 text-xs font-bold">
                {user?.profile?.firstName?.charAt(0)}{user?.profile?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }
              `}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* XP strip */}
        {!isAdmin && user?.studentDetail && (
          <div className="mx-3 mb-3 p-3 bg-violet-50 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Level {user.studentDetail.level}</span>
              <span className="text-xs font-semibold text-violet-600">
                {user.studentDetail.xpTotal} XP
              </span>
            </div>
            <div className="w-full bg-violet-100 rounded-full h-1">
              <div
                className="bg-violet-500 h-1 rounded-full transition-all"
                style={{ width: `${Math.min((user.studentDetail.xpTotal % 500) / 5, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}