'use client';

import { useEffect, useRef, useState } from 'react';
import type { Task } from '@/lib/tasks';
import { XIcon } from '@/components/icons';

interface TaskFormProps {
  /** Если передан — режим редактирования, иначе — создание. */
  initial?: Task;
  onSubmit: (data: {
    title: string;
    description?: string;
    deadline?: string;
  }) => void;
  onCancel: () => void;
}

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(
    initial?.description ?? '',
  );
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.slice(0, 10) : '',
  );
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({
      title: trimmed,
      description: description.trim() || undefined,
      deadline: deadline || undefined,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }

  const isEdit = Boolean(initial);

  return (
    <div
      className="rounded-md border border-rule bg-bg-2 p-4 shadow-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-fg">
          {isEdit ? 'Редактировать задачу' : 'Новая задача'}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-6 w-6 place-items-center rounded-xs text-fg-dim transition-colors hover:bg-bg-3 hover:text-fg"
        >
          <XIcon size={14} />
        </button>
      </div>

      {/* Название */}
      <input
        ref={titleRef}
        type="text"
        placeholder="Название задачи"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        className="mb-2.5 w-full rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line"
      />

      {/* Описание */}
      <textarea
        placeholder="Описание (необязательно)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="mb-2.5 w-full resize-none rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line"
      />

      {/* Дедлайн */}
      <div className="mb-4">
        <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-fg-dim">
          Дедлайн
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none focus:border-accent-line"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm px-3.5 py-2 text-[13px] font-medium text-fg-2 transition-colors hover:bg-bg-3"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="rounded-sm bg-accent px-3.5 py-2 text-[13px] font-semibold text-on-accent transition-all hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </div>
  );
}
