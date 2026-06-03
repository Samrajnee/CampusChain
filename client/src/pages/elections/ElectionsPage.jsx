import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getElectionApi } from '../../api/elections';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ElectionsPage() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: getElections,
  });

  const elections = data?.data?.elections ?? [];

  const open      = elections.filter((e) => e.status === 'OPEN');
  const upcoming  = elections.filter((e) => e.status === 'DRAFT');
  const closed    = elections.filter((e) => ['CLOSED', 'CANCELLED'].includes(e.status));

  function ElectionCard({ election }) {
    return (
      <Link to={`/elections/${election.id}`}>
        <Card hover className="p-5 animate-fade-up">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-sm font-sans font-semibold text-t1 leading-snug flex-1">
              {election.title}
            </h3>
            <StatusBadge status={election.status} />
          </div>

          {election.description && (
            <p className="text-sm font-sans line-clamp-2 mb-4"
              style={{ color: 'var(--text-3)' }}>
              {election.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-xs font-sans"
              style={{ color: 'var(--text-4)' }}>
              {election.startsAt && (
                <span>Opens {fmt(election.startsAt)}</span>
              )}
              {election.endsAt && (
                <span>Closes {fmt(election.endsAt)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-sans"
              style={{ color: 'var(--text-4)' }}>
              <span>{election._count?.candidates ?? 0} candidates</span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  function Section({ label, items }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <SectionLabel>{label}</SectionLabel>
        <div className="flex flex-col gap-3 stagger">
          {items.map((e) => <ElectionCard key={e.id} election={e} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Elections"
        subtitle="Vote, stand for positions, and view results"
        action={
          isAdmin && (
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              Create election
            </Button>
          )
        }
      />

      {isLoading ? (
        <Spinner />
      ) : elections.length === 0 ? (
        <Empty message="No elections yet" sub="Elections created by faculty will appear here" />
      ) : (
        <>
          <Section label="Open for voting" items={open} />
          <Section label="Upcoming"        items={upcoming} />
          <Section label="Closed"          items={closed} />
        </>
      )}
    </div>
  );
}