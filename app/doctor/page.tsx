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
import DoctorAppointmentsSection from '@/components/doctor/DoctorAppointmentsSection';

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

               {/* Quick Notes Input */}
               <QuickNotesInput />
            </div>

            {/* Appointments Section with Dynamic Stats */}
            <DoctorAppointmentsSection />

            {/* Notes List */}
            <div className="lg:col-span-3">
               <DoctorNotesList initialNotes={notes} />
            </div>
         </div>
      </div>
   );
}