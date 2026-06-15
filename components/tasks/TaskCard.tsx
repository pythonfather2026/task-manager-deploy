'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSession } from 'next-auth/react';
import { type Task } from '@/lib/use-tasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { PencilIcon, TrashIcon } from '@/components/icons';

interface TaskCardProps {
  task: Task;
  onUpdate: (data: Partial<Task>) => void;
  onDelete: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function isOverdue(deadline: string, status: string) {
  if (status === 'done') return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isOwner = user?.role === 'owner';
  const canEdit = isOwner || task.created_by === user?.id || task.assignee_id === user?.id;

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = task.deadline ? isOverdue(task.deadline, task.status) : false;

  if (editing) {
    return (
      <TaskForm initial={task}
        onSubmit={(data) => { onUpdate(data); setEditing(false); }}
        onCancel={() => setEditing(false)} />
    );
  }

  if (confirmDelete) {
    return (
      <div className="rounded-md border border-rule bg-bg-2 p-3">
        <p className="mb-3 text-[13px] text-fg">Удалить <span className="font-semibold">«{task.title}»</span>?</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmDelete(false)}
            className="rounded-sm px-3 py-1.5 text-[12px] text-fg-2 hover:bg-bg-3">Отмена</button>
          <button type="button" onClick={onDelete}
            className="rounded-sm bg-[#ef4444] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#dc2626]">Удалить</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}
      className="group relative rounded-[10px] border border-rule bg-bg-2 p-[10px] shadow-xs transition-shadow hover:shadow-sm">
      {/* drag handle */}
      {canEdit && (
        <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab rounded-[10px]" />
      )}

      {/* Кнопки */}
      {canEdit && (
        <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={() => setEditing(true)}
            className="grid h-6 w-6 place-items-center rounded-xs bg-bg-2 text-fg-dim hover:bg-bg-3 hover:text-fg">
            <PencilIcon size={12} />
          </button>
          {(isOwner || task.created_by === user?.id) && (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className="grid h-6 w-6 place-items-center rounded-xs bg-bg-2 text-fg-dim hover:bg-bg-3 hover:text-[#ef4444]">
              <TrashIcon size={12} />
            </button>
          )}
        </div>
      )}

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
          {formatDate(task.created_at)}
        </span>
        {task.deadline && (
          <span className={`flex items-center gap-1 text-[10.5px] font-medium ${overdue ? 'text-[#ef4444]' : 'text-fg-dim'}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {overdue ? '⚠ ' : ''}до {formatDate(task.deadline)}
          </span>
        )}
        {task.status === 'done' && task.completed_at && (
          <span className="flex items-center gap-1 text-[10.5px] text-[#10b981]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            готово {formatDate(task.completed_at)}
          </span>
        )}
      </div>

      {/* Футер */}
      <div className="flex items-center justify-between border-t border-rule-2 pt-[7px]">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <>
              <div className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold"
                style={{ background: task.assignee.color_bg, color: task.assignee.color_text }}>
                {task.assignee.initials}
              </div>
              <span className="text-[11px] text-fg-dim">{task.assignee.name}</span>
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
          <button type="button" onClick={() => setShowComments(true)}
            className="flex items-center gap-1 text-[11px] text-fg-dim hover:text-fg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {task.commentsCount ?? 0}
          </button>
        </div>
      </div>

      {/* Модалка комментариев */}
      {showComments && (
        <CommentsModal task={task} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}

function CommentsModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch(`/api/comments?taskId=${task.id}`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false); })
      .catch(() => setLoading(false));
  });

  async function sendComment() {
    if (!text.trim()) return;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: task.id, content: text.trim() }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments((prev) => [...prev, c]);
      setText('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-rule bg-bg-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <h3 className="text-[14px] font-semibold text-fg">{task.title}</h3>
          <button type="button" onClick={onClose} className="text-fg-dim hover:text-fg">✕</button>
        </div>
        <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
          {loading && <p className="text-[13px] text-fg-dim">Загрузка...</p>}
          {!loading && comments.length === 0 && (
            <p className="text-[13px] text-fg-dim">Комментариев пока нет</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="grid h-7 w-7 flex-none place-items-center rounded-full text-[10px] font-bold"
                style={{ background: c.author?.color_bg, color: c.author?.color_text }}>
                {c.author?.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-fg">{c.author?.name}</span>
                  <span className="text-[11px] text-fg-dim">
                    {new Date(c.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[13px] text-fg">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-rule px-4 py-3">
          <input type="text" placeholder="Написать комментарий..." value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendComment()}
            className="flex-1 rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line" />
          <button type="button" onClick={sendComment} disabled={!text.trim()}
            className="rounded-sm bg-accent px-3 py-2 text-[13px] font-semibold text-on-accent hover:bg-accent-bright disabled:opacity-40">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
