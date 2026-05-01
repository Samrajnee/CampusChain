import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, deleteOne } =
    useNotifications();
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const preview = notifications.slice(0, 8);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        {/* Bell SVG — no emoji */}
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown tray */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-100/80 z-50 overflow-hidden">
          {/* Tray header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {preview.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              preview.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50/60 ${
                    !n.isRead ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  {/* Type pill */}
                  <span
                    className={`mt-0.5 shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      TYPE_COLOR[n.type] ?? TYPE_COLOR.CUSTOM
                    }`}
                  >
                    {TYPE_LABEL[n.type] ?? 'Notice'}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                  )}

                  {/* Delete on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne(n.id);
                    }}
                    className="hidden group-hover:block text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
                className="w-full text-xs text-center text-indigo-500 hover:text-indigo-700 transition-colors py-1"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}