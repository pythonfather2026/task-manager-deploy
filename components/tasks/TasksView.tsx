'use client';

import { useMemo, useState } from 'react';
import { type TaskStatus, STATUS_LABELS, STATUS_ORDER } from '@/lib/tasks';
import { useTasks } from '@/lib/use-tasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { PlusIcon, SearchIcon } from '@/components/icons';

export function TasksView() {
  const { tasks, createTask, updateTask, deleteTask, setStatus } = useTasks();

  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesStatus =
        filterStatus === 'all' || t.status === filterStatus;
      const matchesSearch =
        !q || t.title.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [tasks, search, filterStatus]);

  const counts = useMemo(() => {
    const result: Record<TaskStatus | 'all', number> = {
      all: tasks.length,
      new: 0,
      in_progress: 0,
      done: 0,
    };
    tasks.forEach((t) => result[t.status]++);
    return result;
  }, [tasks]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      {/* Заголовок */}
      <header className="flex items-center justify-between border-b border-rule bg-bg-2 px-6 py-4">
        <h1 className="text-[18px] font-bold tracking-[-0.01em] text-fg">
          Задачи
        </h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-9 items-center gap-2 rounded-pill bg-accent px-4 text-[13.5px] font-semibold text-on-accent transition-all hover:-translate-y-px hover:bg-accent-bright"
        >
          <PlusIcon size={15} />
          Новая задача
        </button>
      </header>

      {/* Фильтры */}
      <div className="flex items-center gap-3 border-b border-rule bg-bg-2 px-6 py-3">
        {/* Поиск */}
        <label className="relative flex items-center">
          <span className="absolute left-3 flex text-fg-dim">
            <SearchIcon size={15} />
          </span>
          <input
            type="search"
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56 rounded-sm border border-rule-2 bg-bg-3 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line"
          />
        </label>

        {/* Статус */}
        <div className="flex gap-1">
          {(['all', ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`flex h-9 items-center gap-1.5 rounded-sm px-3 text-[13px] font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-accent-wash font-semibold text-accent'
                  : 'text-fg-2 hover:bg-bg-3'
              }`}
            >
              {s === 'all' ? 'Все' : STATUS_LABELS[s]}
              <span
                className={`rounded-full px-1.5 py-px text-[11px] font-semibold ${
                  filterStatus === s
                    ? 'bg-accent text-on-accent'
                    : 'bg-bg-3 text-fg-dim'
                }`}
              >
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-2xl space-y-2.5">
          {/* Форма создания */}
          {creating && (
            <TaskForm
              onSubmit={(data) => {
                createTask(data);
                setCreating(false);
              }}
              onCancel={() => setCreating(false)}
            />
          )}

          {/* Пустые состояния */}
          {!creating && filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              {tasks.length === 0 ? (
                <>
                  <span className="grid h-14 w-14 place-items-center rounded-[18px] border border-accent-line bg-accent-wash text-accent">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </span>
                  <h2 className="mt-4 text-[18px] font-bold text-fg">
                    Задач пока нет
                  </h2>
                  <p className="mt-2 text-sm text-fg-dim">
                    Создайте первую задачу, нажав кнопку выше
                  </p>
                </>
              ) : (
                <>
                  <span className="text-3xl">🔍</span>
                  <h2 className="mt-3 text-[16px] font-semibold text-fg">
                    Ничего не найдено
                  </h2>
                  <p className="mt-1 text-sm text-fg-dim">
                    Попробуйте изменить запрос или фильтр
                  </p>
                </>
              )}
            </div>
          )}

          {/* Карточки */}
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={(data) => updateTask(task.id, data)}
              onDelete={() => deleteTask(task.id)}
              onStatusChange={(status) => setStatus(task.id, status)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
