import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getElectionApi, castVoteApi, getResultsApi, updateElectionStatusApi, addCandidateApi } from '../../api/elections'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

export default function ElectionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [voteError, setVoteError] = useState('')
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['election', id],
    queryFn: () => getElectionApi(id).then((r) => r.data.data.election),
  })

  const { data: resultsData } = useQuery({
    queryKey: ['election-results', id],
    queryFn: () => getResultsApi(id).then((r) => r.data.data),
    enabled: !!data && data.status !== 'DRAFT',
  })

  const voteMutation = useMutation({
    mutationFn: () => castVoteApi(id, selectedCandidate),
    onSuccess: () => {
      setVoteSuccess(true)
      setVoteError('')
      qc.invalidateQueries(['election', id])
      qc.invalidateQueries(['election-results', id])
    },
    onError: (err) => setVoteError(err.response?.data?.message || 'Failed to cast vote'),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => updateElectionStatusApi(id, status),
    onSuccess: () => qc.invalidateQueries(['election', id]),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const election = data
  const isOpen = election.status === 'OPEN'
  const canVote = isOpen && !election.hasVoted && !voteSuccess
  const showResults = election.status !== 'DRAFT'
  const totalVotes = resultsData?.totalVotes ?? 0

  return (
    <div className="max-w-3xl flex flex-col gap-6">

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={election.status} />
              {election.isAnonymous && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                  Anonymous
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{election.title}</h2>
            {election.description && (
              <p className="text-sm text-gray-500 mt-1">{election.description}</p>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              {election.status === 'DRAFT' && (
                <Button
                  variant="secondary"
                  onClick={() => statusMutation.mutate('OPEN')}
                  loading={statusMutation.isPending}
                >
                  Open voting
                </Button>
              )}
              {election.status === 'OPEN' && (
                <Button
                  variant="secondary"
                  onClick={() => statusMutation.mutate('CLOSED')}
                  loading={statusMutation.isPending}
                >
                  Close voting
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
          <span>Starts {new Date(election.startsAt).toLocaleString('en-IN')}</span>
          <span>·</span>
          <span>Ends {new Date(election.endsAt).toLocaleString('en-IN')}</span>
          <span>·</span>
          <span>{totalVotes} votes cast</span>
          {election.eligibleDept && <><span>·</span><span>{election.eligibleDept} only</span></>}
          {election.eligibleYear && <><span>·</span><span>Year {election.eligibleYear} only</span></>}
        </div>
      </div>

      {/* Already voted notice */}
      {(election.hasVoted || voteSuccess) && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-medium text-green-700">Your vote has been recorded.</p>
          <p className="text-xs text-green-500 mt-0.5">
            {election.isAnonymous ? 'Your identity is protected by anonymous token voting.' : 'Thank you for participating.'}
          </p>
        </div>
      )}

      {/* Vote error */}
      {voteError && <Alert type="error" message={voteError} />}

      {/* Candidates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Candidates
          </h3>
          {isAdmin && election.status === 'DRAFT' && (
            <Button variant="ghost" onClick={() => setShowAddCandidate(true)}>
              Add candidate
            </Button>
          )}
        </div>

        {election.candidates.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">No candidates added yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {election.candidates.map((candidate) => {
              const result = resultsData?.candidates?.find((c) => c.id === candidate.id)
              const percentage = result?.percentage ?? '0.0'
              const isSelected = selectedCandidate === candidate.id

              return (
                <div
                  key={candidate.id}
                  onClick={() => canVote && setSelectedCandidate(candidate.id)}
                  className={`bg-white border rounded-xl p-4 transition
                    ${canVote ? 'cursor-pointer hover:border-indigo-200' : ''}
                    ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100'}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {canVote && (
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition
                          ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {candidate.user?.profile?.firstName} {candidate.user?.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{candidate.position}</p>
                        {candidate.user?.studentDetail && (
                          <p className="text-xs text-gray-400">
                            {candidate.user.studentDetail.department} · Year {candidate.user.studentDetail.year}
                          </p>
                        )}
                      </div>
                    </div>

                    {showResults && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-indigo-600">{percentage}%</p>
                        <p className="text-xs text-gray-400">{candidate.voteCount} votes</p>
                      </div>
                    )}
                  </div>

                  {candidate.manifesto && (
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 line-clamp-2">
                      {candidate.manifesto}
                    </p>
                  )}

                  {showResults && (
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1">
                      <div
                        className="bg-indigo-400 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Vote button */}
      {canVote && (
        <div className="sticky bottom-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {selectedCandidate ? 'Confirm your vote' : 'Select a candidate above to vote'}
            </p>
            <Button
              onClick={() => voteMutation.mutate()}
              loading={voteMutation.isPending}
              disabled={!selectedCandidate}
            >
              Submit vote
            </Button>
          </div>
        </div>
      )}

      {showAddCandidate && (
        <AddCandidateModal
          electionId={id}
          onClose={() => setShowAddCandidate(false)}
          onSuccess={() => {
            setShowAddCandidate(false)
            qc.invalidateQueries(['election', id])
          }}
        />
      )}
    </div>
  )
}

function AddCandidateModal({ electionId, onClose, onSuccess }) {
  const [form, setForm] = useState({ userId: '', position: '', manifesto: '' })
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const mutation = useMutation({
    mutationFn: () => addCandidateApi(electionId, form),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Add candidate</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Input label="Student user ID" placeholder="Paste the student's UUID" value={form.userId} onChange={set('userId')} required />
          <Input label="Position" placeholder="e.g. Class Representative" value={form.position} onChange={set('position')} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Manifesto (optional)</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={4}
              placeholder="Candidate's manifesto or statement"
              value={form.manifesto}
              onChange={set('manifesto')}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">Add candidate</Button>
          </div>
        </form>
      </div>
    </div>
  )
}