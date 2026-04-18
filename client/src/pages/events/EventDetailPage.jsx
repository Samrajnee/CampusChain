import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventApi, rsvpEventApi, updateEventStatusApi } from '../../api/campus-ops'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function EventDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const isAdmin = ADMIN_ROLES.includes(user?.role)

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventApi(id).then((r) => r.data.data.event),
  })

  const rsvpMutation = useMutation({
    mutationFn: () => rsvpEventApi(id),
    onSuccess: () => qc.invalidateQueries(['event', id]),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => updateEventStatusApi(id, status),
    onSuccess: () => qc.invalidateQueries(['event', id]),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return null
  const event = data
  const start = new Date(event.startsAt)
  const canRsvp = ['UPCOMING', 'ONGOING'].includes(event.status)

  return (
    <div className="max-w-3xl flex flex-col gap-6">

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={event.status} />
              {event.club && <span className="text-xs text-gray-400">{event.club.name}</span>}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            {event.description && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{event.description}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {event.status === 'UPCOMING' && (
                <Button variant="secondary" onClick={() => statusMutation.mutate('ONGOING')} loading={statusMutation.isPending}>
                  Start event
                </Button>
              )}
              {event.status === 'ONGOING' && (
                <Button variant="secondary" onClick={() => statusMutation.mutate('COMPLETED')} loading={statusMutation.isPending}>
                  Mark completed
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Date', value: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Time', value: start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
            { label: 'Venue', value: event.venue || 'TBA' },
            { label: 'Attending', value: `${event._count?.rsvps ?? 0}${event.maxCapacity ? ` / ${event.maxCapacity}` : ''}` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RSVP */}
      {canRsvp && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {event.hasRsvp ? 'You are attending this event' : 'Will you be attending?'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {event.hasRsvp ? 'Click to cancel your RSVP' : 'Let the organizers know'}
            </p>
          </div>
          <Button
            variant={event.hasRsvp ? 'secondary' : 'primary'}
            onClick={() => rsvpMutation.mutate()}
            loading={rsvpMutation.isPending}
          >
            {event.hasRsvp ? 'Cancel RSVP' : 'RSVP'}
          </Button>
        </div>
      )}

      {/* Attended notice */}
      {event.hasAttended && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-medium text-green-700">Your attendance has been recorded for this event.</p>
        </div>
      )}

      {/* Committee */}
      {event.committee?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Organising committee</h3>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {event.committee.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-gray-800">
                  {c.user?.profile?.firstName} {c.user?.profile?.lastName}
                </p>
                <span className="text-xs text-gray-400">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendees */}
      {event.rsvps?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Attendees ({event.rsvps.length})
          </h3>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {event.rsvps.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-indigo-600">
                    {r.user?.profile?.firstName?.charAt(0)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {r.user?.profile?.firstName} {r.user?.profile?.lastName}
                </p>
              </div>
            ))}
            {event.rsvps.length > 10 && (
              <div className="px-5 py-3">
                <p className="text-xs text-gray-400">+{event.rsvps.length - 10} more</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}