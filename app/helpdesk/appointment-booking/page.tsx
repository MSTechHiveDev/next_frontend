'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Clock,
  User,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Activity,
  CreditCard,
  Banknote,
  Smartphone,
  Info,
  RefreshCw,
  AlertCircle,
  Hash,
  PenTool,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Check,
  Phone,
  X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { helpdeskService } from "@/lib/integrations";
import type { HelpdeskDoctor, HelpdeskProfile } from "@/lib/integrations/types/helpdesk";
import toast from "react-hot-toast";
import Link from "next/link";
import { generateClinicalReceiptHtml } from "@/lib/print-utils";

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
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<'queue' | 'slot'>('queue');

  const [notes, setNotes] = useState("");
  const [appointmentType, setAppointmentType] = useState("consultation");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [sendToDoctor, setSendToDoctor] = useState(true);

  // Vitals State
  const [vitals, setVitals] = useState({
    height: '', weight: '', bp: '', temperature: '', pulse: '', spo2: '', sugar: ''
  });

  const handleVitalChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [me, docs] = await Promise.all([helpdeskService.getMe(), helpdeskService.getDoctors()]);
        setProfile(me);
        setDoctors(docs.filter((doc: any) => (doc.user?.name && doc.user.name !== 'Unknown') || (doc.name && doc.name !== 'Unknown')));

        if (patientIdFromQuery) {
          try {
            const patientData = await helpdeskService.getPatientById(patientIdFromQuery);
            const transformed = {
              _id: patientData.user?._id || patientData._id,
              id: patientData.user?._id || patientData._id,
              name: patientData.user?.name || patientData.name,
              honorific: patientData.honorific || patientData.profile?.honorific || '',
              mobile: patientData.user?.mobile || patientData.profile?.contactNumber || patientData.mobile || 'N/A',
              mrn: patientData.mrn || 'CC-' + (patientData.user?._id || patientData._id).slice(-6).toUpperCase(),
              gender: patientData.gender || patientData.profile?.gender || 'N/A',
              age: patientData.age || patientData.profile?.age || 'N/A',
              dob: patientData.dob || patientData.profile?.dob || 'N/A',
              address: patientData.address || patientData.profile?.address || 'N/A',
              email: patientData.user?.email || patientData.profile?.email || patientData.profile?.emergencyContactEmail || 'N/A',
              bloodGroup: patientData.bloodGroup || patientData.profile?.bloodGroup || 'N/A',
              emergencyContact: patientData.emergencyContact || patientData.profile?.alternateNumber || patientData.profile?.emergencyContact || 'N/A',
              allergies: patientData.allergies || patientData.profile?.allergies || [],
              medicalHistory: patientData.medicalHistory || patientData.profile?.medicalHistory || patientData.profile?.conditions || '',
              vitals: patientData.vitals || patientData.profile?.vitals || {},
              ...patientData.profile
            };
            setSelectedPatient(transformed);
          } catch (e) {
              console.error("Error fetching patient by ID", e);
          }
        }
      } catch (error: any) {
        toast.error("Process initialization failed. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [patientIdFromQuery]);

  // Pre-fill Vitals if available
  useEffect(() => {
    if (selectedPatient?.vitals) {
      setVitals(prev => ({
        ...prev,
        height: selectedPatient.vitals.height || prev.height,
        weight: selectedPatient.vitals.weight || prev.weight,
        bp: selectedPatient.vitals.bp || selectedPatient.vitals.bloodPressure || prev.bp,
        temperature: selectedPatient.vitals.temperature || selectedPatient.vitals.temp || prev.temperature,
        pulse: selectedPatient.vitals.pulse || prev.pulse,
        spo2: selectedPatient.vitals.spo2 || selectedPatient.vitals.spO2 || prev.spo2,
        sugar: selectedPatient.vitals.sugar || prev.sugar
      }));
    }
  }, [selectedPatient]);

  // Patient Search Logic
  useEffect(() => {
    if (patientSearch.length < 3) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setSearchingPatients(true);
        const results = await helpdeskService.searchPatients(patientSearch);
        setSearchResults(Array.isArray(results) ? results : ((results as any).data || []));
      } catch (error: any) {
        console.error("Search error", error);
      } finally {
        setSearchingPatients(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !profile?.hospital?._id || !selectedDate) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await helpdeskService.getAvailability(selectedDoctor._id, profile.hospital._id, selectedDate);
      setAvailableSlots(res.slots || []);
      if (res.slots && res.slots.length > 0) {
          setBookingMode('slot');
      } else {
          setBookingMode('queue');
      }
    } catch (e) {
      setBookingMode('queue');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, profile, selectedDate]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleBooking = async () => {
    if (!selectedPatient) { toast.error("Select a patient object"); return; }
    if (!selectedDoctor) { toast.error("Select a physician"); return; }
    if (bookingMode === 'slot' && !selectedSlot) { toast.error("Select an allocation slot"); return; }
    
    try {
      setSubmitting(true);
      const payload = {
        patientId: selectedPatient._id || selectedPatient.id,
        doctorId: selectedDoctor._id,
        date: selectedDate,
        timeSlot: bookingMode === 'slot' ? selectedSlot : "General Queue",
        startTime: bookingMode === 'slot' ? selectedSlot : "",
        endTime: bookingMode === 'slot' ? selectedSlot : "",
        type: appointmentType,
        notes: notes,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        // Pass extended details to ensure profile is updated/corrected
        honorific: selectedPatient.honorific || selectedPatient.profile?.honorific,
        address: selectedPatient.address || selectedPatient.profile?.address,
        bloodGroup: selectedPatient.bloodGroup || selectedPatient.profile?.bloodGroup,
        emergencyContact: selectedPatient.emergencyContact || selectedPatient.profile?.alternateNumber,
        allergies: Array.isArray(selectedPatient.allergies) ? selectedPatient.allergies.join(', ') : selectedPatient.allergies,
        medicalHistory: selectedPatient.medicalHistory,
        vitals: {
          bp: vitals.bp || undefined,
          temperature: vitals.temperature || undefined,
          pulse: vitals.pulse || undefined,
          spo2: vitals.spo2 || undefined,
          height: vitals.height || undefined,
          weight: vitals.weight || undefined,
          sugar: vitals.sugar || undefined
        }
      };

      const response = await helpdeskService.createAppointment(payload);
      const appointment = response.appointment || response;

      if (sendToDoctor && (appointment._id || appointment.id)) {
        try {
          await helpdeskService.updateAppointmentStatus(appointment._id || appointment.id, 'confirmed');
        } catch (e) {}
      }

      const receiptData = {
          hospital: {
              name: profile?.hospital?.name || "CureChain Medical Center",
              address: profile?.hospital?.address || "Main Medical Node",
              contact: profile?.hospital?.mobile || profile?.mobile || "System Support",
              email: profile?.hospital?.email || profile?.email || "healthcare@curechain.io"
          },
          patient: {
              name: selectedPatient.name,
              mrn: selectedPatient.mrn,
              age: selectedPatient.age,
              gender: selectedPatient.gender,
              mobile: selectedPatient.mobile,
              dob: selectedPatient.dob,
              address: selectedPatient.address,
              email: selectedPatient.email,
              bloodGroup: selectedPatient.bloodGroup,
              emergencyContact: selectedPatient.emergencyContact,
              allergies: Array.isArray(selectedPatient.allergies) 
                  ? Array.from(new Set(selectedPatient.allergies)).join(', ') 
                  : Array.from(new Set((selectedPatient.allergies || '').split(',').map((s: string) => s.trim()).filter(Boolean))).join(', '),
              medicalHistory: Array.from(new Set((selectedPatient.medicalHistory || '').split(',').map((s: string) => s.trim()).filter(Boolean))).join(', '),
              vitals: {
                height: vitals.height,
                weight: vitals.weight,
                bp: vitals.bp,
                temperature: vitals.temperature,
                pulse: vitals.pulse,
                spo2: vitals.spo2,
                sugar: vitals.sugar
              }
          },
          appointment: {
              doctorName: selectedDoctor.user?.name || selectedDoctor.name,
              specialization: selectedDoctor.specialties?.[0] || 'General Physician',
              qualification: selectedDoctor.qualifications?.[0] || 'MBBS, DM',
              date: new Date(selectedDate).toLocaleDateString(),
              time: bookingMode === 'slot' ? selectedSlot : "IN QUEUE",
              type: appointmentType.toUpperCase(),
              notes: notes,
              appointmentId: appointment.appointmentId || appointment.id || appointment._id || 'APT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          },
          payment: {
              amount: appointmentType === 'consultation' ? 500 : 200,
              method: paymentMethod.toUpperCase(),
              status: paymentStatus.toUpperCase()
          }
      };

      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(generateClinicalReceiptHtml(receiptData));
          printWindow.document.close();
          toast.success("Booking Indexed & Receipt Generated");
          router.push('/helpdesk');
      } else {
          toast.success("Booking Indexed successfully");
          router.push('/helpdesk');
      }
    } catch (error: any) {
      toast.error(error.message || "Execution failure during booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-6">
            <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Initializing Booking Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/helpdesk" className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-teal-600 transition-all">
                <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Scheduling / Appointment Booking</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Schedule Appointment
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Register new clinical engagement for patient</p>
        </div>
      </div>

    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT SIDE: SELECTION & DATA */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* 1. PATIENT OBJECT */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                            <User size={18} />
                        </div>
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Patient Selection</h2>
                    </div>

                    {selectedPatient ? (
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 p-8 bg-slate-50 rounded-[24px] border border-slate-200 group relative animate-in slide-in-from-left-4 duration-300">
                            <div className="w-20 h-20 rounded-[20px] bg-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-slate-200">
                                {selectedPatient.name.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedPatient.name}</h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-600"><Hash size={12} className="text-teal-600" /> {selectedPatient.mrn}</span>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-600"><Phone size={12} className="text-teal-600" /> {selectedPatient.mobile}</span>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-600"><Activity size={12} className="text-teal-600" /> {selectedPatient.age} / {selectedPatient.gender}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200/50">
                                    <p className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1.5">
                                        <AlertTriangle size={12} /> Allergies: <span className="text-slate-900">{Array.isArray(selectedPatient.allergies) ? (selectedPatient.allergies[0] || 'NONE') : (selectedPatient.allergies || 'NONE')}</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                        <Info size={12} /> History: <span className="text-slate-900 truncate max-w-[200px]">{selectedPatient.medicalHistory || 'CLEAR'}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setSelectedPatient(null); setPatientSearch(""); }} 
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative group max-w-2xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                            <input 
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                placeholder="Search by name, ID number or mobile prefix..."
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all text-xs font-bold uppercase placeholder:text-slate-300"
                            />
                            {searchingPatients && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-teal-600" size={20} />}
                            
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-200 rounded-[24px] shadow-2xl z-30 max-h-[400px] overflow-y-auto p-3 space-y-1 animate-in zoom-in-95 duration-200">
                                    {searchResults.map(p => (
                                        <button 
                                            key={p._id}
                                            onClick={async () => {
                                                const full = await helpdeskService.getPatientById(p._id);
                                                setSelectedPatient({
                                                    _id: full.user?._id || full._id,
                                                    id: full.user?._id || full._id,
                                                    name: full.user?.name || full.name,
                                                    honorific: full.honorific || full.profile?.honorific || '',
                                                    mobile: full.user?.mobile || full.profile?.contactNumber || full.mobile || 'N/A',
                                                    mrn: full.mrn || 'CC-' + (full.user?._id || full._id).slice(-6).toUpperCase(),
                                                    gender: full.gender || full.profile?.gender || 'N/A',
                                                    age: full.age || full.profile?.age || 'N/A',
                                                    dob: full.dob || full.profile?.dob || 'N/A',
                                                    address: full.address || full.profile?.address || 'N/A',
                                                    email: full.user?.email || full.profile?.email || full.profile?.emergencyContactEmail || 'N/A',
                                                    bloodGroup: full.bloodGroup || full.profile?.bloodGroup || 'N/A',
                                                    emergencyContact: full.emergencyContact || full.profile?.alternateNumber || full.profile?.emergencyContact || 'N/A',
                                                    allergies: full.allergies || full.profile?.allergies || [],
                                                    medicalHistory: full.medicalHistory || full.profile?.medicalHistory || full.profile?.conditions || '',
                                                    vitals: full.vitals || full.profile?.vitals || {},
                                                    ...full.profile
                                                });
                                                setPatientSearch("");
                                                setSearchResults([]);
                                            }}
                                            className="w-full p-4 text-left hover:bg-slate-50 rounded-2xl flex items-center justify-between group transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg">
                                                    {p.name?.charAt(0) || p.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 uppercase">{p.name || p.user?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.mobile || p.user?.mobile} • {p.mrn}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                                <ChevronRight size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 2. DOCTOR & SCHEDULING */}
                <section className={`space-y-8 transition-all duration-500 ${!selectedPatient ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                            <Stethoscope size={18} />
                        </div>
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Consultant & Schedule {!selectedPatient && '(Select Patient First)'}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <FormLabel label="Appointment Date" />
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
                                <input 
                                    type="date" 
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold uppercase focus:border-teal-500 outline-none transition-all cursor-pointer hover:bg-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <FormLabel label="Booking Mode" />
                            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 h-[58px]">
                                <button 
                                    onClick={() => setBookingMode('queue')}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        bookingMode === 'queue' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Activity size={14} /> Wait in Queue
                                </button>
                                <button 
                                    onClick={() => setBookingMode('slot')}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        bookingMode === 'slot' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Clock size={14} /> Scheduled Slot
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormLabel label="Select Physician" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {doctors.map(doc => (
                                <button 
                                    key={doc._id}
                                    onClick={() => setSelectedDoctor(doc)}
                                    className={`p-5 rounded-[20px] border-2 text-left flex items-center gap-4 transition-all ${
                                        selectedDoctor?._id === doc._id 
                                        ? 'border-teal-500 bg-teal-50/50 shadow-lg shadow-teal-500/5' 
                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl ${
                                        selectedDoctor?._id === doc._id ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {(doc.user?.name || doc.name)?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-black truncate text-slate-900 uppercase tracking-tight">{doc.user?.name || doc.name}</h4>
                                        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5 ${selectedDoctor?._id === doc._id ? 'text-teal-600' : 'text-slate-400'}`}>
                                            {doc.specialties?.[0] || 'Medical Officer'}
                                        </p>
                                    </div>
                                    {selectedDoctor?._id === doc._id && <CheckCircle2 size={20} className="text-teal-600 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedDoctor && bookingMode === 'slot' && (
                        <div className="pt-8 border-t border-slate-50 space-y-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between">
                                <FormLabel label="Available Allocation Units" />
                                {loadingSlots && <Loader2 size={16} className="animate-spin text-teal-600" />}
                            </div>
                            
                            {availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {availableSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            disabled={slot.isFull}
                                            onClick={() => setSelectedSlot(slot.timeSlot)}
                                            className={`py-4 px-4 rounded-xl border-2 text-center transition-all ${
                                                selectedSlot === slot.timeSlot
                                                ? 'bg-teal-600 border-teal-600 text-white shadow-xl shadow-teal-900/20'
                                                : slot.isFull
                                                ? 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed opacity-50'
                                                : 'bg-white border-slate-100 hover:border-teal-500 text-slate-700 font-bold'
                                            }`}
                                        >
                                            <p className="text-[11px] font-black">{slot.timeSlot}</p>
                                            <p className={`text-[8px] font-bold mt-1 uppercase ${selectedSlot === slot.timeSlot ? 'text-teal-100' : 'text-slate-400'}`}>
                                                {slot.isFull ? 'CLOSED' : `${slot.availableCount} SLOTS`}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : !loadingSlots && (
                                <div className="p-12 text-center bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black italic">
                                        No slots found. Use Queue Mode for this date.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 3. CLINICAL SYMPTOMS & TRIAGE */}
                <section className={`space-y-8 transition-all duration-700 ${!selectedPatient ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                            <PenTool size={18} />
                        </div>
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Clinical Matrix</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                         <div className="space-y-4">
                            <FormLabel label="Primary Symptoms / Reason for Visit" />
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Describe current symptoms or clinical reason for this engagement..."
                                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all text-xs font-bold uppercase resize-none placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-6">
                            <FormLabel label="Vital Indicators (Triage)" />
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <VitalField label="Height (cm)" value={vitals.height} placeholder="170" onChange={(v) => handleVitalChange('height', v)} />
                                <VitalField label="Weight (kg)" value={vitals.weight} placeholder="70" onChange={(v) => handleVitalChange('weight', v)} />
                                <VitalField label="BP (mmHg)" value={vitals.bp} placeholder="120/80" onChange={(v) => handleVitalChange('bp', v)} />
                                <VitalField label="Pulse (bpm)" value={vitals.pulse} placeholder="72" onChange={(v) => handleVitalChange('pulse', v)} />
                                <VitalField label="Temp (°F)" value={vitals.temperature} placeholder="98.6" onChange={(v) => handleVitalChange('temperature', v)} />
                                <VitalField label="SpO2 (%)" value={vitals.spo2} placeholder="99" onChange={(v) => handleVitalChange('spo2', v)} />
                                <VitalField label="Sugar (mg/dL)" value={vitals.sugar} placeholder="100" onChange={(v) => handleVitalChange('sugar', v)} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* RIGHT SIDE: FINALIZATION & REVENUE */}
            <div className={`lg:col-span-4 space-y-8 transition-all duration-700 ${!selectedPatient ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <div className="lg:sticky lg:top-24 space-y-8">
                    {/* REVENUE CYCLE */}
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-8 shadow-2xl">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Receipt size={18} className="text-teal-400" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Revenue & Flow</h2>
                        </div>

                        <div className="space-y-2">
                            <FormLabel label="Engagement Type" className="text-white/40" />
                            <select 
                                value={appointmentType}
                                onChange={(e) => setAppointmentType(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="consultation" className="bg-slate-900 text-white">General Consultation</option>
                                <option value="emergency" className="bg-slate-900 text-white">Emergency Triage</option>
                                <option value="follow-up" className="bg-slate-900 text-white">Follow-up Clinical</option>
                                <option value="lab-referral" className="bg-slate-900 text-white">Lab Diagnostic Referral</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <FormLabel label="Payment Method" className="text-white/40" />
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'cash', icon: <Banknote size={18} />, label: 'Cash' },
                                    { id: 'card', icon: <CreditCard size={18} />, label: 'Card' },
                                    { id: 'upi', icon: <Smartphone size={18} />, label: 'UPI' }
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                            paymentMethod === method.id 
                                            ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20' 
                                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                        }`}
                                    >
                                        {method.icon}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <FormLabel label="Payment Status" className="text-white/40" />
                            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                                <button 
                                    onClick={() => setPaymentStatus('paid')}
                                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        paymentStatus === 'paid' ? 'bg-teal-500 text-white shadow-lg' : 'text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    <Check size={14} /> Received
                                </button>
                                <button 
                                    onClick={() => setPaymentStatus('unpaid')}
                                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        paymentStatus === 'unpaid' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    Pending
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Clinical Fee</p>
                                    <h4 className="text-3xl font-black text-white">₹{appointmentType === 'consultation' ? '500' : '200'}.00</h4>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                                    <Banknote size={24} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/8 transition-all group">
                                    <input 
                                        type="checkbox" 
                                        checked={sendToDoctor} 
                                        onChange={(e) => setSendToDoctor(e.target.checked)}
                                        className="w-6 h-6 rounded-lg accent-teal-500 border-white/20 bg-transparent"
                                    />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">Direct Admission</p>
                                        <p className="text-[8px] font-bold text-white/30 uppercase mt-0.5">Push to live doctor queue</p>
                                    </div>
                                    <CheckCircle2 size={16} className={`transition-colors ${sendToDoctor ? 'text-teal-400' : 'text-white/10'}`} />
                                </label>

                                <button 
                                    onClick={handleBooking}
                                    disabled={submitting}
                                    className="w-full py-6 bg-teal-500 text-slate-900 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group relative"
                                >
                                    {submitting ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Receipt size={18} />
                                            Finish & Print
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Node: {profile?.hospital?.name?.slice(0, 8).toUpperCase() || 'SYSTEM'}</p>
                            </div>
                        </div>
                    </div>

                    {/* INFO WIDGET */}
                    <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100 flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                            <Info size={20} />
                            </div>
                            <div>
                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Protocol Tip</h4>
                            <p className="text-[10px] font-bold text-amber-700/70 mt-1">Verify symptoms and vitals before finalizing the print manifest.</p>
                            </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
            cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function FormLabel({ label, className = "" }: { label: string, className?: string }) {
    return (
        <label className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 block ${className}`}>
            {label}
        </label>
    );
}

function VitalField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div className="space-y-2 flex flex-col">
            <FormLabel label={label} className="text-[9px] text-slate-400" />
            <input 
                type="text" 
                value={value}
                placeholder={placeholder || "-"}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-200"
            />
        </div>
    );
}
