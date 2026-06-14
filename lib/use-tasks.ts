'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type Task,
  type TaskStatus,
  loadTasks,
  saveTasks,
  loadActiveBoard,
  saveActiveBoard,
} from '@/lib/tasks';

function uid() {
  return crypto.randomUUID();
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeBoardId, setActiveBoardIdState] = useState<string>('content');

  useEffect(() => {
    setTasks(loadTasks());
    setActiveBoardIdState(loadActiveBoard());
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const setActiveBoardId = useCallback((id: string) => {
    setActiveBoardIdState(id);
    saveActiveBoard(id);
  }, []);

  const createTask = useCallback(
    (data: {
      title: string;
      description?: string;
      deadline?: string;
      urgent?: boolean;
      assignee?: string;
      assigneeColor?: string;
      assigneeTextColor?: string;
      assigneeName?: string;
      status?: TaskStatus;
      boardId?: string;
    }) => {
      const task: Task = {
        id: uid(),
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        status: data.status ?? 'new',
        urgent: data.urgent ?? false,
        assignee: data.assignee,
        assigneeColor: data.assigneeColor,
        assigneeTextColor: data.assigneeTextColor,
        assigneeName: data.assigneeName,
        createdAt: new Date().toISOString(),
        deadline: data.deadline || undefined,
        commentsCount: 0,
        boardId: data.boardId ?? 'content',
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

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt:
                status === 'done' ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    );
  }, []);

  return {
    tasks,
    activeBoardId,
    setActiveBoardId,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
