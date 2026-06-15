'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type TaskStatus, STATUS_LABELS, STATUS_EMOJI } from '@/lib/tasks';
import { type Task } from '@/lib/use-tasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { PlusIcon } from '@/components/icons';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  boardId: string;
  onCreateTask: (data: Partial<Task> & { title: string }) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  isEven: boolean;
}

export function KanbanColumn({
  status, tasks, boardId, onCreateTask, onUpdateTask, onDeleteTask, isEven,
}: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] flex-col border-r border-rule px-[10px] py-3 last:border-r-0 transition-colors ${
        isEven ? 'bg-bg' : 'bg-bg-2'
      } ${isOver ? 'bg-accent-wash' : ''}`}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-fg-2">
          {STATUS_EMOJI[status]} {STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-bg-3 px-2 py-px text-[11px] text-fg-dim">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[7px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={(data) => onUpdateTask(task.id, data)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>

        {adding && (
          <TaskForm
            defaultStatus={status}
            onSubmit={(data) => { onCreateTask({ ...data, board_id: boardId }); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        )}
      </div>

      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-rule py-[7px] text-[12px] text-fg-dim transition-colors hover:border-accent hover:bg-accent-wash hover:text-accent"
        >
          <PlusIcon size={13} />
          Добавить задачу
        </button>
      )}
    </div>
  );
}