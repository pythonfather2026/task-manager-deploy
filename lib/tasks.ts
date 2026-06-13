// Типы и утилиты для раздела «Задачи».

export type TaskStatus = 'new' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string; // ISO-строка
  deadline?: string; // ISO-строка, опционально
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готово',
};

export const STATUS_ORDER: TaskStatus[] = ['new', 'in_progress', 'done'];

const STORAGE_KEY = 'ai-chat-tasks';

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
