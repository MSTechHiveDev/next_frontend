import React from 'react';
import { Clock, CalendarCheck } from 'lucide-react';

export default function LeavesPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="text-orange-500" /> Leave Management
        </h1>
        
        <div className="bg-white dark:bg-[#111] p-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
            <CalendarCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave Requests</h3>
            <p className="text-gray-500 mt-2">Manage your time off and schedule availability.</p>
        </div>
    </div>
  );
}
