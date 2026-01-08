"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations/services/hospitalAdmin.service";
import { 
  Users, 
  Building2, 
  Stethoscope, 
  Headphones,
  Calendar,
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Bell,
  MapPin,
  Mail,
  Phone,
  LayoutDashboard
} from "lucide-react";
// @ts-ignore
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function HospitalAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await hospitalAdminService.getDashboard();
      setDashboardData(data);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { hospital, stats } = dashboardData;

  const statCards = [
    { label: "Active Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "blue", trend: "+2.4%" },
    { label: "Helpdesk Assets", value: stats.totalHelpdesk, icon: Headphones, color: "emerald", trend: "+1.2%" },
    { label: "Growth Patient", value: stats.totalPatients, icon: Users, color: "indigo", trend: "+8.5%" },
    { label: "Appointments", value: stats.todayAppointments, icon: Calendar, color: "amber", trend: "-0.4%" },
    { label: "Total Flow", value: stats.totalAppointments, icon: Activity, color: "rose", trend: "+12.1%" },
  ];

  const attendanceData = [
    { name: 'Present', value: stats.attendance?.present || 0 },
    { name: 'Absent', value: stats.attendance?.absent || 0 },
    { name: 'On Leave', value: stats.attendance?.onLeave || 0 },
    { name: 'Late', value: stats.attendance?.late || 0 },
  ].filter(d => d.value > 0);

  // Fallback if no attendance data
  if (attendanceData.length === 0) {
    attendanceData.push({ name: 'No Data', value: 1 });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">System Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" /> {hospital?.name || "HMS Portal"} | Operational Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-gray-600 dark:text-gray-400 tracking-widest uppercase">Live Nodes: 124</span>
          </div>
          <button className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
            <LayoutDashboard size={20} />
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-blue-500 transition-all text-gray-900 dark:text-white">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${card.color}-50 dark:bg-${card.color}-900/20 rounded-2xl flex items-center justify-center text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                   <Icon size={24} />
                </div>
                <span className={`text-[10px] font-black ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} bg-${card.trend.startsWith('+') ? 'emerald' : 'rose'}-50 dark:bg-${card.trend.startsWith('+') ? 'emerald' : 'rose'}-900/20 px-2 py-1 rounded-full`}>
                   {card.trend}
                </span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Live Operational Pulse */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white italic tracking-tight uppercase">Live Clinical Pulse</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time patient-doctor throughput</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
               <span className="text-[10px] font-black text-emerald-500 uppercase">System Live</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {dashboardData.liveQueue?.length > 0 ? dashboardData.liveQueue.map((item: any, i: number) => (
               <div key={i} className={`p-5 rounded-3xl border transition-all ${item.status === 'in-progress' ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30' : 'bg-gray-50 dark:bg-gray-700/30 border-transparent'}`}>
                  <div className="flex items-center justify-between mb-4">
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.status === 'in-progress' ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>{item.status}</span>
                     <span className="text-[9px] font-bold text-gray-400">{item.time}</span>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate">{item.patientName}</p>
                     <p className="text-[10px] font-bold text-gray-400 truncate flex items-center gap-1">
                        <Stethoscope size={10} className="text-blue-500" /> {item.doctorName}
                     </p>
                  </div>
               </div>
            )) : (
               <div className="col-span-full py-10 text-center text-gray-400 italic font-bold uppercase text-[10px]">No active clinical transmissions detected</div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Widget */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-xl font-black text-gray-900 dark:text-white">Attendance Pulse</h3>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Real-time presence</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                 <MoreHorizontal size={20} />
              </button>
           </div>

           <div className="h-[250px] w-full relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={attendanceData}
                   cx="50%"
                   cy="50%"
                   innerRadius={65}
                   outerRadius={85}
                   paddingAngle={8}
                   dataKey="value"
                 >
                   {attendanceData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.attendance?.present || 0}</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Present</span>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-1">On Leaves</p>
                 <p className="text-lg font-black text-blue-600">{stats.attendance?.onLeave || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-amber-500/20 transition-all">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Late Registry</p>
                 <p className="text-lg font-black text-amber-600">{stats.attendance?.late || 0}</p>
              </div>
           </div>
           
           <button 
             onClick={() => window.location.href='/hospital-admin/attendance/overview'}
             className="w-full mt-6 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all"
           >
             Detailed Analytics
           </button>
        </div>

        {/* Hospital Identity */}
        <div className="lg:col-span-2 bg-linear-to-br from-indigo-600 to-blue-700 p-10 rounded-4xl text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none">
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                   <Building2 size={32} />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">{hospital.name}</h2>
                <div className="flex items-center gap-2 opacity-80 mb-8">
                   <MapPin size={14} />
                   <span className="text-sm font-bold uppercase tracking-widest">{hospital.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                          <Phone size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Emergency Line</p>
                          <p className="text-lg font-bold">{hospital.phone || "N/A"}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                          <Mail size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Digital Registry</p>
                          <p className="text-lg font-bold truncate max-w-[200px]">{hospital.email || "hms@portal.com"}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col justify-end">
                    <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">System Integrity</span>
                          <span className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-tighter">Secured</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-400 w-[94%]" />
                          </div>
                          <span className="text-xs font-black">94%</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Abstract Design Elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full -ml-48 -mb-48 blur-3xl opacity-30" />
        </div>
      </div>
    </div>
  );
}

