import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  getAnnouncements,
  deleteAnnouncement,
} from '../../api/announcements';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import CreateAnnouncementModal from './CreateAnnouncementModal';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function AnnouncementCard({ announcement, isAdmin, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white border rounded-xl p-5 transition-all ${
        announcement.isPinned
          ? 'border-indigo-200 bg-indigo-50/30'
          : 'border-gray-100'
      } ${!announcement.isRead ? 'border-l-4 border-l-indigo-400' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {announcement.isPinned && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Pinned
              </span>
            )}
            {!announcement.isRead && (
              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                New
              </span>
            )}
            {announcement.targetRole && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {announcement.targetRole}
              </span>
            )}
            {announcement.targetDept && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {announcement.targetDept}
              </span>
            )}
            {announcement.targetYear && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                Year {announcement.targetYear}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {announcement.title}
          </h3>

          <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
            {announcement.body}
          </p>

          {announcement.body.length > 160 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>
              {announcement.createdByUser?.profile?.firstName}{' '}
              {announcement.createdByUser?.profile?.lastName}
            </span>
            <span>·</span>
            <span>{formatDate(announcement.createdAt)}</span>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => onDelete(announcement.id)}
            className="text-xs text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-1"
          >
            Delete
          </button>
        )}
      </div>
    </div>
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

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries(['announcements']);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    },
  });

  const announcements = data?.data?.announcements ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Announcements</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Institution-wide and targeted updates
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            Post Announcement
          </Button>
        )}
      </div>

      <Alert type="error" message={error} />

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No announcements yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isAdmin={isAdmin}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateAnnouncementModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            qc.invalidateQueries(['announcements']);
          }}
        />
      )}
    </div>
  );
}