"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, CheckCircle2, Loader2 } from 'lucide-react';
import { doctorService } from '@/lib/integrations/services/doctor.service';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
  createdAt?: string;
  date?: string;
}

interface QueueProps {
  onStatsChange?: (stats: {
    queueCount: number;
    totalAppointments: number;
    completedCount: number;
    estimatedMinutes: number;
    showQueue: boolean;
  }) => void;
}

export default function AppointmentsQueueDynamic({ onStatsChange }: QueueProps) {
  const router = useRouter();
  const [showQueue, setShowQueue] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingReports: 0,
    consultationsValue: 0
  });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response: any = await doctorService.getDashboard();
      console.log('[Queue] Dashboard response:', response);
      console.log('[Queue] Appointments:', response?.appointments);
      console.log('[Queue] Appointments count:', response?.appointments?.length);
      
      if (response?.appointments) {
        console.log('[Queue] Setting appointments:', response.appointments);
        setAppointments(response.appointments || []);
        setStats(response.stats || stats);
      } else {
        console.log('[Queue] No appointments found in response');
      }
    } catch (error: any) {
      console.error('[Queue] Failed to fetch appointments:', error);
      toast.error(error.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter: Show all appointments except completed and cancelled
  // Also show appointments with status "Booked", "confirmed", "scheduled", etc.
  const queueAppointments = appointments.filter(apt => {
    const status = apt.status?.toLowerCase();
    const isExcluded = status === 'completed' || status === 'cancelled';
    console.log('[Queue] Appointment:', apt.patientName, 'Status:', apt.status, 'Excluded:', isExcluded);
    return !isExcluded;
  });

  console.log('[Queue] Total appointments:', appointments.length);
  console.log('[Queue] Queue appointments:', queueAppointments.length);

  // Sort appointments by creation time (queue order)
  const sortedAppointments = [...queueAppointments].sort((a, b) => {
    return new Date(a.createdAt || a.date || 0).getTime() - new Date(b.createdAt || b.date || 0).getTime();
  });

  // Notify parent of stats changes
  useEffect(() => {
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;
    const estimatedMinutes = queueAppointments.length * 20;
    
    if (onStatsChange) {
      onStatsChange({
        queueCount: queueAppointments.length,
        totalAppointments: appointments.length,
        completedCount,
        estimatedMinutes,
        showQueue
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments.length, queueAppointments.length, showQueue]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Header with Toggle */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Appointments</h2>
          <p className="text-xs text-gray-400 mt-1">
            {showQueue ? (
              <>
                {queueAppointments.length} patient{queueAppointments.length !== 1 ? 's' : ''} in queue
              </>
            ) : (
              <>Queue view disabled</>
            )}
          </p>
        </div>
        
        {/* Queue Toggle */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Queue</span>
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
          <span className={`text-[10px] font-black uppercase ${
            showQueue ? 'text-blue-600' : 'text-gray-400'
          }`}>
            {showQueue ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading appointments...</p>
          </div>
        ) : showQueue ? (
          queueAppointments.length > 0 ? (
            <div className="space-y-3">
              {sortedAppointments.map((apt, idx) => {
                // Calculate estimated wait time (20 min per patient)
                const estimatedWaitMinutes = idx * 20;
                const hours = Math.floor(estimatedWaitMinutes / 60);
                const minutes = estimatedWaitMinutes % 60;
                const waitTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                  >
                    {/* Queue Position */}
                    <div className="shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                      {idx + 1}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                        {apt.patientName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {apt.type}
                        </span>
                        {idx > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                              <Clock size={12} />
                              Wait: {waitTime}
                            </span>
                          </>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className={`text-xs font-bold ${
                          apt.status === 'confirmed' ? 'text-green-600' : 
                          apt.status === 'Booked' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>

                    {/* Time & Actions */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {apt.time}
                      </p>
                      <p className="text-xs text-gray-400">~20min</p>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={() => router.push(`/doctor/appointment/${apt.id}`)}
                      className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      Start
                    </button>
                  </div>
                );
              })}

              {/* Total Estimated Time */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    Total Estimated Time
                  </span>
                  <span className="text-lg font-black text-blue-600">
                    {Math.floor((queueAppointments.length * 20) / 60)}h {(queueAppointments.length * 20) % 60}m
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {queueAppointments.length} appointments × 20 minutes each
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">No appointments in queue</p>
              <p className="text-xs text-gray-400 mt-1">All caught up!</p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Queue View Disabled</p>
            <p className="text-xs text-gray-400 mt-1">Toggle ON to see patient queue and wait times</p>
            <div className="mt-4 text-4xl font-black text-gray-300">0</div>
            <p className="text-xs text-gray-400 mt-1">Appointments visible</p>
          </div>
        )}
      </div>
    </div>
  );
}
