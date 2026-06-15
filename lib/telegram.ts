export async function sendTelegramNotification(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

// Проверка дедлайнов — вызывается через cron или вручную
export async function checkDeadlines(supabaseAdmin: any) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*, assignee:users!tasks_assignee_id_fkey(telegram_chat_id, name)')
    .neq('status', 'done')
    .gte('deadline', tomorrowStr + 'T00:00:00')
    .lte('deadline', tomorrowStr + 'T23:59:59');

  for (const task of tasks ?? []) {
    if (task.assignee?.telegram_chat_id) {
      await sendTelegramNotification(
        task.assignee.telegram_chat_id,
        `⏰ Завтра дедлайн задачи: *${task.title}*`,
      );
    }
  }
}
