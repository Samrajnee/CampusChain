import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listGrievancesApi, createGrievanceApi, updateGrievanceStatusApi } from '../../api/governance'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

const STATUS_FLOW = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ESCALATED', 'RESOLVED', 'CLOSED'],
  ESCALATED: ['RESOLVED', 'CLOSED'],
  RESOLVED: [],
  CLOSED: [],
}

export default function GrievancesPage() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['grievances'],
    queryFn: () => listGrievancesApi().then((r) => r.data.data.grievances),
  })

  const grievances = data ?? []

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Grievances</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {isAdmin ? 'Review and resolve student grievances' : 'Raise and track your concerns'}
          </p>
        </div>
        {!isAdmin && <Button onClick={() => setShowForm(true)}>Raise grievance</Button>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grievances.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No grievances found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {grievances.map((g) => (
            <GrievanceCard
              key={g.id}
              grievance={g}
              isAdmin={isAdmin}
              onClick={() => setSelected(g)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CreateGrievanceModal
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); qc.invalidateQueries(['grievances']) }}
        />
      )}

      {selected && (
        <GrievanceDetailModal
          grievance={selected}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); qc.invalidateQueries(['grievances']) }}
        />
      )}
    </div>
  )
}

function GrievanceCard({ grievance, isAdmin, onClick }) {
  const authorName = grievance.isAnonymous
    ? 'Anonymous'
    : grievance.student
      ? `${grievance.student.profile?.firstName} ${grievance.student.profile?.lastName}`
      : 'Unknown'

  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-xl p-5 text-left hover:border-indigo-200 hover:shadow-sm transition w-full"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={grievance.status} />
            {grievance.isAnonymous && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                Anonymous
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{grievance.title}</h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{grievance.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {isAdmin && <span>{authorName}</span>}
            {isAdmin && <span>·</span>}
            <span>{new Date(grievance.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
        <span className="text-xs text-gray-300 flex-shrink-0">View</span>
      </div>
    </button>
  )
}

function CreateGrievanceModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', isAnonymous: false })
  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [f]: val })
  }

  const mutation = useMutation({ mutationFn: createGrievanceApi, onSuccess })

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Raise a grievance</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Input label="Title" placeholder="Brief summary of your concern" value={form.title} onChange={set('title')} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={5}
              placeholder="Describe your concern in detail. Minimum 20 characters."
              value={form.description}
              onChange={set('description')}
              required
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isAnonymous} onChange={set('isAnonymous')} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Submit anonymously</p>
              <p className="text-xs text-gray-400">Your identity will not be disclosed to staff</p>
            </div>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GrievanceDetailModal({ grievance, isAdmin, onClose, onSuccess }) {
  const [note, setNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => updateGrievanceStatusApi(grievance.id, { status: selectedStatus, note }),
    onSuccess,
  })

  const nextStatuses = STATUS_FLOW[grievance.status] ?? []
  const authorName = grievance.isAnonymous
    ? 'Anonymous'
    : grievance.student
      ? `${grievance.student.profile?.firstName} ${grievance.student.profile?.lastName}`
      : 'Unknown'

  const statusColors = {
    SUBMITTED: 'bg-sky-50 text-sky-600',
    UNDER_REVIEW: 'bg-amber-50 text-amber-600',
    ESCALATED: 'bg-orange-50 text-orange-600',
    RESOLVED: 'bg-green-50 text-green-600',
    CLOSED: 'bg-gray-50 text-gray-500',
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Grievance detail</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900">{grievance.title}</h3>
            <StatusBadge status={grievance.status} />
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{grievance.description}</p>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{isAdmin ? authorName : 'You'}</span>
            <span>·</span>
            <span>{new Date(grievance.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Status timeline */}
          {grievance.statusHistory?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Timeline</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors['SUBMITTED']}`}>Submitted</span>
                  <span className="text-xs text-gray-400">{new Date(grievance.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {grievance.statusHistory.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[log.toStatus]}`}>
                      {log.toStatus.replace('_', ' ')}
                    </span>
                    <div>
                      {log.note && <p className="text-xs text-gray-500">{log.note}</p>}
                      <p className="text-xs text-gray-400">{new Date(log.changedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          {grievance.adminNote && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <p className="text-xs font-medium text-amber-700 mb-0.5">Staff note</p>
              <p className="text-xs text-amber-600">{grievance.adminNote}</p>
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && nextStatuses.length > 0 && (
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Update status</p>
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                      ${selectedStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-200'}`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                  rows={2}
                  placeholder="Add a note for the student"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button
                onClick={() => mutation.mutate()}
                loading={mutation.isPending}
                disabled={!selectedStatus}
              >
                Update status
              </Button>
              <Alert type="error" message={mutation.error?.response?.data?.message} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}