'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  GROUP_ORDER,
  PROJECTS,
  USER,
  type Chat,
  type ModelId,
} from '@/lib/mock-data';
import { ModelSelect } from '@/components/ModelSelect';
import {
  ChatBubbleIcon,
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
  TasksIcon,
} from '@/components/icons';

interface TaskStats {
  total: number;
  in_progress: number;
  review: number;
  overdue: number;
  done: number;
}

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  modelId: ModelId;
  onModelChange: (id: ModelId) => void;
  view: 'chat' | 'tasks';
  onViewChange: (view: 'chat' | 'tasks') => void;
  taskStats: TaskStats;
}

function Donut({ pct, color }: { pct: number; color: string }) {
  const r = 10;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="14" cy="14" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
      />
      <text x="14" y="18" textAnchor="middle" fontSize="7" fontWeight="500" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  modelId,
  onModelChange,
  view,
  onViewChange,
  taskStats,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [tasksOpen, setTasksOpen] = useState(true);
  const { data: session } = useSession();
  const sessionUser = session?.user as any;

  const normalized = query.trim().toLowerCase();
  const visibleChats = normalized
    ? chats.filter((c) => c.title.toLowerCase().includes(normalized))
    : chats;

  const pct = (n: number) =>
    taskStats.total === 0 ? 0 : Math.round((n / taskStats.total) * 100);

  const donePct = pct(taskStats.done);
  const progressWidth = donePct;

  const statRows = [
    { label: 'В работе', value: taskStats.in_progress, color: '#3b82f6', pct: pct(taskStats.in_progress) },
    { label: 'На проверке', value: taskStats.review, color: '#8b5cf6', pct: pct(taskStats.review) },
    { label: 'Просрочено', value: taskStats.overdue, color: '#ef4444', pct: pct(taskStats.overdue) },
    { label: 'Выполнено', value: taskStats.done, color: '#10b981', pct: donePct },
  ];

  return (
    <aside
      aria-label="Список диалогов"
      className="flex h-full w-[290px] flex-none flex-col border-r border-rule bg-bg"
    >
      {/* Новый диалог */}
      <div className="px-4 pb-3 pt-[18px]">
        <button
          type="button"
          onClick={onCreateChat}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-pill bg-accent text-[15px] font-semibold text-on-accent transition-all hover:-translate-y-px hover:bg-accent-bright"
        >
          <PlusIcon size={17} />
          Новый диалог
        </button>
      </div>

      {/* Поиск */}
      <div className="px-4 pb-2.5">
        <label className="relative flex items-center">
          <span className="absolute left-3 flex text-fg-dim">
            <SearchIcon size={16} />
          </span>
          <input
            type="search"
            placeholder="Поиск"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-[38px] w-full rounded-sm border border-rule-2 bg-bg-3 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Проекты */}
        <div className="border-y border-rule-2 px-3 pb-3 pt-1">
          <div className="flex items-center justify-between px-3 pb-1 pt-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-dim">
              Проекты
            </span>
            <button
              type="button"
              title="Добавить проект"
              className="grid h-[22px] w-[22px] place-items-center rounded-xs text-fg-dim transition-colors hover:bg-bg-3 hover:text-fg"
            >
              <PlusIcon size={16} />
            </button>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-[9px] rounded-sm bg-accent-wash px-3 py-2 text-left text-[13.5px] font-semibold text-fg"
          >
            <span className="flex flex-none text-fg-dim">
              <ChatBubbleIcon size={16} />
            </span>
            Все диалоги
          </button>
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              className="flex w-full items-center gap-[9px] rounded-sm px-3 py-2 text-left text-[13.5px] font-medium text-fg-2 transition-colors hover:bg-bg-3"
            >
              <span className="flex flex-none text-fg-dim">
                <FolderIcon size={16} />
              </span>
              <span className="truncate">{project.name}</span>
            </button>
          ))}
          <button
            type="button"
            className="flex w-full items-center gap-[9px] rounded-sm px-3 py-2 text-left text-[13.5px] font-medium text-fg-dim transition-colors hover:bg-bg-3 hover:text-fg-2"
          >
            <PlusIcon size={16} />
            Добавить проект
          </button>
        </div>

        {/* ── Задачи ── */}
        <div className="border-b border-rule-2">
          {/* Заголовок — кликабельный */}
          <button
            type="button"
            onClick={() => {
              onViewChange('tasks');
              setTasksOpen((v) => !v);
            }}
            className={`flex w-full items-center gap-2 px-5 py-2.5 text-left transition-colors ${
              view === 'tasks' ? 'bg-accent-wash' : 'hover:bg-bg-3'
            }`}
          >
            <span className="flex text-fg-dim">
              <TasksIcon size={15} />
            </span>
            <span className="flex-1 text-[13.5px] font-semibold text-fg">Задачи</span>
            {taskStats.total > 0 && (
              <span className="text-[11px] text-fg-dim">{taskStats.total}</span>
            )}
            <ChevronDownIcon
              size={13}
              className={`text-fg-dim transition-transform ${tasksOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Статистика */}
          {tasksOpen && taskStats.total > 0 && (
            <div className="px-4 pb-3 pt-1">
              {/* Общий прогресс */}
              <div className="mb-2.5">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-fg-dim">Всего задач</span>
                  <span className="font-medium text-fg">{taskStats.total}</span>
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-bg-3">
                  <div
                    className="h-full rounded-full bg-[#10b981] transition-all"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-[10.5px] text-[#10b981]">
                  {donePct}% выполнено
                </div>
              </div>

              {/* Строки статистики */}
              <div className="flex flex-col gap-1">
                {statRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[12px] text-fg-2">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="min-w-[14px] text-right text-[12px] font-medium text-fg">
                        {row.value}
                      </span>
                      <Donut pct={row.pct} color={row.color} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Пустое состояние */}
          {tasksOpen && taskStats.total === 0 && (
            <p className="px-5 pb-3 text-[12px] text-fg-dim">Задач пока нет</p>
          )}
        </div>

        {/* Список чатов */}
        <nav className="px-3 pb-3 pt-2.5" aria-label="Диалоги">
          {visibleChats.length === 0 && (
            <p className="px-3 py-2 text-sm text-fg-dim">Ничего не найдено</p>
          )}
          {GROUP_ORDER.map((group) => {
            const groupChats = visibleChats.filter((c) => c.group === group);
            if (groupChats.length === 0) return null;
            return (
              <div key={group} className="mb-3">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-dim">
                  {group}
                </div>
                {groupChats.map((chat) => {
                  const active = chat.id === activeChatId;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => { onSelectChat(chat.id); onViewChange('chat'); }}
                      className={`relative mb-px flex w-full items-center justify-between gap-2.5 rounded-sm px-3 py-[9px] text-left text-sm transition-colors ${
                        active
                          ? 'bg-accent-wash font-semibold text-fg'
                          : 'font-medium text-fg-2 hover:bg-bg-3'
                      }`}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-[2.5px] rounded-full bg-accent" />
                      )}
                      <span className="truncate">{chat.title}</span>
                      <span className="flex-none text-[11.5px] text-fg-dim">
                        {chat.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Переключатель модели */}
      <div className="border-t border-rule px-4 py-3">
        <ModelSelect modelId={modelId} onChange={onModelChange} />
      </div>

      {/* Пользователь */}
      <div className="flex items-center gap-[11px] border-t border-rule px-4 py-3">
        <span
          className="grid h-8 w-8 flex-none place-items-center rounded-full text-[13px] font-bold leading-none"
          style={{ background: sessionUser?.colorBg ?? '#ede9fe', color: sessionUser?.colorText ?? '#4c1d95' }}
        >
          {sessionUser?.initials ?? '??'}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13.5px] font-semibold">
            {sessionUser?.name ?? 'Пользователь'}
          </span>
          <span className="block truncate text-xs text-fg-dim">
            {sessionUser?.role === 'owner' ? 'Владелец' : 'Сотрудник'}
          </span>
        </span>
        <button
          type="button"
          title="Выйти"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex-none rounded-xs p-1 text-fg-dim transition-colors hover:bg-bg-3 hover:text-fg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
