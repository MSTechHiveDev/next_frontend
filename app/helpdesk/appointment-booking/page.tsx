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
  ArrowRight,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { helpdeskService } from "@/lib/integrations";
import type { HelpdeskDoctor, HelpdeskProfile } from "@/lib/integrations/types/helpdesk";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [paymentCompleted, setPaymentCompleted] = useState(false); // New: Track if payment is done
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [sendToDoctor, setSendToDoctor] = useState(false); // New state for send to doctor

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        console.log('[Booking Init] Starting initialization...');

        // Fetch profile
        console.log('[Booking Init] Fetching helpdesk profile...');
        const me = await helpdeskService.getMe();
        console.log('[Booking Init] Profile fetched:', me);
        setProfile(me);

        // Fetch doctors
        console.log('[Booking Init] Fetching doctors...');
        const docs = await helpdeskService.getDoctors();
        console.log('[Booking Init] Doctors fetched:', docs.length);

        // Filter out doctors without valid names
        const validDoctors = docs.filter((doc: any) => {
          const hasValidName = (doc.user?.name && doc.user.name !== 'Unknown') ||
            (doc.name && doc.name !== 'Unknown');
          return hasValidName;
        });

        console.log('[Booking] Total doctors from API:', docs.length);
        console.log('[Booking] Valid doctors with names:', validDoctors.length);
        setDoctors(validDoctors);

        // Fetch patient if ID provided
        if (patientIdFromQuery) {
          console.log('[Booking Init] Fetching patient with ID:', patientIdFromQuery);
          try {
            const patientData = await helpdeskService.getPatientById(patientIdFromQuery);
            console.log('[Booking Init] Patient data received:', patientData);

            // Transform backend format {user, profile} to flat format expected by UI
            const transformedPatient = {
              _id: patientData.user?._id || patientData._id,
              id: patientData.user?._id || patientData._id,
              name: patientData.user?.name || patientData.name,
              mobile: patientData.user?.mobile || patientData.mobile,
              email: patientData.user?.email || patientData.email,
              mrn: patientData.profile?.mrn,
              gender: patientData.profile?.gender,
              age: patientData.profile?.age,
              ...patientData.profile
            };

            console.log('[Booking Init] Transformed patient:', transformedPatient);
            setSelectedPatient(transformedPatient);
          } catch (patientError: any) {
            console.error('[Booking Init] Failed to fetch patient:', patientError);
            toast.error(`Failed to load patient: ${patientError.message || 'Unknown error'}`);
          }
        }

        console.log('[Booking Init] Initialization complete');
      } catch (error: any) {
        console.error('[Booking Init] Initialization error:', error);
        console.error('[Booking Init] Error details:', {
          message: error.message,
          status: error.status,
          stack: error.stack
        });
        toast.error(`Failed to initialize: ${error.message || 'Unknown error'}`);
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
        console.log('[Patient Search] Searching for:', patientSearch);
        const results = await helpdeskService.searchPatients(patientSearch);
        console.log('[Patient Search] Raw results:', results);

        // Handle both direct array and {data: [...]} format
        const patientList = Array.isArray(results) ? results : ((results as any).data || []);
        console.log('[Patient Search] Patient list:', patientList.length, 'patients');

        setSearchResults(patientList);
      } catch (error: any) {
        console.error("[Patient Search] Error:", error);
        toast.error(error.message || "Failed to search patients");
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
      console.log('Availability response:', res);
      // Backend returns { slots: [...hourly blocks], bookedCountByHour }
      setAvailableSlots(res.slots || []);
    } catch (error: any) {
      console.error('Failed to fetch availability:', error);
      toast.error(error.message || "Failed to fetch doctor availability");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, profile, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBooking = async () => {
    if (!selectedPatient) { toast.error("Step 1 Pending: Select a Patient"); return; }
    if (!selectedDoctor) { toast.error("Step 2 Pending: Select a Physician"); return; }
    if (!selectedDate) { toast.error("Date Selection Pending"); return; }

    try {
      setSubmitting(true);
      const startTime = selectedSlot || "";

      const response = await helpdeskService.createAppointment({
        patientId: selectedPatient._id || selectedPatient.id,
        doctorId: selectedDoctor._id,
        date: selectedDate,
        timeSlot: selectedSlot || "Queue",
        startTime: startTime,
        endTime: startTime,
        type: appointmentType,
        notes: notes,
        paymentMethod: paymentMethod,
        vitals: {
          bloodPressure: selectedPatient.bloodPressure || selectedPatient.bp,
          temperature: selectedPatient.temperature || selectedPatient.temp,
          pulse: selectedPatient.pulse || selectedPatient.pulseRate,
          spO2: selectedPatient.spO2 || selectedPatient.spo2,
          height: selectedPatient.height,
          weight: selectedPatient.weight,
          sugar: selectedPatient.sugar
        }
      });

      console.log('[Booking] Success response:', response);
      
      const appointment = response.appointment || response;
      
      // Generate Receipt HTML
      const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Patient Registration Bill</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 10mm; }
            }
            body { font-family: Arial, sans-serif; background: white; font-size: 17px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px; }
            .header h1 { margin: 0; font-size: 29px; font-weight: bold; }
            .header p { margin: 4px 0; font-size: 14px; }
            h2 { font-size: 22px; margin: 12px 0 8px 0; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; font-size: 16px; }
            th { background: #f5f5f5; font-weight: bold; }
            .section-header { background: #f0f0f0; padding: 8px 12px; font-weight: bold; font-size: 17px; margin: 12px 0 8px 0; }
            .footer { border-top: 1px solid #ddd; margin-top: 18px; padding-top: 12px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${profile?.hospital?.name || "CureChain Hospital"}</h1>
            <p>${(profile?.hospital as any)?.address || "Central Healthcare District"}</p>
            <p>Phone: ${(profile?.hospital as any)?.mobile || "+91 99999 00000"} | Email: ${(profile?.hospital as any)?.email || "care@curechain.io"}</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <h2>PATIENT REGISTRATION BILL</h2>
              <p style="margin: 0; font-size: 10px;">Appointment Receipt</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
              <p style="margin: 0;"><strong>Bill No:</strong> ${appointment.appointmentId || `APT-${Date.now()}`}</p>
            </div>
          </div>

          <div class="section-header">PATIENT DETAILS</div>
          <table>
            <tr>
              <td style="background: #f9f9f9; width: 25%;"><strong>MRN / Patient ID:</strong></td>
              <td>${appointment.mrn || selectedPatient.mrn || selectedPatient.profile?.mrn || "N/A"}</td>
              <td style="background: #f9f9f9; width: 25%;"><strong>Blood Group:</strong></td>
              <td>${selectedPatient.bloodGroup || "-"}</td>
            </tr>
            <tr>
              <td style="background: #f9f9f9;"><strong>Patient Name:</strong></td>
              <td>${selectedPatient.name || selectedPatient.user?.name}</td>
              <td style="background: #f9f9f9;"><strong>Date of Birth:</strong></td>
              <td>${selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-IN') : "-"}</td>
            </tr>
            <tr>
              <td style="background: #f9f9f9;"><strong>Age / Gender:</strong></td>
              <td>${selectedPatient.age || selectedPatient.profile?.age || "N/A"} Years / ${selectedPatient.gender || selectedPatient.profile?.gender || "N/A"}</td>
              <td style="background: #f9f9f9;"><strong>Mobile:</strong></td>
              <td>${selectedPatient.mobile || selectedPatient.contact || selectedPatient.user?.mobile}</td>
            </tr>
            <tr>
              <td style="background: #f9f9f9;"><strong>Email:</strong></td>
              <td>${selectedPatient.email || "-"}</td>
              <td style="background: #f9f9f9;"><strong>Emergency Contact:</strong></td>
              <td>${selectedPatient.emergencyContact || "-"}</td>
            </tr>
            <tr>
              <td style="background: #f9f9f9;"><strong>Address:</strong></td>
              <td colspan="3">${selectedPatient.address || "-"}</td>
            </tr>
          </table>

          <div class="section-header">APPOINTMENT DETAILS</div>
          <table>
            <tr>
              <td style="background: #f9f9f9; width: 25%;"><strong>Consulting Doctor:</strong></td>
              <td>${(selectedDoctor as any).user?.name || selectedDoctor.name}</td>
              <td style="background: #f9f9f9; width: 25%;"><strong>Appointment Date:</strong></td>
              <td>${new Date(selectedDate).toLocaleDateString('en-GB')}</td>
            </tr>
            <tr>
              <td style="background: #f9f9f9;"><strong>Qualification:</strong></td>
              <td>${selectedDoctor.qualifications?.join(', ') || "MBBS"}</td>
              <td style="background: #f9f9f9;"><strong>Appointment Time:</strong></td>
              <td>${selectedSlot || "IN QUEUE"}</td>
            </tr>
            <tr>
              <td style="background: #f9f9f9;"><strong>Specialization:</strong></td>
              <td>${selectedDoctor.specialties?.[0] || "-"}</td>
              <td style="background: #f9f9f9;"><strong>Visit Type:</strong></td>
              <td style="text-transform: capitalize;">${appointmentType}</td>
            </tr>
          </table>

          ${selectedPatient.profile?.vitals || appointment.vitals ? `
            <div class="section-header">VITAL SIGNS</div>
            <table>
              <thead>
                <tr style="background: #f5f5f5;">
                  <th>Temperature</th>
                  <th>Blood Pressure</th>
                  <th>Pulse Rate</th>
                  <th>Weight</th>
                  <th>SpO2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${selectedPatient.profile?.temp || appointment.vitals?.temperature || "-"} °C</td>
                  <td>${selectedPatient.profile?.bp || appointment.vitals?.bloodPressure || "-"}</td>
                  <td>${selectedPatient.profile?.pulse || appointment.vitals?.pulse || "-"} bpm</td>
                  <td>${selectedPatient.profile?.weight || appointment.vitals?.weight || "-"} kg</td>
                  <td>${selectedPatient.profile?.spo2 || appointment.vitals?.spO2 || "-"}%</td>
                </tr>
              </tbody>
            </table>
          ` : ''}

          <div class="section-header">PAYMENT SUMMARY</div>
          <table>
            <thead>
              <tr style="background: #f5f5f5;">
                <th>Description</th>
                <th style="text-align: right; width: 120px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consultation Fee (OPD)</td>
                <td style="text-align: right;">500.00</td>
              </tr>
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td>TOTAL AMOUNT</td>
                <td style="text-align: right; font-size: 12px;">₹ 500.00</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 6px; font-size: 10px;">
            <p style="margin: 2px 0;"><strong>Payment Method:</strong> <span style="text-transform: uppercase;">${paymentMethod}</span></p>
            <p style="margin: 2px 0;"><strong>Payment Status:</strong> <span style="padding: 2px 8px; background: ${paymentCompleted ? '#d4edda' : '#fff3cd'}; color: ${paymentCompleted ? '#155724' : '#856404'}; border-radius: 4px; font-weight: bold;">${paymentCompleted ? 'PAID' : 'PENDING'}</span></p>
          </div>

          <div class="footer">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 2px 0;">This is a computer-generated receipt and does not require a signature.</p>
                <p style="margin: 2px 0;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 2px 0; font-weight: bold;">Authorized Signatory</p>
                <div style="border-bottom: 1px solid #000; width: 120px; margin: 16px 0 4px auto;"></div>
                <p style="margin: 2px 0;">${profile?.hospital?.name || "CureChain Hospital"}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Open receipt in new window and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        toast.error('Please allow popups to print receipt');
      }

      toast.success("Appointment Confirmed!");
      
      // If "Send to Doctor" is selected, update status to confirmed
      if (sendToDoctor && appointment._id) {
        try {
          await helpdeskService.updateAppointmentStatus(appointment._id, 'confirmed');
          toast.success("Appointment sent to doctor successfully!");
        } catch (err) {
          console.error('Failed to send to doctor:', err);
          toast.error("Appointment saved but failed to send to doctor");
        }
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/helpdesk');
      }, 2000);
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
    <>
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
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${selectedDoctor?._id === doc._id
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
              Time & Context
            </h2>

            <div className="flex-1 space-y-8">
              {selectedDoctor ? (
                <div className="space-y-6">
                  {/* Working Hours Info */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Working Hours</p>
                    {(() => {
                      const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
                      const avail = selectedDoctor.availability?.find((a: any) => a.days?.includes(dayName));
                      if (avail) {
                        return (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white">{avail.startTime} - {avail.endTime}</p>
                            {avail.breakStart && (
                              <p className="text-[10px] text-gray-500 font-medium">Break: {avail.breakStart} - {avail.breakEnd}</p>
                            )}
                          </div>
                        );
                      }
                      return <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Not Available on {dayName}</p>;
                    })()}
                  </div>

                  {/* Quick Context Settings */}
                  <div className="pt-6 border-t border-white/5 space-y-4">
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
                        rows={3}
                        placeholder="Symptoms / Priority details..."
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none resize-none placeholder:text-gray-700 hover:bg-white/10 transition-all"
                      />
                    </div>
                    
                    {/* Payment Controls */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payment Details</label>
                      
                      {/* Payment Method */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-600 uppercase tracking-wider">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi')}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
                        >
                          <option value="cash" className="bg-gray-900">Cash</option>
                          <option value="card" className="bg-gray-900">Card</option>
                          <option value="upi" className="bg-gray-900">UPI</option>
                        </select>
                      </div>
                      
                      {/* Payment Status */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <input
                          type="checkbox"
                          id="paymentCompleted"
                          checked={paymentCompleted}
                          onChange={(e) => setPaymentCompleted(e.target.checked)}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <label htmlFor="paymentCompleted" className="text-xs font-bold text-white cursor-pointer">
                          Payment Received
                          <span className="block text-[10px] font-normal text-gray-400 mt-0.5">
                            Check if consultation fee has been paid
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Filter className="text-white w-8 h-8" />
                  </div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Lock Physician To Enable Selection</p>
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
              
              {/* Send to Doctor Option */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <input
                  type="checkbox"
                  id="sendToDoctor"
                  checked={sendToDoctor}
                  onChange={(e) => setSendToDoctor(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="sendToDoctor" className="text-sm font-bold text-white uppercase tracking-wide cursor-pointer">
                  Send to Doctor Immediately
                  <span className="block text-xs font-normal text-gray-400 normal-case mt-1">
                    Appointment will be visible in doctor's dashboard right away
                  </span>
                </label>
              </div>
              
              {(() => {
                const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
                const isAvailable = selectedDoctor?.availability?.some((a: any) => a.days?.includes(dayName));
                
                return (
                  <button
                    onClick={handleBooking}
                    disabled={submitting || !selectedDoctor}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest group active:scale-95"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {sendToDoctor ? 'SAVE & SEND TO DOCTOR' : 'ADD TO QUEUE'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
