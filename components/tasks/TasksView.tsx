'use client';

import { useMemo, useState } from 'react';
import {
  DndContext, type DragEndEvent, type DragStartEvent,
  DragOverlay, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import { useSession } from 'next-auth/react';
import { BOARDS, STATUS_ORDER } from '@/lib/tasks';
import { useTasks, type Task } from '@/lib/use-tasks';
import { KanbanColumn } from '@/components/tasks/KanbanColumn';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ChevronDownIcon, PlusIcon } from '@/components/icons';
import { TelegramConnectModal } from '@/components/tasks/TelegramConnectModal';

export function TasksView() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isOwner = user?.role === 'owner';

  const [activeBoardId, setActiveBoardId] = useState('content');
  const [creatingGlobal, setCreatingGlobal] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTelegram, setShowTelegram] = useState(false);

  const { tasks, loading, createTask, updateTask, deleteTask, moveTask } = useTasks(activeBoardId);

  const activeBoard = BOARDS.find((b) => b.id === activeBoardId) ?? BOARDS[0];

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { new: [], in_progress: [], review: [], done: [] };
    tasks.forEach((t) => { if (map[t.status]) map[t.status].push(t); });
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
                    onClick={() => { setActiveBoardId(b.id); setBoardMenuOpen(false); }}
                    className={`flex w-full px-3 py-2 text-[13px] hover:bg-bg-3 ${b.id === activeBoardId ? 'font-semibold text-accent' : 'text-fg-2'}`}>
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Telegram кнопка */}
        <button type="button" onClick={() => setShowTelegram(true)}
          className="flex h-7 items-center gap-1.5 rounded-full border border-rule px-3 text-[11px] text-fg-dim transition-colors hover:border-accent hover:text-accent">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.29c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 13.802l-2.95-.924c-.64-.204-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.784z"/>
          </svg>
          Уведомления
        </button>

        {/* Роль */}
        <span className={`rounded-full px-2.5 py-px text-[11px] font-semibold ${isOwner ? 'bg-accent-wash text-accent' : 'bg-bg-3 text-fg-2'}`}>
          {isOwner ? '👑 Владелец' : '👤 Сотрудник'}
        </span>

        <button type="button" onClick={() => setCreatingGlobal(true)}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-semibold text-on-accent hover:-translate-y-px hover:bg-accent-bright transition-all">
          <PlusIcon size={14} /> Создать задачу
        </button>
      </header>

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

      {/* Telegram модалка */}
      {showTelegram && <TelegramConnectModal onClose={() => setShowTelegram(false)} />}

      {/* Kanban */}
      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-fg-dim">Загрузка...</div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
