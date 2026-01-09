'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Printer, ArrowLeft, HeartPulse, Stethoscope, User, ClipboardList, Save } from 'lucide-react';
import { Card, Button, FormInput, FormSelect, FormTextarea } from '@/components/admin';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { dischargeService } from '@/lib/integrations/services/discharge.service';

import { PrintableDischargeSummary } from './components/PrintableDischargeSummary';

const INITIAL_FORM_STATE = {
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',

    roomNo: '',
    mrn: '',
    roomType: 'General Ward',
    admissionDate: '',
    dischargeDate: '',
    department: '',
    reasonForAdmission: '',
    provisionalDiagnosis: '',
    diagnosis: '',
    chiefComplaints: '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    vitalSigns: '',
    generalAppearance: '',
    treatmentGiven: '',
    surgicalProcedures: '',
    surgeryNotes: '',
    investigationsPerformed: '',
    hospitalCourse: '',
    conditionAtDischarge: 'Improved',
    suggestedDoctorName: '',
    hospitalName: '',
    medicationsPrescribed: '',
    adviceAtDischarge: '',
    activityRestrictions: '',
    followUpInstructions: '',
    patientTitle: 'Mr',
};

export default function DischargeSummaryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const recordId = searchParams.get('id');
    const [loading, setLoading] = useState(false);
    const [consultants, setConsultants] = useState<string[]>(['']);
    const [isInitialized, setIsInitialized] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Discharge_Summary_${recordId || 'New'}`,
    });

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    useEffect(() => {
        if (recordId) {
            const fetchRecord = async () => {
                try {
                    const response = await dischargeService.getRecordById(recordId);
                    const record = response.data;

                    // Format dates for datetime-local input
                    const formatDate = (date: string | Date) => {
                        if (!date) return '';
                        const d = new Date(date);
                        return d.toISOString().slice(0, 16);
                    };

                    setFormData(prev => ({
                        ...prev,
                        ...record,
                        admissionDate: formatDate(record.admissionDate),
                        dischargeDate: formatDate(record.dischargeDate),
                    }));
                    setConsultants(record.consultants || ['']);
                } catch (err) {
                    toast.error("Failed to fetch record for editing");
                    console.error(err);
                } finally {
                    setIsInitialized(true);
                }
            };
            fetchRecord();
        } else {
            // Load draft from local storage if creating new
            const savedDraft = localStorage.getItem('discharge_form_draft');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    if (parsed.formData) setFormData(parsed.formData);
                    if (parsed.consultants) setConsultants(parsed.consultants);
                    // Optional: toast.success('Restored unsaved draft');
                } catch (e) {
                    console.error('Failed to restore draft', e);
                }
            }
            setIsInitialized(true);
        }
    }, [recordId]);

    // Save draft to local storage
    useEffect(() => {
        if (!recordId && isInitialized) {
            const draft = { formData, consultants };
            localStorage.setItem('discharge_form_draft', JSON.stringify(draft));
        }
    }, [formData, consultants, recordId, isInitialized]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // name should be accept character not numbers
        if (name === 'patientName') {
            const charOnly = value.replace(/[0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: charOnly }));
            return;
        }

        // phone number accept only 10 digits and restrict characters
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConsultantChange = (index: number, value: string) => {
        // Validate Consultant Name: characters and special characters only (no numbers)
        if (/^[^0-9]*$/.test(value)) {
            const newConsultants = [...consultants];
            newConsultants[index] = value;
            setConsultants(newConsultants);
        }
    };

    const addConsultant = () => setConsultants([...consultants, '']);
    const removeConsultant = (index: number) => {
        if (consultants.length > 1) {
            setConsultants(consultants.filter((_, i) => i !== index));
        }
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear all data?")) {
            setFormData(INITIAL_FORM_STATE);
            setConsultants(['']);
            localStorage.removeItem('discharge_form_draft');
            toast.success("Form cleared successfully");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone number (must be 10 digits if provided)
        if (formData.phone && formData.phone.length !== 10) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        // Validate admission and discharge dates
        if (formData.admissionDate && formData.dischargeDate) {
            const admission = new Date(formData.admissionDate);
            const discharge = new Date(formData.dischargeDate);
            if (admission > discharge) {
                toast.error("Admission date cannot be later than discharge date");
                return;
            }
        }

        // Validate Mandatory Fields for Printing
        const requiredFields = [
            { key: 'patientName', label: 'Patient Name' },
            { key: 'mrn', label: 'MRN' },
            { key: 'diagnosis', label: 'Final Diagnosis' },
            { key: 'treatmentGiven', label: 'Treatment Given' },
            { key: 'chiefComplaints', label: 'Chief Complaints' },
            { key: 'conditionAtDischarge', label: 'Condition at Discharge' },
            { key: 'vitalSigns', label: 'Vital Signs' }
        ];

        const missingFields = requiredFields.filter(field => !formData[field.key as keyof typeof formData]);

        if (missingFields.length > 0) {
            const missingLabels = missingFields.map(f => f.label).join(', ');
            toast.error(`Please fill the following details before printing: ${missingLabels}`);
            return;
        }

        setLoading(true);

        try {
            const submissionData = {
                ...formData,
                consultants: consultants.filter(c => c.trim() !== ''),
            };

            if (recordId) {
                await dischargeService.updateRecord(recordId, submissionData);
                toast.success('Discharge summary updated!');
            } else {
                await dischargeService.saveRecord(submissionData);
                toast.success('Discharge summary saved!');
                localStorage.removeItem('discharge_form_draft');
            }

            // Short delay to ensure state is ready for print if needed
            // But handlePrint uses refs, so it's usually fine.
            setTimeout(() => {
                handlePrint();
                setLoading(false);
                if (!recordId) {
                    router.push('/discharge/history');
                }
            }, 500);
        } catch (err: any) {
            toast.error(err.message || "Failed to save record");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-5xl mx-auto">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900   tracking-tighter ">
                            {recordId ? 'Edit Summary' : 'Discharge Summary'}
                        </h1>
                        <p className="text-sm font-medium text-gray-500">
                            {recordId ? 'Updating historical patient record' : 'Create patient discharge summary'}
                        </p>
                    </div>
                </div>

                {/* Main Document Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-white overflow-hidden p-8 lg:p-16">
                

                    <div className="space-y-16">
                        {/* Section: Demographics */}
                        <section>
                            <h3 className="text-lg font-bold text-blue-600 mb-8 flex items-center gap-2">
                                <User size={22} /> Patient Demographics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="flex gap-2 items-end">
                                    <div className="w-24">
                                        <FormSelect
                                            label="Title"
                                            name="patientTitle"
                                            options={[
                                                { label: 'Mr', value: 'Mr' },
                                                { label: 'Ms', value: 'Ms' },
                                                { label: 'Mrs', value: 'Mrs' }
                                            ]}
                                            value={formData.patientTitle}
                                            onChange={handleChange}
                                            className="rounded-xl border-gray-100"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <FormInput label="Patient Name *" name="patientName" value={formData.patientName} onChange={handleChange} required className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                    </div>
                                </div>
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
                                <FormInput label="MRN *" name="mrn" value={formData.mrn} onChange={handleChange} required placeholder="MRN-00000" className="rounded-xl border-gray-100 focus:bg-blue-50/10" />

                                <FormSelect
                                    label="Room Type"
                                    name="roomType"
                                    options={[
                                        { label: 'General Ward', value: 'General Ward' },
                                        { label: 'Semi-Private Room', value: 'Semi-Private Room' },
                                        { label: 'Private Room', value: 'Private Room' },
                                        { label: 'Deluxe Room', value: 'Deluxe Room' },
                                        { label: 'Suite', value: 'Suite' },

                                        { label: 'ICU', value: 'ICU' },
                                        { label: 'HDU', value: 'HDU' },
                                        { label: 'CCU', value: 'CCU' },
                                        { label: 'NICU', value: 'NICU' },
                                        { label: 'PICU', value: 'PICU' },

                                        { label: 'Isolation Room', value: 'Isolation Room' },
                                        { label: 'Day Care', value: 'Day Care' },
                                        { label: 'Labour Room', value: 'Labour Room' },
                                        { label: 'Recovery Room', value: 'Recovery Room' }
                                    ]}
                                    value={formData.roomType}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-100"
                                />
                                <FormInput label="Room Number" name="roomNo" value={formData.roomNo} onChange={handleChange} placeholder="e.g., 303" className="rounded-xl border-gray-100 focus:bg-blue-50/10" />
                                <FormInput label="Admission Date" name="admissionDate" type="datetime-local" value={formData.admissionDate} onChange={handleChange} className="rounded-xl border-gray-100" />
                                <FormInput label="Discharge Date" name="dischargeDate" type="datetime-local" value={formData.dischargeDate} onChange={handleChange} className="rounded-xl border-gray-100" />
                                <FormSelect
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-100"
                                    options={[
                                        { label: 'General Medicine', value: 'General Medicine' },
                                        { label: 'General Surgery', value: 'General Surgery' },
                                        { label: 'Pediatrics', value: 'Pediatrics' },
                                        { label: 'Obstetrics & Gynecology (OBG)', value: 'Obstetrics & Gynecology (OBG)' },
                                        { label: 'Orthopedics', value: 'Orthopedics' },
                                        { label: 'Cardiology', value: 'Cardiology' },
                                        { label: 'Neurology', value: 'Neurology' },
                                        { label: 'Neurosurgery', value: 'Neurosurgery' },
                                        { label: 'Gastroenterology', value: 'Gastroenterology' },
                                        { label: 'Pulmonology (Chest / TB)', value: 'Pulmonology (Chest / TB)' },
                                        { label: 'Nephrology', value: 'Nephrology' },
                                        { label: 'Urology', value: 'Urology' },
                                        { label: 'Dermatology (Skin)', value: 'Dermatology (Skin)' },
                                        { label: 'Psychiatry', value: 'Psychiatry' },
                                        { label: 'Oncology (Cancer)', value: 'Oncology (Cancer)' },
                                        { label: 'Endocrinology', value: 'Endocrinology' },
                                        { label: 'Rheumatology', value: 'Rheumatology' },
                                        { label: 'Infectious Diseases', value: 'Infectious Diseases' }, { label: 'Plastic Surgery', value: 'Plastic Surgery' },
                                        { label: 'Cardiothoracic Surgery (CTVS)', value: 'CTVS' },
                                        { label: 'Vascular Surgery', value: 'Vascular Surgery' },
                                        { label: 'Pediatric Surgery', value: 'Pediatric Surgery' },
                                        { label: 'Physiotherapy', value: 'Physiotherapy' },
                                        { label: 'Rehabilitation Medicine', value: 'Rehabilitation Medicine' },
                                        { label: 'Nutrition & Dietetics', value: 'Nutrition & Dietetics' },


                                    ]}
                                />

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

                        <section className="space-y-12">
                            <h3 className="text-lg font-bold text-blue-600 mb-2 flex items-center gap-2">
                                <Stethoscope size={22} /> Clinical Documentation
                            </h3>
                            <div className="grid grid-cols-1 gap-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Reason for Admission" name="reasonForAdmission" value={formData.reasonForAdmission} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Provisional Diagnosis at Admission" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Final Diagnosis at Discharge *" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Chief Complaints" name="chiefComplaints" value={formData.chiefComplaints} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="History of Present Illness" name="historyOfPresentIllness" value={formData.historyOfPresentIllness} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Past Medical History" name="pastMedicalHistory" value={formData.pastMedicalHistory} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Vital Signs (BP, Pulse, etc.)" name="vitalSigns" value={formData.vitalSigns} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="General Appearance" name="generalAppearance" value={formData.generalAppearance} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Investigations Performed" name="investigationsPerformed" value={formData.investigationsPerformed} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Course in the Hospital" name="hospitalCourse" value={formData.hospitalCourse} onChange={handleChange} rows={3} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Treatment Given *" name="treatmentGiven" value={formData.treatmentGiven} onChange={handleChange} required rows={4} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Surgery Notes" name="surgeryNotes" value={formData.surgeryNotes} onChange={handleChange} rows={4} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormTextarea label="Surgical Procedures (if any)" name="surgicalProcedures" value={formData.surgicalProcedures} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                    <FormTextarea label="Medications Prescribed" name="medicationsPrescribed" value={formData.medicationsPrescribed} onChange={handleChange} placeholder="LIST DOSAGE & FREQUENCY..." rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                </div>
                            </div>
                        </section>

                        {/* Section: Discharge Planning */}
                        <section className="space-y-12">
                            <h3 className="text-lg font-bold text-blue-600 mb-8 flex items-center gap-2">
                                <HeartPulse size={22} /> Discharge Planning & Advice
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <FormSelect
                                    label="Condition at Discharge"
                                    name="conditionAtDischarge"
                                    options={[
                                        { label: 'Improved', value: 'Improved' },
                                        { label: 'Stable', value: 'Stable' },
                                        { label: 'Referred to Higher Hospital', value: 'Referred to Higher Hospital' }
                                    ]}
                                    value={formData.conditionAtDischarge}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-100"
                                />
                                {formData.conditionAtDischarge === 'Referred to Higher Hospital' && (
                                    <>
                                        <FormInput
                                            label="Suggested Doctor Name"
                                            name="suggestedDoctorName"
                                            value={formData.suggestedDoctorName}
                                            onChange={handleChange}
                                            className="rounded-xl border-gray-100 focus:bg-blue-50/10"
                                        />
                                        <FormInput
                                            label="Hospital Name"
                                            name="hospitalName"
                                            value={formData.hospitalName}
                                            onChange={handleChange}
                                            className="rounded-xl border-gray-100 focus:bg-blue-50/10"
                                        />
                                    </>
                                )}
                                <FormTextarea label="Advice on Discharge" name="adviceAtDischarge" value={formData.adviceAtDischarge} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                <FormTextarea label="Activity Restrictions" name="activityRestrictions" value={formData.activityRestrictions} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                                <FormTextarea label="Follow-up Instructions" name="followUpInstructions" value={formData.followUpInstructions} onChange={handleChange} rows={2} className="rounded-2xl border-gray-100 focus:bg-blue-50/10" />
                            </div>
                        </section>

                        {/* Final Footer Actions */}
                        <footer className="pt-12 border-t border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex gap-4">
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={loading}
                                    className="px-6 py-2 rounded-2xl font-bold text-white bg-green-500 hover:bg-green-100 border border-green-200 transition-all flex items-center gap-2"
                                >
                                    Clear Data
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1 md:flex-none py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3">
                                    {loading ? 'Processing...' : (
                                        <>
                                            {recordId ? <Save size={22} /> : <Printer size={22} />}
                                            {recordId ? 'Update & Print' : 'Commit & Print'}
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
