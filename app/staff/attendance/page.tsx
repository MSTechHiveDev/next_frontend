'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Timer, 
  Calendar, 
  History, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  MapPin,
  Info
} from 'lucide-react';
import { staffService } from '@/lib/integrations';
import type { AttendanceHistory, TodayAttendance } from '@/lib/integrations/types';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [todayStatus, setTodayStatus] = useState<TodayAttendance | null>(null);
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        staffService.getTodayStatus(),
        staffService.getAttendanceHistory({ limit: 10, page: 1 })
      ]);
      setTodayStatus(statusRes.attendance);
      setHistory(historyRes.attendance || []);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setSubmitting(true);
      await staffService.checkIn();
      toast.success('Successfully checked in!');
      await loadAllData();
    } catch (error) {
      toast.error('Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setSubmitting(true);
      await staffService.checkOut();
      toast.success('Successfully checked out!');
      await loadAllData();
    } catch (error) {
       toast.error('Check-out failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const hasCheckedIn = !!todayStatus?.checkIn;
  const hasCheckedOut = !!todayStatus?.checkOut;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
        <p className="text-gray-500 mt-1">Manage your daily clock-ins and view your attendance history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clock & Actions */}
        <div className="lg:col-span-5 space-y-6">
           {/* Live Clock Card */}
           <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-2xl group-hover:scale-125 transition-all duration-1000"></div>
              
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100 mb-6">
                    <Clock className="w-3 h-3" /> Live Clock
                 </div>
                 <h2 className="text-6xl font-black text-gray-900 tracking-tighter">
                   {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                 </h2>
                 <p className="text-gray-400 font-bold mt-2">
                   {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
                 {!hasCheckedIn ? (
                    <button 
                      onClick={handleCheckIn}
                      disabled={submitting}
                      className="col-span-2 group relative bg-indigo-600 text-white p-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><LogIn className="w-6 h-6" /> CLOCK IN</>}
                    </button>
                 ) : !hasCheckedOut ? (
                    <button 
                      onClick={handleCheckOut}
                      disabled={submitting}
                      className="col-span-2 group relative bg-gray-900 text-white p-6 rounded-3xl font-black text-xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><LogOut className="w-6 h-6" /> CLOCK OUT</>}
                    </button>
                 ) : (
                    <div className="col-span-2 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3">
                       <CheckCircle2 className="w-6 h-6" /> SHIFT COMPLETE
                    </div>
                 )}
              </div>
           </div>

           {/* Today's Detail Card */}
           {hasCheckedIn && (
             <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-emerald-500" /> Today's Session
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Time</p>
                      <p className="text-xl font-black text-gray-900 mt-1">
                        {new Date(todayStatus.checkIn?.time!).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </p>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border border-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Duration</p>
                      <p className="text-xl font-black text-gray-900 mt-1">
                        {hasCheckedOut ? `${Math.floor(todayStatus.workingHours / 60)}h ${todayStatus.workingHours % 60}m` : 'In Session'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200">
                   <MapPin className="w-5 h-5 text-indigo-400" />
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-gray-900">Hospital Main Campus</p>
                   </div>
                </div>
             </div>
           )}

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed font-medium">Please ensure GPS is enabled if your department requires location-verified attendance. Contact IT Support for issues.</p>
           </div>
        </div>

        {/* Right Column: History List */}
        <div className="lg:col-span-7">
           <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                   <History className="w-5 h-5 text-indigo-600" /> Recent History
                 </h3>
                 <div className="flex items-center gap-2">
                    <button className="text-xs font-black text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all">Filter</button>
                    <button className="text-xs font-black text-white bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Download Report</button>
                 </div>
              </div>

              <div className="overflow-x-auto flex-1">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50/50">
                          <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">In / Out</th>
                          <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                          <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {history.length > 0 ? history.map((entry) => (
                          <tr key={entry._id} className="group hover:bg-gray-50 transition-colors">
                             <td className="px-8 py-6">
                                <span className="font-black text-gray-900">{new Date(entry.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                      {new Date(entry.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                      {entry.checkOut ? new Date(entry.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className="text-sm font-black text-gray-600">{Math.floor(entry.workingHours / 60)}h {entry.workingHours % 60}m</span>
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((entry.workingHours / (8 * 60)) * 100, 100)}%` }}></div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${
                                   entry.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                   entry.status === 'late' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                   'bg-gray-50 text-gray-600 border-gray-100'
                                }`}>
                                   {entry.status}
                                </span>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan={4} className="px-8 py-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                   <Calendar className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="font-bold text-gray-900">No history found</h4>
                                <p className="text-sm text-gray-400">Your attendance logs will appear here once you start clocking in.</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
              
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
                 <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-all">Load Full History</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
