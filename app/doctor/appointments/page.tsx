import React from 'react';
import { Calendar, Clock, Filter, Search, MoreVertical } from 'lucide-react';
import { getAllAppointmentsAction } from '@/lib/integrations';

export default async function DoctorAppointmentsPage() {
  const { data: appointments } = await getAllAppointmentsAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your schedule and patient consultations.</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/20">
          + New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex gap-4 overflow-x-auto">
        <div className="relative flex-1 min-w-[200px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Search by patient name or ID..." 
             className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
           />
        </div>
        <button className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium rounded-lg text-sm flex items-center gap-2 whitespace-nowrap border border-emerald-100 dark:border-emerald-800">
           <Filter size={16} /> Filter by Status
        </button>
        <button className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-medium rounded-lg text-sm flex items-center gap-2 whitespace-nowrap border border-gray-200 dark:border-gray-800">
           <Calendar size={16} /> Select Date
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
               <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
               {appointments?.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                           <Clock size={16} className="text-gray-400" />
                           {apt.time}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 font-bold text-xs">
                              {apt.patientName.charAt(0)}
                           </div>
                           <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{apt.patientName}</p>
                              <p className="text-xs text-gray-500">{apt.patientId}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                           {apt.type}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            apt.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            apt.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                           {apt.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                           <MoreVertical size={18} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
