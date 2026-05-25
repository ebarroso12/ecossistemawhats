import { getDashboardData } from '@/lib';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
