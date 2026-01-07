'use client';

import React, { useState } from "react";
import { Calendar, Search, Clock, User, Filter } from "lucide-react";
import { helpdeskData } from "@/lib/integrations/data/helpdesk";

export default function AppointmentBooking() {
  const { doctors } = helpdeskData;
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0].id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Booking</h1>
        <p className="text-gray-500">Schedule new appointments for patients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Search Patient & Doctor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Search */}
          <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-500" /> 1. Select Patient
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Patient ID, Name or Phone..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Doctor Selection Grid */}
          <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" /> 2. Select Department & Doctor
              </h2>
              <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
                <Filter size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedDoctor === doc.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                      : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                  }`}
                >
                  <p className="font-bold text-gray-900 dark:text-white">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.specialty}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${doc.availability === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase">{doc.availability}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Slot Selection */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-full">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" /> 3. Available Slots
            </h2>
            <div className="space-y-3">
              {['09:00 AM', '10:30 AM', '11:15 AM', '02:00 PM', '04:30 PM'].map((slot, i) => (
                <button 
                  key={i}
                  className="w-full py-3 rounded-xl border border-gray-100 dark:border-gray-800 text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="mt-12 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Fee</p>
                <p className="text-2xl font-bold dark:text-white">₹ 500.00</p>
              </div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                Confirm Appointment
              </button>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}
