import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listPollsApi, createPollApi, respondToPollApi } from '../../api/governance'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function PollsPage() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => listPollsApi().then((r) => r.data.data.polls),
  })

  const polls = data ?? []

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Polls</h2>
          <p className="text-sm text-gray-400 mt-0.5">Quick opinion polls with live results</p>
        </div>
        {isAdmin && <Button onClick={() => setShowCreate(true)}>Create poll</Button>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : polls.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No polls yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={() => qc.invalidateQueries(['polls'])}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePollModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); qc.invalidateQueries(['polls']) }}
        />
      )}
    </div>
  )
}

function PollCard({ poll, onVote }) {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const hasVoted = !!poll.userResponseId
  const total = poll.totalResponses || 0

  const mutation = useMutation({
    mutationFn: () => respondToPollApi(poll.id, selected),
    onSuccess: () => { onVote(); setSelected(null) },
  })

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{poll.title}</h3>
          {poll.description && <p className="text-xs text-gray-400 mt-0.5">{poll.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!poll.isLive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Closed</span>
          )}
          <span className="text-xs text-gray-400">{total} {total === 1 ? 'response' : 'responses'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const pct = total > 0 ? Math.round((option.voteCount / total) * 100) : 0
          const isUserChoice = poll.userResponseId === option.id
          const isSelecting = selected === option.id

          return (
            <div key={option.id}>
              {hasVoted ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-100 px-3 py-2.5">
                  <div
                    className={`absolute inset-0 ${isUserChoice ? 'bg-indigo-50' : 'bg-gray-50'} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className={`text-xs font-medium ${isUserChoice ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {option.text}
                      {isUserChoice && <span className="ml-1.5 text-indigo-400">· your vote</span>}
                    </span>
                    <span className={`text-xs font-semibold ${isUserChoice ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => poll.isLive && setSelected(option.id)}
                  disabled={!poll.isLive}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition
                    ${isSelecting
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                    }`}
                >
                  {option.text}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {!hasVoted && poll.isLive && (
        <div className="mt-3 flex items-center justify-between">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!selected}
            className="ml-auto"
          >
            Submit
          </Button>
        </div>
      )}

      {poll.endsAt && (
        <p className="text-xs text-gray-400 mt-3">
          {new Date(poll.endsAt) > new Date() ? 'Closes' : 'Closed'}{' '}
          {new Date(poll.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      )}
    </div>
  )
}

function CreatePollModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', options: ['', ''], endsAt: '' })

  const setField = (f) => (e) => setForm({ ...form, [f]: e.target.value })
  const setOption = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm({ ...form, options: opts })
  }
  const addOption = () => form.options.length < 8 && setForm({ ...form, options: [...form.options, ''] })
  const removeOption = (i) => form.options.length > 2 && setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) })

  const mutation = useMutation({
    mutationFn: () => createPollApi({
      ...form,
      options: form.options.filter((o) => o.trim()),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    }),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create poll</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Input label="Question" placeholder="What would you like to ask?" value={form.title} onChange={setField('title')} required />
          <Input label="Description (optional)" placeholder="Add context if needed" value={form.description} onChange={setField('description')} />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Options</label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  required
                />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(i)} className="text-xs text-gray-400 hover:text-red-400 px-2">
                    Remove
                  </button>
                )}
              </div>
            ))}
            {form.options.length < 8 && (
              <button type="button" onClick={addOption} className="text-xs text-indigo-500 hover:text-indigo-700 text-left font-medium">
                Add option
              </button>
            )}
          </div>

          <Input label="End date (optional)" type="datetime-local" value={form.endsAt} onChange={setField('endsAt')} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">Create poll</Button>
          </div>
        </form>
      </div>
    </div>
  )
}