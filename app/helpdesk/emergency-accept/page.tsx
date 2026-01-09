'use client';

import React, { useState, useEffect } from "react";
import { AlertTriangle, Siren, MapPin, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { helpdeskEmergencyService } from "@/lib/integrations/services/helpdesk-emergency.service";
import { EmergencyRequest } from "@/lib/integrations/types/emergency";
import toast from "react-hot-toast";

export default function EmergencyAccept() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  useEffect(() => {
    fetchEmergencies();
    // Poll for new emergencies every 15 seconds
    const interval = setInterval(fetchEmergencies, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      // Don't show full loader on background refreshes
      const response = await helpdeskEmergencyService.getHospitalEmergencyRequests();
      setEmergencies(response.requests);
    } catch (error: any) {
      console.error("Failed to fetch emergencies:", error);
      // Only show toast on first load or if it's a persistent error
      if (loading) toast.error("Failed to sync emergency data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      if (status === 'accepted') {
        await helpdeskEmergencyService.acceptRequest(id, "Accepted from Response Center");
        toast.success("Emergency case accepted and dispatched");
      } else if (status === 'rejected') {
        await helpdeskEmergencyService.rejectRequest(id, "Deferred by Helpdesk");
        toast.success("Emergency case deferred");
      }
      fetchEmergencies();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  if (loading && emergencies.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse text-rose-500">Connecting to Emergency Grid...</p>
        </div>
    );
  }

  const pendingRequests = emergencies.filter(e => e.status === 'pending');
  // In the new system, we consider 'accepted' as active responses for the hospital
  const activeResponses = emergencies.filter(e => e.status === 'accepted');

  const displayList = activeTab === 'pending' ? pendingRequests : activeResponses;

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-600 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
            <Siren className="text-red-600 animate-pulse" size={28} /> EMERGENCY RESPONSE CENTER
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Immediate action required for priority protocols</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600' : 'text-gray-500'}`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Active ({activeResponses.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayList.length > 0 ? (
          displayList.map((req) => (
            <div key={req._id} className="bg-white dark:bg-[#111] border-2 border-red-500/20 rounded-3xl p-6 shadow-lg shadow-red-500/5 hover:border-red-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getSeverityStyle(req.severity)}`}>
                    {req.severity} Priority
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> {new Date(req.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{req.patientName}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{req.patientAge} years • {req.patientGender}</p>
                  <p className="text-lg text-red-600 dark:text-red-400 font-black uppercase tracking-tight mt-1">{req.emergencyType}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{req.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={18} className="text-blue-500" />
                    <span className="text-xs font-black uppercase tracking-widest">{req.currentLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Siren size={18} className="text-rose-500" />
                    <span className="text-xs font-black uppercase tracking-widest italic">
                      Ambulance: {req.ambulancePersonnel?.vehicleNumber || 'UNIT-01'}
                    </span>
                  </div>
                  {req.eta && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={18} className="text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-widest italic">ETA: {req.eta} Mins</span>
                    </div>
                  )}
                </div>

                {req.vitals && (
                  <div className="flex flex-wrap gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {req.vitals.bloodPressure && (
                      <div className="text-[10px] font-bold uppercase tracking-tight"><span className="text-gray-400 mr-1">BP:</span> {req.vitals.bloodPressure}</div>
                    )}
                    {req.vitals.heartRate && (
                      <div className="text-[10px] font-bold uppercase tracking-tight"><span className="text-gray-400 mr-1">HR:</span> {req.vitals.heartRate} bpm</div>
                    )}
                    {req.vitals.oxygenLevel && (
                      <div className="text-[10px] font-bold uppercase tracking-tight"><span className="text-gray-400 mr-1">SpO2:</span> {req.vitals.oxygenLevel}%</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 lg:w-72">
                {req.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(req._id, 'rejected')}
                      className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} /> Defer
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req._id, 'accepted')}
                      className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                    >
                      <CheckCircle size={20} /> Dispatch
                    </button>
                  </>
                ) : (
                  <div className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-600 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 italic">
                    <CheckCircle size={20} /> Request Handled
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-gray-300" />
             </div>
             <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No active emergency alerts in this sector.</p>
          </div>
        )}
      </div>
    </div>
  );
}

