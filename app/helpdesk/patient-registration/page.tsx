'use client';

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Save, 
  RotateCcw, 
  Shield, 
  Activity, 
  FileText, 
  Stethoscope, 
  CreditCard, 
  CheckSquare 
} from "lucide-react";
import { helpdeskData } from "@/lib/integrations/data/helpdesk";
import toast from "react-hot-toast";

// Symptom to Specialty Mapping
import { useRouter } from "next/navigation";
import { useHelpdeskStore } from "@/stores/helpdeskStore";

const SYMPTOMS_LIST = [
  { id: 'fever', label: 'High Fever', specialty: 'Pediatrics' }, 
  { id: 'headache', label: 'Severe Headache', specialty: 'Neurology' },
  { id: 'chest_pain', label: 'Chest Pain', specialty: 'Cardiology' },
  { id: 'stomach_pain', label: 'Stomach Ache', specialty: 'General Medicine' },
  { id: 'breathing', label: 'Breathing Difficulty', specialty: 'Cardiology' },
  { id: 'injury', label: 'Injury / Fracture', specialty: 'Orthopedics' },
  { id: 'cold', label: 'Cold / Flu', specialty: 'Pediatrics' },
  { id: 'rash', label: 'Skin Rash', specialty: 'Dermatology' },
];

export default function PatientRegistration() {
  const router = useRouter();
  const { addPatient, checkPatientExists } = useHelpdeskStore();
  
  const [formData, setFormData] = useState({
    // Personal (Mandatory)
    name: '',
    age: '',
    dob: '',
    gender: 'male',
    address: '',
    mobile: '',
    emergencyContact: '',
    
    // Vitals
    height: '',
    weight: '',
    bp: '',
    pulseRate: '',
    bloodGroup: 'O+',
    sugar: '',
    heartRate: '',
    spo2: '',

    // History
    allergies: '',
    medicalHistory: '',
    
    // Symptoms
    symptoms: [] as string[],
  });

  // Remove doctor suggestion effect

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(symptomId);
      return {
        ...prev,
        symptoms: exists 
          ? prev.symptoms.filter(id => id !== symptomId)
          : [...prev.symptoms, symptomId]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Mandatory Fields Check
    if (!formData.name || !formData.age || !formData.dob || !formData.mobile || !formData.emergencyContact || !formData.address) {
      toast.error("Please fill all mandatory personal details.");
      return;
    }

    // 2. Strict Validation
    if (formData.mobile.length !== 10) {
        toast.error("Mobile number must be exactly 10 digits.");
        return;
    }
    if (parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
        toast.error("Please enter a valid age.");
        return;
    }

    // 3. Duplicate Check
    if (checkPatientExists(formData.mobile)) {
        toast.error("A patient with this mobile number is already registered.");
        return;
    }

    // Generate MRN
    const mrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPatient = {
      id: mrn,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      contact: formData.mobile,
      registeredAt: new Date().toISOString(),
      dob: formData.dob,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      bloodGroup: formData.bloodGroup,
      vitals: {
        height: formData.height,
        weight: formData.weight,
        bp: formData.bp,
        pulse: formData.pulseRate,
        sugar: formData.sugar,
        heartRate: formData.heartRate,
        spo2: formData.spo2
      },
      history: {
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory
      },
      symptoms: formData.symptoms
    };

    addPatient(newPatient);
    toast.success(`Patient Registered! MRN: ${mrn}`);
    
    // Redirect to booking page
    setTimeout(() => {
      router.push(`/helpdesk/${mrn}/book`);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      name: '', age: '', dob: '', gender: 'male', address: '', mobile: '', emergencyContact: '',
      height: '', weight: '', bp: '', pulseRate: '', bloodGroup: 'O+', sugar: '', heartRate: '', spo2: '',
      allergies: '', medicalHistory: '', symptoms: []
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Patient Registration</h1>
          <p className="text-gray-500">Comprehensive intake form for new hospital admissions.</p>
        </div>
        <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
          <Shield size={12} /> HIPAA Compliant
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Personal Information (Mandatory) */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <UserPlus size={20} /> Personal Details <span className="text-red-500 text-sm">*Mandatory</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="form-input w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age *</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="form-input w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" placeholder="Years" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number *</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="form-input w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" placeholder="+91 98765 43210" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact *</label>
              <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="form-input w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" placeholder="Alt. Number" required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Residential Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="form-textarea w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none resize-none" placeholder="Full Address..." required></textarea>
            </div>
          </div>
        </div>

        {/* 2. Vitals */}
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Activity size={20} /> Patient Vitals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Height (cm)</label>
               <input name="height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="0" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Weight (kg)</label>
               <input name="weight" value={formData.weight} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="0" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Blood Pressure</label>
               <input name="bp" value={formData.bp} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="120/80" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Pulse Rate</label>
               <input name="pulseRate" value={formData.pulseRate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="bpm" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Blood Sugar</label>
               <input name="sugar" value={formData.sugar} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="mg/dL" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Heart Rate</label>
               <input name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="bpm" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">SPO2Level</label>
               <input name="spo2" value={formData.spo2} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500" placeholder="%" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Blood Group</label>
               <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:border-purple-500">
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
               </select>
            </div>
          </div>
        </div>

        {/* 3. History & Symptoms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <FileText size={20} /> Medical History
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Known Allergies</label>
                <input name="allergies" value={formData.allergies} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" placeholder="e.g. Penicillin, Peanuts" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Past Medical History</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none resize-none" placeholder="e.g. Diabetes, Hypertension..."></textarea>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Current Symptoms</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SYMPTOMS_LIST.map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center gap-2 ${
                        formData.symptoms.includes(symptom.id)
                          ? "bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-900/50"
                          : "bg-gray-50 border-transparent text-gray-500 dark:bg-gray-900 dark:text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center border ${
                        formData.symptoms.includes(symptom.id) ? "bg-orange-600 border-orange-600 text-white" : "border-gray-300"
                      }`}>
                         {formData.symptoms.includes(symptom.id) && <CheckSquare size={10} />}
                      </span>
                      {symptom.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions Column */}
          <div className="space-y-4">
             <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-6">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Registration Actions</h3>
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 mb-3"
                >
                  <Save size={20} /> Register Patient
                </button>
                 <button 
                  type="button"
                  onClick={resetForm}
                  className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Reset Form
                </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
