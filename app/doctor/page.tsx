import React from 'react';
import Link from 'next/link';
import {
   Users,
   Calendar,
   Megaphone,
   User,
   Bell
} from 'lucide-react';
import {
   getDoctorDashboardAction,
   getDoctorProfileAction,
   getQuickNotesAction
} from '@/lib/integrations';
import DoctorDashboardCharts from '@/components/doctor/DoctorDashboardCharts';
import QuickNotesInput from '@/components/doctor/QuickNotesInput';
import DoctorNotesList from '@/components/doctor/DoctorNotesList';

export default async function DoctorDashboard() {
   // Parallel data fetching
   const dashboardReq = getDoctorDashboardAction();
   const meReq = getDoctorProfileAction();
   const notesReq = getQuickNotesAction();

   const [dashboardRes, meRes, notesRes] = await Promise.all([
      dashboardReq,
      meReq,
      notesReq
   ]);

   const dashboard = dashboardRes.success && dashboardRes.data ? dashboardRes.data : null;
   const doctorName = meRes.success && meRes.data?.user?.name ? meRes.data.user.name : 'Doctor';

   // Extract Stats
   const stats = dashboard?.stats || {
      totalPatients: 0,
      appointmentsToday: 0,
      pendingReports: 0,
      consultationsValue: 0
   };

   const appointments = dashboard?.appointments || [];
   const notes = notesRes.success && notesRes.data ? notesRes.data : [];

   return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</h1>
               <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your upcoming care and quick actions.</p>
            </div>
            <div className="flex items-center gap-3">
               <Link href="/doctor/appointments/next" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                  <User size={16} /> Next Patient
               </Link>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Live Queue & Charts */}
            <div className="lg:col-span-2 space-y-8">
               {/* Consultation Analysis Chart */}
               <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                     <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Consultation Flow Analysis</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time throughput metrics</p>
                     </div>
                     <div className="flex bg-gray-50 dark:bg-gray-700/50 p-1 rounded-xl">
                        <button className="px-4 py-1.5 bg-white dark:bg-gray-600 shadow-sm text-xs font-black rounded-lg">Weekly</button>
                        <button className="px-4 py-1.5 text-xs font-black text-gray-400">Monthly</button>
                     </div>
                  </div>
                  <div className="h-[300px]">
                     <DoctorDashboardCharts type="area" />
                  </div>
               </div>

               <div className="flex-1 flex items-center justify-center">
                  {appointments.length > 0 ? (
                     <div className="w-full space-y-3">
                        {appointments.slice(0, 3).map((apt: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold shadow-sm">{apt.patientName?.charAt(0) || 'P'}</div>
                                 <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{apt.patientName}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{apt.time} • {apt.type}</p>
                                 </div>
                              </div>
                              <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">Start</span>
                           </div>
                        ))}
                        {appointments.length > 3 && <p className="text-center text-xs text-gray-400 font-medium mt-2">+{appointments.length - 3} more</p>}
                     </div>
                  ) : (
                     <div className="text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-400">No appointments scheduled for today</p>
                     </div>
                  )}
               </div>

               {/* Quick Notes Input */}
               <QuickNotesInput />
            </div>

            {/* Right Column: Summary & Notes */}
            <div className="space-y-6">
               {/* Patient Queue Summary */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Patient Queue</h3>
                  <div className="flex items-center justify-between">
                     <div>
                        <span className="text-4xl font-black text-blue-600 block mb-1">
                           {appointments.length}
                        </span>
                        <span className="text-xs font-medium text-gray-400">Patients Waiting</span>
                     </div>
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
                        <User size={24} />
                     </div>
                  </div>
               </div>

               {/* Today's Summary */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Today's Summary</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                           <span className="text-gray-500 dark:text-gray-400">Total Appointments</span>
                           <span className="text-gray-900 dark:text-white">{stats.appointmentsToday}</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                           <span className="text-gray-500 dark:text-gray-400">Completed</span>
                           <span className="text-green-600">{stats.appointmentsToday}</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Notes List */}
               <div className="h-full">
                  <DoctorNotesList initialNotes={notes} />
               </div>
            </div>
         </div>
      </div>
   );
}