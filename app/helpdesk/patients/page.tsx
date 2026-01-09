'use client';

import React, { useState, useEffect } from "react";
import { Users, Search, Phone, Mail, Calendar, FileText, Loader2, AlertCircle, Plus } from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ClinicalReceipt from "@/components/helpdesk/ClinicalReceipt";

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [fetchingReceipt, setFetchingReceipt] = useState<string | null>(null);
    const limit = 10;
    const [hospitalInfo, setHospitalInfo] = useState<any>(null);

    useEffect(() => {
        fetchPatients();
        fetchMe();
    }, [page]);

    const fetchMe = async () => {
        try {
            const me = await helpdeskService.getMe();
            setHospitalInfo(me.hospital);
        } catch (e) {}
    };

    useEffect(() => {
        // Debounce search
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
            const timer = setTimeout(() => {
                setPage(1);
                fetchPatients();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            console.log('[Patients Page] Fetching patients with search:', searchTerm);
            const data: any = await helpdeskService.searchPatients(searchTerm || '');
            console.log('[Patients Page] Received data:', data);
            
            // Handle both formats: direct array or {data: [], pagination: {}}
            if (Array.isArray(data)) {
                setPatients(data);
                setTotal(data.length);
            } else {
                setPatients(data.data || []);
                setTotal(data.pagination?.total || 0);
            }
        } catch (error: any) {
            console.error("[Patients Page] Failed to fetch patients:", error);
            toast.error(error.message || "Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (patientId: string) => {
        router.push(`/helpdesk/appointment-booking?patientId=${patientId}`);
    };

    const handlePrintLatestReceipt = async (patient: any) => {
        try {
            const patientId = patient._id || patient.id;
            setFetchingReceipt(patientId);
            
            // Reusing getAppointments but filtered by patientId
            const apps: any = await helpdeskService.getAppointments();
            const patientApps = apps.filter((a: any) => (a.patient?._id || a.patient) === patientId);
            
            if (patientApps.length === 0) {
                toast.error("No appointments found for this patient");
                return;
            }

            // Get latest appointment
            const latest = patientApps.sort((a: any, b: any) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];

            setReceiptData({
                 hospital: {
                     name: hospitalInfo?.name || "CureChain Hospital Node",
                     address: hospitalInfo?.address || "Central Healthcare District, New Delhi",
                     contact: hospitalInfo?.mobile || "+91 99999 00000",
                     email: hospitalInfo?.email || "care@curechain.io"
                 },
                 patient: {
                     name: patient.name || patient.user?.name,
                     mrn: patient.profile?.mrn || patient.mrn || latest.mrn || "N/A",
                     age: patient.profile?.age || patient.age || "N/A",
                     gender: patient.profile?.gender || patient.gender || "N/A",
                     mobile: patient.mobile || patient.user?.mobile || "N/A",
                     email: patient.email || patient.user?.email || "N/A",
                     address: patient.profile?.address || patient.address || "N/A",
                     emergencyContact: patient.profile?.emergencyContact || patient.emergencyContact || "N/A",
                     bloodGroup: patient.profile?.bloodGroup || patient.bloodGroup || "N/A",
                     dateOfBirth: patient.profile?.dateOfBirth || patient.dateOfBirth || "N/A",
                     vitals: latest.vitals ? {
                         bp: latest.vitals.bloodPressure,
                         pulse: latest.vitals.pulse,
                         temp: latest.vitals.temperature,
                         weight: latest.vitals.weight,
                         spo2: latest.vitals.spO2
                     } : undefined
                 },
                 appointment: {
                     doctorName: latest.doctor?.user?.name || latest.doctor?.name || "Assigned Physician",
                     specialization: latest.doctor?.specialties?.[0],
                     degree: latest.doctor?.qualifications?.join(', '),
                     date: new Date(latest.date).toLocaleDateString('en-GB'),
                     time: latest.appointmentTime || latest.startTime || "IN QUEUE",
                     type: latest.type || 'Offline',
                     appointmentId: latest.appointmentId
                 },
                 payment: {
                     amount: latest.payment?.amount || latest.amount || 500.00,
                     method: latest.payment?.paymentMethod || 'cash',
                     status: latest.payment?.paymentStatus || 'PAID'
                 }
             });

            setShowReceipt(true);
        } catch (error: any) {
            toast.error("Failed to fetch receipt data");
        } finally {
            setFetchingReceipt(null);
        }
    };


    const totalPages = Math.ceil(total / limit);

    if (loading && page === 1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Patient Records...</p>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic">Patient Registry</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Complete database of registered patients</p>
                </div>
                <button 
                    onClick={() => router.push('/helpdesk/patient-registration')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={18} /> Register New Patient
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="SEARCH BY NAME, MOBILE, OR MRN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Patients Grid */}
            {patients.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => {
                            const name = patient.name || patient.user?.name || "Unknown";
                            const mobile = patient.mobile || patient.user?.mobile || "N/A";
                            const email = patient.email || patient.user?.email || "N/A";
                            const mrn = patient.profile?.mrn || patient.mrn || "N/A";
                            const gender = patient.profile?.gender || patient.gender || "N/A";
                            const lastVisit = patient.profile?.lastVisit || patient.lastVisit;
                            const patientId = patient._id || patient.id || patient.user?._id;

                            return (
                                <div key={patientId} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl group-hover:scale-110 transition-transform">
                                            {name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">{name}</p>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">MRN: {mrn}</p>
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-black bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {gender}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Phone size={14} />
                                            <span className="text-xs font-bold">{mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Mail size={14} />
                                            <span className="text-xs font-bold truncate">{email}</span>
                                        </div>
                                        {lastVisit && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Calendar size={14} />
                                                <span className="text-xs font-bold">
                                                    Last Visit: {new Date(lastVisit).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="h-px bg-gray-50 dark:bg-gray-800 w-full" />
                                        <button 
                                            onClick={() => handleBookAppointment(patientId)}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/10 active:scale-95 mb-2"
                                        >
                                            Book Appointment
                                        </button>
                                        <button 
                                            onClick={() => handlePrintLatestReceipt(patient)}
                                            disabled={fetchingReceipt === patientId}
                                            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {fetchingReceipt === patientId ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                                            Print Latest Receipt
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        {searchTerm ? "No patients found matching your search" : "No patients registered yet"}
                    </p>
                    <button 
                        onClick={() => router.push('/helpdesk/patient-registration')}
                        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Register First Patient
                    </button>
                </div>
            )}
        </div>

        {showReceipt && receiptData && (
            <ClinicalReceipt 
                {...receiptData}
                onClose={() => setShowReceipt(false)}
            />
        )}
        </>
    );
}
