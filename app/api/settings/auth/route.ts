import { NextResponse } from 'next/server';
import crypto from 'crypto';

type AuthPayload = {
  currentPassword?: string;
  adminUser?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as AuthPayload | null;
  if (!payload) return NextResponse.json({ error: 'JSON invalido.' }, { status: 400 });

  const currentPassword = String(payload.currentPassword || '');
  const adminUser = String(payload.adminUser || '').trim();
  const newPassword = String(payload.newPassword || '');
  const confirmPassword = String(payload.confirmPassword || '');
  const expectedPassword = process.env.ECOSYSTEM_ADMIN_PASSWORD || '';

  if (!expectedPassword) {
    return NextResponse.json({ error: 'Senha atual do painel nao esta configurada no servidor.' }, { status: 503 });
  }
  if (!safeEqual(currentPassword, expectedPassword)) {
    return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });
  }
  if (adminUser.length < 3) {
    return NextResponse.json({ error: 'Usuario precisa ter pelo menos 3 caracteres.' }, { status: 400 });
  }
  if (newPassword.length < 10) {
    return NextResponse.json({ error: 'Nova senha precisa ter pelo menos 10 caracteres.' }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Confirmacao de senha nao confere.' }, { status: 400 });
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME;
  if (!vercelToken || !projectId) {
    return NextResponse.json({
      error: 'Alteracao validada, mas falta VERCEL_TOKEN e VERCEL_PROJECT_ID no servidor para gravar no Vercel.',
    }, { status: 503 });
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const query = new URLSearchParams({ upsert: 'true' });
  if (teamId) query.set('teamId', teamId);

  const response = await fetch(`https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env?${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      { key: 'ECOSYSTEM_ADMIN_USER', value: adminUser, type: 'encrypted', target: ['production', 'preview', 'development'] },
      { key: 'ECOSYSTEM_ADMIN_PASSWORD', value: newPassword, type: 'encrypted', target: ['production', 'preview', 'development'] },
    ]),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: `Vercel recusou atualizacao: ${error.slice(0, 240)}` }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    message: 'Credenciais salvas no Vercel. Faca novo deploy para o login usar a nova senha.',
  });
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
