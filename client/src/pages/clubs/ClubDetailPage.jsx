import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClubApi, joinClubApi, leaveClubApi, updateClubStatusApi } from '../../api/campus-ops'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { useState } from 'react'

const ADMIN_ROLES = ['HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function ClubDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const [actionError, setActionError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['club', id],
    queryFn: () => getClubApi(id).then((r) => r.data.data.club),
  })

  const joinMutation = useMutation({
    mutationFn: () => joinClubApi(id),
    onSuccess: () => { setActionError(''); qc.invalidateQueries(['club', id]) },
    onError: (err) => setActionError(err.response?.data?.message || 'Action failed'),
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveClubApi(id),
    onSuccess: () => { setActionError(''); qc.invalidateQueries(['club', id]) },
    onError: (err) => setActionError(err.response?.data?.message || 'Action failed'),
  })

  const approveMutation = useMutation({
    mutationFn: () => updateClubStatusApi(id, { status: 'ACTIVE' }),
    onSuccess: () => qc.invalidateQueries(['club', id]),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return null
  const club = data

  return (
    <div className="max-w-3xl flex flex-col gap-6">

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">{club.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{club.name}</h2>
                <StatusBadge status={club.status} />
              </div>
              {club.advisor && (
                <p className="text-xs text-gray-400">
                  Faculty advisor: {club.advisor.user?.profile?.firstName} {club.advisor.user?.profile?.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {isAdmin && club.status === 'PENDING_APPROVAL' && (
              <Button onClick={() => approveMutation.mutate()} loading={approveMutation.isPending}>
                Approve club
              </Button>
            )}
            {!isAdmin && club.status === 'ACTIVE' && (
              club.isMember ? (
                <Button variant="secondary" onClick={() => leaveMutation.mutate()} loading={leaveMutation.isPending}>
                  Leave club
                </Button>
              ) : (
                <Button onClick={() => joinMutation.mutate()} loading={joinMutation.isPending}>
                  Join club
                </Button>
              )
            )}
          </div>
        </div>

        {club.description && (
          <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 leading-relaxed">
            {club.description}
          </p>
        )}

        {actionError && <Alert type="error" message={actionError} />}

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Members', value: club.members?.length ?? 0 },
            { label: 'Events', value: club.events?.length ?? 0 },
            { label: 'Your role', value: club.userRole ?? 'Not a member' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">
                {typeof item.value === 'string' ? item.value.toLowerCase().replace('_', ' ') : item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      {club.members?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Members</h3>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {club.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600">
                      {m.user?.profile?.firstName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {m.user?.profile?.firstName} {m.user?.profile?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.user?.studentDetail?.department} · Year {m.user?.studentDetail?.year}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${m.role === 'PRESIDENT' ? 'bg-indigo-100 text-indigo-600' :
                    m.role === 'SECRETARY' ? 'bg-sky-100 text-sky-600' :
                    'bg-gray-100 text-gray-500'}`}
                >
                  {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent events */}
      {club.events?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent events</h3>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {club.events.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}