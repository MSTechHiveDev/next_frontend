'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, FileText, Clock, CreditCard, X, Printer, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getDoctorPatientDetailsAction, getDoctorProfileAction, getAllAppointmentsAction } from '@/lib/integrations/actions/doctor.actions';
import { doctorService } from '@/lib/integrations/services/doctor.service';
import { PrescriptionDocument } from '@/components/documents/PrescriptionDocument';
import toast from 'react-hot-toast';

export default function PatientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);

    // Prescription View State
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
    const [isPivoting, setIsPivoting] = useState(false);
    const [isRxModalOpen, setIsRxModalOpen] = useState(false);

    useEffect(() => {
        const fetchDoctorId = async () => {
            const res = await getDoctorProfileAction();
            if (res.success && res.data) {
                // Determine if ID is _id or id and if it's the profile ID or user ID. 
                // Appointments usually link to Doctor Profile ID.
                setCurrentDoctorId(res.data._id || res.data.id);
            }
        };
        fetchDoctorId();

        if (params.id) {
            loadPatientData(params.id as string);
        }
    }, [params.id]);

    const loadPatientData = async (id: string) => {
        setIsLoading(true);
        try {
            // Parallel fetch: Patient Profile and All Appointments
            // We fetch all appointments because there isn't a dedicated "get appointments by patient" endpoint for doctors yet.
            const [profileRes, appointmentsRes] = await Promise.all([
                getDoctorPatientDetailsAction(id),
                getAllAppointmentsAction()
            ]);

            if (profileRes.success && profileRes.data) {
                setPatient(profileRes.data);

                if (appointmentsRes.success && appointmentsRes.data) {
                    // Filter appointments for this patient
                    // The patient ID in appointments (patientId or patient._id) should match the profile's user ID or the profile ID itself.
                    // We check both for robustness.
                    const pUserId = profileRes.data.user?._id || profileRes.data.user?.id;
                    const pProfileId = profileRes.data._id || profileRes.data.id; // The profile ID from the URL/response

                    const filtered = appointmentsRes.data.filter((appt: any) => {
                        // Check nested patient object or direct fields
                        const apptPId = appt.patient?._id || appt.patient?.id || appt.patientId || appt.patient;

                        // Match against User ID (most likely) or Profile ID
                        return (pUserId && apptPId === pUserId) || (pProfileId && apptPId === pProfileId);
                    });

                    // Sort by date descending
                    filtered.sort((a: any, b: any) => new Date(b.date || b.startTime).getTime() - new Date(a.date || a.startTime).getTime());

                    // Extract latest vitals for the dashboard display
                    const latestWithVitals = filtered.find(a => a.vitals && Object.values(a.vitals).some(v => v !== null && v !== "" && v !== undefined));
                    if (latestWithVitals) {
                        const cleanVitals = Object.fromEntries(
                            Object.entries(latestWithVitals.vitals).filter(([_, v]) => v)
                        );
                        setPatient((prev: any) => ({
                            ...prev,
                            ...cleanVitals
                        }));
                    }

                    setAppointments(filtered);
                }
            } else {
                toast.error(profileRes.error || "Failed to load patient details");
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("An error occurred while loading patient data.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPrescriptionDetails = async (visit: any) => {
        const rxId = visit.prescriptionId || visit.prescription?._id || visit.prescription;

        if (!rxId) {
            toast.error("No prescription linked to this consultation.");
            return;
        }

        setIsPivoting(true);
        setIsRxModalOpen(true);
        try {
            const res = await doctorService.getPrescriptionById(rxId);
            if (res.success && (res.prescription || res.data)) {
                setSelectedPrescription(res.prescription || res.data);
            } else {
                toast.error(res.message || "Could not retrieve prescription details.");
                setIsRxModalOpen(false);
            }
        } catch (error) {
            console.error("RX Fetch Error:", error);
            toast.error("Failed to load prescription.");
            setIsRxModalOpen(false);
        } finally {
            setIsPivoting(false);
        }
    };

    const handlePrintPrescription = () => {
        const printWindow = window.open('', '_blank');
        const content = document.querySelector('.print-prescription-container')?.innerHTML;

        if (printWindow && content) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Prescription Print</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: A4; margin: 0; }
                                body { margin: 0; -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        ${content}
                        <script>
                            window.onload = () => {
                                window.print();
                                // window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
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

    // Backend returns a flattened structure for vitals in PatientProfile
    // patient.user contains name, email, mobile
    const pUser = patient.user || {};

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Nav Back */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Patients
            </button>

            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-200">
                    {pUser.name?.charAt(0) || patient.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{pUser.name || patient.name || 'Unknown Patient'}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5"><User size={14} /> {patient.age || 'N/A'} Years, {patient.gender || 'Unknown'}</span>
                        <span className="flex items-center gap-1.5"><Activity size={14} /> {patient.bloodGroup || 'Blood Group N/A'}</span>
                        <span className="flex items-center gap-1.5 text-gray-400">|</span>
                        <span className="flex items-center gap-1.5"><Phone size={14} /> {pUser.mobile || patient.mobile || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Mail size={14} /> {pUser.email || patient.email || 'N/A'}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/doctor/prescription?patientId=${patient.user?._id || patient.user?.id || patient.id}`} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <FileText size={18} /> New Prescription
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Vitals & Info */}
                <div className="space-y-6">
                    {/* Vitals - Mapped from flat profile structure */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Latest Vitals</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-xs font-bold text-red-400 uppercase mb-1">Heart Rate</p>
                                <p className="text-xl font-black text-red-600">{patient.pulse || '--'} <span className="text-xs font-medium text-red-400">bpm</span></p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-400 uppercase mb-1">BP</p>
                                <p className="text-xl font-black text-blue-600">{patient.bloodPressure || '--/--'} <span className="text-xs font-medium text-blue-400">mmHg</span></p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Weight</p>
                                <p className="text-xl font-black text-emerald-600">{patient.weight || '--'} <span className="text-xs font-medium text-emerald-400">kg</span></p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-xs font-bold text-orange-400 uppercase mb-1">Temp</p>
                                <p className="text-xl font-black text-orange-600">{patient.temperature || '--'} <span className="text-xs font-medium text-orange-400">°F</span></p>
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
                        </div>
                    </div>
                </div>

                {/* Right Col: Timeline/History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Medical History */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Medical History</h3>
                        <div className="flex flex-wrap gap-2">
                            {/* Handle string or array */}
                            {patient.medicalHistory ? (
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">{patient.medicalHistory}</span>
                            ) : (
                                <p className="text-gray-400 text-sm italic">No known allergies or chronic conditions recorded.</p>
                            )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {patient.conditions && patient.conditions !== 'None' && (
                                <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg font-medium">Conditions: {patient.conditions}</span>
                            )}
                            {patient.allergies && patient.allergies !== 'None' && (
                                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium">Allergies: {patient.allergies}</span>
                            )}
                            {patient.medications && patient.medications !== 'None' && (
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">Meds: {patient.medications}</span>
                            )}
                        </div>
                    </div>

                    {/* Past Consultations */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Consultation History</h3>
                        <div className="space-y-6">
                            {appointments.length > 0 ? (
                                appointments.map((visit: any, idx: number, arr: any[]) => (
                                    <div
                                        key={idx}
                                        className="flex gap-4 relative cursor-pointer group"
                                        onClick={() => fetchPrescriptionDetails(visit)}
                                    >
                                        {/* Timeline Line */}
                                        {idx !== arr.length - 1 && (
                                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200"></div>
                                        )}
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center text-blue-600 shrink-0 z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 group-hover:shadow-md group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{visit.reason || visit.symptoms?.[0] || 'General Consultation'}</h4>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Clock size={12} /> {new Date(visit.date || visit.startTime).toLocaleDateString()} at {visit.time || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${visit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        visit.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {visit.status || 'Pending'}
                                                    </span>
                                                    {visit.paymentStatus && (
                                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-lg flex items-center gap-1 ${visit.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            <CreditCard size={8} /> {visit.paymentStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{visit.notes || visit.diagnosis || 'No notes recorded.'}</p>
                                            <div className="flex gap-2">
                                                {(visit.prescriptionId || visit.prescription || visit.prescription?._id) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fetchPrescriptionDetails(visit);
                                                        }}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 flex items-center gap-1"
                                                    >
                                                        <FileText size={12} /> View Full Prescription
                                                    </button>
                                                )}
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

            {/* Prescription Modal */}
            {isRxModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Prescription Node</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Multi-Role Registry</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedPrescription && (
                                    <button
                                        onClick={handlePrintPrescription}
                                        className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                                    >
                                        <Printer size={16} /> Print
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsRxModalOpen(false); setSelectedPrescription(null); }}
                                    className="p-2.5 bg-white text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 border border-gray-100 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-100/50 p-8 flex justify-center">
                            {isPivoting ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Fetching Clinical Data...</p>
                                </div>
                            ) : selectedPrescription ? (
                                <div className="print-prescription-container shadow-2xl bg-white">
                                    <PrescriptionDocument prescription={selectedPrescription} patient={patient} />
                                </div>
                            ) : (
                                <div className="text-center py-20 flex flex-col items-center gap-4">
                                    <FileText size={48} className="text-gray-200" />
                                    <p className="text-sm font-bold text-gray-400">Prescription details could not be loaded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
