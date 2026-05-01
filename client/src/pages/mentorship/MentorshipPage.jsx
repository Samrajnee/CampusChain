import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  getMentorships,
  acceptMentorship,
  completeMentorship,
  cancelMentorship,
  closeMentorship,
} from '../../api/mentorship';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import RequestMentorshipModal from './RequestMentorshipModal';

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];
const HOD_ROLES   = ['HOD', 'PRINCIPAL', 'SUPER_ADMIN'];

const STATUS_TABS = [
  { key: '',           label: 'All'       },
  { key: 'PENDING',    label: 'Pending'   },
  { key: 'ACTIVE',     label: 'Active'    },
  { key: 'COMPLETED',  label: 'Completed' },
  { key: 'CANCELLED',  label: 'Cancelled' },
];

const STATUS_STYLE = {
  PENDING:   'bg-amber-50  text-amber-600',
  ACTIVE:    'bg-green-50  text-green-600',
  COMPLETED: 'bg-indigo-50 text-indigo-600',
  CANCELLED: 'bg-gray-50   text-gray-400',
  CLOSED:    'bg-red-50    text-red-400',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function displayName(user) {
  if (!user) return 'Unassigned';
  const p = user.profile;
  if (p?.firstName) return `${p.firstName} ${p.lastName}`;
  return user.email ?? 'Unknown';
}

// ── Card ─────────────────────────────────────────────────────────────────────

function MentorshipCard({ item, userId, role, onAction }) {
  const isTeacher   = ADMIN_ROLES.includes(role);
  const isHod       = HOD_ROLES.includes(role);
  const isMentee    = item.menteeId === userId;
  const isMentor    = item.mentorId === userId;
  const isParticipant = isMentee || isMentor;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                STATUS_STYLE[item.status] ?? 'bg-gray-50 text-gray-400'
              }`}
            >
              {item.status}
            </span>
            {isMentee && (
              <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                Your request
              </span>
            )}
            {isMentor && (
              <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                You are mentoring
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{item.topic}</h3>
        </div>
        <p className="text-xs text-gray-400 shrink-0">{fmt(item.createdAt)}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {item.description}
      </p>

      {/* People */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-violet-50 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
            Mentee
          </p>
          <p className="text-sm font-medium text-gray-800">
            {displayName(item.mentee)}
          </p>
          {item.mentee?.studentDetail?.department && (
            <p className="text-xs text-gray-400">
              {item.mentee.studentDetail.department}
              {item.mentee.studentDetail.year
                ? ` · Year ${item.mentee.studentDetail.year}`
                : ''}
            </p>
          )}
        </div>

        <div className="bg-teal-50 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
            Mentor
          </p>
          {item.mentor ? (
            <>
              <p className="text-sm font-medium text-gray-800">
                {displayName(item.mentor)}
              </p>
              <p className="text-xs text-gray-400">{item.mentor.role}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Awaiting mentor</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      {(item.acceptedAt || item.completedAt) && (
        <div className="flex gap-4 text-xs text-gray-400">
          {item.acceptedAt && (
            <span>Accepted: {fmt(item.acceptedAt)}</span>
          )}
          {item.completedAt && (
            <span>Completed: {fmt(item.completedAt)}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">

        {/* Accept — any teacher, only when PENDING, and not the mentee */}
        {item.status === 'PENDING' && isTeacher && !isMentee && (
          <Button
            variant="primary"
            onClick={() => onAction('accept', item.id)}
          >
            Accept request
          </Button>
        )}

        {/* Complete — participant or HOD, only when ACTIVE */}
        {item.status === 'ACTIVE' && (isParticipant || isHod) && (
          <Button
            variant="secondary"
            onClick={() => onAction('complete', item.id)}
          >
            Mark complete
          </Button>
        )}

        {/* Cancel — mentee or HOD, PENDING or ACTIVE */}
        {['PENDING', 'ACTIVE'].includes(item.status) && (isMentee || isHod) && (
          <Button
            variant="ghost"
            onClick={() => onAction('cancel', item.id)}
          >
            Cancel
          </Button>
        )}

        {/* Force close — HOD only */}
        {isHod && !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(item.status) && (
          <Button
            variant="danger"
            onClick={() => onAction('close', item.id)}
          >
            Force close
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MentorshipPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [tab, setTab]         = useState('');
  const [page, setPage]       = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]     = useState('');

  const isTeacher = ADMIN_ROLES.includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['mentorships', tab, page],
    queryFn: () =>
      getMentorships({ status: tab || undefined, page, limit: 12 }),
  });

  const mentorships = data?.data?.mentorships ?? [];
  const pagination  = data?.data?.pagination;

  // ── Mutation factory ───────────────────────────────────────────────────────

  const invalidate = () => qc.invalidateQueries(['mentorships']);

  const acceptMut   = useMutation({ mutationFn: acceptMentorship,   onSuccess: invalidate, onError: (e) => setError(e.response?.data?.message || 'Action failed') });
  const completeMut = useMutation({ mutationFn: completeMentorship, onSuccess: invalidate, onError: (e) => setError(e.response?.data?.message || 'Action failed') });
  const cancelMut   = useMutation({ mutationFn: cancelMentorship,   onSuccess: invalidate, onError: (e) => setError(e.response?.data?.message || 'Action failed') });
  const closeMut    = useMutation({ mutationFn: closeMentorship,    onSuccess: invalidate, onError: (e) => setError(e.response?.data?.message || 'Action failed') });

  function handleAction(type, id) {
    setError('');
    if (type === 'accept')   acceptMut.mutate(id);
    if (type === 'complete') completeMut.mutate(id);
    if (type === 'cancel')   cancelMut.mutate(id);
    if (type === 'close')    closeMut.mutate(id);
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Mentorship</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isTeacher
              ? 'Browse open requests and accept students to mentor'
              : 'Request guidance from faculty or senior students'}
          </p>
        </div>
        {!isTeacher && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Request Mentorship
          </Button>
        )}
      </div>

      <Alert type="error" message={error} />

      {/* XP info banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="text-xs font-semibold text-amber-700">XP rewards</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Mentee earns 30 XP on completion. Mentor earns 20 XP. Both receive a notification.
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-medium ${
              tab === t.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mentorships.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">
            {tab === 'PENDING' && isTeacher
              ? 'No open mentorship requests right now'
              : 'No mentorships found'}
          </p>
          {tab === '' && !isTeacher && (
            <p className="text-xs text-gray-400 mt-1">
              Submit a request and a faculty member will accept it
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentorships.map((item) => (
            <MentorshipCard
              key={item.id}
              item={item}
              userId={user?.id}
              role={user?.role}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <RequestMentorshipModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            invalidate();
          }}
        />
      )}
    </div>
  );
}