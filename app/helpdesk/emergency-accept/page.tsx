"use client";

import React, { useState, useEffect } from "react";
import { 
    AlertTriangle, 
    Siren, 
    MapPin, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Loader2, 
    ArrowLeft, 
    RefreshCw,
    Activity,
    ShieldAlert
} from "lucide-react";
import { helpdeskEmergencyService } from "@/lib/integrations/services/helpdesk-emergency.service";
import { EmergencyRequest } from "@/lib/integrations/types/emergency";
import toast from "react-hot-toast";
import Link from "next/link";

export default function EmergencyAccept() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  const fetchEmergencies = async () => {
    try {
      const response = await helpdeskEmergencyService.getHospitalEmergencyRequests();
      setEmergencies(response.requests);
    } catch (error: any) {
      if (loading) toast.error("Emergency Grid Offline");
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      if (status === 'accepted') {
        await helpdeskEmergencyService.acceptRequest(id, "Accepted from Response Center");
        toast.success("Deployment Confirmed");
      } else if (status === 'rejected') {
        await helpdeskEmergencyService.rejectRequest(id, "Deferred by Helpdesk");
        toast.success("Request Deferred");
      }
      fetchEmergencies();
    } catch (error: any) {
      toast.error("Operation Sequence Interrupted");
    }
  };

  if (loading && emergencies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Awaiting Critical Signal...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = emergencies.filter(e => e.status === 'pending');
  const activeResponses = emergencies.filter(e => e.status === 'accepted');
  const displayList = activeTab === 'pending' ? pendingRequests : activeResponses;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* PROFESSIONAL HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Delta / Case Reception</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             {activeTab === 'pending' ? 'Emergency Reception' : 'Active Deployments'}
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Hospital Node / Critical Dispatch Control</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === 'pending' 
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Pending ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === 'active' 
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Active ({activeResponses.length})
                </button>
            </div>
            <button onClick={fetchEmergencies} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 transition-all shadow-sm" aria-label="Refresh Grid">
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      {/* EMERGENCY MANIFEST GRID */}
      <div className="max-w-7xl mx-auto space-y-4">
        {displayList.length > 0 ? displayList.map((req) => (
            <div key={req._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-rose-200">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-md border ${
                            req.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                            Priority: {req.severity}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={12} /> Live Pulse: {new Date(req.createdAt).toLocaleTimeString()}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{req.patientName || "IDENTITY-PENDING"}</h2>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.patientAge}Y • {req.patientGender}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-xs font-bold text-rose-600 uppercase tracking-tight">{req.emergencyType}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                        <StatusBox icon={<MapPin size={14} className="text-slate-400" />} label="Location" value={req.currentLocation} />
                        <StatusBox icon={<Siren size={14} className="text-rose-600" />} label="Field Asset" value={req.ambulancePersonnel?.vehicleNumber} />
                        <StatusBox icon={<Activity size={14} className="text-teal-600" />} label="Real-time Vitals" value={req.vitals ? `${req.vitals.bloodPressure || '-'} BP` : 'NO LINK'} />
                    </div>
                </div>

                <div className="lg:w-72 space-y-2">
                    {req.status === 'pending' ? (
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => handleStatusUpdate(req._id, 'accepted')}
                                className="w-full py-4 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Authorize Admission
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                className="w-full py-2 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-all active:scale-95"
                            >
                                Defer Signal
                            </button>
                        </div>
                    ) : (
                        <div className="w-full py-4 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 italic">
                             <CheckCircle size={16} /> Asset Committed
                        </div>
                    )}
                </div>
            </div>
        )) : (
            <div className="py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Grid Operational. No active critical vectors.</p>
            </div>
        )}
      </div>

    </div>
  );
}

function StatusBox({ icon, label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {icon} {label}
            </p>
            <p className="text-[10px] font-bold text-slate-700 uppercase truncate">{value}</p>
        </div>
    );
}
