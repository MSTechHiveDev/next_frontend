'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Info,
  BookOpenCheck,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { staffService } from '@/lib/integrations';
import toast from 'react-hot-toast';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any>(null);
  const [approvedLeaves, setApprovedLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await staffService.getSchedule();
      setSchedule(data.schedule);
      setApprovedLeaves(data.approvedLeaves || []);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      toast.error('Failed to load work schedule');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Work Schedule Protocol</h1>
          <p className="text-gray-500 font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Registry of assigned shifts, working hours, and weekly offs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shift Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full transition-all group-hover:scale-125 duration-1000"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Clock size={20} />
                </div>
                Assigned Shift
              </h2>
              
              <div className="space-y-8">
                <div className="p-6 bg-gray-900 rounded-3xl text-white relative overflow-hidden group/shift">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover/shift:scale-150 transition-transform"></div>
                  <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Protocol Designation</p>
                  <div className="flex items-center justify-between mt-2">
                    <h3 className="text-2xl font-black tracking-tight italic uppercase">{schedule?.shift || 'General'} Shift</h3>
                    <span className="bg-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">Active</span>
                  </div>
                  <div className="flex items-center gap-6 mt-6">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Interval</p>
                       <p className="text-sm font-black">{schedule?.workingHours?.start || '09:00'} - {schedule?.workingHours?.end || '17:00'}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Workload</p>
                       <p className="text-sm font-black">8.0 HRS</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                        <Briefcase size={16} />
                      </div>
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Contract</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 uppercase">{schedule?.employmentType || 'full-time'}</span>
                  </div>
                  <div className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                        <Calendar size={16} />
                      </div>
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Weekly Rest</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 uppercase">
                      {schedule?.weeklyOff?.length > 0 ? schedule.weeklyOff.join(', ') : 'None'}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4">
                  <Info className="w-6 h-6 text-amber-600 shrink-0" />
                  <p className="text-[10px] text-amber-800 leading-relaxed font-bold uppercase tracking-wide">Protocol Modification: Submit authorization requests to Unit HR for shift rotation or node reassignment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden group">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8">Performance Ledger</h2>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group/score">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Punctuality Score</p>
                    <p className="text-3xl font-black text-emerald-900 italic tracking-tighter">{schedule?.stats?.onTimePercentage || 0}%</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover/score:scale-110">
                    <TrendingUp size={24} />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Present</p>
                    <p className="text-2xl font-black text-gray-900">{schedule?.stats?.presentDays || 0} D</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Absent</p>
                    <p className="text-2xl font-black text-rose-600">{schedule?.stats?.absentDays || 0} D</p>
                  </div>
               </div>

               <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-xs">
                        <User size={16} />
                     </div>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Leaves</span>
                  </div>
                  <span className="text-lg font-black text-indigo-900 uppercase">{schedule?.stats?.onLeaveDays || 0} Days</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar View */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">{monthNames[currentMonth]} {currentYear}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Operational Deployment Schedule</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs p-1">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-50 text-gray-600 transition-all rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentMonth(new Date().getMonth());
                      setCurrentYear(new Date().getFullYear());
                    }}
                    className="px-6 py-2 hover:bg-gray-50 text-xs font-black text-indigo-600 uppercase tracking-widest transition-all rounded-lg"
                  >
                    Today
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-50 text-gray-600 transition-all rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8">
              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-4xl overflow-hidden border border-gray-100 shadow-inner">
                {/* Weekdays */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="bg-white py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}

                {/* Empty slots for first week */}
                {Array.from({ length: firstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white/50 backdrop-blur-xs p-4 h-32"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth(currentMonth, currentYear) }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentYear, currentMonth, day);
                  date.setHours(0, 0, 0, 0);
                  
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                  const isOff = schedule?.weeklyOff?.includes(date.toLocaleDateString('en-US', { weekday: 'long' }));
                  
                  // Check for leaves
                  const leaveOnThisDay = approvedLeaves.find(leave => {
                    const start = new Date(leave.startDate);
                    start.setHours(0,0,0,0);
                    const end = new Date(leave.endDate);
                    end.setHours(23,59,59,999);
                    return date >= start && date <= end;
                  });

                  return (
                    <div key={day} className={`bg-white p-4 h-36 border-t border-l border-gray-50 relative group transition-all hover:bg-indigo-50/30 ${isToday ? 'bg-indigo-50/10' : ''}`}>
                      <div className={`text-sm font-black mb-3 ${isToday ? 'bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-lg ring-4 ring-indigo-50' : 'text-gray-900'} ${isOff ? 'text-gray-300' : ''}`}>
                        {day}
                      </div>
                      
                      {leaveOnThisDay ? (
                        <div className="space-y-2">
                           <div className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-100 shadow-xs flex items-center justify-between">
                             <span>ON LEAVE</span>
                             <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                           </div>
                           <p className="text-[8px] font-bold text-rose-400 uppercase tracking-tighter truncate px-1">
                             {leaveOnThisDay.leaveType}
                           </p>
                        </div>
                      ) : !isOff ? (
                        <div className="space-y-2">
                          <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 shadow-xs flex items-center justify-between">
                            <span>{schedule?.shift}</span>
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
                          </div>
                          <div className="px-3 py-1.5 bg-white text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                            {schedule?.workingHours?.start || '09:00'} - {schedule?.workingHours?.end || '17:00'}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center">
                          <span className="text-[10px] font-black tracking-widest text-gray-200 uppercase transform -rotate-12 border-b-2 border-gray-100/30">Weekly Rest</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{schedule?.shift} Shift</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">On Leave</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weekly Off</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white ring-2 ring-indigo-600 rounded-full"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
