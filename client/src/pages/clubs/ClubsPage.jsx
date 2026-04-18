import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listClubsApi, createClubApi } from '../../api/campus-ops'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function ClubsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => listClubsApi().then((r) => r.data.data.clubs),
  })

  const clubs = (data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clubs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Student clubs and organisations</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Start a club</Button>
      </div>

      <input
        type="text"
        placeholder="Search clubs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No clubs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">
                    {club.name.charAt(0)}
                  </span>
                </div>
                <StatusBadge status={club.status} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition mb-1">
                {club.name}
              </h3>
              {club.description && (
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{club.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{club._count?.members ?? 0} members</span>
                <span>·</span>
                <span>{club._count?.events ?? 0} events</span>
                {club.advisor && (
                  <>
                    <span>·</span>
                    <span>Advised by {club.advisor.user?.profile?.firstName}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClubModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); qc.invalidateQueries(['clubs']) }}
        />
      )}
    </div>
  )
}

function CreateClubModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const mutation = useMutation({ mutationFn: createClubApi, onSuccess })

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Start a club</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            New clubs require HOD approval before becoming active.
          </p>
          <Input label="Club name" placeholder="e.g. Photography Club" value={form.name} onChange={set('name')} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={3}
              placeholder="What is this club about?"
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">Submit for approval</Button>
          </div>
        </form>
      </div>
    </div>
  )
}