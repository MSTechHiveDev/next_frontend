import React from 'react';
import { 
  Users, 
  Calendar, 
  RefreshCw, 
  Bell, 
  ChevronRight,
  User,
  Trash2,
  Save
} from 'lucide-react';
import { getDoctorStatsAction, getTodayAppointmentsAction, getRecentPatientsAction, getMeAction } from '@/lib/integrations';

// Server Component
export default async function DoctorDashboard() {
  // Parallel data fetching
  const statsReq = getDoctorStatsAction();
  const appointmentsReq = getTodayAppointmentsAction();
  const meReq = getMeAction().catch(() => ({ success: false, data: { name: 'Lakehsmi Prasad' } })); // Fallback to name in screenshot for demo if failing

  const [statsRes, appointmentsRes, meRes] = await Promise.all([
    statsReq, 
    appointmentsReq,
    meReq
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const appointments = appointmentsRes.success ? appointmentsRes.data : [];
  const doctorName = (meRes as any)?.data?.name || 'Lakshmi Prasad';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, Dr. {doctorName}</h1>
          <p className="text-gray-500 mt-1">Here's your upcoming care and quick actions.</p>
        </div>
        <div className="flex items-center gap-3">
             <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                <User size={18} /> Next Patient
             </button>
             <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 relative">
                <Bell size={18} /> View Alerts
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 rounded-full text-xs font-bold flex items-center justify-center border-2 border-red-600">1</span>
             </button>
             <button className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                Refresh
             </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        
        {/* Left Column: Today Appointments & Quick Notes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Today Appointments Card */}
                <div className="flex-1 bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col relative h-[350px]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today Appointments</h2>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{appointments.length} Today</span>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Calendar size={64} strokeWidth={1} className="mb-4 text-gray-300 dark:text-gray-700" />
                            <p className="text-lg font-medium">No appointments scheduled for today</p>
                        </div>
                    ) : (
                         <div className="overflow-y-auto pr-2 space-y-3">
                             {appointments.map(apt => (
                                 <div key={apt.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 flex justify-between items-center">
                                     <div>
                                         <p className="font-bold text-gray-900">{apt.patientName}</p>
                                         <p className="text-sm text-gray-500">{apt.time} • {apt.type}</p>
                                     </div>
                                     <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Start</button>
                                 </div>
                             ))}
                         </div>
                    )}
                </div>

                {/* Right Mini-Column: Patient Queue & Summary */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                     {/* Patient Queue */}
                     <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
                         <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Patient Queue</h3>
                            <p className="text-4xl font-bold text-blue-600">0</p>
                            <p className="text-sm text-gray-500 mt-1">Patients Waiting</p>
                         </div>
                         <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                             <Users size={24} />
                         </div>
                     </div>

                     {/* Today's Summary */}
                     <div className="flex-1 bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-center">
                         <h3 className="font-bold text-gray-900 dark:text-white mb-6">Today's Summary</h3>
                         
                         <div className="mb-6">
                             <div className="flex justify-between text-sm mb-2">
                                 <span className="text-gray-600">Total Appointments</span>
                                 <span className="font-bold">{appointments.length}</span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-600 w-[10%] rounded-full"></div>
                             </div>
                         </div>

                         <div>
                             <div className="flex justify-between text-sm mb-2">
                                 <span className="text-gray-600">Completed</span>
                                 <span className="font-bold text-green-600">0</span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 w-0 rounded-full"></div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>

            {/* Quick Notes (Bottom Left) */}
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Notes</h3>
                <textarea 
                    className="w-full h-24 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    placeholder="Type a quick note here..."
                ></textarea>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-400">Press Ctrl+Enter to save</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Clear</button>
                        <button className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 shadow-sm">Save Note</button>
                    </div>
                </div>
            </div>

        </div>

        {/* Right Column: Persistent My Notes */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col h-full lg:min-h-[600px]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-500" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Notes</h2>
                </div>
                <button className="text-xs text-red-500 hover:underline">Clear All</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Sample Note from Screenshot */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">hii</p>
                    <p className="text-[10px] text-gray-400 mt-2">Jan 4, 2026 • 03:28 PM</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-400">1 note saved • Cloud storage</p>
            </div>
        </div>

      </div>
    </div>
  );
}

// Icon helper
function FileText({ className, size }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
    )
}
