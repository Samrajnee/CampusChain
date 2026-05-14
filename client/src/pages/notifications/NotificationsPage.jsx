import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotifications } from '../../api/notifications';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_COLOR = {
  VOTE_CAST:          { bg: '#F5F3FF', color: '#6D28D9' },
  PROPOSAL_UPVOTED:   { bg: '#EFF6FF', color: '#1D4ED8' },
  GRIEVANCE_RESOLVED: { bg: '#F0FDF4', color: '#15803D' },
  CERTIFICATE_ISSUED: { bg: '#FFFBEB', color: '#92400E' },
  BADGE_EARNED:       { bg: '#FFF1F2', color: '#BE123C' },
  EVENT_ATTENDED:     { bg: '#F0FDFA', color: '#0F766E' },
  ANNOUNCEMENT_READ:  { bg: '#FFFBEB', color: '#92400E' },
  CLUB_JOINED:        { bg: '#FFF7ED', color: '#C2410C' },
  CUSTOM:             { bg: 'var(--surface-2)', color: 'var(--text-3)' },
};

const TYPE_LABEL = {
  VOTE_CAST: 'Election', PROPOSAL_UPVOTED: 'Proposal',
  GRIEVANCE_RESOLVED: 'Grievance', CERTIFICATE_ISSUED: 'Certificate',
  BADGE_EARNED: 'Badge', EVENT_ATTENDED: 'Event',
  ANNOUNCEMENT_READ: 'Announcement', CLUB_JOINED: 'Club', CUSTOM: 'Notice',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [page, setPage]     = useState(1);

  const { markRead, markAllRead, deleteOne, clearRead, unreadCount } = useNotifications();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', filter, page],
    queryFn: () => getNotifications({ unreadOnly: filter === 'unread', page, limit: 25 }),
  });

  const notifications = data?.data?.notifications ?? [];
  const pagination    = data?.data?.pagination;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" onClick={clearRead}>
              Clear read
            </Button>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6"
        style={{ background: 'var(--surface-2)' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className="px-4 py-1.5 text-sm font-sans rounded-lg transition-all duration-150"
            style={{
              background: filter === f.key ? 'var(--white)' : 'transparent',
              color: filter === f.key ? '#C9A96E' : 'var(--text-3)',
              fontWeight: filter === f.key ? 600 : 400,
              boxShadow: filter === f.key ? '0 1px 3px rgba(11,17,32,0.08)' : 'none',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : notifications.length === 0 ? (
        <Empty
          message={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
        />
      ) : (
        <Card>
          {notifications.map((n, i) => {
            const tc = TYPE_COLOR[n.type] ?? TYPE_COLOR.CUSTOM;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className="group flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors duration-100"
                style={{
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--surface-2)' : 'none',
                  background: !n.isRead ? 'rgba(201,169,110,0.03)' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = !n.isRead ? 'rgba(201,169,110,0.03)' : 'transparent')}
              >
                <span
                  className="shrink-0 text-xs font-sans font-semibold px-2.5 py-1 rounded-full mt-0.5"
                  style={{ background: tc.bg, color: tc.color }}
                >
                  {TYPE_LABEL[n.type] ?? 'Notice'}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-t1 leading-snug">
                    {n.title}
                  </p>
                  <p className="text-sm font-sans mt-0.5 leading-relaxed"
                    style={{ color: 'var(--text-3)' }}>
                    {n.body}
                  </p>
                  <p className="text-xs font-sans mt-1.5" style={{ color: 'var(--text-4)' }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#C9A96E' }} />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteOne(n.id); }}
                    className="hidden group-hover:flex w-7 h-7 items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--text-4)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#DC2626';
                      e.currentTarget.style.background = '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-4)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button variant="secondary" disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm font-sans" style={{ color: 'var(--text-3)' }}>
            {page} of {pagination.totalPages}
          </span>
          <Button variant="secondary" disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}