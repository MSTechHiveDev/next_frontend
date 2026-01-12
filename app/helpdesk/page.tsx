"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  Stethoscope, 
  ChevronRight, 
  Activity, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Filter,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { helpdeskService } from "@/lib/integrations/services/helpdesk.service";
import { toast } from "react-hot-toast";

export default function HelpdeskDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const fetchDashboardData = async () => {
    try {
      const [dashData, docsData] = await Promise.all([
        helpdeskService.getDashboard(),
        helpdeskService.getDoctors()
      ]);
      setDashboardData(dashData);
      setAppointments(dashData.appointments || []);
      // Filter out invalid/placeholder doctor records
      const cleanDocs = (docsData || []).filter((doc: any) => {
        const name = doc.user?.name || doc.name;
        return name && 
               name.toLowerCase() !== 'unknown' && 
               name.toLowerCase() !== 'unknown doctor' && 
               name.toLowerCase() !== 'unknown physician';
      });
      setAllDoctors(cleanDocs);
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getDoctorQueues = () => {
    const counts: Record<string, { count: number, id: string, specialty?: string }> = {};
    
    allDoctors.forEach((doc) => {
      const name = doc.user?.name || doc.name || "Unknown Doctor";
      counts[name] = { 
        count: 0, 
        id: doc._id || doc.id,
        specialty: doc.specialties?.[0] || doc.department
      };
    });

    appointments.forEach((apt) => {
      if (['Booked', 'pending', 'confirmed'].includes(apt.status)) {
        const docName = apt.doctorName;
        // Only count if appointment is assigned to a valid doctor name
        if (docName && docName.toLowerCase() !== 'unknown doctor' && docName.toLowerCase() !== 'unknown physician') {
            if (counts[docName]) {
              counts[docName].count++;
            }
        }
      }
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count); 
  };

  const doctorQueues = getDoctorQueues();

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Helpdesk Dashboard
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">CureChain Health / Front Desk Portal</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 transition-all shadow-sm active:scale-95"
            aria-label="Refresh Dashboard"
          >
            <RefreshCw size={18} />
          </button>
          <Link 
            href="/helpdesk/patient-registration"
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/20"
          >
            <Plus size={16} /> Register Patient
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <StatCard 
          icon={<Users size={20} />} 
          title="Total Patients" 
          value={stats.totalPatients || 0} 
          trend="In Registry"
          color="slate"
        />
        <StatCard 
          icon={<Calendar size={20} />} 
          title="Today's Patients" 
          value={stats.todayPatients || 0} 
          trend="Live Now"
          color="teal"
        />
        <StatCard 
          icon={<AlertCircle size={20} />} 
          title="Emergency Cases" 
          value={stats.emergencyCases || 0} 
          trend="Critical"
          color="rose"
        />
        <StatCard 
          icon={<CheckCircle2 size={20} />} 
          title="Completed" 
          value={stats.completedToday || 0} 
          trend="Discharged"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
        
        {/* DOCTOR QUEUES (LEFT SIDE) */}
        <div className="md:col-span-1 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Doctors</h2>
            <div className="flex items-center gap-1 text-[8px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-widest border border-teal-100">
              Live Tracker
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {doctorQueues.length > 0 ? doctorQueues.map((doc, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-teal-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    doc.count > 0 ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-300'
                  }`}>
                    <Stethoscope size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight truncate max-w-[120px]">{doc.name}</h4>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                      {doc.specialty || "General Medicine"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className={`text-xl font-bold tabular-nums transition-colors ${
                    doc.count > 3 ? 'text-rose-600' : doc.count > 0 ? 'text-teal-600' : 'text-slate-200'
                  }`}>
                    {doc.count}
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Waiting</span>
                </div>
              </div>
            )) : (
              <div className="bg-slate-50/50 p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
                <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">No Doctors Available</p>
              </div>
            )}
          </div>
        </div>

        {/* APPOINTMENT LIST (RIGHT SIDE) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[525px]">
            
            {/* TABS & SEARCH */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === 'active' ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Waiting
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === 'history' ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter appointments..." 
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-tight outline-none w-full focus:border-teal-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* LIST CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50 px-2">
              {appointments.filter(a => activeTab === 'history' ? ['Completed', 'cancelled', 'no-show'].includes(a.status) : !['Completed', 'cancelled', 'no-show'].includes(a.status)).length > 0 ? (
                <>
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-1 border-r border-slate-100">#</div>
                    <div className="col-span-5">Patient Details</div>
                    <div className="col-span-3">Assigned Doctor</div>
                    <div className="col-span-3 text-right">Actions</div>
                  </div>
                  {appointments
                    .filter(a => activeTab === 'history' ? ['Completed', 'cancelled', 'no-show'].includes(a.status) : !['Completed', 'cancelled', 'no-show'].includes(a.status))
                    .map((apt, idx) => (
                    <div key={idx} className="p-6 grid grid-cols-1 sm:grid-cols-12 items-center gap-4 hover:bg-slate-50 transition-all group rounded-xl">
                      <div className="col-span-1 border-r border-slate-100">
                        <span className="text-[10px] font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                      </div>
                      
                      <div className="col-span-5 flex items-center gap-4 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-all ${
                          apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white group-hover:scale-105'
                        }`}>
                          {(apt.patientName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">
                            {apt.patientName || "Unknown Patient"}
                          </h4>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest mt-1 inline-block ${
                            apt.type?.toLowerCase() === 'emergency' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500 border border-transparent'
                          }`}>
                            {apt.type || 'Standard'} • {apt.time || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <Stethoscope size={14} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate">
                            {apt.doctorName || "Pending Assign"}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center gap-3 justify-end">
                        {['Booked', 'pending'].includes(apt.status) ? (
                          <button 
                            onClick={async () => {
                              try {
                                await helpdeskService.updateAppointmentStatus(apt.id || apt._id, 'confirmed');
                                toast.success("Appointment sent to doctor");
                                fetchDashboardData();
                              } catch (err: any) {
                                toast.error("Update Failed");
                              }
                            }}
                            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md active:scale-95"
                          >
                            Send to Doctor
                          </button>
                        ) : (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${
                            apt.status === 'confirmed' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                            apt.status === 'Completed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {apt.status === 'confirmed' ? (
                              <><CheckCircle2 size={12} /> IN SESSION</>
                            ) : apt.status.toUpperCase()}
                          </div>
                        )}
                        <button className="p-2 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100">
                    <Activity size={32} className="text-slate-200" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">No Appointments</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Everything is clear on the schedule</p>
                </div>
              )}
            </div>
            
            {/* FOOTER */}
            <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between px-8">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">System Status: Online</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Facility: {stats.hospitalName || "Hospital Main"}</p>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, title, value, trend, color }: any) {
  const colors: any = {
    teal: "bg-teal-600 text-white shadow-teal-500/10",
    slate: "bg-slate-900 text-white shadow-slate-900/10",
    rose: "bg-rose-600 text-white shadow-rose-500/10",
    emerald: "bg-emerald-600 text-white shadow-emerald-500/10"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all group flex flex-col gap-6 hover:border-teal-500/30">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]} transition-all group-hover:scale-110 shadow-lg`}>
          {React.cloneElement(icon, { size: 18, strokeWidth: 3 })}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[8px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase border border-teal-100">
             <Activity size={10} className="animate-pulse" /> Live
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{value}</h3>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{trend}</p>
        </div>
      </div>
    </div>
  );
}