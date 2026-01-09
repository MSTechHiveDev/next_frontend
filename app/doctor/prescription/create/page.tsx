'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Printer,
    Sparkles,
    User,
    Stethoscope,
    Plus,
    Trash2,
    FileText,
    Activity,
    Calendar,
    Save,
    Eraser,
    PenTool,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { doctorService } from '@/lib/integrations/services/doctor.service';
import { getAppointmentDetailsAction, getDoctorProfileAction } from '@/lib/integrations/actions/doctor.actions';
import medicineData from '@/medicine.json';
import { CheckCircle } from 'lucide-react';

// --- Types ---
interface Medicine {
    name: string;
    dosage: string;
    freq: string;
    duration: string;
    notes: string;
    price: number;
}

interface PrescriptionForm {
    patientName: string;
    age: string;
    gender: string;
    duration: string;
    mrn: string;
    date: string;
    symptoms: string;
    diagnosis: string;
    medicines: Medicine[];
    dietAdvice: string[];
    suggestedTests: string[];
    followUp: string;
    avoid: string[];
    doctorName: string;
    doctorSignature?: string; // URL or base64
    subtotal: number;
    tax: number;
    total: number;
}

const INITIAL_FORM: PrescriptionForm = {
    patientName: '',
    age: '',
    gender: 'Male',
    duration: '',
    mrn: '',
    date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
    symptoms: '',
    diagnosis: '',
    medicines: [],
    dietAdvice: [],
    suggestedTests: [],
    followUp: '',
    avoid: [],
    doctorName: '',
    subtotal: 0,
    tax: 0,
    total: 0
};

export default function CreatePrescriptionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    const [mode, setMode] = useState<'AI' | 'SELF'>('SELF');
    const [formData, setFormData] = useState<PrescriptionForm>(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Success State
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedHtml, setGeneratedHtml] = useState<{prescription: string, billing: string} | null>(null);



    // -- Fetch Appointment Details if ID present --
    useEffect(() => {
        if (appointmentId) {
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const res = await getAppointmentDetailsAction(appointmentId);

                    if (res.success && res.data) {
                        const apt = res.data;
                        const patientName = apt.patient?.name || apt.patientDetails?.name || '';
                        const age = apt.patient?.age || apt.patientDetails?.age || '';
                        const gender = apt.patient?.gender || apt.patientDetails?.gender || 'Male';
                        const mrn = apt.patient?.mrn || apt.mrn || '';
                        const symptoms = Array.isArray(apt.symptoms) ? apt.symptoms.join(', ') : (apt.symptoms || '');
                        const diagnosis = apt.reason || symptoms;

                        setFormData(prev => ({
                            ...prev,
                            patientName,
                            age: String(age),
                            gender: gender,
                            mrn,
                            symptoms,
                            diagnosis
                        }));
                    } else {
                        toast.error(res.error || "Failed to load appointment details");
                    }
                } catch (error) {
                    console.error("Failed to prefill", error);
                    toast.error("Failed to load appointment details");
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [appointmentId]);

    // -- Fetch Doctor Profile --
    useEffect(() => {
        const fetchDoctorProfile = async () => {
            const res = await getDoctorProfileAction();
            if (res.success && res.data) {
                const doc = res.data;
                setFormData(prev => ({
                    ...prev,
                    doctorName: doc.user?.name || doc.name || prev.doctorName,
                    doctorSignature: doc.signature
                }));
            }
        };
        fetchDoctorProfile();
    }, []);

    const handleGeneratePrescription = () => {
        if (!formData.symptoms) {
            toast.error("No symptoms to generate prescription from");
            return;
        }

        const currentSymptoms = formData.symptoms.split(',').map(s => s.trim().toLowerCase());
        let matchedMeds: Medicine[] = [];
        let matchedDiet: string[] = [];
        let matchedTests: string[] = [];
        let matchedAvoid: string[] = [];
        let matchedFollowUp: string = '';
        let matchedDiagnosis: string[] = [];

        medicineData.symptoms_data.forEach((protocol: any) => {
            const protocolSymptomLower = protocol.symptom.toLowerCase();
            const isMatch = currentSymptoms.some(userSym =>
                userSym.includes(protocolSymptomLower) || protocolSymptomLower.includes(userSym)
            );

            if (isMatch) {
                matchedDiagnosis.push(protocol.symptom);
                const meds: Medicine[] = protocol.medicine.map((m: string) => ({
                    name: m,
                    dosage: '-',
                    freq: '-',
                    duration: '-',
                    notes: '',
                    price: 0
                }));
                matchedMeds = [...matchedMeds, ...meds];
                if (protocol.diet_advice) matchedDiet = [...matchedDiet, ...protocol.diet_advice];
                if (protocol.suggested_tests) matchedTests = [...matchedTests, ...protocol.suggested_tests];
                if (protocol.avoid) matchedAvoid = [...matchedAvoid, ...protocol.avoid];
                if (protocol.follow_up) matchedFollowUp = protocol.follow_up;
            }
        });

        if (matchedMeds.length === 0) {
            toast.error("No matching protocols found for these symptoms");
            return;
        }

        matchedDiet = Array.from(new Set(matchedDiet));
        matchedTests = Array.from(new Set(matchedTests));
        matchedAvoid = Array.from(new Set(matchedAvoid));
        matchedDiagnosis = Array.from(new Set(matchedDiagnosis));

        setFormData(prev => ({
            ...prev,
            diagnosis: matchedDiagnosis.join(', '),
            medicines: matchedMeds,
            dietAdvice: matchedDiet,
            suggestedTests: matchedTests,
            avoid: matchedAvoid,
            followUp: matchedFollowUp || prev.followUp
        }));

        toast.success("Prescription Generated Successfully");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addMedicine = () => {
        setFormData(prev => ({
            ...prev,
            medicines: [...prev.medicines, { name: '', dosage: '', freq: '', duration: '', notes: '', price: 0 }]
        }));
    };

    const updateMedicine = (index: number, field: string, value: string | number) => {
        const newMeds = [...formData.medicines];
        (newMeds[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, medicines: newMeds }));
        if (field === 'price') {
            calculateBilling();
        }
    };

    const calculateBilling = () => {
        const subtotal = formData.medicines.reduce((sum, med) => sum + (med.price || 0), 0);
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;
        setFormData(prev => ({ ...prev, subtotal, tax, total }));
    };

    const removeMedicine = (index: number) => {
        setFormData(prev => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index)
        }));
    };

    const addArrayItem = (field: 'dietAdvice' | 'suggestedTests' | 'avoid') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const updateArrayItem = (field: 'dietAdvice' | 'suggestedTests' | 'avoid', index: number, value: string) => {
        const newArr = [...formData[field]];
        newArr[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArr }));
    };

    const removeArrayItem = (field: 'dietAdvice' | 'suggestedTests' | 'avoid', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!appointmentId) return toast.error("Appointment ID is required");
        if (!formData.patientName) return toast.error("Patient Name is required");
        if (!formData.diagnosis) return toast.error("Diagnosis is required");
        if (formData.medicines.length === 0) return toast.error("At least one medicine is required");

        try {
            setIsSaving(true);

            // Save prescription
            const prescriptionResponse = await doctorService.createPrescription({
                appointmentId,
                diagnosis: formData.diagnosis,
                symptoms: formData.symptoms.split(',').map(s => s.trim()),
                medicines: formData.medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.freq,
                    duration: m.duration,
                    instructions: m.notes,
                    price: m.price
                })),
                advice: formData.followUp,
                dietAdvice: formData.dietAdvice,
                suggestedTests: formData.suggestedTests,
                avoid: formData.avoid,
                aiGenerated: mode === 'AI'
            });

            // Create prescription document HTML with inline print styles
            const prescriptionHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Prescription</title>
                    <meta charset="UTF-8">
                    <style>
                        @media print {
                            @page { size: A4; margin: 0; }
                            html, body { width: 210mm; height: 297mm; background: white !important; margin: 0 !important; padding: 0 !important; }
                            body { visibility: hidden; overflow: hidden; }
                            .print-block { visibility: visible !important; display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 210mm !important; height: 296mm !important; margin: 0 !important; padding: 12mm 15mm 12mm 25mm !important; box-sizing: border-box !important; background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                        .print-block { background: white; position: relative; width: 210mm; height: 296mm; margin: 0 auto; padding: 12mm 15mm 12mm 25mm; box-sizing: border-box; }
                        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
                        .patient-info { margin-bottom: 20px; }
                        .medicines { margin-bottom: 20px; }
                        .billing-summary { margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
                        .signature { text-align: right; margin-top: 40px; }
                        .font-handwriting { font-family: 'Brush Script MT', cursive; }
                    </style>
                </head>
                <body>
                    <div class="print-block">
                        <div class="header">
                            <h1 style="font-size: 24px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em;">PRESCRIPTION</h1>
                            <h2 style="font-size: 18px; font-weight: bold; color: #1f2937;">RIMS Government General Hospital Kadapa</h2>
                            <p style="font-size: 12px; color: #6b7280;">RIMS Road, Putlampalli, Kadapa, Andhra Pradesh</p>
                            <p style="font-size: 12px; color: #6b7280;">Phone: 08562-245555</p>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; background: #f0f9ff; padding: 16px; border-radius: 12px; border: 1px solid #e0f2fe;">
                            <div>
                                <span style="font-weight: bold; color: #1e40af;">Patient:</span>
                                <span style="font-weight: 600; color: #1f2937; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; display: inline-block; margin-left: 4px;">${formData.patientName}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold; color: #1e40af;">Physician:</span>
                                <span style="font-weight: 600; color: #1f2937;">${formData.doctorName}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold; color: #1e40af;">Age/Gender:</span>
                                <span style="color: #1f2937;">${formData.age} Years / ${formData.gender}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold; color: #1e40af;">Date:</span>
                                <span style="color: #1f2937;">${formData.date}</span>
                            </div>
                            <div style="grid-column: span 2;">
                                <span style="font-weight: bold; color: #1e40af;">Diagnosis:</span>
                                <span style="color: #1f2937; margin-left: 4px;">${formData.diagnosis}</span>
                            </div>
                        </div>

                        <div class="medicines">
                            <h3 style="color: #2563eb; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 12px;">Medicines</h3>
                            <div style="space-y: 8px;">
                                ${formData.medicines.map(med => `
                                    <div style="display: flex; justify-between; align-items: start; padding-bottom: 4px; border-bottom: 1px solid #f3f4f6;">
                                        <div style="flex: 1;">
                                            <p style="font-weight: bold; font-size: 14px; color: #1f2937;">${med.name} - ${med.dosage}</p>
                                            <p style="font-size: 12px; font-weight: 500; color: #6b7280;">${med.freq} for ${med.duration}</p>
                                            ${med.notes ? `<p style="font-size: 10px; color: #9ca3af; font-style: italic;">${med.notes}</p>` : ''}
                                        </div>
                                        <div style="text-align: right;">
                                            <p style="font-weight: bold; color: #16a34a;">₹${med.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div>
                                <h3 style="color: #2563eb; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px;">Diet Advice</h3>
                                <ul style="space-y: 4px;">
                                    ${formData.dietAdvice.filter(i => i.trim()).map(item => `<li style="font-size: 11px; color: #374151; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0; color: #9ca3af;">•</span>${item}</li>`).join('')}
                                </ul>
                            </div>
                            <div>
                                <h3 style="color: #2563eb; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px;">Suggested Tests</h3>
                                <ul style="space-y: 4px;">
                                    ${formData.suggestedTests.filter(i => i.trim()).map(item => `<li style="font-size: 11px; color: #374151; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0; color: #9ca3af;">•</span>${item}</li>`).join('')}
                                </ul>
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; gap: 12px; align-items: baseline;">
                                <h3 style="color: #2563eb; font-weight: bold; text-transform: uppercase; font-size: 11px; width: 80px; flex-shrink: 0;">Follow Up:</h3>
                                <p style="font-size: 11px; color: #1f2937;">${formData.followUp || ''}</p>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: baseline;">
                                <h3 style="color: #2563eb; font-weight: bold; text-transform: uppercase; font-size: 11px; width: 80px; flex-shrink: 0;">Avoid:</h3>
                                <p style="font-size: 11px; color: #1f2937;">${formData.avoid.filter(i => i.trim()).join(', ')}</p>
                            </div>
                        </div>

                        <div class="billing-summary">
                            <h3 style="color: #2563eb; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; margin-bottom: 8px;">Billing Summary</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
                                <div style="display: flex; justify-between;"><span>Subtotal:</span><span style="font-weight: bold;">₹${formData.subtotal.toFixed(2)}</span></div>
                                <div style="display: flex; justify-between;"><span>Tax (18% GST):</span><span style="font-weight: bold;">₹${formData.tax.toFixed(2)}</span></div>
                                <div style="grid-column: span 2; display: flex; justify-between; border-top: 1px solid #d1d5db; padding-top: 4px; margin-top: 4px;">
                                    <span style="font-weight: bold;">Total Amount:</span>
                                    <span style="font-weight: bold; color: #16a34a;">₹${formData.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div style="position: absolute; bottom: 24px; right: 20px; width: 120px; text-align: center;">
                            <div style="height: 40px; display: flex; align-items: end; justify-content: center; margin-bottom: 4px;">
                                <span class="font-handwriting" style="font-size: 18px; color: #1e40af; font-weight: bold;">${formData.doctorName}</span>
                            </div>
                            <div style="border-top: 1px solid #374151; padding-top: 4px;">
                                <p style="font-size: 8px; text-transform: uppercase; color: #6b7280;">Doctor's Signature</p>
                            </div>
                        </div>

                        <div style="position: absolute; bottom: 8px; left: 25mm; right: 20px; border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-between; font-size: 6px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">
                            <p>Generated on: ${new Date().toLocaleDateString()}</p>
                            <p>Electronically generated prescription • Safe & Secure</p>
                        </div>

                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); pointer-events: none; opacity: 0.02; font-size: 48px; font-weight: bold; color: #1e40af; white-space: nowrap; z-index: -1;">
                            RIMS Gov Hospital
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Create billing document HTML
            const billingHtml = `
                <html>
                <head>
                    <title>Billing Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
                        .billing-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .billing-table th, .billing-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .billing-table th { background-color: #f2f2f2; }
                        .total { font-weight: bold; font-size: 18px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>BILLING RECEIPT</h1>
                        <h2>RIMS Government General Hospital Kadapa</h2>
                    </div>
                    <p><strong>Patient:</strong> ${formData.patientName}</p>
                    <p><strong>MRN:</strong> ${formData.mrn}</p>
                    <p><strong>Date:</strong> ${formData.date}</p>
                    <table class="billing-table">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Dosage</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.medicines.map(med => `
                                <tr>
                                    <td>${med.name}</td>
                                    <td>${med.dosage}</td>
                                    <td>₹${med.price.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p><strong>Subtotal:</strong> ₹${formData.subtotal.toFixed(2)}</p>
                    <p><strong>Tax (18% GST):</strong> ₹${formData.tax.toFixed(2)}</p>
                    <p class="total"><strong>Total Amount:</strong> ₹${formData.total.toFixed(2)}</p>
                </body>
                </html>
            `;

            // Save HTML for printing
            setGeneratedHtml({
                prescription: prescriptionHtml,
                billing: billingHtml
            });
            setShowSuccess(true);
            toast.success("Prescription Created Successfully!");

        } catch (error: any) {
            toast.error(error.message || "Failed to save prescription");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrintDocument = (type: 'prescription' | 'billing') => {
        if (!generatedHtml) return;
        
        const html = type === 'prescription' ? generatedHtml.prescription : generatedHtml.billing;
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            
            // Trigger print after content loads
            setTimeout(() => {
                printWindow.print();
            }, 500);
        } else {
            toast.error('Please allow popups to print documents');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            {/* Mode Toggles */}
            <div className="max-w-7xl mx-auto pt-8 px-4 print:hidden">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-xl shadow-sm border border-gray-200 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Prescription</h1>
                        <p className="text-sm text-gray-500">Back to Consultation</p>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setMode('AI')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${mode === 'AI' ? 'bg-white shadow-md text-indigo-600 border border-gray-100' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Sparkles size={16} /> AI Prescription
                        </button>
                        <button
                            onClick={() => setMode('SELF')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${mode === 'SELF' ? 'bg-blue-600 shadow-md text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <PenTool size={16} /> Self Prescription
                        </button>
                    </div>
                </div>

                {/* Main Input Form */}
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Patient Details Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Patient Name</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleInputChange}
                                    placeholder="Enter Patient Name"
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Age</label>
                                <input type="text" name="age" value={formData.age} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">MRN</label>
                                <input type="text" name="mrn" value={formData.mrn} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                <input type="text" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Clinical Details */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                                    Symptoms
                                </label>
                                <textarea
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleInputChange}
                                    placeholder="Enter symptoms separated by comma"
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500 min-h-[46px]"
                                />
                                <button
                                    onClick={handleGeneratePrescription}
                                    className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} /> Generate Prescription
                                </button>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Diagnosis / Reason</label>
                                <textarea
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500 min-h-[46px]"
                                    placeholder="Enter diagnosis"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prescription Body */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-center text-blue-500 font-bold uppercase tracking-widest mb-8">Prescription</h2>

                        {/* Medicines */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-blue-500 uppercase">Medicines</h3>
                                <button onClick={addMedicine} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100 transition-colors">+ Add Medicine</button>
                            </div>
                            <div className="space-y-3">
                                {formData.medicines.map((med, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="col-span-11 grid grid-cols-1 md:grid-cols-5 gap-2">
                                            <input
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                                                placeholder="Medicine Name"
                                                className="bg-transparent text-sm font-bold text-gray-800 outline-none w-full col-span-2"
                                            />
                                            <input
                                                type="text"
                                                value={med.dosage}
                                                onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                                                placeholder="Dosage"
                                                className="bg-transparent text-sm text-gray-600 outline-none w-full"
                                            />
                                            <input
                                                type="text"
                                                value={med.freq}
                                                onChange={(e) => updateMedicine(idx, 'freq', e.target.value)}
                                                placeholder="Freq"
                                                className="bg-transparent text-sm text-gray-600 outline-none w-full"
                                            />
                                            <input
                                                type="text"
                                                value={med.duration}
                                                onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                                                placeholder="Duration"
                                                className="bg-transparent text-sm text-gray-600 outline-none w-full"
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button onClick={() => removeMedicine(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {formData.medicines.length === 0 && <p className="text-center text-gray-300 text-sm italic py-4">No medicines added</p>}
                            </div>
                        </div>

                        {/* Diet & Tests Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Diet Advice */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-bold text-blue-500 uppercase">Diet Advice</h3>
                                    <button onClick={() => addArrayItem('dietAdvice')} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">+ Add</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.dietAdvice.map((diet, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={diet}
                                                onChange={(e) => updateArrayItem('dietAdvice', idx, e.target.value)}
                                                className="w-full p-2 bg-gray-50 rounded border border-gray-100 text-sm outline-none"
                                            />
                                            <button onClick={() => removeArrayItem('dietAdvice', idx)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tests */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-bold text-blue-500 uppercase">Suggested Tests</h3>
                                    <button onClick={() => addArrayItem('suggestedTests')} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">+ Add</button>
                                </div>
                                <div className="space-y-2">
                                    {formData.suggestedTests.map((test, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={test}
                                                onChange={(e) => updateArrayItem('suggestedTests', idx, e.target.value)}
                                                className="w-full p-2 bg-gray-50 rounded border border-gray-100 text-sm outline-none"
                                            />
                                            <button onClick={() => removeArrayItem('suggestedTests', idx)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Follow Up */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-blue-500 uppercase mb-4">Follow Up Advice</h3>
                            <textarea
                                name="followUp"
                                value={formData.followUp}
                                onChange={handleInputChange}
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm outline-none resize-none"
                                rows={2}
                            ></textarea>
                        </div>

                        {/* Things to Avoid */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-blue-500 uppercase">Things to Avoid</h3>
                                <button onClick={() => addArrayItem('avoid')} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">+ Add</button>
                            </div>
                            <div className="space-y-2">
                                {formData.avoid.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateArrayItem('avoid', idx, e.target.value)}
                                            className="w-full p-2 bg-gray-50 rounded border border-gray-100 text-sm outline-none"
                                        />
                                        <button onClick={() => removeArrayItem('avoid', idx)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Signature Block Editor */}
                        <div className="flex justify-end mt-12 text-gray-900">
                            <div className="w-64 border p-4 bg-gray-50 rounded-lg text-center">
                                {formData.doctorSignature ? (
                                    <div className="h-16 flex items-center justify-center mb-2">
                                        <img src={formData.doctorSignature} alt="Signature" className="max-h-full max-w-full" />
                                    </div>
                                ) : (
                                    <div className="h-16 flex items-end justify-center mb-2">
                                        <span className="font-handwriting text-2xl text-blue-900 font-bold">{formData.doctorName}</span>
                                    </div>
                                )}
                                <p className="text-[10px] uppercase text-gray-500">Doctor's Signature</p>
                            </div>
                        </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 pt-4">
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSaving}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save & Print Prescription
                        </button>
                        <button onClick={() => setFormData(INITIAL_FORM)} className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                            Clear All
                        </button>
                    </div>

                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && generatedHtml && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Prescription Created!</h2>
                            <p className="text-gray-500">Ready to print documents</p>
                        </div>
                        
                        <div className="grid gap-3">
                            <button 
                                onClick={() => handlePrintDocument('prescription')}
                                className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Printer size={18} /> Print Prescription
                            </button>
                            <button 
                                onClick={() => handlePrintDocument('billing')}
                                className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Printer size={18} /> Print Billing Receipt
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button 
                                onClick={() => router.push(`/doctor/appointment/${appointmentId}`)}
                                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
                            >
                                Done & Return
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* --- PRINT LAYOUT --- */}
            <div className="hidden print:block bg-white p-4 max-w-[21cm] mx-auto h-[29.7cm] relative text-gray-900">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-blue-500 pb-4">
                    <div className="flex gap-3">
                        <div className="w-12 h-12">
                            <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-blue-600 uppercase tracking-wide">PRESCRIPTION</h1>
                            <p className="text-xs text-gray-500">Generated by MsCureChain</p>
                            <div className="mt-2 text-gray-800">
                                <h2 className="font-bold text-base">RIMS Government General Hospital Kadapa</h2>
                                <p className="text-xs">RIMS Road, Putlampalli, Kadapa, Andhra Pradesh</p>
                                <p className="text-xs">Phone: 08562-245555</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-gray-800">
                        <p className="text-xs font-bold">Date: <span className="font-normal">{formData.date}</span></p>
                        <p className="text-xs font-bold">MRN: <span className="font-normal">{formData.mrn}</span></p>
                    </div>
                </div>

                {/* Patient & Doctor Grid */}
                <div className="bg-blue-50/30 rounded-xl p-6 mb-8 grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                    <div className="grid grid-cols-[100px_1fr] items-baseline">
                        <span className="font-bold text-gray-700">Patient:</span>
                        <span className="font-semibold text-gray-900 border-b border-gray-300 pb-1">{formData.patientName}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-baseline">
                        <span className="font-bold text-gray-700">Physician:</span>
                        <span className="font-semibold text-gray-900">{formData.doctorName}</span>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] items-baseline">
                        <span className="font-bold text-gray-700">Age/Gender:</span>
                        <span className="text-gray-900">{formData.age} Years / {formData.gender}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-baseline">
                        <span className="font-bold text-gray-700">Qualification:</span>
                        <span className="text-gray-900">MBBS, MD Internal Medicine</span>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] items-baseline">
                        <span className="font-bold text-gray-700">Reason:</span>
                        <span className="text-gray-900">{formData.diagnosis || formData.symptoms}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-baseline">
                        <span className="font-bold text-gray-700">Specialist:</span>
                        <span className="text-gray-900">General Medicine</span>
                    </div>
                </div>

                {/* Medicines Section */}
                <div className="mb-8">
                    <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Medicines</h3>
                    <ul className="space-y-4 pl-4">
                        {formData.medicines.map((med, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                                <span className="text-blue-400 mt-1.5">•</span>
                                <div>
                                    <p className="font-bold text-base">{med.name} - {med.dosage}</p>
                                    <p className="text-sm font-medium text-gray-700">{med.freq} for {med.duration}</p>
                                    {med.notes && <p className="text-xs text-gray-500 italic mt-0.5">{med.notes}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Advice Grid */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Diet Advice</h3>
                        <ul className="space-y-2">
                            {formData.dietAdvice.filter(i => i.trim()).map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-700 pl-4 relative">
                                    <span className="absolute left-0 text-gray-400">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Tests</h3>
                        <ul className="space-y-2">
                            {formData.suggestedTests.filter(i => i.trim()).map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-700 pl-4 relative">
                                    <span className="absolute left-0 text-gray-400">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Follow Up & Avoid */}
                <div className="space-y-4 mb-12">
                    <div className="flex gap-4 items-baseline">
                        <h3 className="text-blue-600 font-bold uppercase w-32 shrink-0 text-sm">Follow Up:</h3>
                        <p className="text-sm text-gray-800">{formData.followUp}</p>
                    </div>
                    <div className="flex gap-4 items-baseline">
                        <h3 className="text-blue-600 font-bold uppercase w-32 shrink-0 text-sm">Avoid:</h3>
                        <p className="text-sm text-gray-800">{formData.avoid.filter(i => i.trim()).join(', ')}</p>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="absolute bottom-12 right-12 w-64 text-center">
                    <div className="h-20 flex items-end justify-center mb-2">
                        <div className="px-4 py-2 rotate-[-2deg] opacity-80 rounded align-bottom">
                            {formData.doctorSignature ? (
                                <img src={formData.doctorSignature} alt="Signature" className="h-16 object-contain" />
                            ) : (
                                <span className="font-handwriting text-2xl text-blue-900 font-bold">{formData.doctorName}</span>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-400 pt-2 text-gray-800">
                        <p className="text-xs">(Doctor's Signature)</p>
                    </div>
                </div>

                {/* Watermark/Footer Info */}
                <div className="absolute bottom-4 left-8 right-8 border-t border-gray-100 pt-4 flex justify-between text-[10px] text-gray-400">
                    <p>Generated on: {new Date().toLocaleDateString()}</p>
                    <p>Electronically generated prescription • Safe & Secure</p>
                </div>

                {/* Watermark Diagonal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] select-none text-9xl font-black text-blue-900 whitespace-nowrap">
                    RIMS Gov Hospital
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        visibility: hidden !important;
                    }
                    nav, header, aside, .sidebar, .navbar, .print-hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        visibility: visible !important;
                        display: block !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        padding: 2cm !important;
                        z-index: 9999 !important;
                        background: white !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
                .font-handwriting {
                    font-family: 'Brush Script MT', cursive;
                }
            `}</style>
        </div>
    );
}
