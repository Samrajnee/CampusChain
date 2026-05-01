import { useEffect, useRef } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
  deleteNotification as apiDelete,
  clearReadNotifications as apiClearRead,
} from '../api/notifications';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const socketRef = useRef(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const unreadQuery = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    enabled: !!user,
    refetchInterval: 60_000, // poll every 60s as fallback
  });

  const listQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications({ page: 1, limit: 30 }),
    enabled: !!user,
  });

  // ── Socket.IO ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('cc_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('notification', (incoming) => {
      // Prepend to list cache
      qc.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        const existing = old?.data?.notifications ?? [];
        return {
          ...old,
          data: {
            ...old.data,
            notifications: [incoming, ...existing],
            unreadCount: (old.data?.unreadCount ?? 0) + 1,
          },
        };
      });

      // Bump unread count cache
      qc.setQueryData(['notifications-unread-count'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: { count: (old?.data?.count ?? 0) + 1 },
        };
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, qc]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const markReadMutation = useMutation({
    mutationFn: apiMarkRead,
    onSuccess: () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notifications-unread-count']);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: apiMarkAllRead,
    onSuccess: () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notifications-unread-count']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiDelete,
    onSuccess: () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notifications-unread-count']);
    },
  });

  const clearReadMutation = useMutation({
    mutationFn: apiClearRead,
    onSuccess: () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notifications-unread-count']);
    },
  });

  return {
    notifications: listQuery.data?.data?.notifications ?? [],
    unreadCount: unreadQuery.data?.data?.count ?? 0,
    isLoading: listQuery.isLoading,
    markRead: (id) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
    deleteOne: (id) => deleteMutation.mutate(id),
    clearRead: () => clearReadMutation.mutate(),
  };
}