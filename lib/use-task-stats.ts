'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface TaskStats {
  total: number;
  in_progress: number;
  review: number;
  overdue: number;
  done: number;
}

const EMPTY: TaskStats = { total: 0, in_progress: 0, review: 0, overdue: 0, done: 0 };

export function useTaskStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<TaskStats>(EMPTY);

  useEffect(() => {
    if (!session) return;
    fetch('/api/tasks/stats')
      .then((r) => r.ok ? r.json() : EMPTY)
      .then(setStats)
      .catch(() => setStats(EMPTY));
  }, [session]);

  // Обновляем каждые 30 секунд
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetch('/api/tasks/stats')
        .then((r) => r.ok ? r.json() : EMPTY)
        .then(setStats)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  return stats;
}
