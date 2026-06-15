import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const { chatId } = await req.json();

  const { error } = await supabaseAdmin
    .from('users')
    .update({ telegram_chat_id: chatId })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendTelegramNotification(chatId, '✅ Уведомления подключены! Теперь вы будете получать оповещения о задачах.');

  return NextResponse.json({ ok: true });
}
