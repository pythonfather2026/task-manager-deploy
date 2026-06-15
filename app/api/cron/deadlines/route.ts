import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const from = new Date(tomorrow.toDateString()).toISOString();
  const to = new Date(tomorrow.toDateString());
  to.setHours(23, 59, 59);

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('title, assignee:users!tasks_assignee_id_fkey(name, telegram_chat_id)')
    .neq('status', 'done')
    .gte('deadline', from)
    .lte('deadline', to.toISOString());

  let sent = 0;
  for (const task of tasks ?? []) {
    const assignee = task.assignee as any;
    if (assignee?.telegram_chat_id) {
      await sendTelegramNotification(
        assignee.telegram_chat_id,
        `⏰ Завтра дедлайн задачи: *${task.title}*\nНе забудь завершить!`,
      );
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
