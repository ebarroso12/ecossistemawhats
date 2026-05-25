import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/api/health', '/api/webhooks', '/api/commands', '/api/telegram/webhook'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const user = process.env.ECOSYSTEM_ADMIN_USER || 'edson';
  const password = process.env.ECOSYSTEM_ADMIN_PASSWORD;

  if (!password) {
    if (process.env.VERCEL === '1') {
      return NextResponse.json({ error: 'dashboard auth not configured' }, { status: 503 });
    }
    return NextResponse.next();
  }

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return unauthorized();

  const decoded = atob(header.slice(6));
  const separator = decoded.indexOf(':');
  const sentUser = decoded.slice(0, separator);
  const sentPassword = decoded.slice(separator + 1);

  if (sentUser === user && sentPassword === password) {
    return NextResponse.next();
  }

  return unauthorized();
}

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Ecossistema Whats"',
    },
  });
}

export const config = {
  matcher: ['/', '/api/events', '/api/messages/:path*'],
};
