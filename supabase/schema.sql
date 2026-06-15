-- Пользователи
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('owner', 'employee')),
  initials text not null,
  color_bg text not null,
  color_text text not null,
  telegram_chat_id text,
  created_at timestamptz default now()
);

-- Доски
create table public.boards (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Задачи
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'review', 'done')),
  urgent boolean not null default false,
  board_id text not null references public.boards(id) on delete cascade,
  assignee_id uuid references public.users(id) on delete set null,
  created_by uuid not null references public.users(id) on delete cascade,
  deadline timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Комментарии
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Стартовые доски
insert into public.boards (id, name) values
  ('content', 'Контент-производство'),
  ('smm', 'SMM и соцсети'),
  ('education', 'Учебные материалы'),
  ('ops', 'Операционка');

-- Стартовые пользователи (пароль для всех: password123)
insert into public.users (name, email, password_hash, role, initials, color_bg, color_text) values
  ('Людмила', 'lyudmila@team.ru',
   '$2b$10$rBnqhkHm3Y9v5K.oGbgvWO5M8sUxOlVjH3Jh8D0YJ8mvNX4Rw8Wy',
   'owner', 'ЛЮ', '#ede9fe', '#4c1d95'),
  ('Анна', 'anna@team.ru',
   '$2b$10$rBnqhkHm3Y9v5K.oGbgvWO5M8sUxOlVjH3Jh8D0YJ8mvNX4Rw8Wy',
   'employee', 'АС', '#dbeafe', '#1e40af'),
  ('Мария', 'maria@team.ru',
   '$2b$10$rBnqhkHm3Y9v5K.oGbgvWO5M8sUxOlVjH3Jh8D0YJ8mvNX4Rw8Wy',
   'employee', 'МК', '#d1fae5', '#065f46'),
  ('Олег', 'oleg@team.ru',
   '$2b$10$rBnqhkHm3Y9v5K.oGbgvWO5M8sUxOlVjH3Jh8D0YJ8mvNX4Rw8Wy',
   'employee', 'ОП', '#fef3c7', '#92400e'),
  ('Екатерина', 'ekaterina@team.ru',
   '$2b$10$rBnqhkHm3Y9v5K.oGbgvWO5M8sUxOlVjH3Jh8D0YJ8mvNX4Rw8Wy',
   'employee', 'ЕВ', '#fce7f3', '#9d174d');
