'use client';

import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/doctor/DashboardCharts'), { ssr: false });

export default function DoctorDashboardCharts({ type }: { type: string }) {
  return <DashboardCharts type={type} />;
}