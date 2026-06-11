'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ASSISTANT_REPLIES,
  CHATS,
  INITIAL_CHAT_ID,
  INITIAL_MODEL_ID,
  MESSAGES,
  type Chat,
  type ChatMessage,
  type ModelId,
} from '@/lib/mock-data';
import { Sidebar } from '@/components/Sidebar';
import { ChatHeader } from '@/components/ChatHeader';
import { MessageList } from '@/components/MessageList';
import { Composer } from '@/components/Composer';
import { Toast } from '@/components/Toast';

/** Пауза перед началом «ответа» ассистента. */
const REPLY_DELAY_MS = 800;
/** Интервал появления слов при эффекте печатания. */
const TYPE_WORD_MS = 55;
const TOAST_MS = 2000;

function uid() {
  return crypto.randomUUID();
}

/**
 * Корневой клиентский компонент: держит всё состояние чата.
 * Данные живут только в React state — без сервера и localStorage.
 */
export function ChatApp() {
  const [chats, setChats] = useState<Chat[]>(CHATS);
  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessage[]>>(MESSAGES);
  const [activeChatId, setActiveChatId] = useState(INITIAL_CHAT_ID);
  const [modelId, setModelId] = useState<ModelId>(INITIAL_MODEL_ID);
  const [useSources, setUseSources] = useState(true);
  const [draft, setDraft] = useState('');
  // Чат, в котором ассистент сейчас «отвечает»; null — свободен.
  const [replyingChatId, setReplyingChatId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Индекс следующего заготовленного ответа (выдаются по кругу).
  const replyIndexRef = useRef(0);

  // Активные таймеры; чистим при размонтировании, чтобы не дёргать state.
  const timersRef = useRef<{
    delay?: ReturnType<typeof setTimeout>;
    typing?: ReturnType<typeof setInterval>;
    toast?: ReturnType<typeof setTimeout>;
  }>({});

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      clearTimeout(timers.delay);
      clearInterval(timers.typing);
      clearTimeout(timers.toast);
    };
  }, []);

  function appendMessage(chatId: string, message: ChatMessage) {
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), message],
    }));
  }

  function patchMessage(
    chatId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
  ) {
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] ?? []).map((m) =>
        m.id === messageId ? { ...m, ...patch } : m,
      ),
    }));
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || replyingChatId) return;

    const chatId = activeChatId;
    appendMessage(chatId, { id: uid(), role: 'user', content: text });
    setDraft('');
    setReplyingChatId(chatId);

    const reply =
      ASSISTANT_REPLIES[replyIndexRef.current % ASSISTANT_REPLIES.length];
    replyIndexRef.current += 1;
    const sources = useSources ? reply.sources : undefined;

    // Пауза «обдумывания», затем ответ печатается пословно.
    timersRef.current.delay = setTimeout(() => {
      const messageId = uid();
      const words = reply.content.split(' ');
      let shown = 1;

      appendMessage(chatId, {
        id: messageId,
        role: 'assistant',
        content: words[0],
      });

      timersRef.current.typing = setInterval(() => {
        shown += 1;
        patchMessage(chatId, messageId, {
          content: words.slice(0, shown).join(' '),
        });
        if (shown >= words.length) {
          clearInterval(timersRef.current.typing);
          if (sources) patchMessage(chatId, messageId, { sources });
          setReplyingChatId(null);
        }
      }, TYPE_WORD_MS);
    }, REPLY_DELAY_MS);
  }

  function createChat() {
    const id = uid();
    setChats((prev) => [
      { id, title: 'Новый диалог', group: 'Сегодня', time: 'сейчас' },
      ...prev,
    ]);
    setMessagesByChat((prev) => ({ ...prev, [id]: [] }));
    setActiveChatId(id);
  }

  function showToast(text: string) {
    setToast(text);
    clearTimeout(timersRef.current.toast);
    timersRef.current.toast = setTimeout(() => setToast(null), TOAST_MS);
  }

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Скопировано');
    } catch {
      showToast('Не удалось скопировать');
    }
  }

  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = messagesByChat[activeChatId] ?? [];
  // Индикатор «печатает…» показываем только в паузе до первого слова ответа.
  const assistantThinking =
    replyingChatId === activeChatId &&
    messages[messages.length - 1]?.role === 'user';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onCreateChat={createChat}
        modelId={modelId}
        onModelChange={setModelId}
      />
      <main className="flex h-full min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeChat?.title ?? 'Новый диалог'}
          modelId={modelId}
          useSources={useSources}
          onToggleSources={() => setUseSources((v) => !v)}
        />
        <MessageList
          chatId={activeChatId}
          messages={messages}
          modelId={modelId}
          assistantThinking={assistantThinking}
          onCopy={copyMessage}
          onPickExample={setDraft}
        />
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={sendMessage}
          sendLocked={replyingChatId !== null}
        />
      </main>
      <Toast message={toast} />
    </div>
  );
}
