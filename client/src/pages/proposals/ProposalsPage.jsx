import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProposalsApi, createProposalApi, voteProposalApi } from '../../api/governance'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function ProposalsPage() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => listProposalsApi().then((r) => r.data.data.proposals),
  })

  const proposals = data ?? []
  const filtered = filter === 'ALL' ? proposals : proposals.filter((p) => p.status === filter)

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Proposals</h2>
          <p className="text-sm text-gray-400 mt-0.5">Submit ideas and vote on what matters</p>
        </div>
        <Button onClick={() => setShowForm(true)}>New proposal</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-200'}`}
          >
            {f === 'ALL' ? 'All' : f.replace('_', ' ').charAt(0) + f.replace('_', ' ').slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No proposals found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              onVote={() => qc.invalidateQueries(['proposals'])}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CreateProposalModal
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); qc.invalidateQueries(['proposals']) }}
        />
      )}
    </div>
  )
}

function ProposalCard({ proposal, isAdmin, currentUserId, onVote }) {
  const qc = useQueryClient()

  const voteMutation = useMutation({
    mutationFn: (isUpvote) => voteProposalApi(proposal.id, isUpvote),
    onSuccess: () => qc.invalidateQueries(['proposals']),
  })

  const isOwner = proposal.authorId === currentUserId
  const authorName = proposal.isAnonymous
    ? 'Anonymous'
    : proposal.author
      ? `${proposal.author.profile?.firstName} ${proposal.author.profile?.lastName}`
      : 'Unknown'

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-start gap-4">

        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
          <button
            onClick={() => voteMutation.mutate(true)}
            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border transition
              ${proposal.userVote === 'UP'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500'
              }`}
          >
            +
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {proposal.upvotes - proposal.downvotes}
          </span>
          <button
            onClick={() => voteMutation.mutate(false)}
            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border transition
              ${proposal.userVote === 'DOWN'
                ? 'bg-red-400 text-white border-red-400'
                : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
              }`}
          >
            -
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{proposal.title}</h3>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{proposal.body}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{authorName}</span>
            <span>·</span>
            <span>{new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            <span>·</span>
            <span>{proposal.upvotes} upvotes</span>
          </div>
          {proposal.adminNote && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">Admin note: {proposal.adminNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateProposalModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', body: '', isAnonymous: false })
  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [f]: val })
  }

  const mutation = useMutation({ mutationFn: createProposalApi, onSuccess })

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">New proposal</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Input label="Title" placeholder="What is your proposal about?" value={form.title} onChange={set('title')} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Details</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={5}
              placeholder="Describe your idea or complaint in detail. Minimum 20 characters."
              value={form.body}
              onChange={set('body')}
              required
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isAnonymous} onChange={set('isAnonymous')} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Submit anonymously</p>
              <p className="text-xs text-gray-400">Your name will not be shown publicly</p>
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