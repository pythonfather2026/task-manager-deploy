'use client';

import { useState } from 'react';
import { type Task, type TaskStatus, STATUS_LABELS, STATUS_ORDER } from '@/lib/tasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TrashIcon, PencilIcon, ChevronDownIcon } from '@/components/icons';

interface TaskCardProps {
  task: Task;
  onUpdate: (data: { title: string; description?: string; deadline?: string }) => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  new: 'bg-bg-3 text-fg-2',
  in_progress: 'bg-accent-wash text-accent',
  done: 'bg-[rgba(16,185,129,0.1)] text-[#059669]',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date(new Date().toDateString());
}

export function TaskCard({
  task,
  onUpdate,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (editing) {
    return (
      <TaskForm
        initial={task}
        onSubmit={(data) => {
          onUpdate(data);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  if (confirmDelete) {
    return (
      <div className="rounded-md border border-rule bg-bg-2 p-4 shadow-xs">
        <p className="mb-3 text-[13.5px] text-fg">
          Удалить задачу{' '}
          <span className="font-semibold">«{task.title}»</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-sm px-3.5 py-2 text-[13px] font-medium text-fg-2 transition-colors hover:bg-bg-3"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-sm bg-[#ef4444] px-3.5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#dc2626]"
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  const overdueDeadline =
    task.deadline && task.status !== 'done' && isOverdue(task.deadline);

  return (
    <div className="group rounded-md border border-rule bg-bg-2 p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        {/* Чекбокс быстрой смены статуса */}
        <button
          type="button"
          title={task.status === 'done' ? 'Снять отметку' : 'Отметить готовым'}
          onClick={() =>
            onStatusChange(task.status === 'done' ? 'new' : 'done')
          }
          className={`mt-px grid h-[18px] w-[18px] flex-none place-items-center rounded-[4px] border-2 transition-colors ${
            task.status === 'done'
              ? 'border-[#10b981] bg-[#10b981] text-white'
              : 'border-rule hover:border-accent'
          }`}
        >
          {task.status === 'done' && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6.5 5 9.5 10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[14px] font-semibold leading-snug ${
              task.status === 'done' ? 'text-fg-dim line-through' : 'text-fg'
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 text-[13px] leading-relaxed text-fg-2">
              {task.description}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {/* Статус */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className={`flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[12px] font-semibold transition-opacity hover:opacity-80 ${STATUS_COLORS[task.status]}`}
              >
                {STATUS_LABELS[task.status]}
                <ChevronDownIcon size={12} />
              </button>
              {statusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setStatusOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-sm border border-rule bg-bg-2 py-1 shadow-md">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          onStatusChange(s);
                          setStatusOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-bg-3 ${
                          s === task.status
                            ? 'font-semibold text-accent'
                            : 'text-fg-2'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Дедлайн */}
            {task.deadline && (
              <span
                className={`text-[12px] font-medium ${
                  overdueDeadline ? 'text-[#ef4444]' : 'text-fg-dim'
                }`}
              >
                {overdueDeadline ? '⚠ ' : ''}до {formatDate(task.deadline)}
              </span>
            )}

            {/* Дата создания */}
            <span className="text-[12px] text-fg-dim">
              {formatDate(task.createdAt)}
            </span>
          </div>
        </div>

        {/* Действия */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Редактировать"
            onClick={() => setEditing(true)}
            className="grid h-7 w-7 place-items-center rounded-xs text-fg-dim transition-colors hover:bg-bg-3 hover:text-fg"
          >
            <PencilIcon size={14} />
          </button>
          <button
            type="button"
            title="Удалить"
            onClick={() => setConfirmDelete(true)}
            className="grid h-7 w-7 place-items-center rounded-xs text-fg-dim transition-colors hover:bg-bg-3 hover:text-[#ef4444]"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
