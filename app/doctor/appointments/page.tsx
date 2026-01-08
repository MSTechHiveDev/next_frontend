'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Search, MoreVertical, X } from 'lucide-react';
import { getAllAppointmentsAction } from '@/lib/integrations/actions/doctor.actions';
import toast from 'react-hot-toast';

export default function DoctorAppointmentsPage() {
   const [appointments, setAppointments] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   // Filter States
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState('');
   const [dateFilter, setDateFilter] = useState('');

   useEffect(() => {
      fetchAppointments();
   }, []);

   const fetchAppointments = async () => {
      try {
         const res = await getAllAppointmentsAction();
         if (res.success && res.data) {
            setAppointments(res.data);
         } else {
            toast.error('Failed to load appointments');
         }
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   // Filter Logic
   const filteredAppointments = appointments.filter(apt => {
      // Search
      const matchesSearch =
         (apt.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
         (apt.patientId?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus = statusFilter ? apt.status?.toLowerCase() === statusFilter.toLowerCase() : true;

      // Date
      // Assuming apt.date exists in YYYY-MM-DD or ISO format, or apt.startTime
      let matchesDate = true;
      if (dateFilter) {
         const aptDate = apt.date ? new Date(apt.date).toISOString().split('T')[0] :
            apt.startTime ? new Date(apt.startTime).toISOString().split('T')[0] : '';
         matchesDate = aptDate === dateFilter;
      }

      return matchesSearch && matchesStatus && matchesDate;
   });

   // Date Restrictions (Current Month)
   const now = new Date();
   const currentYear = now.getFullYear();
   const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
   const lastDay = new Date(currentYear, now.getMonth() + 1, 0).getDate();
   const minDate = `${currentYear}-${currentMonth}-01`;
   const maxDate = `${currentYear}-${currentMonth}-${lastDay}`;

   const clearFilters = () => {
      setSearchQuery('');
      setStatusFilter('');
      setDateFilter('');
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
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
         <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
               />
            </div>

            <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium rounded-lg text-sm border border-emerald-100 dark:border-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
               >
                  <option value="">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
               </select>
            </div>

            <div className="relative">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
               <input
                  type="date"
                  value={dateFilter}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-medium rounded-lg text-sm border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
               />
            </div>

            {(searchQuery || statusFilter || dateFilter) && (
               <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
               >
                  <X size={16} /> Clear
               </button>
            )}
         </div>

         {/* Appointments List */}
         <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px]">
            {loading ? (
               <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : filteredAppointments.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Calendar size={48} className="mb-4 opacity-20" />
                  <p>No appointments found</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
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
                        {filteredAppointments.map((apt: any) => (
                           <tr key={apt.id || apt._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                       <Clock size={16} className="text-gray-400" />
                                       {apt.time}
                                    </div>
                                    {apt.date && (
                                       <span className="text-[10px] text-gray-400 ml-6">
                                          {new Date(apt.date).toLocaleDateString()}
                                       </span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 font-bold text-xs capitalize">
                                       {(apt.patientName || '?').charAt(0)}
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
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${apt.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                    apt.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                       apt.status === 'Cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                          'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
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
            )}
         </div>
      </div>
   );
}
