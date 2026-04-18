import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listElectionsApi } from '../../api/elections'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import CreateElectionModal from './CreateElectionModal'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function ElectionsPage() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['elections'],
    queryFn: () => listElectionsApi().then((r) => r.data.data.elections),
  })

  const elections = data ?? []

  const filtered = filter === 'ALL'
    ? elections
    : elections.filter((e) => e.status === filter)

  return (
    <div className="max-w-4xl flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Elections</h2>
          <p className="text-sm text-gray-400 mt-0.5">Campus elections, CR selections and leadership votes</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>Create election</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'OPEN', 'DRAFT', 'CLOSED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-200'
              }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No elections found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((election) => (
            <ElectionCard key={election.id} election={election} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateElectionModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); refetch() }}
        />
      )}
    </div>
  )
}

function ElectionCard({ election, isAdmin }) {
  const now = new Date()
  const ends = new Date(election.endsAt)
  const starts = new Date(election.startsAt)
  const isOpen = election.status === 'OPEN'
  const timeLabel = isOpen
    ? `Ends ${ends.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : `Started ${starts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <Link
      to={`/elections/${election.id}`}
      className="bg-white border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={election.status} />
            {election.isAnonymous && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                Anonymous
              </span>
            )}
            {election.hasVoted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                Voted
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">
            {election.title}
          </h3>
          {election.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{election.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">{timeLabel}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{election.candidates?.length ?? 0} candidates</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{election.voterCount ?? 0} votes</span>
          </div>
        </div>
        {isOpen && !election.hasVoted && (
          <span className="flex-shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
            Vote now
          </span>
        )}
      </div>
    </Link>
  )
}