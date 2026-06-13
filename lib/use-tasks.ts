'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type Task,
  type TaskStatus,
  loadTasks,
  saveTasks,
} from '@/lib/tasks';

function uid() {
  return crypto.randomUUID();
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Загружаем из localStorage один раз при монтировании.
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  // Сохраняем в localStorage при каждом изменении.
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const createTask = useCallback(
    (data: { title: string; description?: string; deadline?: string }) => {
      const task: Task = {
        id: uid(),
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        status: 'new',
        createdAt: new Date().toISOString(),
        deadline: data.deadline || undefined,
      };
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );
  }, []);

  return { tasks, createTask, updateTask, deleteTask, setStatus };
}
