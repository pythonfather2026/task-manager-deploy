'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const USERS = [
  { name: 'Людмила', email: 'lyudmila@team.ru', role: 'Владелец', initials: 'ЛЮ', bg: '#ede9fe', color: '#4c1d95' },
  { name: 'Анна', email: 'anna@team.ru', role: 'Копирайтер', initials: 'АС', bg: '#dbeafe', color: '#1e40af' },
  { name: 'Мария', email: 'maria@team.ru', role: 'Методолог', initials: 'МК', bg: '#d1fae5', color: '#065f46' },
  { name: 'Олег', email: 'oleg@team.ru', role: 'SMM', initials: 'ОП', bg: '#fef3c7', color: '#92400e' },
  { name: 'Екатерина', email: 'ekaterina@team.ru', role: 'Ассистент', initials: 'ЕВ', bg: '#fce7f3', color: '#9d174d' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  async function login(email: string) {
    setLoading(email);
    setError('');
    const res = await signIn('credentials', {
      email,
      password: 'password123',
      redirect: false,
    });
    if (res?.error) {
      setError('Ошибка входа');
      setLoading(null);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-bold text-fg">Войти в систему</h1>
          <p className="mt-1 text-sm text-fg-dim">Выберите аккаунт для входа</p>
        </div>

        <div className="flex flex-col gap-2">
          {USERS.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => login(u.email)}
              disabled={loading !== null}
              className="flex items-center gap-3 rounded-md border border-rule bg-bg-2 px-4 py-3 text-left transition-all hover:-translate-y-px hover:border-accent-line hover:shadow-sm disabled:opacity-60"
            >
              <div
                className="grid h-10 w-10 flex-none place-items-center rounded-full text-[13px] font-bold"
                style={{ background: u.bg, color: u.color }}
              >
                {loading === u.email ? '...' : u.initials}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-fg">{u.name}</div>
                <div className="text-[12px] text-fg-dim">{u.role}</div>
              </div>
              {u.email === 'lyudmila@team.ru' && (
                <span className="ml-auto rounded-full bg-accent-wash px-2 py-px text-[11px] font-semibold text-accent">
                  Владелец
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-[#ef4444]">{error}</p>
        )}

        <p className="mt-6 text-center text-[12px] text-fg-dim">
          Пароль для всех аккаунтов: <code className="font-mono">password123</code>
        </p>
      </div>
    </div>
  );
}
