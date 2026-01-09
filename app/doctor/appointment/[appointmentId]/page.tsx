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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Patient Name</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {appointment?.patient?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Age / Gender</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {appointment?.patient?.age || 'N/A'} / {appointment?.patient?.gender || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Contact</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {appointment?.patient?.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">MRN</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {appointment?.patient?.mrn || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Vitals if available */}
              {appointment?.vitals && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Vital Signs</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-lg font-black text-blue-600">{appointment.vitals.bloodPressure || 'N/A'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">BP</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-black text-green-600">{appointment.vitals.pulse || 'N/A'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pulse</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-lg font-black text-orange-600">{appointment.vitals.temperature || 'N/A'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Temp</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-lg font-black text-purple-600">{appointment.vitals.weight || 'N/A'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Weight</p>
                    </div>
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
