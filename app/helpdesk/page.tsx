'use client';

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Search,
  Plus,
  Bell,
  UserPlus,
  Stethoscope,
  TrendingUp,
  MapPin,
  MoreVertical,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { helpdeskService, type HelpdeskDashboard } from "@/lib/integrations";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function HelpdeskDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<HelpdeskDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQueue, setShowQueue] = useState(true); // Toggle for showing queue with wait times

  useEffect(() => {
    if (isAuthenticated && user?.role === 'hospital-admin') {
      router.push('/hospital-admin');
      return;
    }
    
    if (isAuthenticated && user?.role === 'helpdesk') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.role, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getDashboard();
      console.log('[Helpdesk] Received data from backend:', data);
      console.log('[Helpdesk] Stats:', data.stats);
      console.log('[Helpdesk] Recent patients:', data.recentPatients?.length || 0);
      console.log('[Helpdesk] Appointments:', data.appointments?.length || 0);
      console.log('[Helpdesk] Appointments array:', data.appointments);
      setDashboardData(data);
    } catch (error: any) {
      console.error("[Helpdesk] Failed to fetch dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard statistics");
      setDashboardData({
        stats: {
          totalDoctors: 0,
          totalPatients: 0,
          todayPatients: 0,
          pendingAppointments: 0,
          activeTransits: 0,
          emergencyCases: 0
        },
        recentPatients: [],
        appointments: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Frontier Operations...</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, recentPatients = [], appointments = [] } = dashboardData;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-blue-700 to-indigo-900 rounded-4xl p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest leading-none">Frontline Operations Hub v4.2</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase italic">Front Desk Command</h1>
            <p className="text-blue-100 text-lg font-bold opacity-80 max-w-xl">Efficiency is the heartbeat of this hospital. You have <span className="text-white underline underline-offset-4">{stats.pendingAppointments} pending cycles</span> to manage in the current clinical window.</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
               <button 
                onClick={() => router.push('/helpdesk/patient-registration')}
                className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl flex items-center gap-2 group"
               >
                  <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> NEW REGISTRATION
               </button>
               <button 
                onClick={() => router.push('/helpdesk/appointment-booking')}
                className="px-8 py-4 bg-blue-500/30 backdrop-blur-md border border-blue-400/30 text-white rounded-2xl font-black text-sm hover:bg-blue-500/50 transition-all flex items-center gap-2"
               >
                  <Calendar size={18} /> BOOK SLOT
               </button>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
             <div className="w-px h-24 bg-white/20" />
             <div className="flex flex-col gap-6">
                <div className="text-center">
                   <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Clinic Pulse</p>
                   <p className="text-3xl font-black">ACTIVE</p>
                </div>
                <div className="text-center flex items-center gap-2">
                   <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                   <span className="text-xs font-black uppercase tracking-widest">Sys Ready</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Advanced Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 px-4 relative z-20">
        {[
          { label: "Daily Throughput", value: stats.todayPatients, icon: Users, color: "blue", trend: "+14.2%" },
          { label: "Cycle Backlog", value: stats.pendingAppointments, icon: Clock, color: "amber", trend: "Steady" },
          { label: "Active Transits", value: stats.activeTransits, icon: Activity, color: "emerald", trend: "Live" },
          { label: "Anomalies", value: stats.emergencyCases, icon: AlertTriangle, color: "rose", trend: stats.emergencyCases > 0 ? "Action Required" : "Secure" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 group hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[9px] font-black px-2 py-1 rounded-full bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600 uppercase`}>{stat.trend}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Main Control: Today's Appointments */}
           <div className="bg-white dark:bg-gray-800 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">Operational Queue</h3>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Upcoming Patient Transitions</p>
                </div>
                <div className="flex items-center gap-4">
                   {/* Queue Toggle Switch */}
                   <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-600">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Queue View</span>
                      <button
                        onClick={() => setShowQueue(!showQueue)}
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          showQueue ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          showQueue ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        showQueue ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {showQueue ? 'ON' : 'OFF'}
                      </span>
                   </div>
                   
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="text" placeholder="Search manifest..." className="pl-11 pr-6 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64" />
                   </div>
                </div>
             </div>
             
             <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {showQueue ? (
                  appointments.length > 0 ? appointments.map((apt: any, idx: number) => (
                    <div key={idx} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-all group">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                                {apt.patientName?.charAt(0) || 'P'}
                             </div>
                             <div>
                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg">{apt.patientName}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                                      <Stethoscope size={10} className="inline mr-1" /> {apt.doctorName}
                                   </span>
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {apt.type}
                                   </span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 justify-between md:justify-end">
                              <div className="text-right">
                                 <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                   {apt.time && apt.time !== 'N/A' ? apt.time : (
                                     <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md text-[9px] animate-pulse">IN QUEUE</span>
                                   )}
                                 </p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Est. Duration 20m</p>
                              </div>
                              <div className="flex items-center gap-2">
                                 {["Booked", "pending"].includes(apt.status) ? (
                                   <button 
                                     onClick={async () => {
                                       try {
                                         await helpdeskService.updateAppointmentStatus(apt.id || apt._id, 'confirmed');
                                         toast.success("Patient sent to doctor!");
                                         fetchDashboardData();
                                       } catch (err: any) {
                                         toast.error(err.message || "Failed to send patient");
                                       }
                                     }}
                                     className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                   >
                                     SEND TO DOCTOR
                                   </button>
                                 ) : (
                                   <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                      {apt.status}
                                   </span>
                                 )}
                                 <button className="p-2.5 text-gray-300 hover:text-blue-600 transition-colors">
                                    <ChevronRight size={18} />
                                 </button>
                              </div>
                           </div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-600">
                         <Calendar className="text-gray-200 w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-gray-300 italic tracking-tight uppercase">Manifest Empty</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">No upcoming consultations logged for this window</p>
                    </div>
                  )
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Queue View Disabled</p>
                    <p className="text-xs text-gray-400 mt-1">Toggle ON to see patient queue</p>
                    <div className="mt-4 text-4xl font-black text-gray-300">{appointments.length}</div>
                    <p className="text-xs text-gray-400 mt-1">Appointments hidden</p>
                  </div>
                )}
             </div>
           </div>

           {/* Quick Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between group">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h4 className="text-lg font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">Registration Velocity</h4>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Growth Metrics</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 transition-all group-hover:rotate-12">
                       <TrendingUp size={20} />
                    </div>
                 </div>
                 <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">+{stats.totalPatients}</span>
                    <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                       <ArrowUpRight size={14} /> Total Lifetime
                    </span>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between group">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h4 className="text-lg font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">Resource Load</h4>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personnel Availability</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 transition-all group-hover:rotate-12">
                       <Stethoscope size={20} />
                    </div>
                 </div>
                 <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{stats.totalDoctors}</span>
                    <span className="text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                       Physicians Active
                    </span>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {/* Recent Logged Patients */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Recent Entry</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Profile Detects</p>
                 </div>
                 <button className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all">
                    <Users size={18} />
                 </button>
              </div>
              
              <div className="flex-1 space-y-4">
                 {recentPatients.length > 0 ? recentPatients.slice(0, 4).map((patient: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-blue-100 transition-all flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 font-black shadow-sm">
                          {patient.name?.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase truncate tracking-tight">{patient.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{patient.contact}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{new Date(patient.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       </div>
                    </div>
                 )) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                       <UserPlus size={40} className="text-gray-300 mb-2" />
                       <p className="text-[10px] font-black text-gray-400 uppercase">Registry Quiet</p>
                    </div>
                 )}
              </div>

              <button 
                onClick={() => router.push('/helpdesk/transits')}
                className="w-full mt-8 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-between px-6 group"
              >
                 System Audit Log <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
           </div>

           {/* Hospital Directives Widget (Shared Connectivity) */}
           <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-8 rounded-4xl text-white shadow-xl relative overflow-hidden group">
              <Bell className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10">
                 <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 text-white">
                    <Bell size={20} />
                 </div>
                 <h3 className="text-lg font-black italic tracking-tight mb-2 uppercase">Broadcast Matrix</h3>
                 <p className="text-[11px] font-bold text-blue-100 opacity-80 leading-relaxed uppercase tracking-wider">Synchronized with central administration directives. Review latest tactical updates.</p>
                 <button className="w-full mt-8 py-3 bg-white text-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                    GO TO BROADCASTS
                 </button>
              </div>
           </div>

           {/* Emergency Hot-Link */}
           <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-4xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-pulse">
                    <AlertTriangle size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-rose-900 dark:text-rose-400 uppercase tracking-tighter">Protocols</h4>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Active {stats.emergencyCases} Incidents</p>
                 </div>
              </div>
              <button 
                onClick={() => router.push('/helpdesk/emergency-accept')}
                className="p-3 bg-white rounded-xl text-rose-500 shadow-sm hover:scale-110 transition-transform"
              >
                 <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}