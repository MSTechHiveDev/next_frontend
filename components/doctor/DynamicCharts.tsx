'use client';

import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { ssr: false });

interface DynamicChartsProps {
    type: 'area' | 'pie';
    data?: any[];
}

export default function DynamicCharts({ type, data }: DynamicChartsProps) {
    return <DashboardCharts type={type} data={data} />;
}
