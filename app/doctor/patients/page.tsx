import React from 'react';
import { Search, ChevronRight, User } from 'lucide-react';
import { getRecentPatientsAction } from '@/lib/integrations';

export default async function DoctorPatientsPage() {
  const { data: patients } = await getRecentPatientsAction();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
          <p className="text-gray-500 mt-1">View and manage patient health records.</p>
        </div>
      </div>

      <div className="relative max-w-md">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input 
           type="text" 
           placeholder="Search patients by name, MRN, or condition..." 
           className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients?.map((patient) => (
          <div key={patient.id} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group cursor-pointer">
             <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                   <User size={24} />
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-mono rounded-md">
                   {patient.id}
                </span>
             </div>
             
             <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{patient.name}</h3>
             <p className="text-sm text-gray-500 mb-4">{patient.age} Yrs • {patient.gender}</p>

             <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Condition</span>
                   <span className="font-medium text-gray-900 dark:text-white">{patient.condition}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Last Visit</span>
                   <span className="font-medium text-gray-900 dark:text-white">{patient.lastVisit}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
