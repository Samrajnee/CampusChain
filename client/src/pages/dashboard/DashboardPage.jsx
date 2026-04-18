import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const quickLinks = [
  { label: 'Elections', path: '/elections', desc: 'Vote and view results' },
  { label: 'Proposals', path: '/proposals', desc: 'Submit and upvote ideas' },
  { label: 'Certificates', path: '/certificates', desc: 'View your credentials' },
  { label: 'Events', path: '/events', desc: 'Browse campus events' },
  { label: 'Grievances', path: '/grievances', desc: 'Raise a concern' },
  { label: 'Clubs', path: '/clubs', desc: 'Explore student clubs' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.profile?.firstName || 'there'
  const sd = user?.studentDetail

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Welcome banner */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-indigo-200 text-sm mb-1">{greeting}</p>
        <h2 className="text-2xl font-bold mb-1">{firstName}</h2>
        <p className="text-indigo-200 text-sm">
          {sd?.department} · Year {sd?.year} · Semester {sd?.semester}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'XP Points', value: sd?.xpTotal ?? 0, bg: 'bg-violet-50', text: 'text-violet-700' },
          { label: 'Level', value: sd?.level ?? 1, bg: 'bg-sky-50', text: 'text-sky-700' },
          { label: 'Badges', value: 0, bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Events attended', value: 0, bg: 'bg-teal-50', text: 'text-teal-700' },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition group"
            >
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                {link.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent activity</h3>
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">No activity yet. Start exploring the platform.</p>
        </div>
      </div>

    </div>
  )
}