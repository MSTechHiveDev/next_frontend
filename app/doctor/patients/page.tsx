'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Filter, ArrowRight, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getDoctorPatientsAction } from '@/lib/integrations/actions/doctor.actions';
import { DoctorPatient } from '@/lib/integrations/types/doctor';
import toast from 'react-hot-toast';

export default function PatientsPage() {
   const [patients, setPatients] = useState<DoctorPatient[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [filter, setFilter] = useState('all');

   useEffect(() => {
      loadPatients();
   }, []);

   const loadPatients = async () => {
      setIsLoading(true);
      const { success, data, error } = await getDoctorPatientsAction();
      if (success && data) {
         setPatients(data);
      } else {
         toast.error(error || "Failed to load patients");
      }
      setIsLoading(false);
   };

   const filteredPatients = patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (patient.condition && patient.condition.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
   });

   if (isLoading) {
      return (
         <div className="flex h-[50vh] items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         {/* Header */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
               <p className="text-gray-500 text-sm mt-1">View and manage patient health records.</p>
            </div>
         </div>

         {/* Filters & Search */}
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Search patients by name, MRN, or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
               />
            </div>

         </div>

         {/* Patients List */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Demographics</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Visit</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Condition</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                           <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                       {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                                       <p className="text-xs text-gray-500">MRN: {patient.mrn || 'N/A'}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="text-sm text-gray-700">
                                    <p>{patient.age ? `${patient.age} Years` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{patient.gender || 'Unknown'}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(patient.lastVisit).toLocaleDateString()}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 {patient.condition ? (
                                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-100 inline-flex items-center gap-1">
                                       <Activity size={12} /> {patient.condition}
                                    </span>
                                 ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Link href={`/doctor/patients/${patient.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">
                                    <ArrowRight size={16} />
                                 </Link>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center justify-center">
                                 <User size={48} className="text-gray-200 mb-4" />
                                 <p className="text-lg font-medium">No patients found</p>
                                 <p className="text-sm">Try adjusting your search terms.</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
