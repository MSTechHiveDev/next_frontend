'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { getDoctorPatientDetailsAction } from '@/lib/integrations/actions/doctor.actions';
import toast from 'react-hot-toast';

export default function PatientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadPatient(params.id as string);
        }
    }, [params.id]);

    const loadPatient = async (id: string) => {
        setIsLoading(true);
        const { success, data, error } = await getDoctorPatientDetailsAction(id);
        if (success && data) {
            setPatient(data);
        } else {
            toast.error(error || "Failed to load patient details");
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-700">Patient not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    // Assuming patient object structure roughly matches:
    // { user: { name, email, mobile, ... }, age, gender, bloodGroup, address, medicalHistory: [], visits: [] }

    const pUser = patient.user || patient;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Nav Back */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Patients
            </button>

            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-200">
                    {pUser.name?.charAt(0)}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{pUser.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5"><User size={14} /> {patient.age || 'N/A'} Years, {patient.gender || 'Unknown'}</span>
                        <span className="flex items-center gap-1.5"><Activity size={14} /> {patient.bloodGroup || 'Blood Group N/A'}</span>
                        <span className="flex items-center gap-1.5 text-gray-400">|</span>
                        <span className="flex items-center gap-1.5"><Phone size={14} /> {pUser.mobile || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Mail size={14} /> {pUser.email || 'N/A'}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/doctor/prescription?patientId=${patient.id}`} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <FileText size={18} /> New Prescription
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Vitals & Info */}
                <div className="space-y-6">
                    {/* Vitals */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Latest Vitals</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-xs font-bold text-red-400 uppercase mb-1">Heart Rate</p>
                                <p className="text-xl font-black text-red-600">{patient.vitals?.heartRate || '--'} <span className="text-xs font-medium text-red-400">bpm</span></p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-400 uppercase mb-1">BP</p>
                                <p className="text-xl font-black text-blue-600">{patient.vitals?.bp || '--/--'} <span className="text-xs font-medium text-blue-400">mmHg</span></p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Weight</p>
                                <p className="text-xl font-black text-emerald-600">{patient.vitals?.weight || '--'} <span className="text-xs font-medium text-emerald-400">kg</span></p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-xs font-bold text-orange-400 uppercase mb-1">Temp</p>
                                <p className="text-xl font-black text-orange-600">{patient.vitals?.temp || '--'} <span className="text-xs font-medium text-orange-400">°F</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Contact Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-bold text-gray-900">Address</p>
                                    <p className="text-gray-500">{patient.address || 'No address provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-bold text-gray-900">Emergency Contact</p>
                                    <p className="text-gray-500">{patient.emergencyContact?.name || '--'} ({patient.emergencyContact?.relation || '--'})</p>
                                    <p className="text-gray-500">{patient.emergencyContact?.phone || '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Timeline/History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Medical History */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Medical History</h3>
                        <div className="flex flex-wrap gap-2">
                            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                                patient.medicalHistory.map((item: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">{item}</span>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm italic">No known allergies or chronic conditions recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Past Consultations */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Consultation History</h3>
                        <div className="space-y-6">
                            {patient.visits && patient.visits.length > 0 ? (
                                patient.visits.map((visit: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Timeline Line */}
                                        {idx !== patient.visits.length - 1 && (
                                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200"></div>
                                        )}
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center text-blue-600 shrink-0 z-10">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{visit.reason || 'General Consultation'}</h4>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Clock size={12} /> {new Date(visit.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-lg">Completed</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{visit.notes || 'No notes recorded.'}</p>
                                            <div className="flex gap-2">
                                                <button className="text-xs font-bold text-blue-600 hover:underline">View Prescription</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">No past consultation records found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
