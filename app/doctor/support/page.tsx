import React from 'react';
import { Settings, MessageSquare, ShieldCheck } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="text-gray-500" /> Support & Feedback
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-[#111] p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
                <MessageSquare className="text-blue-500 mb-4" size={32} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Support</h3>
                <p className="text-gray-500 mt-2 mb-4">Need help with the system? Reach out to our IT desk.</p>
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm">Open Ticket</button>
             </div>

             <div className="bg-white dark:bg-[#111] p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
                <ShieldCheck className="text-green-500 mb-4" size={32} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Privacy & Security</h3>
                <p className="text-gray-500 mt-2 mb-4">Review your data protection settings and audit logs.</p>
                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium text-sm">View Settings</button>
             </div>
        </div>
    </div>
  );
}
