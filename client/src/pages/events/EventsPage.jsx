import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listEventsApi, createEventApi } from '../../api/campus-ops'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function EventsPage() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => listEventsApi().then((r) => r.data.data.events),
  })

  const events = data ?? []
  const filtered = filter === 'ALL' ? events : events.filter((e) => e.status === filter)

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">Campus events, workshops and activities</p>
        </div>
        {isAdmin && <Button onClick={() => setShowCreate(true)}>Create event</Button>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-200'}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); qc.invalidateQueries(['events']) }}
        />
      )}
    </div>
  )
}

function EventCard({ event }) {
  const start = new Date(event.startsAt)
  const day = start.toLocaleDateString('en-IN', { day: 'numeric' })
  const month = start.toLocaleDateString('en-IN', { month: 'short' })
  const time = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <Link
      to={`/events/${event.id}`}
      className="bg-white border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition group flex gap-4"
    >
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-xl font-bold text-indigo-600 leading-none">{day}</p>
        <p className="text-xs text-gray-400 uppercase mt-0.5">{month}</p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={event.status} />
          {event.club && (
            <span className="text-xs text-gray-400 truncate">{event.club.name}</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">
          {event.title}
        </h3>
        {event.venue && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{event.venue}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{time}</span>
          <span>·</span>
          <span>{event._count?.rsvps ?? 0} attending</span>
          {event.maxCapacity && (
            <><span>·</span><span>Max {event.maxCapacity}</span></>
          )}
        </div>
      </div>
    </Link>
  )
}

function CreateEventModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', venue: '',
    startsAt: '', endsAt: '', maxCapacity: '',
  })
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const mutation = useMutation({
    mutationFn: createEventApi,
    onSuccess,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create event</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Input label="Title" placeholder="Event name" value={form.title} onChange={set('title')} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={3}
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <Input label="Venue" placeholder="Location or room number" value={form.venue} onChange={set('venue')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Starts at" type="datetime-local" value={form.startsAt} onChange={set('startsAt')} required />
            <Input label="Ends at" type="datetime-local" value={form.endsAt} onChange={set('endsAt')} />
          </div>
          <Input label="Max capacity (optional)" type="number" placeholder="Leave blank for unlimited" value={form.maxCapacity} onChange={set('maxCapacity')} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">Create</Button>
          </div>
        </form>
      </div>
    </div>
  )
}