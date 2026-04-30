import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLeaderboardApi } from '../../api/identity'
import { useAuth } from '../../context/AuthContext'

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business Administration']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [dept, setDept] = useState('')
  const [year, setYear] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', dept, year],
    queryFn: () => getLeaderboardApi({ department: dept || undefined, year: year || undefined })
      .then((r) => r.data.data.leaderboard),
  })

  const leaderboard = data ?? []

  const levelLabel = (level) => {
    if (level >= 10) return 'Campus Leader'
    if (level >= 7) return 'Senior'
    if (level >= 4) return 'Active'
    if (level >= 2) return 'Rising'
    return 'Newbie'
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">Top students ranked by XP and participation</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.slice(1).map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All years</option>
          {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No students found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {leaderboard.map((student, index) => {
            const isMe = student.userId === user?.id
            const rankColors = ['text-amber-500', 'text-gray-400', 'text-orange-400']

            return (
              <div
                key={student.userId}
                className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0
                  ${isMe ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}
              >
                <span className={`w-6 text-sm font-bold text-center flex-shrink-0 ${rankColors[index] || 'text-gray-300'}`}>
                  {student.rank}
                </span>

                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">
                    {student.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {student.name}
                      {isMe && <span className="ml-1.5 text-xs font-normal text-indigo-400">you</span>}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {student.department} · Year {student.year} · {levelLabel(student.level)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-indigo-600">{student.xpTotal} XP</p>
                  <p className="text-xs text-gray-400">{student.badgeCount} badges</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}