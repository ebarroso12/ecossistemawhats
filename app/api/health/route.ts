import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'ecossistemawhats',
    database: getSupabaseAdmin() ? 'supabase' : 'sample-data',
    vercel: process.env.VERCEL === '1',
  });
}
