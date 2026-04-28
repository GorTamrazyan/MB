'use client';
import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notification.store';
import { useAuthStore } from '../stores/auth.store';
import { getAccessToken } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function useNotifications() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    const token = getAccessToken();
    const url = `${API_URL}/notifications/stream`;
    const es = new EventSource(`${url}?token=${token}`);

    es.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        addNotification(notification);
      } catch {}
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [user]);
}
