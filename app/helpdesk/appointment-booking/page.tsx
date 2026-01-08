'use client';

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  Search, 
  Clock, 
  User, 
  Filter, 
  Stethoscope, 
  ChevronRight, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { helpdeskService } from "@/lib/integrations";
import type { HelpdeskDoctor, HelpdeskProfile } from "@/lib/integrations/types/helpdesk";
import toast from "react-hot-toast";

export default function AppointmentBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<HelpdeskProfile | null>(null);
  const [doctors, setDoctors] = useState<HelpdeskDoctor[]>([]);
  
  // Selection State
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<HelpdeskDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [notes, setNotes] = useState("");
  const [appointmentType, setAppointmentType] = useState("consultation");

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [me, docs] = await Promise.all([
          helpdeskService.getMe(),
          helpdeskService.getDoctors()
        ]);
        setProfile(me);
        setDoctors(docs);

        if (patientIdFromQuery) {
          const patient = await helpdeskService.getPatientById(patientIdFromQuery);
          setSelectedPatient(patient);
        }
      } catch (error: any) {
        toast.error("Failed to initialize booking session");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [patientIdFromQuery]);

  // Patient Search Logic
  useEffect(() => {
    if (patientSearch.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchingPatients(true);
        const results = await helpdeskService.searchPatients(patientSearch);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearchingPatients(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Slots Fetching Logic
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !profile?.hospital?._id || !selectedDate) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await helpdeskService.getAvailability(selectedDoctor._id, profile.hospital._id, selectedDate);
      setAvailableSlots(res.availableSlots || []);
    } catch (error) {
      toast.error("Failed to fetch doctor availability");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, profile, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBooking = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedSlot || !selectedDate) {
      toast.error("Please complete all selection steps");
      return;
    }

    try {
      setSubmitting(true);
      await helpdeskService.createAppointment({
        patientId: selectedPatient._id || selectedPatient.id,
        doctorId: selectedDoctor._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: appointmentType,
        notes: notes
      });
      toast.success("Appointment Confirmed!");
      router.push('/helpdesk');
    } catch (error: any) {
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Initializing Booking Logic...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Appointment Logistics</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Slot allocation & resource management</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
           <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-[9px] font-black text-blue-600 uppercase">Hospital Node</p>
              <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{profile?.hospital?.name}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Step 1: Patient Selection */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2 mb-8">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs">1</span> 
              Patient Manifest
            </h2>

            {selectedPatient ? (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 font-black text-xl shadow-sm italic">
                    {selectedPatient.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedPatient.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedPatient.mobile || selectedPatient.contact}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedPatient(null); setPatientSearch(""); }}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-[10px] font-black text-rose-500 uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-50 transition-all"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by Patient ID, Name or Mobile..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {searchingPatients && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-500" />}
                </div>

                {searchResults.length > 0 && (
                   <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
                     {searchResults.map((p) => (
                       <button
                         key={p._id}
                         onClick={() => setSelectedPatient(p)}
                         className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                             {p.name?.charAt(0)}
                           </div>
                           <div>
                             <p className="text-sm font-black text-gray-900 dark:text-white uppercase truncate">{p.name}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.mobile}</p>
                           </div>
                         </div>
                         <ArrowRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                       </button>
                     ))}
                   </div>
                )}
                {patientSearch.length >= 3 && searchResults.length === 0 && !searchingPatients && (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No patient found in registry</p>
                    <button 
                      onClick={() => router.push('/helpdesk/patient-registration')}
                      className="mt-4 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      Register New Patient instead
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Doctor Selection */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all group">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs">2</span> 
                Physician Matrix
              </h2>
              <div className="flex items-center gap-3">
                 <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs font-bold outline-none border-none focus:ring-2 focus:ring-blue-500"
                 />
                 <button className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
                    <Filter size={18} />
                 </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.length > 0 ? doctors.map((doc: any) => (
                <div 
                  key={doc._id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                    selectedDoctor?._id === doc._id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-50 dark:border-gray-700 hover:border-blue-200 bg-white dark:bg-gray-800 shadow-sm'
                  }`}
                >
                  {selectedDoctor?._id === doc._id && (
                    <div className="absolute top-4 right-4 text-blue-600">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-xl italic group-hover:scale-110 transition-transform">
                      {doc.user?.name?.charAt(0) || doc.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white uppercase text-md leading-tight">{doc.user?.name || doc.name}</h4>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{doc.specialties?.[0] || doc.specialty}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verified Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200">
                   <Stethoscope size={40} className="text-gray-300 mx-auto mb-3" />
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No medical personnel active</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Slot selection & confirm */}
        <div className="space-y-8">
           <div className="bg-gray-900 p-8 rounded-4xl border border-gray-800 shadow-2xl sticky top-8 min-h-[500px] flex flex-col">
              <h2 className="text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-2 mb-8">
                <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs">3</span> 
                Chronos Grid
              </h2>

              <div className="flex-1">
                {selectedDoctor ? (
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Available Slottings for {selectedDate}</p>
                    
                    {loadingSlots ? (
                       <div className="py-12 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Calculating Availability...</p>
                       </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                         {availableSlots.map((slot, i) => (
                           <button
                             key={i}
                             onClick={() => setSelectedSlot(slot)}
                             className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                               selectedSlot?.startTime === slot.startTime 
                                 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-white/20"
                                 : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                             }`}
                           >
                             {slot.startTime}
                           </button>
                         ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white/5 rounded-3xl border border-white/5">
                        <Clock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">No tactical slots<br/>available today</p>
                      </div>
                    )}

                    {selectedSlot && (
                      <div className="pt-6 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Consultation Context</label>
                          <select 
                            value={appointmentType}
                            onChange={(e) => setAppointmentType(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
                          >
                             <option value="consultation" className="bg-gray-900">Standard Consultation</option>
                             <option value="follow-up" className="bg-gray-900">Follow-up Briefing</option>
                             <option value="emergency" className="bg-gray-900 text-rose-500">Emergency Override</option>
                             <option value="procedure" className="bg-gray-900">Clinical Procedure</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Operational Memo (Optional)</label>
                           <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2} 
                            placeholder="Symptoms / Priority details..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none resize-none placeholder:text-gray-700 hover:bg-white/10 transition-all"
                           />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                       <Filter className="text-white w-8 h-8" />
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Lock Physician To View Timeline</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-end p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div>
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Fee Structure</p>
                      <p className="text-[8px] font-bold text-gray-500 uppercase">Hospital Default</p>
                   </div>
                   <p className="text-2xl font-black text-white uppercase tracking-tighter">₹500.00</p>
                </div>
                <button 
                  onClick={handleBooking}
                  disabled={submitting || !selectedSlot}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest group active:scale-95"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Confirm Assignment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
