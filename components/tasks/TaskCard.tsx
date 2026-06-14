'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task, formatDate, isOverdue } from '@/lib/tasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { PencilIcon, TrashIcon } from '@/components/icons';

interface TaskCardProps {
  task: Task;
  onUpdate: (data: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: () => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = task.deadline ? isOverdue(task.deadline, task.status) : false;

  if (editing) {
    return (
      <TaskForm
        initial={task}
        onSubmit={(data) => { onUpdate(data); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  if (confirmDelete) {
    return (
      <div className="rounded-md border border-rule bg-bg-2 p-3 shadow-xs">
        <p className="mb-3 text-[13px] text-fg">
          Удалить <span className="font-semibold">«{task.title}»</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmDelete(false)}
            className="rounded-sm px-3 py-1.5 text-[12px] text-fg-2 hover:bg-bg-3">
            Отмена
          </button>
          <button type="button" onClick={onDelete}
            className="rounded-sm bg-[#ef4444] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#dc2626]">
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-[10px] border border-rule bg-bg-2 p-[10px] shadow-xs transition-shadow hover:shadow-sm"
    >
      {/* drag handle — вся карточка */}
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab rounded-[10px]" />

      {/* Кнопки поверх drag-handle */}
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button type="button" onClick={() => setEditing(true)}
          className="grid h-6 w-6 place-items-center rounded-xs bg-bg-2 text-fg-dim hover:bg-bg-3 hover:text-fg">
          <PencilIcon size={12} />
        </button>
        <button type="button" onClick={() => setConfirmDelete(true)}
          className="grid h-6 w-6 place-items-center rounded-xs bg-bg-2 text-fg-dim hover:bg-bg-3 hover:text-[#ef4444]">
          <TrashIcon size={12} />
        </button>
      </div>

      {/* Заголовок */}
      <p className={`mb-2 pr-14 text-[12.5px] font-medium leading-snug ${task.status === 'done' ? 'text-fg-dim line-through' : 'text-fg'}`}>
        {task.title}
      </p>

      {/* Даты */}
      <div className="mb-[10px] flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex items-center gap-1 text-[10.5px] text-fg-dim">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {formatDate(task.createdAt)}
        </span>
        {task.deadline && (
          <span className={`flex items-center gap-1 text-[10.5px] font-medium ${overdue ? 'text-[#ef4444]' : 'text-fg-dim'}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {overdue ? '⚠ ' : ''}до {formatDate(task.deadline)}
          </span>
        )}
        {task.status === 'done' && task.completedAt && (
          <span className="flex items-center gap-1 text-[10.5px] text-[#10b981]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            готово {formatDate(task.completedAt)}
          </span>
        )}
      </div>

      {/* Футер */}
      <div className="flex items-center justify-between border-t border-rule-2 pt-[7px]">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <>
              <div className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold"
                style={{ background: task.assigneeColor, color: task.assigneeTextColor }}>
                {task.assignee}
              </div>
              <span className="text-[11px] text-fg-dim">{task.assigneeName}</span>
            </>
          ) : (
            <span className="text-[11px] text-fg-dim">Не назначено</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.urgent && (
            <span className="rounded-[4px] bg-[#fee2e2] px-1.5 py-px text-[10px] font-semibold text-[#991b1b]">
              🔥 срочно
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-fg-dim">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {task.commentsCount}
          </span>
        </div>
      </div>
    </div>
  );
}
