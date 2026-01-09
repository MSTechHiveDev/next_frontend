'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Printer, ArrowLeft, HeartPulse, Stethoscope, User, ClipboardList } from 'lucide-react';
import { Card, Button, FormInput, FormSelect, FormTextarea } from '@/components/admin';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

// Printable Component with Professional Border and Padding
const PrintableDischargeSummary = React.forwardRef<HTMLDivElement, { data: any, consultants: string[] }>(({ data, consultants }, ref) => {
    return (
        <div ref={ref} className="p-16 bg-white text-black font-serif text-[13px] leading-relaxed print:p-8">
            <div className="border-4 border-double border-black p-10 min-h-[1000px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-700 uppercase tracking-widest mb-1">Discharge Summary</h1>
                    <p className="text-sm font-semibold text-gray-500 italic">Hospital Name / Medical Center</p>
                    <div className="mt-4 border-b-2 border-blue-600 w-full" />
                </div>

                {/* Demographics Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 pb-6 border-b border-gray-200">
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Patient Name:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1">{data.patientName || '---'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Age/Gender:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1">{data.age || '---'} / {data.gender || '---'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">IP No / MRN:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1">{data.ipNo || data.mrn || '---'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Room No:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1">{data.roomNo || '---'} ({data.roomType || '---'})</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Admission Date:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1">{data.admissionDate ? new Date(data.admissionDate).toLocaleString() : '---'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Discharge Date:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1">{data.dischargeDate ? new Date(data.dischargeDate).toLocaleString() : '---'}</span>
                    </div>
                    <div className="flex gap-2 col-span-2">
                        <span className="font-bold min-w-[130px]">Address:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1 uppercase">{data.address || '---'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Department:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1 uppercase">{data.department || '---'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold min-w-[130px]">Consultant:</span>
                        <span className="border-b border-dotted border-gray-400 flex-1 uppercase">{consultants.filter(d => d).join(', ') || '---'}</span>
                    </div>
                </div>

                {/* Clinical Content Sections */}
                <div className="space-y-8">
                    {[
                        { label: 'Reason for Admission', value: data.reasonForAdmission },
                        { label: 'Diagnosis', value: data.diagnosis },
                        { label: 'Chief Complaints', value: data.chiefComplaints },
                        { label: 'History of Present Illness', value: data.historyOfPresentIllness },
                        { label: 'Past Medical History', value: data.pastMedicalHistory },
                        { label: 'Treatment Given', value: data.treatmentGiven },
                        { label: 'Surgical Procedures', value: data.surgicalProcedures },
                        { label: 'Investigations Performed', value: data.investigationsPerformed },
                        { label: 'Condition at Discharge', value: data.conditionAtDischarge },
                        { label: 'Medications Prescribed', value: data.medicationsPrescribed },
                        { label: 'Advice on Discharge', value: data.adviceAtDischarge },
                        { label: 'Activity Restrictions', value: data.activityRestrictions },
                        { label: 'Follow-up Instructions', value: data.followUpInstructions },
                    ].map((section, idx) => (
                        <section key={idx} className="page-break-inside-avoid">
                            <h3 className="font-bold uppercase text-[14px] text-blue-800 mb-2 border-l-4 border-blue-600 pl-3">{section.label}:</h3>
                            <p className="pl-6 whitespace-pre-wrap text-gray-800 italic">{section.value || '---'}</p>
                        </section>
                    ))}
                </div>

                {/* Signature Area */}
                <div className="mt-20 flex justify-between items-end">
                    <div className="text-center">
                        <div className="w-56 border-t border-black mb-2" />
                        <p className="font-bold text-xs">Patient / Caretaker Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="w-56 border-t border-black mb-2" />
                        <p className="font-bold text-xs uppercase">Authorized Medical Personnel</p>
                        <p className="text-[10px] text-gray-500 italic uppercase">{data.department || 'General Medicine'} Unit</p>
                    </div>
                </div>

                <div className="mt-12 text-[10px] text-gray-400 text-center border-t border-gray-100 pt-6">
                    This document is an electronically generated clinical summary. Confidential medical record.
                </div>
            </div>
        </div>
    );
});

PrintableDischargeSummary.displayName = 'PrintableDischargeSummary';

export default function DischargeSummaryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [consultants, setConsultants] = useState<string[]>(['']);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Discharge_Summary_Manifest',
    });

    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        ipNo: '',
        roomNo: '',
        mrn: '',
        roomType: 'General',
        admissionDate: '',
        dischargeDate: '',
        department: '',
        reasonForAdmission: '',
        diagnosis: '',
        chiefComplaints: '',
        historyOfPresentIllness: '',
        pastMedicalHistory: '',
        treatmentGiven: '',
        surgicalProcedures: '',
        investigationsPerformed: '',
        conditionAtDischarge: 'Improved',
        medicationsPrescribed: '',
        adviceAtDischarge: '',
        activityRestrictions: '',
        followUpInstructions: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConsultantChange = (index: number, value: string) => {
        const newConsultants = [...consultants];
        newConsultants[index] = value;
        setConsultants(newConsultants);
    };

    const addConsultant = () => setConsultants([...consultants, '']);
    const removeConsultant = (index: number) => {
        if (consultants.length > 1) {
            setConsultants(consultants.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            handlePrint();
            toast.success('Discharge summary generated!');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Discharge Summary</h1>
                        <p className="text-sm font-medium text-gray-500">Create patient discharge summary</p>
                    </div>
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-full hover:bg-white shadow-sm transition-all border border-gray-100">
                        <ArrowLeft size={20} className="mr-2" /> Back
                    </Button>
                </div>

                {/* Main Document Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-white overflow-hidden p-8 lg:p-16">
                    {/* Form Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-blue-700 uppercase tracking-widest mb-1">Discharge Summary</h2>
                        <p className="text-sm font-semibold text-gray-400">Hospital Name / Medical Center</p>
                        <div className="mt-6 border-b-2 border-blue-600/20 w-full" />
                    </div>

                    <div className="space-y-16">
                        {/* Section: Demographics */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-8 flex items-center gap-2">
                                <User size={22} /> Patient Demographics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <FormInput label="Patient Name *" name="patientName" value={formData.patientName} onChange={handleChange} required className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                <FormInput label="Age" name="age" placeholder="e.g., 45 years" value={formData.age} onChange={handleChange} className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                <FormSelect label="Gender" name="gender" options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }]} value={formData.gender} onChange={handleChange} className="rounded-xl border-gray-100" />
                                <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                <div className="md:col-span-2">
                                    <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                            </div>
                        </section>

                        {/* Section: Admission */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-8 flex items-center gap-2">
                                <ClipboardList size={22} /> Admission Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <FormInput label="IP No / MRN *" name="mrn" value={formData.mrn} onChange={handleChange} required placeholder="MRN-00000" className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                <FormInput label="Room No" name="roomNo" value={formData.roomNo} onChange={handleChange} placeholder="Room 303 (General)" className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                <FormInput label="Admission Date" name="admissionDate" type="datetime-local" value={formData.admissionDate} onChange={handleChange} className="rounded-xl border-gray-100" />
                                <FormInput label="Discharge Date" name="dischargeDate" type="datetime-local" value={formData.dischargeDate} onChange={handleChange} className="rounded-xl border-gray-100" />
                                <FormInput label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., CARDIOLOGY" className="rounded-xl border-gray-100 focus:bg-blue-50/10" />

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-700">Consultant Doctor Name(s)</label>
                                    {consultants.map((doctor, index) => (
                                        <div key={index} className="flex gap-2 group animate-in slide-in-from-right-2">
                                            <input
                                                className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm transition-all text-sm outline-none"
                                                placeholder={`Doctor ${index + 1}`}
                                                value={doctor}
                                                onChange={(e) => handleConsultantChange(index, e.target.value)}
                                            />
                                            {consultants.length > 1 && (
                                                <button type="button" onClick={() => removeConsultant(index)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addConsultant} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-2">
                                        <Plus size={16} /> Add Another Consultant
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Section: Clinical Registry */}
                        <section className="space-y-12">
                            <div className="grid grid-cols-1 gap-10">
                                <FormTextarea label="Reason for Admission" name="reasonForAdmission" value={formData.reasonForAdmission} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Clinical Diagnosis *" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Chief Complaints" name="chiefComplaints" value={formData.chiefComplaints} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <FormTextarea label="History of Present Illness" name="historyOfPresentIllness" value={formData.historyOfPresentIllness} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Treatment Given *" name="treatmentGiven" value={formData.treatmentGiven} onChange={handleChange} required rows={4} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Medications Prescribed" name="medicationsPrescribed" value={formData.medicationsPrescribed} onChange={handleChange} placeholder="LIST DOSAGE & FREQUENCY..." rows={4} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                            </div>
                        </section>

                        {/* Final Footer Actions */}
                        <footer className="pt-12 border-t border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex gap-4">
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                    <HeartPulse size={14} /> Ready for Print
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button type="submit" disabled={loading} className="flex-1 md:flex-none py-5 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3">
                                    {loading ? 'Processing...' : (
                                        <>
                                            <Printer size={22} /> Commit & Print
                                        </>
                                    )}
                                </Button>
                            </div>
                        </footer>
                    </div>
                </form>

                {/* Hidden Printable Area */}
                <div className="hidden">
                    <PrintableDischargeSummary
                        ref={componentRef}
                        data={formData}
                        consultants={consultants}
                    />
                </div>
            </div>
        </div>
    );
}
