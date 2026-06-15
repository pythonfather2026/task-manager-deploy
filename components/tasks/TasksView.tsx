'use client';

import { useMemo, useState } from 'react';
import {
  DndContext, type DragEndEvent, type DragStartEvent,
  DragOverlay, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import { useSession } from 'next-auth/react';
import { BOARDS, STATUS_ORDER, STATUS_LABELS } from '@/lib/tasks';
import { useTasks, type Task } from '@/lib/use-tasks';
import { KanbanColumn } from '@/components/tasks/KanbanColumn';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ChevronDownIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { TelegramConnectModal } from '@/components/tasks/TelegramConnectModal';

type FilterStatus = 'all' | Task['status'];

export function TasksView() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isOwner = user?.role === 'owner';

  const [activeBoardId, setActiveBoardId] = useState('content');
  const [creatingGlobal, setCreatingGlobal] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTelegram, setShowTelegram] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const { tasks, loading, createTask, updateTask, deleteTask, moveTask } = useTasks(activeBoardId);

  const activeBoard = BOARDS.find((b) => b.id === activeBoardId) ?? BOARDS[0];

  // Фильтрация
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch = !q || t.title.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, filterStatus]);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { new: [], in_progress: [], review: [], done: [] };
    filteredTasks.forEach((t) => { if (map[t.status]) map[t.status].push(t); });
    return map;
  }, [filteredTasks]);

  // Счётчики для фильтров (по всем задачам, не по отфильтрованным)
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: tasks.length, new: 0, in_progress: 0, review: 0, done: 0 };
    tasks.forEach((t) => { if (map[t.status] !== undefined) map[t.status]++; });
    return map;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string); }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const dragged = tasks.find((t) => t.id === active.id);
    if (!dragged) return;
    if (STATUS_ORDER.includes(over.id as any)) {
      const newStatus = over.id as Task['status'];
      if (dragged.status !== newStatus) moveTask(dragged.id, newStatus);
      return;
    }
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && dragged.status !== overTask.status) {
      moveTask(dragged.id, overTask.status);
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      {/* Хедер */}
      <header className="flex items-center gap-3 border-b border-rule bg-bg-2 px-5 py-3">
        {/* Доска */}
        <div className="relative">
          <button type="button" onClick={() => setBoardMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[15px] font-semibold text-fg hover:bg-bg-3">
            {activeBoard.name}
            <ChevronDownIcon size={15} className="text-fg-dim" />
          </button>
          {boardMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBoardMenuOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-md border border-rule bg-bg-2 py-1 shadow-md">
                {BOARDS.map((b) => (
                  <button key={b.id} type="button"
                    onClick={() => { setActiveBoardId(b.id); setBoardMenuOpen(false); setSearch(''); setFilterStatus('all'); }}
                    className={`flex w-full px-3 py-2 text-[13px] hover:bg-bg-3 ${b.id === activeBoardId ? 'font-semibold text-accent' : 'text-fg-2'}`}>
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Роль */}
        <span className={`rounded-full px-2.5 py-px text-[11px] font-semibold ${isOwner ? 'bg-accent-wash text-accent' : 'bg-bg-3 text-fg-2'}`}>
          {isOwner ? '👑 Владелец' : '👤 Сотрудник'}
        </span>

        {/* Telegram */}
        <button type="button" onClick={() => setShowTelegram(true)}
          className="flex h-7 items-center gap-1.5 rounded-full border border-rule px-3 text-[11px] text-fg-dim transition-colors hover:border-accent hover:text-accent">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.29c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 13.802l-2.95-.924c-.64-.204-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.784z"/>
          </svg>
          Уведомления
        </button>

        <button type="button" onClick={() => setCreatingGlobal(true)}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-semibold text-on-accent hover:-translate-y-px hover:bg-accent-bright transition-all">
          <PlusIcon size={14} /> Создать задачу
        </button>
      </header>

      {/* Панель фильтров */}
      <div className="flex items-center gap-3 border-b border-rule bg-bg-2 px-5 py-2.5">
        {/* Поиск */}
        <label className="relative flex items-center">
          <span className="absolute left-3 text-fg-dim">
            <SearchIcon size={14} />
          </span>
          <input
            type="search"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-52 rounded-sm border border-rule-2 bg-bg-3 pl-8 pr-3 text-[13px] text-fg outline-none placeholder:text-fg-dim focus:border-accent-line"
          />
        </label>

        {/* Фильтр по статусу */}
        <div className="flex gap-1">
          {(['all', ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`flex h-8 items-center gap-1.5 rounded-sm px-3 text-[12px] font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-accent-wash font-semibold text-accent'
                  : 'text-fg-2 hover:bg-bg-3'
              }`}
            >
              {s === 'all' ? 'Все' : STATUS_LABELS[s]}
              <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${
                filterStatus === s ? 'bg-accent text-on-accent' : 'bg-bg-3 text-fg-dim'
              }`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Сброс */}
        {(search || filterStatus !== 'all') && (
          <button
            type="button"
            onClick={() => { setSearch(''); setFilterStatus('all'); }}
            className="ml-auto text-[12px] text-fg-dim hover:text-fg"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Модалка создания */}
      {creatingGlobal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <TaskForm defaultStatus="new"
              onSubmit={(data) => { createTask({ ...data, board_id: activeBoardId }); setCreatingGlobal(false); }}
              onCancel={() => setCreatingGlobal(false)} />
          </div>
        </div>
      )}

      {showTelegram && <TelegramConnectModal onClose={() => setShowTelegram(false)} />}

      {/* Пустой результат поиска */}
      {!loading && filteredTasks.length === 0 && tasks.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-3xl">🔍</span>
          <p className="mt-3 text-[15px] font-semibold text-fg">Ничего не найдено</p>
          <p className="mt-1 text-sm text-fg-dim">Попробуй изменить запрос или фильтр</p>
        </div>
      )}

      {/* Kanban */}
      {!loading && (filteredTasks.length > 0 || tasks.length === 0) && (
        <div className="min-h-0 flex-1 overflow-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter}
            onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid h-full min-h-[400px] grid-cols-4 divide-x divide-rule">
              {STATUS_ORDER.map((status, i) => (
                <KanbanColumn key={status} status={status}
                  tasks={tasksByStatus[status] ?? []}
                  boardId={activeBoardId} isEven={i % 2 === 0}
                  onCreateTask={(data) => createTask({ ...data, board_id: activeBoardId })}
                  onUpdateTask={(id, data) => updateTask(id, data)}
                  onDeleteTask={(id) => deleteTask(id)} />
              ))}
            </div>
            <DragOverlay>
              {activeTask && (
                <div className="rotate-1 rounded-[10px] border border-rule bg-bg-2 p-[10px] shadow-lg opacity-90">
                  <p className="text-[12.5px] font-medium text-fg">{activeTask.title}</p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {loading && (
        <div className="flex h-full items-center justify-center text-fg-dim">Загрузка...</div>
      )}
    </div>
  );
}
