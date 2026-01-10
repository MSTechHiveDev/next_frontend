'use client';

import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/doctor/DashboardCharts'), { ssr: false });

export default function DoctorDashboardCharts({ type, data }: { type: string; data?: any[] }) {
  // @ts-ignore - Dynamic import typing issue
  return <DashboardCharts type={type} data={data} />;
}