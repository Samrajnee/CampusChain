import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../../api/notifications';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const TYPE_LABEL = {
  VOTE_CAST: 'Election',
  PROPOSAL_UPVOTED: 'Proposal',
  GRIEVANCE_RESOLVED: 'Grievance',
  CERTIFICATE_ISSUED: 'Certificate',
  BADGE_EARNED: 'Badge',
  EVENT_ATTENDED: 'Event',
  ANNOUNCEMENT_READ: 'Announcement',
  CLUB_JOINED: 'Club',
  CUSTOM: 'Notice',
};

const TYPE_COLOR = {
  VOTE_CAST: 'bg-violet-50 text-violet-600',
  PROPOSAL_UPVOTED: 'bg-sky-50 text-sky-600',
  GRIEVANCE_RESOLVED: 'bg-green-50 text-green-600',
  CERTIFICATE_ISSUED: 'bg-amber-50 text-amber-700',
  BADGE_EARNED: 'bg-pink-50 text-pink-600',
  EVENT_ATTENDED: 'bg-teal-50 text-teal-600',
  ANNOUNCEMENT_READ: 'bg-indigo-50 text-indigo-600',
  CLUB_JOINED: 'bg-orange-50 text-orange-600',
  CUSTOM: 'bg-gray-50 text-gray-500',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const { markRead, markAllRead, deleteOne, clearRead, unreadCount } =
    useNotifications();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', filter, page],
    queryFn: () =>
      getNotifications({
        unreadOnly: filter === 'unread',
        page,
        limit: 25,
      }),
  });

  const notifications = data?.data?.notifications ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={clearRead}
            className="px-3 py-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-1.5 text-sm rounded-lg transition-colors font-medium ${
              filter === f.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`group flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50/60 ${
                !n.isRead ? 'bg-indigo-50/20' : ''
              }`}
            >
              {/* Type pill */}
              <span
                className={`mt-0.5 shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  TYPE_COLOR[n.type] ?? TYPE_COLOR.CUSTOM
                }`}
              >
                {TYPE_LABEL[n.type] ?? 'Notice'}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  {n.body}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Unread dot */}
                {!n.isRead && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                )}

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOne(n.id);
                  }}
                  className="hidden group-hover:flex w-7 h-7 items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
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
    </div>
  );
}