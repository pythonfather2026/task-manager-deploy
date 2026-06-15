import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Клиентский — для браузера
export const supabase = createClient(url, anon);

// Серверный — для API Routes (обходит RLS)
export const supabaseAdmin = createClient(url, service);
