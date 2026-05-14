import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getPolls, respondToPoll } from '../../api/governance';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import Button from '../../components/ui/Button';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });
}

function PollCard({ poll }) {
  const qc = useQueryClient();
  const total = poll.options?.reduce((s, o) => s + (o.voteCount ?? 0), 0) ?? 0;

  const respondMut = useMutation({
    mutationFn: ({ pollId, optionId }) => respondToPoll(pollId, { pollOptionId: optionId }),
    onSuccess: () => qc.invalidateQueries(['polls']),
  });

  return (
    <Card className="p-5 animate-fade-up">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-sm font-sans font-semibold text-t1 flex-1">
          {poll.title}
        </h3>
        <span
          className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: poll.isLive ? '#F0FDF4' : 'var(--surface-2)',
            color: poll.isLive ? '#15803D' : 'var(--text-4)',
          }}
        >
          {poll.isLive ? 'Live' : 'Closed'}
        </span>
      </div>

      {poll.description && (
        <p className="text-sm font-sans mb-4" style={{ color: 'var(--text-3)' }}>
          {poll.description}
        </p>
      )}

      <div className="flex flex-col gap-2 mt-3">
        {poll.options?.map((opt) => {
          const pct = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;
          return (
            <div key={opt.id}>
              <div className="flex items-center justify-between mb-1">
                <button
                  disabled={!poll.isLive || respondMut.isPending}
                  onClick={() => respondMut.mutate({ pollId: poll.id, optionId: opt.id })}
                  className="text-sm font-sans text-left transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onMouseEnter={(e) => poll.isLive && (e.currentTarget.style.color = '#C9A96E')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
                >
                  {opt.text}
                </button>
                <span className="text-xs font-sans font-semibold"
                  style={{ color: 'var(--text-3)' }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #C9A96E, #B8934A)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs font-sans"
        style={{ color: 'var(--text-4)' }}>
        <span>{total} {total === 1 ? 'response' : 'responses'}</span>
        {poll.endsAt && <span>Closes {fmt(poll.endsAt)}</span>}
      </div>
    </Card>
  );
}

export default function PollsPage() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: getPolls,
  });

  const polls = data?.data?.polls ?? [];
  const live   = polls.filter((p) => p.isLive);
  const closed = polls.filter((p) => !p.isLive);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Polls"
        subtitle="Share your opinion on campus decisions"
      />

      {isLoading ? (
        <Spinner />
      ) : polls.length === 0 ? (
        <Empty message="No polls yet" sub="Faculty will post polls for student feedback" />
      ) : (
        <>
          {live.length > 0 && (
            <div className="mb-8">
              <SectionLabel>Live now</SectionLabel>
              <div className="flex flex-col gap-3 stagger">
                {live.map((p) => <PollCard key={p.id} poll={p} />)}
              </div>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <SectionLabel>Closed</SectionLabel>
              <div className="flex flex-col gap-3 stagger">
                {closed.map((p) => <PollCard key={p.id} poll={p} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}