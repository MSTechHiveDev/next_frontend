"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, FileText, Beaker, CheckCircle, Loader2, Printer, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doctorService } from '@/lib/integrations/services/doctor.service';

interface ConsultationPageProps {
  params: Promise<{
    appointmentId: string;
  }>;
}

export default function ConsultationPage({ params }: ConsultationPageProps) {
  const router = useRouter();
  const { appointmentId } = use(params);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());
  const [creatingPrescription, setCreatingPrescription] = useState(false);
  const [creatingLabToken, setCreatingLabToken] = useState(false);

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const data = await doctorService.startConsultation(appointmentId);
        setAppointment(data.appointment);
        
        // Only toast if it was just started
        if (data.message !== 'Consultation already completed' && !data.appointment.consultationEndTime) {
          if (data.appointment.status === 'in-progress' && !appointment) {
             // We can be more specific here if needed
          }
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  // Timer logic
  useEffect(() => {
    if (!appointment?.consultationStartTime) return;

    const start = new Date(appointment.consultationStartTime).getTime();
    
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [appointment?.consultationStartTime]);


  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreatePrescription = () => {
    router.push(`/doctor/prescription/create?appointmentId=${appointmentId}`);
  };

  const handleCreateLabToken = () => {
    router.push(`/doctor/lab-token/create?appointmentId=${appointmentId}`);
  };

  const handleEndConsultation = async () => {
    try {
      await doctorService.endConsultation(appointmentId, { duration: elapsedTime });
      toast.success('Consultation completed successfully!');
      router.push('/doctor');
    } catch (error: any) {
      toast.error(error.message || 'Failed to end consultation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Timer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {appointment?.patient?.name || 'Patient Consultation'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {appointmentId}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Consultation Time</p>
                <p className="text-3xl font-black text-blue-600">{formatTime(elapsedTime)}</p>
              </div>
              <Clock className="text-blue-600 w-8 h-8 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information (Clinical Receipt) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Patient Information</h2>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Printer size={16} />
                Print
              </button>
            </div>

            {/* Patient Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Name</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase truncate">
                    {(appointment?.patient?.honorific || appointment?.patient?.profile?.honorific || '')} {appointment?.patient?.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Age / Gender</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                    {appointment?.patient?.age || appointment?.patient?.profile?.age || 'N/A'} / {appointment?.patient?.gender || appointment?.patient?.profile?.gender || 'N/A'}
                  </p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Blood Group</p>
                   <p className="text-sm font-black text-rose-500 uppercase">
                     {appointment?.patient?.bloodGroup || appointment?.patient?.profile?.bloodGroup || 'N/A'}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">MRN</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                     {appointment?.patient?.mrn || appointment?.patient?.profile?.mrn || 'N/A'}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {appointment?.patient?.mobile || appointment?.patient?.contactNumber || appointment?.patient?.profile?.contactNumber}
                  </p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Emergency Contact</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white">
                     {appointment?.patient?.emergencyContact || appointment?.patient?.profile?.alternateNumber || appointment?.patient?.profile?.emergencyContact || 'N/A'}
                   </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate" title={appointment?.patient?.address || appointment?.patient?.profile?.address || 'N/A'}>
                    {appointment?.patient?.address || appointment?.patient?.profile?.address || 'N/A'}
                  </p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                   <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          (appointment?.paymentStatus || 'paid') === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                          {appointment?.paymentStatus || 'PAID'}
                      </span>
                      <span className="text-xs font-bold text-gray-900">₹{appointment?.amount || (appointment?.type === 'consultation' ? '500' : '200')}</span>
                   </div>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Medical History</p>
                   <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                     {(() => {
                        const history = appointment?.patient?.medicalHistory || appointment?.patient?.profile?.medicalHistory || appointment?.patient?.profile?.conditions || '';
                        return Array.from(new Set(history.split(',').map((s: string) => s.trim()).filter(Boolean))).join(', ') || 'No history recorded';
                     })()}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Allergies</p>
                   <p className="text-xs font-bold text-rose-500">
                     {(() => {
                        const raw = appointment?.patient?.allergies || appointment?.patient?.profile?.allergies;
                        if (Array.isArray(raw)) return Array.from(new Set(raw)).join(', ') || 'None';
                        return Array.from(new Set((raw || '').split(',').map((s: string) => s.trim()).filter(Boolean))).join(', ') || 'None';
                     })()}
                   </p>
                </div>
               </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Complaints / Symptoms</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    {appointment?.notes || appointment?.reason || 'No symptoms described'}
                  </p>
              </div>

              {/* Vitals */}
              {appointment?.vitals && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Clinical Vitals</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <VitalCard 
                        label="BP" 
                        value={appointment.vitals.bp || appointment.vitals.bloodPressure} 
                        unit="mmHg" 
                        color="blue" 
                    />
                     <VitalCard 
                        label="Pulse" 
                        value={appointment.vitals.pulse} 
                        unit="bpm" 
                        color="emerald" 
                    />
                     <VitalCard 
                        label="Temp" 
                        value={appointment.vitals.temperature || appointment.vitals.temp} 
                        unit="°F" 
                        color="rose" 
                    />
                     <VitalCard 
                        label="SpO2" 
                        value={appointment.vitals.spo2 || appointment.vitals.spO2} 
                        unit="%" 
                        color="cyan" 
                    />
                    <VitalCard 
                        label="Weight" 
                        value={appointment.vitals.weight} 
                        unit="kg" 
                        color="violet" 
                    />
                    <VitalCard 
                        label="Height" 
                        value={appointment.vitals.height} 
                        unit="cm" 
                        color="amber" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Create Prescription */}
            <button
              onClick={handleCreatePrescription}
              className="w-full p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <FileText size={32} className="group-hover:scale-110 transition-transform" />
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  →
                </div>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">AI Prescription</h3>
              <p className="text-sm text-blue-100 mt-1">Create prescription for patient</p>
            </button>

            {/* Create Lab Token */}
            <button
              onClick={handleCreateLabToken}
              className="w-full p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <Beaker size={32} className="group-hover:scale-110 transition-transform" />
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  →
                </div>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Lab Tests</h3>
              <p className="text-sm text-purple-100 mt-1">Recommend lab investigations</p>
            </button>

            {/* End Consultation */}
            <button
              onClick={handleEndConsultation}
              className="w-full p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <CheckCircle size={32} className="group-hover:scale-110 transition-transform" />
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  ✓
                </div>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">End Consultation</h3>
              <p className="text-sm text-green-100 mt-1">Complete and save all records</p>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

function VitalCard({ label, value, unit, color }: { label: string, value: string | undefined, unit: string, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
    cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
    violet: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-transparent ${selectedColor.split(' ')[1]} ${selectedColor.split(' ')[2]}`}>
      <span className={`text-lg font-black ${selectedColor.split(' ')[0]}`}>
        {value || '-'}
      </span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
        {label} <span className="opacity-50 lowercase">({unit})</span>
      </span>
    </div>
  );
}
