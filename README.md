# Task Manager — Тестовое задание

Таск-менеджер для команды Людмилы. Kanban-доска с ролями, уведомлениями в Telegram и реальным хранением данных.

## 🚀 Демо

**Живая версия:** https://task-manager-deploy-theta.vercel.app

### Тестовые аккаунты

Пароль для всех: `password123`

| Имя | Email | Роль |
|-----|-------|------|
| Людмила | lyudmila@team.ru | Владелец |
| Анна | anna@team.ru | Сотрудник (копирайтер) |
| Мария | maria@team.ru | Сотрудник (методолог) |
| Олег | oleg@team.ru | Сотрудник (SMM) |
| Екатерина | ekaterina@team.ru | Сотрудник (ассистент) |

---

## ⚙️ Локальный запуск

### 1. Клонируй репозиторий

```bash
git clone https://github.com/pythonfather2026/task-manager-deploy.git
cd task-manager-deploy
```

### 2. Установи зависимости

```bash
npm install
```

### 3. Создай `.env.local` в корне проекта

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-change-in-production-32chars

NEXT_PUBLIC_SUPABASE_URL=https://ffbifpcmiqsbvrvnzvmk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_secret_key

DATABASE_URL=postgresql://postgres:PASSWORD@db.ffbifpcmiqsbvrvnzvmk.supabase.co:5432/postgres

TELEGRAM_BOT_TOKEN=your_bot_token
CRON_SECRET=deadlines-cron-secret-2024
```

### 4. Запусти

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

---

## 📱 Подключение Telegram-уведомлений

1. Открой [@userinfobot](https://t.me/userinfobot) в Telegram → `/start` → скопируй свой **Chat ID**
2. Войди в приложение под своим аккаунтом
3. Нажми кнопку **«Уведомления»** в хедере доски
4. Вставь Chat ID → нажми **«Подключить»**
5. Придёт тестовое сообщение ✅

### Когда приходят уведомления

- 📋 **Назначили задачу** — сразу при создании задачи с исполнителем
- 💬 **Новый комментарий** — сразу после отправки комментария
- 👁 **Задача на проверке** — Людмиле когда задачу переносят в «На проверке»
- ⏰ **Дедлайн завтра** — каждый день в 9:00 автоматически

---

## 🏗️ Стек

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **База данных:** Supabase (PostgreSQL)
- **Авторизация:** NextAuth.js (JWT)
- **Drag & Drop:** @dnd-kit
- **Деплой:** Vercel

---

## 🎯 Ключевые продуктовые решения

### Доски
4 доски под команду Людмилы:
- **Контент-производство** — общий контент, посты, статьи
- **SMM и соцсети** — для SMM-специалиста
- **Учебные материалы** — для методолога-куратора
- **Операционка** — для ассистента, орг. задачи

### Колонки
`Идеи → В работе → На проверке → Готово`

Перетаскивание карточек между колонками меняет статус. «Просрочено» — автоматически, когда дедлайн прошёл.

### Роли

**Owner (Людмила):**
- Создаёт, редактирует и удаляет любые задачи
- Назначает любого исполнителя
- Приглашает новых участников
- Видит всю статистику

**Employee (сотрудники):**
- Создают задачи, назначают только себя
- Редактируют и удаляют только свои задачи
- Перетаскивают только свои карточки
- Комментируют любую задачу

### Уведомления
Бот уведомляет точечно: только нужного человека, только о важном событии. Подключение через Chat ID — без лишних шагов.

---

## 📁 Структура проекта

```
app/
  api/
    auth/          # NextAuth
    tasks/         # CRUD задач
    comments/      # Комментарии
    users/         # Список пользователей
    telegram/      # Подключение уведомлений
    cron/          # Автоматические уведомления о дедлайнах
  login/           # Страница входа
components/
  tasks/           # Kanban-доска, карточки, формы
  Sidebar.tsx      # Сайдбар со статистикой
lib/
  auth.ts          # NextAuth конфиг
  supabase.ts      # Supabase клиент
  telegram.ts      # Утилита отправки сообщений
supabase/
  schema.sql       # Схема базы данных
```
