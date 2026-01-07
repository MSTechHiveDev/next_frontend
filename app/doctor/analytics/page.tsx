import React from 'react';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-blue-500" /> Practice Analytics
        </h1>
        
        <div className="bg-white dark:bg-[#111] p-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
            <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analytics Module</h3>
            <p className="text-gray-500 mt-2">Detailed charts and trend analysis coming soon.</p>
        </div>
    </div>
  );
}
