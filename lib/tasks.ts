// Типы и утилиты для раздела «Задачи».

export type TaskStatus = 'new' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  urgent: boolean;
  assignee?: string; // инициалы, например 'АС'
  assigneeColor?: string; // bg-цвет аватара
  assigneeTextColor?: string;
  assigneeName?: string;
  createdAt: string; // ISO-строка
  deadline?: string; // ISO-строка
  completedAt?: string; // ISO-строка, заполняется при переводе в done
  commentsCount: number;
  boardId: string;
}

export interface Board {
  id: string;
  name: string;
}

export const BOARDS: Board[] = [
  { id: 'content', name: 'Контент-производство' },
  { id: 'smm', name: 'SMM и соцсети' },
  { id: 'education', name: 'Учебные материалы' },
  { id: 'ops', name: 'Операционка' },
];

export const TEAM = [
  { initials: 'АС', name: 'Анна', bg: '#dbeafe', color: '#1e40af' },
  { initials: 'МК', name: 'Мария', bg: '#d1fae5', color: '#065f46' },
  { initials: 'ОП', name: 'Олег', bg: '#fef3c7', color: '#92400e' },
  { initials: 'ЕВ', name: 'Екатерина', bg: '#fce7f3', color: '#9d174d' },
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Идеи',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Готово',
};

export const STATUS_ORDER: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];

export const STATUS_EMOJI: Record<TaskStatus, string> = {
  new: '💡',
  in_progress: '⚙️',
  review: '👁',
  done: '✅',
};

export function isOverdue(deadline: string, status: TaskStatus): boolean {
  if (status === 'done') return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

const STORAGE_KEY = 'ai-chat-tasks-v2';
const BOARD_KEY = 'ai-chat-active-board';

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

export function loadActiveBoard(): string {
  if (typeof window === 'undefined') return 'content';
  return localStorage.getItem(BOARD_KEY) ?? 'content';
}

export function saveActiveBoard(boardId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOARD_KEY, boardId);
}
