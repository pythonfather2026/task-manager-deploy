'use client';

import { useEffect, useRef } from 'react';
import { MicIcon, PaperclipIcon, SendIcon } from '@/components/icons';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** true, пока ассистент «печатает» ответ — отправка заблокирована. */
  sendLocked: boolean;
}

export function Composer({ value, onChange, onSend, sendLocked }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоувеличение высоты textarea под содержимое (потолок задаёт max-h в CSS).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter — отправить, Shift+Enter — перенос строки.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  const canSend = !sendLocked && value.trim().length > 0;

  return (
    <div className="bg-gradient-to-t from-bg via-bg to-transparent px-6 pb-6 pt-3 lg:px-10">
      <div className="mx-auto max-w-[780px]">
        <div className="flex items-end gap-1.5 rounded-lg border border-rule bg-bg-2 p-2 shadow-sm transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-wash)]">
          <button
            type="button"
            title="Прикрепить файл"
            aria-label="Прикрепить файл"
            className="grid h-[42px] w-[42px] flex-none place-items-center rounded-md text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg"
          >
            <PaperclipIcon size={20} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спросите ассистента…"
            className="max-h-32 flex-1 resize-none bg-transparent px-1 py-[11px] text-[15.5px] leading-normal text-fg outline-none placeholder:text-fg-dim"
          />

          <button
            type="button"
            title="Голосовой ввод"
            aria-label="Голосовой ввод"
            className="grid h-[42px] w-[42px] flex-none place-items-center rounded-md text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg"
          >
            <MicIcon size={20} />
          </button>

          <button
            type="button"
            title="Отправить"
            aria-label="Отправить"
            disabled={!canSend}
            onClick={onSend}
            className="grid h-11 w-11 flex-none place-items-center rounded-full bg-accent text-on-accent transition-colors disabled:bg-bg-3 disabled:text-fg-dim"
          >
            <SendIcon size={20} />
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-fg-dim">
          Ассистент опирается на материалы базы знаний. Проверяйте важные
          формулировки.
        </p>
      </div>
    </div>
  );
}
