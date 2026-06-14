'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  BOARDS,
  STATUS_ORDER,
  type Task,
  type TaskStatus,
} from '@/lib/tasks';
import { useTasks } from '@/lib/use-tasks';
import { KanbanColumn } from '@/components/tasks/KanbanColumn';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ChevronDownIcon, PlusIcon } from '@/components/icons';
import { TEAM } from '@/lib/tasks';

export function TasksView() {
  const { tasks, activeBoardId, setActiveBoardId, createTask, updateTask, deleteTask, moveTask } =
    useTasks();

  const [creatingGlobal, setCreatingGlobal] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const activeBoard = BOARDS.find((b) => b.id === activeBoardId) ?? BOARDS[0];
  const boardTasks = useMemo(
    () => tasks.filter((t) => t.boardId === activeBoardId),
    [tasks, activeBoardId],
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      new: [], in_progress: [], review: [], done: [],
    };
    boardTasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [boardTasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Если бросили на колонку (droppable id = статус)
    if (STATUS_ORDER.includes(over.id as TaskStatus)) {
      const newStatus = over.id as TaskStatus;
      if (activeTask.status !== newStatus) moveTask(activeTask.id, newStatus);
      return;
    }

    // Если бросили на другую карточку
    const overTask = tasks.find((t) => t.id === over.id);
    if (!overTask) return;
    if (activeTask.status !== overTask.status) {
      moveTask(activeTask.id, overTask.status);
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      {/* Хедер */}
      <header className="flex items-center gap-3 border-b border-rule bg-bg-2 px-5 py-3">
        {/* Переключатель досок */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setBoardMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[15px] font-semibold text-fg transition-colors hover:bg-bg-3"
          >
            {activeBoard.name}
            <ChevronDownIcon size={15} className="text-fg-dim" />
          </button>
          {boardMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBoardMenuOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-md border border-rule bg-bg-2 py-1 shadow-md">
                {BOARDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => { setActiveBoardId(b.id); setBoardMenuOpen(false); }}
                    className={`flex w-full items-center px-3 py-2 text-[13px] transition-colors hover:bg-bg-3 ${
                      b.id === activeBoardId ? 'font-semibold text-accent' : 'text-fg-2'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Аватары команды */}
        <div className="flex">
          {TEAM.map((m, i) => (
            <div
              key={m.initials}
              title={m.name}
              className="grid h-7 w-7 place-items-center rounded-full border-2 border-bg-2 text-[10px] font-bold"
              style={{ background: m.bg, color: m.color, marginLeft: i === 0 ? 0 : -6 }}
            >
              {m.initials}
            </div>
          ))}
        </div>

        {/* Пригласить */}
        <button
          type="button"
          className="flex h-7 items-center gap-1 rounded-full border border-dashed border-rule px-3 text-[11px] text-fg-dim transition-colors hover:border-accent hover:text-accent"
        >
          <PlusIcon size={11} /> Пригласить
        </button>

        {/* Создать задачу */}
        <button
          type="button"
          onClick={() => setCreatingGlobal(true)}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-semibold text-on-accent transition-all hover:-translate-y-px hover:bg-accent-bright"
        >
          <PlusIcon size={14} /> Создать задачу
        </button>
      </header>

      {/* Модалка глобального создания */}
      {creatingGlobal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <TaskForm
              defaultStatus="new"
              defaultBoardId={activeBoardId}
              onSubmit={(data) => {
                createTask({ ...data, boardId: activeBoardId });
                setCreatingGlobal(false);
              }}
              onCancel={() => setCreatingGlobal(false)}
            />
          </div>
        </div>
      )}

      {/* Kanban доска */}
      <div className="min-h-0 flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid h-full min-h-[400px] grid-cols-4 divide-x divide-rule">
            {STATUS_ORDER.map((status, i) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                boardId={activeBoardId}
                isEven={i % 2 === 0}
                onCreateTask={(data) => createTask({ ...data, boardId: activeBoardId })}
                onUpdateTask={(id, data) => updateTask(id, data)}
                onDeleteTask={(id) => deleteTask(id)}
              />
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
    </div>
  );
}
