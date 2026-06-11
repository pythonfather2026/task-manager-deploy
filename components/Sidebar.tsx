'use client';

import { useState } from 'react';
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
} from '@/components/icons';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  modelId: ModelId;
  onModelChange: (id: ModelId) => void;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  modelId,
  onModelChange,
}: SidebarProps) {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const visibleChats = normalized
    ? chats.filter((c) => c.title.toLowerCase().includes(normalized))
    : chats;

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
                      onClick={() => onSelectChat(chat.id)}
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
        <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-accent-line bg-accent-wash text-[13px] font-bold leading-none text-accent-deep">
          {USER.initials}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13.5px] font-semibold">
            {USER.name}
          </span>
          <span className="block truncate text-xs text-fg-dim">
            {USER.role}
          </span>
        </span>
        <span className="flex-none text-fg-dim">
          <ChevronDownIcon size={16} />
        </span>
      </div>
    </aside>
  );
}
