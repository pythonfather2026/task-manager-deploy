'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface TaskUser {
  id: string;
  name: string;
  initials: string;
  color_bg: string;
  color_text: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'review' | 'done';
  urgent: boolean;
  board_id: string;
  assignee_id?: string;
  assignee?: TaskUser;
  created_by: string;
  deadline?: string;
  completed_at?: string;
  created_at: string;
  commentsCount?: number;
}

export function useTasks(boardId: string) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const res = await fetch(`/api/tasks?boardId=${boardId}`);
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }, [boardId, session]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (data: Partial<Task> & { title: string }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, board_id: boardId }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      return task;
    }
  }, [boardId]);

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback(async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
  }, [updateTask]);

  return { tasks, loading, createTask, updateTask, deleteTask, moveTask, refetch: fetchTasks };
}

export function useUsers() {
  const [users, setUsers] = useState<(TaskUser & { role: string; telegram_chat_id?: string })[]>([]);

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  return users;
}
