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
   User,
   Building,
   Filter,
   Search,
   MoreHorizontal,
   ArrowRight,
   ShieldAlert,
   CalendarDays,
   CheckCircle,
   ClipboardList
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
   pending: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "Pending Review" },
   approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Approved" },
   rejected: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", label: "Rejected" },
   cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-100", label: "Cancelled" }
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

export default function HospitalAdminLeaves() {
   const [leaves, setLeaves] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [filterStatus, setFilterStatus] = useState("all");
   const [filterRole, setFilterRole] = useState("all");
   const [searchTerm, setSearchTerm] = useState("");
   const [processingId, setProcessingId] = useState<string | null>(null);

   useEffect(() => {
      fetchLeaves();
   }, []);

   const fetchLeaves = async () => {
      try {
         const data = await adminService.getLeavesClient();
         setLeaves(data.leaves || []);
      } catch (error: any) {
         console.error("Failed to fetch leaves:", error);
         toast.error(error.message || "Failed to load leave requests");
      } finally {
         setLoading(false);
      }
   };

   const handleStatusUpdate = async (leaveId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
      setProcessingId(leaveId);
      try {
         await adminService.updateLeaveStatusClient(leaveId, {
            status,
            rejectionReason: status === 'rejected' ? rejectionReason : undefined
         });
         toast.success(`Leave request ${status} successfully`);
         setLeaves(prev => prev.map(leave =>
            leave._id === leaveId ? { ...leave, status, rejectionReason } : leave
         ));
      } catch (error: any) {
         console.error("Failed to update leave status:", error);
         toast.error(error.message || "Failed to update leave status");
      } finally {
         setProcessingId(null);
      }
   };

   const filteredLeaves = leaves.filter(leave => {
      const matchesStatus = filterStatus === "all" || leave.status === filterStatus;

      const role = leave.requester?.role || leave.applicant?.type;
      const matchesRole = filterRole === "all" || role === filterRole;

      const name = (leave.requester?.name || leave.applicant?.name || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesRole && matchesSearch;
   });

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Leave Governance</h1>
               <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Registry: {leaves.length} Applications Detected</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={fetchLeaves} className="p-3 bg-white dark:bg-gray-800 text-gray-400 rounded-2xl border border-gray-100 dark:border-gray-700 hover:text-blue-500 transition-all shadow-sm">
                  <Clock className="w-5 h-5" />
               </button>
               <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Automated<br />Workflow v2.4</p>
            </div>
         </div>

         {/* Stats Summary */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                     <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Applications</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{leaves.length}</h3>
                  </div>
               </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Review</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{leaves.filter(l => l.status === 'pending').length}</h3>
                  </div>
               </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                     <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved Today</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{leaves.filter(l => l.status === 'approved').length}</h3>
                  </div>
               </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600">
                     <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Denied / Blocked</p>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white">{leaves.filter(l => l.status === 'rejected').length}</h3>
                  </div>
               </div>
            </div>
         </div>

         {/* Filter Bar */}
         <div className="bg-white dark:bg-gray-800 p-5 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full lg:w-auto">
               <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
               <input
                  type="text"
                  placeholder="Search applicant nomenclature..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-44">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                     value={filterRole}
                     onChange={(e) => setFilterRole(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                     <option value="all">All Roles</option>
                     <option value="doctor">Doctors</option>
                     <option value="staff">Medical Staff</option>
                  </select>
               </div>
               <div className="relative flex-1 lg:w-44">
                  <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                     <option value="all">Global (All States)</option>
                     <option value="pending">Pending Filter</option>
                     <option value="approved">Approved Filter</option>
                     <option value="rejected">Rejected Filter</option>
                  </select>
               </div>
               <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-blue-500 transition-all">
                  <CalendarDays className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* Leave Requests Grid */}
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Querying central ledger...</p>
            </div>
         ) : filteredLeaves.length === 0 ? (
            <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
               <Calendar className="mx-auto mb-6 text-gray-200" size={64} />
               <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic">Calm Horizon</h3>
               <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">No active leave applications found in the selected matrix.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredLeaves.map((leave) => (
                  <div key={leave._id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col group hover:border-blue-500 transition-all relative overflow-hidden">

                     {/* Card Header */}
                     <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none">
                              <User size={24} />
                           </div>
                           <div>
                              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                 {leave.requester?.name || leave.applicant?.name || "Anonymous User"}
                              </h3>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                 {leave.requester?.role === 'doctor' ? 'Doctor' :
                                    leave.requester?.role === 'staff' ? 'Medical Staff' :
                                       leave.requester?.role?.replace('-', ' ') || 'Registered User'}
                              </p>
                           </div>
                        </div>
                        <button className="text-gray-300 hover:text-gray-600 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all">
                           <MoreHorizontal size={20} />
                        </button>
                     </div>

                     {/* Leave Metadata */}
                     <div className="flex-1 space-y-6">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Application Category</p>
                           <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                              {LEAVE_TYPE_LABELS[leave.leaveType as keyof typeof LEAVE_TYPE_LABELS] || leave.leaveType}
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 h-[100px] items-center">
                           <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Temporal Range</p>
                              <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                                 {new Date(leave.startDate).toLocaleDateString()}<br />
                                 <span className="text-gray-400">to</span><br />
                                 {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                           </div>
                           <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex flex-col items-center justify-center">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Duration</p>
                              <p className="text-xl font-black text-blue-600 leading-none">
                                 {leave.numberOfDays || leave.duration || (
                                    Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                                 )}D
                              </p>
                           </div>
                        </div>

                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject Justification</p>
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 italic line-clamp-3 leading-relaxed">
                              "{leave.reason}"
                           </p>
                        </div>
                     </div>

                     {/* Card Footer */}
                     <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700 space-y-4">
                        <div className="flex items-center justify-between">
                           <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border ${STATUS_CONFIG[leave.status as keyof typeof STATUS_CONFIG]?.bg} ${STATUS_CONFIG[leave.status as keyof typeof STATUS_CONFIG]?.color} ${STATUS_CONFIG[leave.status as keyof typeof STATUS_CONFIG]?.border}`}>
                              {React.createElement(STATUS_CONFIG[leave.status as keyof typeof STATUS_CONFIG]?.icon || AlertCircle, { size: 12 })}
                              {STATUS_CONFIG[leave.status as keyof typeof STATUS_CONFIG]?.label || leave.status}
                           </div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {new Date(leave.createdAt).toLocaleDateString()}
                           </span>
                        </div>

                        {leave.status === 'pending' ? (
                           <div className="flex gap-2 pt-2">
                              <button
                                 onClick={() => handleStatusUpdate(leave._id, 'approved')}
                                 disabled={processingId === leave._id}
                                 className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                              >
                                 Approve
                              </button>
                              <button
                                 onClick={() => {
                                    const reason = prompt("State rejection protocol justification:");
                                    if (reason) handleStatusUpdate(leave._id, 'rejected', reason);
                                 }}
                                 disabled={processingId === leave._id}
                                 className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50"
                              >
                                 Retract
                              </button>
                           </div>
                        ) : (
                           <button className="w-full py-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-between px-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              Audit Application Flow <ArrowRight size={14} />
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}