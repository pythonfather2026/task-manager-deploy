import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const boardId = req.nextUrl.searchParams.get('boardId');
  let query = supabaseAdmin
    .from('tasks')
    .select(`*, assignee:users!tasks_assignee_id_fkey(id,name,initials,color_bg,color_text), creator:users!tasks_created_by_fkey(id,name,initials)`)
    .order('created_at', { ascending: false });

  if (boardId) query = query.eq('board_id', boardId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();

  // Employee может назначать только себя
  if (user.role === 'employee' && body.assignee_id && body.assignee_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      title: body.title,
      description: body.description,
      status: body.status ?? 'new',
      urgent: body.urgent ?? false,
      board_id: body.board_id,
      assignee_id: body.assignee_id ?? null,
      created_by: user.id,
      deadline: body.deadline ?? null,
    })
    .select(`*, assignee:users!tasks_assignee_id_fkey(id,name,initials,color_bg,color_text)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Telegram уведомление исполнителю
  if (data.assignee_id && data.assignee_id !== user.id) {
    const { data: assignee } = await supabaseAdmin
      .from('users')
      .select('telegram_chat_id, name')
      .eq('id', data.assignee_id)
      .single();

    if (assignee?.telegram_chat_id) {
      await sendTelegramNotification(
        assignee.telegram_chat_id,
        `📋 Тебе назначена новая задача: *${data.title}*\nОт: ${user.name}`,
      );
    }
  }

  return NextResponse.json(data, { status: 201 });
}
