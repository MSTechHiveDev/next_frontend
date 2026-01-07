'use client';

import React, { useState } from "react";
import { AlertTriangle, Siren, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { helpdeskData } from "@/lib/integrations/data/helpdesk";

export default function EmergencyAccept() {
  const { emergencyRequests } = helpdeskData;
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Siren className="text-red-600 animate-pulse" size={28} /> Emergency Response Center
          </h1>
          <p className="text-gray-500">Immediate action required for these critical cases.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600' : 'text-gray-500'}`}
          >
            Pending Requests ({emergencyRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Active Responses
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {emergencyRequests.length > 0 ? (
          emergencyRequests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-[#111] border-2 border-red-500/20 rounded-3xl p-6 shadow-lg shadow-red-500/5 hover:border-red-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-full">High Priority</span>
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Clock size={12} /> Received: {new Date(req.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{req.patientName}</h2>
                  <p className="text-lg text-red-600 dark:text-red-400 font-medium mt-1">{req.condition}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={18} className="text-blue-500" />
                    <span className="text-sm font-semibold">{req.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 lg:w-72">
                <button className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2">
                  <XCircle size={20} /> Defer
                </button>
                <button className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 group-hover:scale-105">
                  <CheckCircle size={20} /> Accept & Start
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-gray-300" />
             </div>
             <p className="text-gray-500 font-bold">No pending emergency alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
