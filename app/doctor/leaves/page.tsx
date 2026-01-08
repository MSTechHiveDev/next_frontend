"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/lib/integrations";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  Filter,
  Search,
  MoreHorizontal,
  LayoutGrid,
  List,
  Eye,
  Trash2,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", label: "Awaiting Review" },
  approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", label: "Authorized" },
  rejected: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", label: "Declined" },
  cancelled: { icon: AlertTriangle, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-100", label: "Withdrawn" }
};

const LEAVE_TYPE_LABELS = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  annual: "Annual Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  emergency: "Emergency Leave",
  other: "Other"
};

export default function DoctorLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await adminService.getLeavesClient();
      setLeaves(data.leaves || []);
    } catch (error: any) {
      console.error("Failed to fetch leaves:", error);
      toast.error(error.message || "Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Retrieving Leave Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Leave Governance</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Personnel Flux & Absence Log v4.0</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.href = '/doctor/leave'}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> REQUEST ABSENCE
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Applied", value: leaves.length, icon: FileText, color: "blue", sub: "Lifetime requests" },
         
          { label: "Pending Load", value: leaves.filter(l => l.status === 'pending').length, icon: Clock, color: "amber", sub: "Awaiting clearance" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between mb-4">
               
               
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</h3>
             
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Leave Log */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Absence Chronology</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Registry of all historical and active requests</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative hidden md:block">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all w-64"
                  />
               </div>
               <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-2xl hover:text-emerald-500 transition-all">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Absence Type</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interval Matrix</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Duration</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Index</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rationalization</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {leaves.length > 0 ? leaves.map((leave, idx) => {
                     const config = STATUS_CONFIG[leave.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                     const StatusIcon = config.icon;
                     
                     return (
                        <tr key={leave._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                           <td className="px-8 py-6">
                              <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                 {LEAVE_TYPE_LABELS[leave.leaveType as keyof typeof LEAVE_TYPE_LABELS] || leave.leaveType}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300 italic">
                                    {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                 </span>
                                 <span className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Applied: {new Date(leave.createdAt).toLocaleDateString()}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase text-gray-500">
                                 {leave.numberOfDays} Quantum
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
                                 <StatusIcon size={12} />
                                 {config.label}
                              </div>
                           </td>
                           <td className="px-8 py-6 max-w-xs">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate uppercase tracking-tighter">{leave.reason}</p>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 rounded-xl transition-all">
                                    <Eye size={18} />
                                 </button>
                                 {leave.status === 'pending' && (
                                    <button className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-600 rounded-xl transition-all">
                                       <Trash2 size={18} />
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     );
                  }) : (
                     <tr>
                        <td colSpan={6} className="py-32 text-center">
                           <Calendar className="mx-auto mb-6 text-gray-200" size={64} strokeWidth={1} />
                           <h4 className="text-xl font-black text-gray-300 italic uppercase">Absence Matrix is Void</h4>
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">No personnel absence records found in high-security registry</p>
                           <button 
                             onClick={() => window.location.href = '/doctor/leave'}
                             className="mt-8 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none inline-flex items-center gap-2"
                           >
                              <Plus size={18} /> TRANSMIT FIRST REQUEST
                           </button>
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
