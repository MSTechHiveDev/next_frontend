import React from 'react';
import {
   Users,
   Calendar,
   Megaphone,
   User,
   Bell
} from 'lucide-react';
import {
   getDoctorDashboardAction,
   getQuickNotesAction,
   getDoctorProfileAction
} from '@/lib/integrations/actions/doctor.actions';
import QuickNotesInput from '@/components/doctor/QuickNotesInput';
import DoctorNotesList from '@/components/doctor/DoctorNotesList';
import Link from 'next/link';

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
   // meRes.data is the profile object (DoctorProfile), which has a user object
   // If getDoctorMeAction returns the profile, meRes.data.user.name is the name
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
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Welcome, {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</h1>
               <p className="text-gray-500 text-sm mt-1">Here's your upcoming care and quick actions.</p>
            </div>
            <div className="flex items-center gap-3">
               <Link href="/doctor/appointments/next" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                  <User size={16} /> Next Patient
               </Link>
               
            </div>
         </div>

         {/* Dashboard Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column (Main Stats + Input) */}
            <div className="lg:col-span-3 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Today Appointments (Wide) */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
                     <div className="flex justify-between items-start mb-8">
                        <h3 className="text-lg font-bold text-gray-900">Today Appointments</h3>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{appointments.length} Today</span>
                     </div>

                     <div className="flex-1 flex items-center justify-center">
                        {appointments.length > 0 ? (
                           <div className="w-full space-y-3">
                              {appointments.slice(0, 3).map((apt: any, i: number) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 font-bold shadow-sm">{apt.patientName.charAt(0)}</div>
                                       <div>
                                          <h4 className="font-bold text-gray-900">{apt.patientName}</h4>
                                          <p className="text-xs text-gray-500">{apt.time} • {apt.type}</p>
                                       </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">Start</span>
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
                  </div>

                  {/* Summary Stack */}
                  <div className="space-y-6">
                     {/* Patient Queue */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Patient Queue</h3>
                        <div className="flex items-center justify-between">
                           <div>
                              <span className="text-4xl font-black text-blue-600 block mb-1">
                                 {appointments.length}
                              </span>
                              <span className="text-xs font-medium text-gray-400">Patients Waiting</span>
                           </div>
                           <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                              <User size={24} />
                           </div>
                        </div>
                     </div>

                     {/* Today's Summary */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                        <h3 className="text-sm font-bold text-gray-900 mb-6">Today's Summary</h3>

                        <div className="space-y-6">
                           <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                 <span className="text-gray-500">Total Appointments</span>
                                 <span className="text-gray-900">{stats.appointmentsToday}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                           </div>

                           <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                 <span className="text-gray-500">Completed</span>
                                 <span className="text-green-600">{stats.appointmentsToday}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }}></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quick Notes Input */}
               <QuickNotesInput />
            </div>

            {/* Right Column (Notes List) */}
            <div className="h-full">
               <DoctorNotesList initialNotes={notes} />
            </div>
         </div>
      </div>
   );
}
