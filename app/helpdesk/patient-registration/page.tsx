'use client';

import React, { useState } from "react";
import { 
  UserPlus, 
  Save, 
  RotateCcw, 
  Shield, 
  Activity, 
  FileText, 
  CheckSquare,
  Loader2 
} from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    gender: 'male',
    address: '',
    mobile: '',
    emergencyContact: '',
    height: '',
    weight: '',
    bp: '',
    pulseRate: '',
    bloodGroup: 'O+',
    sugar: '',
    heartRate: '',
    spo2: '',
    allergies: '',
    medicalHistory: '',
    symptoms: [] as string[],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.age) {
      toast.error("Please fill mandatory fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await helpdeskService.registerPatient({
        name: formData.name,
        mobile: formData.mobile,
        age: parseInt(formData.age),
        gender: formData.gender as any,
        dob: formData.dob,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies ? [formData.allergies] : [],
        medicalHistory: formData.medicalHistory,
        vitals: {
          height: formData.height,
          weight: formData.weight,
          bp: formData.bp,
          pulse: formData.pulseRate,
          sugar: formData.sugar,
          spo2: formData.spo2
        } as any
      });

      toast.success(`Patient Registered! MRN: ${res.patient.mrn}`);
      
      // Redirect to booking page with the new patient ID
      setTimeout(() => {
        router.push(`/helpdesk/appointment-booking?patientId=${res.patient.id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register patient");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', age: '', dob: '', gender: 'male', address: '', mobile: '', emergencyContact: '',
      height: '', weight: '', bp: '', pulseRate: '', bloodGroup: 'O+', sugar: '', heartRate: '', spo2: '',
      allergies: '', medicalHistory: '', symptoms: []
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Clinical Entry Manifest</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Personnel registration & vital intake</p>
        </div>
        <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-green-100 dark:border-green-900/30">
          <Shield size={10} /> Secure Transmission
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Personal Information (Mandatory) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2 mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">
            <UserPlus size={20} className="text-blue-600" /> Identity Matrix <span className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-auto">Verified Only</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name (Legal) *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 focus:bg-white transition-all text-sm font-bold outline-none" placeholder="JOHN DOE" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Biological Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none text-sm font-bold appearance-none">
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="other">OTHER</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none text-sm font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age (Verified) *</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none text-sm font-bold" placeholder="00" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Contact *</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none text-sm font-bold tracking-widest" placeholder="+91 00000 00000" required />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emergency Bypass *</label>
              <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none text-sm font-bold tracking-widest" placeholder="Alt. ID" required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Residential Coordinates *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 outline-none text-sm font-bold resize-none uppercase" placeholder="STREET, CITY, ZIP..." required></textarea>
            </div>
          </div>
        </div>

        {/* 2. Vitals */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm group">
          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2 mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">
            <Activity size={20} className="text-purple-600" /> Biometric Capture
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Height (cm)", name: "height", placeholder: "0.00" },
              { label: "Weight (kg)", name: "weight", placeholder: "0.00" },
              { label: "Pressure (SYS/DIA)", name: "bp", placeholder: "120/80" },
              { label: "Pulse (BPM)", name: "pulseRate", placeholder: "72" },
              { label: "Glucose (mg/dL)", name: "sugar", placeholder: "100" },
              { label: "SpO2 (%)", name: "spo2", placeholder: "98" }
            ].map((vital) => (
              <div key={vital.name} className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{vital.label}</label>
                <input name={vital.name} value={(formData as any)[vital.name]} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-purple-500 outline-none text-sm font-bold" placeholder={vital.placeholder} />
              </div>
            ))}
            <div className="space-y-2">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Blood Sequence</label>
               <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-purple-500 outline-none text-sm font-bold uppercase">
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
               </select>
            </div>
          </div>
        </div>

        {/* 3. History & Symptoms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2 mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">
              <FileText size={20} className="text-orange-600" /> Archive Records
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reactive Antigens (Allergies)</label>
                <input name="allergies" value={formData.allergies} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-orange-500 outline-none text-sm font-bold uppercase" placeholder="PENICILLIN, PEANUTS..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical History Manifest</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={3} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-orange-500 outline-none text-sm font-bold resize-none uppercase" placeholder="KNOWN PATHOLOGIES..."></textarea>
              </div>
              
              <div className="pt-6 border-t border-gray-50 dark:border-gray-700">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Current Anomalies (Symptoms)</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {SYMPTOMS_LIST.map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom.id)}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all text-left flex items-center gap-3 ${
                        formData.symptoms.includes(symptom.id)
                          ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20"
                          : "bg-gray-50 border-transparent text-gray-400 dark:bg-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                        formData.symptoms.includes(symptom.id) ? "border-white" : "border-gray-300"
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
          <div className="space-y-6">
             <div className="bg-gray-900 dark:bg-[#111] p-8 rounded-4xl border border-gray-800 shadow-2xl sticky top-8">
                <h3 className="font-black text-white italic uppercase tracking-tighter mb-6">Manifest Finalization</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest leading-none mb-2">Protocol 4A</p>
                    <p className="text-[8px] font-bold text-gray-500 leading-tight uppercase">Data will be transmitted to central medical vault upon verification.</p>
                  </div>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 group active:scale-95"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Save size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="uppercase text-sm tracking-widest">Commit to Registry</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    <RotateCcw size={14} /> Clear Manifest
                  </button>
                </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
