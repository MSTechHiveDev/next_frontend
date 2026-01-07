'use client';

import React from "react";
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Clock
} from "lucide-react";
import { helpdeskData } from "@/lib/integrations/data/helpdesk";
import { Card } from "@/components/admin";
import { useRouter } from "next/navigation";
import { useHelpdeskStore } from "@/stores/helpdeskStore";

export default function HelpdeskDashboard() {
  const router = useRouter();
  const { stats: initialStats, emergencyRequests } = helpdeskData;
  const { patients, appointments } = useHelpdeskStore();

  // Calculate dynamic stats
  const stats = {
      ...initialStats,
      todayPatients: patients.length + initialStats.todayPatients, // Demo logic: adding store count to base
      pendingAppointments: appointments.filter(a => a.status === 'Scheduled').length
  };

  const statCards = [
    { label: "Today's Patients", value: stats.todayPatients, icon: <Users className="text-blue-500" />, trend: "+12%" },
    { label: "Appointments", value: stats.pendingAppointments, icon: <Calendar className="text-purple-500" />, trend: "5 pending" },
    { label: "Active Transits", value: stats.activeTransits, icon: <Activity className="text-orange-500" />, trend: "Real-time" },
    { label: "Emergencies", value: stats.emergencyCases, icon: <AlertTriangle className="text-red-500" />, trend: "Requires Action" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HelpDesk Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage patient registrations and daily hospital operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-6 hover:shadow-xl transition-all duration-300 border-none bg-white dark:bg-[#111] shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patient Registrations */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Registrations</h2>
            <button className="text-sm text-blue-600 hover:underline">View All</button>
          </div>
           <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
             <div className="divide-y divide-gray-100 dark:divide-gray-800">
               {patients.slice(0, 5).map((patient: any) => (
                <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.gender}, {patient.age} yrs • {patient.contact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{new Date(patient.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <ArrowUpRight size={16} className="text-gray-300 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Appointments</h2>
            <button className="text-sm text-blue-600 hover:underline">View Schedule</button>
          </div>
           <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
             <div className="divide-y divide-gray-100 dark:divide-gray-800">
               {appointments.map((apt) => (
                <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Clock size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{apt.patientName}</p>
                      <p className="text-xs text-gray-500">with <span className="text-gray-700 dark:text-gray-300 font-medium">{apt.doctorName}</span> • {apt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {new Date(apt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Section Tag */}
      {emergencyRequests.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-400">Emergency Request Incoming</h3>
              <p className="text-sm text-red-700 dark:text-red-500/80">{emergencyRequests[0].patientName} - {emergencyRequests[0].condition}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/helpdesk/emergency-accept')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
          >
            Accept Now
          </button>
        </div>
      )}
    </div>
  );
}