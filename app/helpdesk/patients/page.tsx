'use client';

import React, { useState, useEffect } from "react";
import { 
    Users, 
    Search, 
    Phone, 
    Mail, 
    Calendar, 
    FileText, 
    Loader2, 
    AlertCircle, 
    Plus, 
    ChevronRight, 
    ArrowLeft, 
    MoreVertical,
    Activity,
    ExternalLink,
    RefreshCw,
    Shield
} from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateClinicalReceiptHtml } from "@/lib/print-utils";

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [fetchingReceipt, setFetchingReceipt] = useState<string | null>(null);
    const limit = 10;
    const [hospitalInfo, setHospitalInfo] = useState<any>(null);

    const fetchMe = async () => {
        try {
            const me = await helpdeskService.getMe();
            setHospitalInfo(me.hospital);
        } catch (e) {}
    };

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data: any = await helpdeskService.searchPatients(searchTerm || '', page, limit);
            
            if (data.data) {
                setPatients(data.data);
                setTotal(data.pagination?.total || 0);
            } else if (Array.isArray(data)) {
                setPatients(data);
                setTotal(data.length);
            }
        } catch (error: any) {
            toast.error("Registry Sync Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
        fetchMe();
    }, [page]);

    useEffect(() => {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
            const timer = setTimeout(() => { setPage(1); fetchPatients(); }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const handlePrintLatestReceipt = async (patient: any) => {
        try {
            const patientId = patient._id || patient.id;
            setFetchingReceipt(patientId);
            const apps: any = await helpdeskService.getAppointments();
            const patientApps = apps.filter((a: any) => (a.patient?._id || a.patient) === patientId);
            
            if (patientApps.length === 0) {
                toast.error("No clinical history found");
                return;
            }

            const latest = patientApps.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

             const receiptData = {
                  hospital: {
                      name: hospitalInfo?.name || "CureChain Medical Center",
                      address: hospitalInfo?.address || "123 Health Avenue, Medicity, NY 10001",
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
                      vitals: latest.vitals ? {
                          bp: latest.vitals.bloodPressure || latest.vitals.bp,
                          pulse: latest.vitals.pulse,
                          temp: latest.vitals.temperature || latest.vitals.temp,
                          weight: latest.vitals.weight,
                          spo2: latest.vitals.spO2 || latest.vitals.spo2
                      } : undefined
                  },
                  appointment: {
                      doctorName: latest.doctor?.user?.name || latest.doctor?.name || "Assigned Physician",
                      specialization: latest.doctor?.specialties?.[0] || latest.doctor?.specialty,
                      date: new Date(latest.date).toLocaleDateString('en-GB'),
                      time: latest.appointmentTime || latest.startTime || "IN QUEUE",
                      type: latest.appointmentType || 'Consultation',
                      appointmentId: latest.appointmentId || latest._id?.slice(-8).toUpperCase()
                  },
                  payment: {
                      amount: latest.payment?.amount || latest.amount || 500.00,
                      method: latest.payment?.paymentMethod || 'cash',
                      status: latest.payment?.paymentStatus || 'PAID'
                  }
              };

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(generateClinicalReceiptHtml(receiptData));
                printWindow.document.close();
                toast.success("Preparing Manifest...");
            } else {
                toast.error("Please allow popups to print");
            }

        } catch (error: any) {
            toast.error("Receipt generation failed");
        } finally {
            setFetchingReceipt(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* PROFESSIONAL HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                            <ArrowLeft size={16} />
                        </Link>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Records / Patient Manifest</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Clinical Patient Registry
                    </h1>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Hospital Node / Document Indexed</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH REFERENCE / NAME..."
                            className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-tight outline-none focus:border-teal-500 shadow-sm transition-all"
                        />
                    </div>
                    <Link 
                        href="/helpdesk/patient-registration"
                        className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                    </Link>
                </div>
            </div>

            {/* LISTING PANEL */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-40 flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Registry...</p>
                            </div>
                        ) : patients.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <th className="px-6 py-4 text-left">Reference Node</th>
                                        <th className="px-6 py-4 text-left">Clinical Object</th>
                                        <th className="px-6 py-4 text-center">Workflow Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {patients.map((patient, idx) => {
                                        const patientId = patient._id || patient.id;
                                        return (
                                            <tr key={patientId} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">#{patient.profile?.mrn || patient.mrn || `P${idx + 1}`}</span>
                                                        <span className="text-[8px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg w-fit uppercase tracking-widest border border-teal-100">Verified</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-teal-600 group-hover:text-white transition-all flex items-center justify-center font-bold text-lg shadow-sm border border-slate-100">
                                                            {(patient.name || patient.user?.name || "P").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{patient.name || patient.user?.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{patient.profile?.age || patient.age}Y • {patient.profile?.gender || patient.gender}</span>
                                                                <div className="w-0.5 h-0.5 bg-slate-200 rounded-full" />
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{patient.mobile || patient.user?.mobile}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => router.push(`/helpdesk/patients/${patientId}`)}
                                                            className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                                                            title="View Profile"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => router.push(`/helpdesk/appointment-booking?patientId=${patientId}`)}
                                                            className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md shadow-teal-900/10 transition-all"
                                                            title="New Appointment"
                                                        >
                                                            <Calendar size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePrintLatestReceipt(patient)}
                                                            disabled={fetchingReceipt === patientId}
                                                            className="p-2 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 hover:border-teal-100 transition-all"
                                                            title="Print Ledger"
                                                        >
                                                            {fetchingReceipt === patientId ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-40 text-center">
                                <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No patient nodes indexed in registry</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGINATION PANEL */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 max-w-fit mx-auto shadow-sm">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 text-slate-400 hover:text-teal-600 disabled:opacity-30 transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                        page === i + 1 
                                            ? 'bg-slate-900 text-white shadow-lg' 
                                            : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 text-slate-400 hover:text-teal-600 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
