"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations/services/hospitalAdmin.service";
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Calendar, 
  Activity,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  MapPin,
  Mail,
  Phone
} from "lucide-react";

export default function HospitalAdminPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await hospitalAdminService.getPatients();
      setPatients(data.patients || []);
    } catch (error: any) {
      console.error("Failed to fetch patients:", error);
      toast.error(error.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mobile?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling Patient Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Clinical Demographics</h1>
           <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Registry Ledger: {patients.length} Active Profiles</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
              Database Integrity: Optimal
           </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Registered", value: patients.length, icon: Users, color: "blue" },
           { label: "Growth Rate", value: "+12.4%", icon: TrendingUp, color: "emerald" },
           { label: "Operational Load", value: "Balanced", icon: Activity, color: "amber" }
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl flex items-center justify-center text-${stat.color}-600`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
           </div>
         ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
             <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Translate query into patient identification..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
             />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
             <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                <Filter className="w-4 h-4" /> Filter Matrix
             </button>
          </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-blue-500 transition-all flex flex-col overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
             
             <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none group-hover:scale-110 transition-transform">
                   <User size={28} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-tight">{patient.name}</h3>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md inline-block mt-1">ID: {patient._id.slice(-8).toUpperCase()}</p>
                </div>
             </div>

             <div className="space-y-4 flex-1 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                      <Mail size={14} />
                   </div>
                   <span className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">{patient.email || "No digital registry"}</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                      <Phone size={14} />
                   </div>
                   <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{patient.mobile || "No mobile telelink"}</span>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <div className="text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Interaction Count</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{patient.totalAppointments || 0}</p>
                   </div>
                   <div className="w-px h-8 bg-gray-100 dark:bg-gray-700" />
                   <div className="text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Transmission</p>
                      <p className="text-xs font-black text-blue-600">
                        {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString() : 'Initial State'}
                      </p>
                   </div>
                </div>

                <button className="w-full py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-between px-6 hover:bg-blue-600 hover:text-white transition-all group/btn">
                   Execute Deep Profile Audit <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
             </div>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
             <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-gray-200 w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tight">Empty Registry Segment</h3>
             <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">No profiles detected within the specified search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

