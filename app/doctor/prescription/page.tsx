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
    PenTool
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { getDoctorPatientDetailsAction, getAppointmentDetailsAction, getDoctorProfileAction } from '@/lib/integrations/actions/doctor.actions';
import medicineData from '@/medicine.json';

// --- Types ---
interface Medicine {
    name: string;
    dosage: string;
    freq: string;
    duration: string;
    notes: string;
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
    doctorName: ''
};

// --- Mock Patients for Dropdown Removed as per request ---

export default function PrescriptionPage() {
    const [mode, setMode] = useState<'AI' | 'SELF'>('SELF');
    const [formData, setFormData] = useState<PrescriptionForm>(INITIAL_FORM);
    // const [aiSearchTerm, setAiSearchTerm] = useState(''); // Unused


    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    // -- Fetch Appointment Details if ID present --
    useEffect(() => {
        if (appointmentId) {
            const fetchDetails = async () => {
                try {
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
                            age: String(age), // Ensure string
                            gender: gender,
                            mrn,
                            symptoms,
                            diagnosis
                        }));

                        toast.success("Patient details loaded");
                    } else {
                        toast.error(res.error || "Failed to load appointment details");
                    }
                } catch (error) {
                    console.error("Failed to prefill", error);
                    toast.error("Failed to load appointment details");
                }
            };
            fetchDetails();
        }
    }, [appointmentId]);

    // -- Fetch Doctor Profile for Signature --
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

    // -- Auto-Generate Prescription Handler --
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

        // Iterate through all protocols
        medicineData.symptoms_data.forEach((protocol: any) => {
            // Check if protocol symptom is present in current symptoms (partial matching)
            // We check if "Fever" is in "Fever, Cold"
            const protocolSymptomLower = protocol.symptom.toLowerCase();

            // Check if any user symptom contains the protocol symptom or vice versa
            const isMatch = currentSymptoms.some(userSym =>
                userSym.includes(protocolSymptomLower) || protocolSymptomLower.includes(userSym)
            );

            if (isMatch) {
                matchedDiagnosis.push(protocol.symptom);

                // Map Medicines
                const meds: Medicine[] = protocol.medicine.map((m: string) => ({
                    name: m,
                    dosage: '-',
                    freq: '-',
                    duration: '-',
                    notes: ''
                }));
                matchedMeds = [...matchedMeds, ...meds];

                // Map Advice
                if (protocol.diet_advice) matchedDiet = [...matchedDiet, ...protocol.diet_advice];
                if (protocol.suggested_tests) matchedTests = [...matchedTests, ...protocol.suggested_tests];
                if (protocol.avoid) matchedAvoid = [...matchedAvoid, ...protocol.avoid];
                if (protocol.follow_up) matchedFollowUp = protocol.follow_up; // Take last matched follow up or append? Let's take last for now.
            }
        });

        if (matchedMeds.length === 0) {
            toast.error("No matching protocols found for these symptoms");
            return;
        }

        // Deduplicate simple arrays
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

    // -- AI Mode Handlers Removed/Replaced --
    // The previous handleAiSelect is no longer needed as we use the new button logic.

    // -- Self Mode Handlers --
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // AI Match Logic on Symptoms Input removed as we use read-only symptoms
        // if (mode === 'AI' && name === 'symptoms') {
        //     const match = medicineData.symptoms_data.find((s: any) => s.symptom.toLowerCase() === value.toLowerCase());
        //     if (match) {
        //         handleAiSelect(match);
        //     }
        // }
    };

    // -- Medicine Array Handlers --
    const addMedicine = () => {
        setFormData(prev => ({
            ...prev,
            medicines: [...prev.medicines, { name: '', dosage: '', freq: '', duration: '', notes: '' }]
        }));
    };

    const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
        const newMeds = [...formData.medicines];
        newMeds[index][field] = value;
        setFormData(prev => ({ ...prev, medicines: newMeds }));
    };

    const removeMedicine = (index: number) => {
        setFormData(prev => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index)
        }));
    };

    // -- Array Fields Handlers (Diet, Tests, Avoid) --
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

    const handlePrint = () => {
        if (!formData.patientName) return toast.error("Patient Name is required");
        window.print();
    };

    const handleClear = () => {
        setFormData(INITIAL_FORM);
        toast('Form Cleared');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            {/* Mode Toggles */}
            <div className="max-w-7xl mx-auto pt-8 px-4 print:hidden">
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

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-blue-500">{mode === 'AI' ? 'AI-Assisted Prescription' : 'Self Prescription'}</h1>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">{mode === 'AI' ? 'Type a symptom to auto-generate protocol' : 'Manual Entry Mode'}</p>
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
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</label>
                                {/* Hidden/Removed as per request */}
                                <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} disabled className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium outline-none text-gray-400 cursor-not-allowed hidden" />
                                <span className="text-xs text-gray-400 italic">Not required</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                <input type="text" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500" />
                            </div>
                            <div className="col-span-1 flex flex-col items-center justify-center">
                                {/* View Vitals Removed */}
                            </div>
                        </div>
                    </div>

                    {/* Clinical Details */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                                    Symptoms (Read-Only)
                                </label>
                                <div className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 min-h-[46px] flex items-center">
                                    {formData.symptoms || <span className="text-gray-400 italic">No symptoms fetched</span>}
                                </div>
                                <button
                                    onClick={handleGeneratePrescription}
                                    className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} /> Generate Prescription
                                </button>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Diagnosis / Reason</label>
                                <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-blue-500" />
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
                                        <div className="col-span-11 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                                                placeholder="Medicine Name"
                                                className="bg-transparent text-sm font-bold text-gray-800 outline-none w-full"
                                            />
                                            {/* For self mode, could break down components, but keeping simple rows for now as per image logic visually implies rows */}
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button onClick={() => removeMedicine(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>

                                        {/* Showing extended fields if SELF mode to allow editing the "Paracetamol 500mg... " string typically found in AI */}
                                        {/* Since AI returns single string, we display it. For SELF, we allow editing. */}
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
                            <h3 className="text-xs font-bold text-blue-500 uppercase mb-4">Follow Up</h3>
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
                        <div className="flex justify-end mt-12">
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
                        <button onClick={handlePrint} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Save size={18} /> Save & Print
                        </button>
                        <button onClick={handleClear} className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                            Clear All
                        </button>
                    </div>

                </div>
            </div>

            {/* --- PRINT LAYOUT --- */}
            {/* This section is completely hidden in normal view and only visible when printing */}
            <div className="hidden print:block bg-white p-8 max-w-[21cm] mx-auto h-[29.7cm] relative text-gray-900">

                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-2 border-blue-500 pb-6">
                    <div className="flex gap-4">
                        <div className="w-16 h-16">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain opacity-80" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-wide">PRESCRIPTION</h1>
                            <p className="text-xs text-gray-500">Generated by MsCureChain</p>
                            <div className="mt-4">
                                <h2 className="font-bold text-lg text-gray-800">RIMS Government General Hospital Kadapa</h2>
                                <p className="text-sm text-gray-600">RIMS Road, Putlampalli, Kadapa, Andhra Pradesh</p>
                                <p className="text-sm text-gray-600">Phone: 08562-245555</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">Date: <span className="font-normal">{formData.date}</span></p>
                        <p className="text-sm font-bold text-gray-800">MRN: <span className="font-normal">{formData.mrn}</span></p>
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
                                    <p className="font-medium">{med.name}</p>
                                    {/* If notes exist, show them */}
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
                            {formData.dietAdvice.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-700 pl-4 relative">
                                    <span className="absolute left-0 text-gray-400">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Tests</h3>
                        <ul className="space-y-2">
                            {formData.suggestedTests.map((item, idx) => (
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
                        <p className="text-sm text-gray-800">{formData.avoid.join(', ')}</p>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="absolute bottom-12 right-12 w-64 text-center">
                    <div className="h-20 flex items-end justify-center mb-2">
                        {/* Signature Image or Font */}
                        <div className="px-4 py-2 rotate-[-2deg] opacity-80 rounded align-bottom">
                            {formData.doctorSignature ? (
                                <img src={formData.doctorSignature} alt="Signature" className="h-16 object-contain" />
                            ) : (
                                <span className="font-handwriting text-2xl text-blue-900 font-bold">{formData.doctorName}</span>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-500">(Doctor's Signature)</p>
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
                background: white; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                visibility: hidden;
            }
            /* Explicitly hide common layout elements */
            nav, header, aside, .sidebar, .navbar, #navbar, #sidebar {
                display: none !important;
            }
            
            /* Show only the print block and position it fixed over everything */
            .print\\:block {
                visibility: visible;
                display: block !important;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                margin: 0;
                padding: 0;
                z-index: 9999;
                background: white;
            }
            
            /* Hide everything else via generic selector as backup */
            body > *:not(.print\\:block) {
                display: none !important;
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
