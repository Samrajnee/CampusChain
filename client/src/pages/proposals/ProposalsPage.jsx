import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  getProposals, createProposal, voteOnProposal,
} from '../../api/governance';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ProposalsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', isAnonymous: false });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: getProposals,
  });

  const proposals = data?.data?.proposals ?? [];

  const createMut = useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      qc.invalidateQueries(['proposals']);
      setShowForm(false);
      setForm({ title: '', body: '', isAnonymous: false });
    },
    onError: (e) => setError(e.response?.data?.message || 'Failed to submit'),
  });

  const voteMut = useMutation({
    mutationFn: ({ id, isUpvote }) => voteOnProposal(id, { isUpvote }),
    onSuccess: () => qc.invalidateQueries(['proposals']),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Proposals"
        subtitle="Submit ideas and vote on what matters to the campus"
        action={
          <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : 'New proposal'}
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <Card className="p-6 mb-6 animate-fade-up">
          <p className="text-sm font-sans font-semibold text-t1 mb-4">
            Submit a proposal
          </p>
          <Alert type="error" message={error} />
          <div className="flex flex-col gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="What are you proposing?"
            />
            <div>
              <label className="block text-xs font-sans font-medium mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--text-3)' }}>
                Description
              </label>
              <textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Describe your proposal in detail..."
                className="w-full px-4 py-2.5 text-sm font-sans rounded-lg resize-none transition-all duration-150"
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C9A96E';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((f) => ({ ...f, isAnonymous: !f.isAnonymous }))}
                className="w-10 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{ background: form.isAnonymous ? '#C9A96E' : 'var(--border)' }}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="text-sm font-sans" style={{ color: 'var(--text-2)' }}>
                Submit anonymously
              </span>
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                variant="primary"
                loading={createMut.isPending}
                disabled={!form.title.trim() || !form.body.trim()}
                onClick={() => createMut.mutate(form)}
              >
                Submit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <Spinner />
      ) : proposals.length === 0 ? (
        <Empty message="No proposals yet" sub="Be the first to submit an idea" />
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {proposals.map((p) => (
            <Card key={p.id} className="p-5 animate-fade-up">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-sans font-semibold text-t1 flex-1">
                  {p.title}
                </h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm font-sans line-clamp-2 mb-4"
                style={{ color: 'var(--text-3)' }}>
                {p.body}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => voteMut.mutate({ id: p.id, isUpvote: true })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-150"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--text-2)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(201,169,110,0.1)';
                      e.currentTarget.style.borderColor = '#C9A96E';
                      e.currentTarget.style.color = '#C9A96E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-2)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-2)';
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    {p.upvotes ?? 0}
                  </button>
                  <button
                    onClick={() => voteMut.mutate({ id: p.id, isUpvote: false })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all duration-150"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--text-2)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FECACA';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-2)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-2)';
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    {p.downvotes ?? 0}
                  </button>
                </div>
                <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
                  {p.isAnonymous ? 'Anonymous' : (p.author?.profile?.firstName ?? p.author?.email)}
                  {' · '}
                  {fmt(p.createdAt)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}