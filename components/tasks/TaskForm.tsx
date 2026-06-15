'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { type Task, type TaskUser, useUsers } from '@/lib/use-tasks';
import { XIcon } from '@/components/icons';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Идеи' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'review', label: 'На проверке' },
  { value: 'done', label: 'Готово' },
];

interface TaskFormProps {
  initial?: Task;
  defaultStatus?: Task['status'];
  onSubmit: (data: Partial<Task> & { title: string }) => void;
  onCancel: () => void;
}

export function TaskForm({ initial, defaultStatus = 'new', onSubmit, onCancel }: TaskFormProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const users = useUsers();
  const isOwner = user?.role === 'owner';

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [deadline, setDeadline] = useState(initial?.deadline ? initial.deadline.slice(0, 10) : '');
  const [urgent, setUrgent] = useState(initial?.urgent ?? false);
  const [assigneeId, setAssigneeId] = useState<string>(initial?.assignee_id ?? '');
  const [status, setStatus] = useState<Task['status']>(initial?.status ?? defaultStatus);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  // Employee может назначать только себя
  const availableAssignees = isOwner ? users : users.filter((u) => u.id === user?.id);

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({
      title: trimmed,
      description: description.trim() || undefined,
      deadline: deadline || undefined,
      urgent,
      assignee_id: assigneeId || undefined,
      status,
    });
  }

  return (
    <div className="rounded-md border border-rule bg-bg-2 p-4 shadow-md"
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-fg">
          {initial ? 'Редактировать задачу' : 'Новая задача'}
        </span>
        <button type="button" onClick={onCancel}
          className="grid h-6 w-6 place-items-center rounded-xs text-fg-dim hover:bg-bg-3 hover:text-fg">
          <XIcon size={14} />
        </button>
      </div>

      <input ref={titleRef} type="text" placeholder="Название задачи"
        value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
        className="mb-2.5 w-full rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line" />

      <textarea placeholder="Описание (необязательно)"
        value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
        className="mb-2.5 w-full resize-none rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line" />

      <div className="mb-2.5 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">Колонка</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}
            className="w-full rounded-sm border border-rule-2 bg-bg-3 px-2 py-2 text-sm text-fg outline-none focus:border-accent-line">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">Дедлайн</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-sm border border-rule-2 bg-bg-3 px-2 py-2 text-sm text-fg outline-none focus:border-accent-line" />
        </div>
      </div>

      {/* Исполнитель */}
      <div className="mb-3">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-dim">Исполнитель</label>
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <button type="button" onClick={() => setAssigneeId('')}
              className={`h-8 rounded-sm px-2.5 text-[12px] transition-colors ${!assigneeId ? 'bg-accent text-on-accent' : 'bg-bg-3 text-fg-2 hover:bg-bg-3'}`}>
              Никто
            </button>
          )}
          {availableAssignees.map((u) => (
            <button key={u.id} type="button" onClick={() => setAssigneeId(u.id)} title={u.name}
              className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold transition-all ${assigneeId === u.id ? 'ring-2 ring-accent ring-offset-1' : ''}`}
              style={{ background: u.color_bg, color: u.color_text }}>
              {u.initials}
            </button>
          ))}
        </div>
        {!isOwner && (
          <p className="mt-1 text-[11px] text-fg-dim">Можно назначить только себя</p>
        )}
      </div>

      <label className="mb-4 flex cursor-pointer items-center gap-2 text-[13px] text-fg-2">
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)}
          className="h-4 w-4 rounded accent-accent" />
        🔥 Срочная задача
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="rounded-sm px-3.5 py-2 text-[13px] font-medium text-fg-2 transition-colors hover:bg-bg-3">
          Отмена
        </button>
        <button type="button" onClick={handleSubmit} disabled={!title.trim()}
          className="rounded-sm bg-accent px-3.5 py-2 text-[13px] font-semibold text-on-accent hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-40">
          {initial ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </div>
  );
}
