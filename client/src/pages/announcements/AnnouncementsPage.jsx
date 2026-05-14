import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements, deleteAnnouncement } from '../../api/announcements';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';
import CreateAnnouncementModal from './CreateAnnouncementModal';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function AnnouncementCard({ a, isAdmin, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="p-5 animate-fade-up"
      style={{
        borderLeft: !a.isRead ? '3px solid #C9A96E' : '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {a.isPinned && (
              <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#FFFBEB', color: '#92400E' }}>
                Pinned
              </span>
            )}
            {!a.isRead && (
              <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(201,169,110,0.12)', color: '#C9A96E' }}>
                New
              </span>
            )}
            {a.targetRole && (
              <span className="text-xs font-sans px-2 py-0.5 rounded-full"
                style={{ background: 'var(--surface-2)', color: 'var(--text-4)' }}>
                {a.targetRole}
              </span>
            )}
          </div>

          <h3 className="text-sm font-sans font-semibold text-t1 mb-1">{a.title}</h3>

          <p className={`text-sm font-sans leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}
            style={{ color: 'var(--text-3)' }}>
            {a.body}
          </p>

          {a.body.length > 160 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-sans font-medium mt-1 transition-colors"
              style={{ color: '#C9A96E' }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}

          <p className="text-xs font-sans mt-3" style={{ color: 'var(--text-4)' }}>
            {a.createdByUser?.profile?.firstName} {a.createdByUser?.profile?.lastName}
            {' · '}{fmt(a.createdAt)}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onDelete(a.id)}
            className="text-xs font-sans transition-colors shrink-0 mt-1"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-4)')}
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['announcements', page],
    queryFn: () => getAnnouncements({ page, limit: 20 }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => qc.invalidateQueries(['announcements']),
    onError: (e) => setError(e.response?.data?.message || 'Failed to delete'),
  });

  const announcements = data?.data?.announcements ?? [];
  const pagination    = data?.data?.pagination;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Announcements"
        subtitle="Institution-wide and targeted updates"
        action={
          isAdmin && (
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              Post announcement
            </Button>
          )
        }
      />

      <Alert type="error" message={error} />

      {isLoading ? (
        <Spinner />
      ) : announcements.length === 0 ? (
        <Empty message="No announcements yet" />
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              a={a}
              isAdmin={isAdmin}
              onDelete={(id) => deleteMut.mutate(id)}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button variant="secondary" disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm font-sans" style={{ color: 'var(--text-3)' }}>
            {page} of {pagination.totalPages}
          </span>
          <Button variant="secondary" disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {showCreate && (
        <CreateAnnouncementModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); qc.invalidateQueries(['announcements']); }}
        />
      )}
    </div>
  );
}