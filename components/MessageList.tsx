'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, ModelId } from '@/lib/mock-data';
import { Message } from '@/components/Message';
import { TypingIndicator } from '@/components/TypingIndicator';
import { EmptyState } from '@/components/EmptyState';
import { ArrowDownIcon } from '@/components/icons';

/** Дистанция до низа (px), в пределах которой считаем, что читатель «у низа». */
const PIN_THRESHOLD = 120;

interface MessageListProps {
  chatId: string;
  messages: ChatMessage[];
  modelId: ModelId;
  assistantThinking: boolean;
  onCopy: (content: string) => void;
  onPickExample: (text: string) => void;
}

export function MessageList({
  chatId,
  messages,
  modelId,
  assistantThinking,
  onCopy,
  onPickExample,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Прижат ли просмотр к низу: только тогда автоскроллим новые сообщения.
  const pinnedRef = useRef(true);
  const [showJump, setShowJump] = useState(false);

  function scrollToBottom(behavior: ScrollBehavior) {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior });
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD;
    pinnedRef.current = nearBottom;
    setShowJump(!nearBottom);
  }

  // При смене чата начинаем с низа ленты.
  useEffect(() => {
    pinnedRef.current = true;
    setShowJump(false);
    scrollToBottom('auto');
  }, [chatId]);

  // Автоскролл при новых сообщениях и во время «печати» ответа.
  useEffect(() => {
    if (pinnedRef.current) scrollToBottom('auto');
  }, [messages, assistantThinking]);

  const isEmpty = messages.length === 0 && !assistantThinking;

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-6 pb-2 pt-8 lg:px-10"
      >
        <div className="mx-auto flex min-h-full max-w-[780px] flex-col">
          {isEmpty ? (
            <EmptyState onPickExample={onPickExample} />
          ) : (
            <>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  modelId={modelId}
                  onCopy={onCopy}
                />
              ))}
              {assistantThinking && <TypingIndicator modelId={modelId} />}
            </>
          )}
        </div>
      </div>

      {showJump && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-rule bg-bg-2 px-3.5 py-1.5 text-xs font-semibold text-fg-2 shadow-md transition-colors hover:text-fg"
        >
          <ArrowDownIcon size={13} />
          Вернуться вниз
        </button>
      )}
    </div>
  );
}
