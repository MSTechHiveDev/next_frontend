import React from 'react';
import { 
  Users, 
  Calendar, 
  RefreshCw, 
  Bell, 
  ChevronRight,
  User,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  MoreVertical,
  MousePointer2,
  TrendingUp,
  BrainCircuit,
  PieChart as PieChartIcon,
  Megaphone
} from 'lucide-react';
import { getDoctorDashboardAction, getMyAnnouncementsAction } from '@/lib/integrations';
import { getMeAction as getAuthMeAction } from '@/lib/integrations/actions/auth.actions';
import DoctorDashboardCharts from '@/components/doctor/DoctorDashboardCharts';

export default async function DoctorDashboard() {
  // Parallel data fetching
  const dashboardReq = getDoctorDashboardAction();
  const annReq = getMyAnnouncementsAction();
  const meReq = getAuthMeAction().catch(() => ({ name: 'Lakshmi Prasad' }));

  const [dashboardRes, annRes, meRes] = await Promise.all([
    dashboardReq,
    annReq,
    meReq
  ]);

  const dashboard = dashboardRes.success ? dashboardRes.data : null;
  const announcements = annRes.success ? annRes.data.announcements : [];
  const stats = dashboard?.stats || {
    totalPatients: 0,
    todayAppointments: 0,
    pendingConsultations: 0,
    completedToday: 0
  };
  const appointments = dashboard?.appointments || [];
  const doctorName = (meRes as any)?.user?.name || (meRes as any)?.name || 'Lakshmi Prasad';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Premium Header / Welcome Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-emerald-200 dark:shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none">Medical Intelligence v4.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Good Morning, Dr. {doctorName.split(' ')[0]}!</h1>
            <p className="text-emerald-50 text-lg font-bold opacity-80 max-w-xl">Your expertise is key to today's operations. You have <span className="text-white underline underline-offset-4">{appointments.length} patients</span> scheduled for the next clinical cycle.</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
               <button className="px-8 py-4 bg-white text-emerald-800 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-emerald-950/20 flex items-center gap-2 group">
                  <User size={18} className="group-hover:rotate-12 transition-transform" /> START CONSULTATION
               </button>
               <button className="px-8 py-4 bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 text-white rounded-2xl font-black text-sm hover:bg-emerald-500/50 transition-all flex items-center gap-2">
                  <Bell size={18} /> CRITICAL ALERTS
               </button>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
             <div className="w-px h-24 bg-white/20" />
             <div className="space-y-4">
                <div className="text-center">
                   <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Clinic Pulse</p>
                   <p className="text-3xl font-black">98.4%</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Efficiency</p>
                   <p className="text-3xl font-black">Optimum</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Advanced Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-8 px-4">
        {[
          { label: "Today's Consults", value: appointments.length, icon: Calendar, color: "blue", trend: "+12%" },
          { label: "Pending Review", value: stats.pendingConsultations || 0, icon: AlertCircle, color: "rose", trend: "High" },
          { label: "Patients History", value: stats.totalPatients || 0, icon: Users, color: "amber", trend: "Growth" },
          { label: "Daily Success", value: "92%", icon: TrendingUp, color: "emerald", trend: "Stable" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl shadow-gray-100 dark:shadow-none border border-gray-50 dark:border-gray-700 group hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600 uppercase`}>{stat.trend}</span>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Queue & Charts */}
        <div className="lg:col-span-2 space-y-8">
           {/* Consultation Analysis Chart */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                 <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Consultation Flow Analysis</h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time throughput metrics</p>
                 </div>
                 <div className="flex bg-gray-50 dark:bg-gray-700/50 p-1 rounded-xl">
                    <button className="px-4 py-1.5 bg-white dark:bg-gray-600 shadow-sm text-xs font-black rounded-lg">Weekly</button>
                    <button className="px-4 py-1.5 text-xs font-black text-gray-400">Monthly</button>
                 </div>
              </div>
              <div className="h-[300px]">
                 <DoctorDashboardCharts type="area" />
              </div>
           </div>

           {/* Live Patient Queue */}
           <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Current Operational Queue</h3>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Live patient stream</p>
                </div>
                <button className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all">
                   <Clock size={20} />
                </button>
             </div>
             
             <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {appointments.length > 0 ? appointments.slice(0, 5).map((apt: any, idx: number) => (
                  <div key={idx} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-all group">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 font-black group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all duration-500">
                              {apt.patientName?.charAt(0) || 'P'}
                           </div>
                           <div>
                              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{apt.patientName}</h4>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{apt.time} • {apt.type || 'Standard Checkup'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                              {idx === 0 ? 'Next in line' : 'Queued'}
                           </span>
                           <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                              PROCEED
                           </button>
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-600">
                       <Calendar className="text-gray-300 w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-black text-gray-300 italic">No Active Transmissions</h4>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Clinical queue is currently depleted</p>
                  </div>
                )}
             </div>
           </div>
        </div>

        {/* Right Column: AI Assistant & Notes */}
        <div className="space-y-8">
           {/* Medical AI Brain Widget */}
           <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
              <BrainCircuit className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10">
                 <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                    <BrainCircuit size={20} />
                 </div>
                 <h3 className="text-xl font-black italic tracking-tight mb-2 uppercase">AI Diagnostic Helper</h3>
                 <p className="text-xs font-bold text-indigo-100 opacity-80 leading-relaxed">System is ready to analyze patient symtomology and generate preliminary treatment protocols.</p>
                 <button className="w-full mt-8 py-3 bg-white text-indigo-700 rounded-2xl text-xs font-black uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                    Initialize AI <ArrowUpRight size={14} />
                 </button>
              </div>
           </div>

           {/* Hospital Announcements Widget */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Broadcasts</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Hospital Directives</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                       <Megaphone size={18} />
                    </div>
                 </div>

                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {announcements.length > 0 ? announcements.map((ann: any) => (
                       <div key={ann._id} className={`p-4 rounded-2xl border ${ann.priority === 'high' ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/30' : 'bg-gray-50 border-gray-100 dark:bg-gray-700/30 dark:border-gray-600/30'}`}>
                          <div className="flex items-center justify-between mb-2">
                             <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ann.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{ann.priority}</span>
                             <span className="text-[9px] font-bold text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase mb-1">{ann.title}</h4>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed">{ann.content}</p>
                       </div>
                    )) : (
                       <div className="py-12 text-center">
                          <p className="text-[10px] font-black text-gray-300 uppercase italic">No active broadcasts</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Professional Notes Matrix */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[350px]">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Memoranda</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">v2.1 Synchronized</p>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                 <div className="p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100/50 dark:border-gray-600/30 group">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">Review the new clinical guidelines for robotic-assisted orthopedic surgeries.</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <textarea 
                    className="w-full h-20 p-5 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-xs font-bold placeholder:text-gray-400"
                    placeholder="New insight..."
                 ></textarea>
                 <button className="w-full py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 dark:shadow-none">
                    COMMIT ARCHIVE
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
