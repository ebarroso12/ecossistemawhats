import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecossistema Whats Dr. Edson',
  description: 'Dashboard central de CRM, webhooks, WhatsApp, OpenClaw, Fireflies, Webflow e Supabase.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
