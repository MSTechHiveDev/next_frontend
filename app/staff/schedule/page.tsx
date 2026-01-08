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
  Briefcase
} from 'lucide-react';
import { staffService } from '@/lib/integrations';
import toast from 'react-hot-toast';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any>(null);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Schedule</h1>
        <p className="text-gray-500 mt-1">View your assigned shifts, working hours, and weekly offs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shift Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Assigned Shift
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Current Shift</p>
                <div className="flex items-center justify-between mt-2">
                  <h3 className="text-xl font-bold text-indigo-900 capitalize italic">{schedule?.shift || 'Morning'} Shift</h3>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100">Active</span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-indigo-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {schedule?.workingHours?.start || '09:00'} - {schedule?.workingHours?.end || '17:00'}
                  </div>
                  <div className="w-1 h-1 bg-indigo-300 rounded-full"></div>
                  <div className="flex items-center gap-1.5">
                    <BookOpenCheck className="w-4 h-4" />
                    8 Hours
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm font-medium">Employment type</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 capitalize">{schedule?.employmentType || 'Full-time'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Weekly offs</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {schedule?.weeklyOff?.length > 0 ? schedule.weeklyOff.join(', ') : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Work station</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">Main Building, F2</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">Please report to the HR manager if you wish to request a change in your assigned shift or work station.</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <h3 className="text-lg font-bold relative z-10">Attendance Score</h3>
            <p className="text-emerald-100 text-sm mt-1 relative z-10">Keep it up! Your punctuality is excellent.</p>
            <div className="mt-6 flex items-end gap-3 relative z-10">
              <span className="text-4xl font-bold">98%</span>
              <span className="text-emerald-200 text-sm mb-1 font-medium">Excellent</span>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-900">{monthNames[currentMonth]} {currentYear}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white rounded-xl border border-gray-200 text-gray-600 transition-all hover:shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setCurrentMonth(new Date().getMonth());
                    setCurrentYear(new Date().getFullYear());
                  }}
                  className="px-4 py-2 hover:bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-700 transition-all hover:shadow-sm"
                >
                  Today
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white rounded-xl border border-gray-200 text-gray-600 transition-all hover:shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                {/* Weekdays */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="bg-gray-50 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {day}
                  </div>
                ))}

                {/* Empty slots for first week */}
                {Array.from({ length: firstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white p-4 h-32"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth(currentMonth, currentYear) }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentYear, currentMonth, day);
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                  const isOff = schedule?.weeklyOff?.includes(date.toLocaleDateString('en-US', { weekday: 'long' }));

                  return (
                    <div key={day} className={`bg-white p-3 h-32 border-t border-l border-gray-50 relative group transition-colors hover:bg-gray-50/50 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                      <span className={`text-sm font-bold ${isToday ? 'bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-md' : 'text-gray-900'} ${isOff ? 'text-gray-300' : ''}`}>
                        {day}
                      </span>
                      
                      {!isOff ? (
                        <div className="mt-2 space-y-1">
                          <div className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md border border-indigo-100">
                            {schedule?.shift || 'Morning'}
                          </div>
                          <div className="px-2 py-1 bg-white text-gray-500 text-[10px] font-medium rounded-md border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                            09:00 - 17:00
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-gray-50/30 flex items-center justify-center pointer-events-none">
                          <span className="transform -rotate-45 text-[10px] font-bold tracking-widest text-gray-300 uppercase">Weekly Off</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-xs font-medium text-gray-600">Morning Shift</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <span className="text-xs font-medium text-gray-600">Weekly Off</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-50 ring-1 ring-indigo-200 rounded-full"></div>
                <span className="text-xs font-medium text-gray-600">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
