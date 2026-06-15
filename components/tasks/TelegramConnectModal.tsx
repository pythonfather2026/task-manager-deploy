'use client';

import { useState } from 'react';
import { XIcon } from '@/components/icons';

export function TelegramConnectModal({ onClose }: { onClose: () => void }) {
  const [chatId, setChatId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function connect() {
    if (!chatId.trim()) return;
    setStatus('loading');
    const res = await fetch('/api/telegram/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: chatId.trim() }),
    });
    setStatus(res.ok ? 'success' : 'error');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-rule bg-bg-2 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-fg">Telegram уведомления</h3>
          <button type="button" onClick={onClose} className="text-fg-dim hover:text-fg"><XIcon size={16} /></button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-[14px] font-semibold text-fg">Подключено!</p>
            <p className="text-[13px] text-fg-dim mt-1">Проверь Telegram — пришло тестовое сообщение</p>
            <button type="button" onClick={onClose}
              className="mt-4 rounded-sm bg-accent px-4 py-2 text-[13px] font-semibold text-on-accent hover:bg-accent-bright">
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-md bg-bg-3 p-3 text-[12.5px] text-fg-2 leading-relaxed">
              <p className="font-semibold text-fg mb-1">Как получить Chat ID:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Открой <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-accent underline">@userinfobot</a> в Telegram</li>
                <li>Нажми /start</li>
                <li>Скопируй число после «Id:»</li>
                <li>Вставь ниже и нажми «Подключить»</li>
              </ol>
            </div>

            <input type="text" placeholder="Твой Chat ID (например: 123456789)"
              value={chatId} onChange={(e) => setChatId(e.target.value)}
              className="mb-3 w-full rounded-sm border border-rule-2 bg-bg-3 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-accent-line" />

            {status === 'error' && (
              <p className="mb-2 text-[12px] text-[#ef4444]">Ошибка. Проверь Chat ID и попробуй снова.</p>
            )}

            <button type="button" onClick={connect} disabled={!chatId.trim() || status === 'loading'}
              className="w-full rounded-sm bg-accent py-2 text-[13px] font-semibold text-on-accent hover:bg-accent-bright disabled:opacity-40">
              {status === 'loading' ? 'Подключение...' : 'Подключить'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
