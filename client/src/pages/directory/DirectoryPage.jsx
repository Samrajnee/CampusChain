import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDirectoryApi } from '../../api/identity'
import { Link } from 'react-router-dom'

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business Administration']

const BADGE_COLORS = {
  GOVERNANCE: 'bg-blue-50 text-blue-700',
  SOCIAL: 'bg-pink-50 text-pink-700',
  ACADEMIC: 'bg-green-50 text-green-700',
  LEADERSHIP: 'bg-violet-50 text-violet-700',
  EVENTS: 'bg-amber-50 text-amber-700',
  FUN: 'bg-rose-50 text-rose-600',
}

export default function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [year, setYear] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['directory', search, dept, year],
    queryFn: () => getDirectoryApi({
      search: search || undefined,
      department: dept || undefined,
      year: year || undefined,
    }).then((r) => r.data.data.students),
    enabled: true,
  })

  const students = data ?? []

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Student Directory</h2>
        <p className="text-sm text-gray-400 mt-0.5">Browse and discover students across campus</p>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-40 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">All years</option>
          {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No students found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {students.map((student) => (
            <div key={student.userId} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.department} · Year {student.year}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-indigo-600">{student.xpTotal} XP</p>
                  <p className="text-xs text-gray-400">Lv. {student.level}</p>
                </div>
              </div>

              {student.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {student.badges.map((badge) => (
                    <span key={badge.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_COLORS[badge.category] || 'bg-gray-50 text-gray-500'}`}>
                      {badge.name}
                    </span>
                  ))}
                </div>
              )}

              {student.portfolioSlug && (
                <Link
                  to={`/portfolio/${student.portfolioSlug}`}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  View portfolio
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}