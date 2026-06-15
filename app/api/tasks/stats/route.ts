import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('status, deadline');

  const now = new Date().toDateString();
  const total = tasks?.length ?? 0;
  const in_progress = tasks?.filter((t) => t.status === 'in_progress').length ?? 0;
  const review = tasks?.filter((t) => t.status === 'review').length ?? 0;
  const done = tasks?.filter((t) => t.status === 'done').length ?? 0;
  const overdue = tasks?.filter((t) =>
    t.deadline && t.status !== 'done' && new Date(t.deadline) < new Date(now)
  ).length ?? 0;

  return NextResponse.json({ total, in_progress, review, done, overdue });
}
