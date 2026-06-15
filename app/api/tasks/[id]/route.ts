import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();

  // Получаем задачу
  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Employee может редактировать только свои задачи
  if (user.role === 'employee' && task.created_by !== user.id && task.assignee_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Employee не может переназначать исполнителя на другого
  if (user.role === 'employee' && body.assignee_id && body.assignee_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const patch: any = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.status !== undefined) {
    patch.status = body.status;
    patch.completed_at = body.status === 'done' ? new Date().toISOString() : null;
  }
  if (body.urgent !== undefined) patch.urgent = body.urgent;
  if (body.deadline !== undefined) patch.deadline = body.deadline;
  if (body.assignee_id !== undefined) patch.assignee_id = body.assignee_id;

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update(patch)
    .eq('id', params.id)
    .select(`*, assignee:users!tasks_assignee_id_fkey(id,name,initials,color_bg,color_text)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Уведомление при смене статуса на review
  if (body.status === 'review') {
    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('telegram_chat_id, name')
      .eq('role', 'owner')
      .single();

    if (owner?.telegram_chat_id) {
      await sendTelegramNotification(
        owner.telegram_chat_id,
        `👁 Задача готова к проверке: *${data.title}*`,
      );
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;

  if (user.role === 'employee') {
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('created_by')
      .eq('id', params.id)
      .single();

    if (task?.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { error } = await supabaseAdmin.from('tasks').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
