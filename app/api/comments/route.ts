import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, author:users(id,name,initials,color_bg,color_text)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ task_id: body.task_id, author_id: user.id, content: body.content })
    .select('*, author:users(id,name,initials,color_bg,color_text)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Уведомить исполнителя задачи о новом комментарии
  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('title, assignee_id, created_by')
    .eq('id', body.task_id)
    .single();

  if (task) {
    const notifyId = task.assignee_id !== user.id ? task.assignee_id : task.created_by;
    if (notifyId && notifyId !== user.id) {
      const { data: recipient } = await supabaseAdmin
        .from('users')
        .select('telegram_chat_id')
        .eq('id', notifyId)
        .single();

      if (recipient?.telegram_chat_id) {
        await sendTelegramNotification(
          recipient.telegram_chat_id,
          `💬 Новый комментарий к задаче *${task.title}*:\n${user.name}: ${body.content}`,
        );
      }
    }
  }

  return NextResponse.json(data, { status: 201 });
}
