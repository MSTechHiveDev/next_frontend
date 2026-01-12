'use client';

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  FileText,
  Loader2,
  Edit2,
  X,
  Activity,
  Shield,
  Activity as HeartIcon
} from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ViewEditPatient({ params }: { params: Promise<{ patientId: string }> }) {
  const router = useRouter();
  const { patientId } = React.use(params);
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    honorific: 'Mr',
    name: '',
    mobile: '',
    email: '',
    gender: 'male',
    dob: '',
    address: '',
    emergencyContact: '',
    emergencyContactEmail: '',
    bloodGroup: 'O+',
    allergies: '',
    medicalHistory: ''
  });

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getPatientById(patientId);
      setPatientData(data);
      setFormData({
        honorific: data.profile?.honorific || 'Mr',
        name: data.user?.name || '',
        mobile: data.user?.mobile || '',
        email: data.user?.email || '',
        gender: data.profile?.gender || 'male',
        dob: data.profile?.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : '',
        address: data.profile?.address || '',
        emergencyContact: data.profile?.alternateNumber || '',
        emergencyContactEmail: data.profile?.emergencyContactEmail || '',
        bloodGroup: data.profile?.bloodGroup || 'O+',
        allergies: data.profile?.allergies || '',
        medicalHistory: data.profile?.medicalHistory || ''
      });
    } catch (error: any) {
      toast.error("Manifest retrieval failed");
      router.push('/helpdesk/patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatientData(); }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await helpdeskService.updatePatient(patientId, {
        ...formData,
        name: formData.name.toUpperCase(),
        address: formData.address.toUpperCase()
      });
      toast.success("Manifest Updated");
      setEditing(false);
      fetchPatientData();
    } catch (error: any) {
      toast.error("Update Sequence Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Clinical Registry...</p>
        </div>
      </div>
    );
  }

  const ageData = formData.dob ? Math.floor((new Date().getTime() - new Date(formData.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* PROFESSIONAL HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/helpdesk/patients" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Information / {patientData?.profile?.mrn || 'NODE'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             {editing ? 'Modify Clinical Manifest' : 'Patient Master Profile'}
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Hospital Node / Electronic Health Record</p>
        </div>
        <div className="flex items-center gap-3">
          {!editing ? (
            <button 
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
                <Edit2 size={14} /> Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Cancel
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg active:scale-95"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                    {saving ? 'Syncing...' : 'Save Changes'}
                </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MAIN IDENTITY CARD */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Activity size={16} className="text-teal-600" /> Identity Matrix
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <ProfileField label="Honorific" editing={editing}>
                        <select name="honorific" value={formData.honorific} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold appearance-none transition-all">
                            <option value="Mr">MR</option><option value="Mrs">MRS</option><option value="Ms">MS</option>
                        </select>
                    </ProfileField>

                    <ProfileField label="Legal Name" editing={editing}>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase transition-all" />
                    </ProfileField>

                    <ProfileField label="Primary Contact" editing={editing}>
                        <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold tracking-tight transition-all" />
                    </ProfileField>

                    <ProfileField label="Date of Birth" editing={editing}>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all" />
                    </ProfileField>

                    <ProfileField label="Biological Gender" editing={editing}>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold appearance-none transition-all">
                            <option value="male">MALE</option><option value="female">FEMALE</option><option value="other">OTHER</option>
                        </select>
                    </ProfileField>

                    <ProfileField label="Blood Status" editing={editing}>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold appearance-none transition-all">
                            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </ProfileField>

                    <div className="md:col-span-2">
                        <ProfileField label="Residential Access" editing={editing}>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase resize-none transition-all" />
                        </ProfileField>
                    </div>
                </div>
            </div>

            {/* CLINICAL SUMMARY */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <FileText size={16} className="text-teal-600" /> Clinical History
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <ProfileField label="Known Allergies" editing={editing}>
                        <input name="allergies" value={formData.allergies} onChange={handleChange} placeholder="SYSTEM NORMAL" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase transition-all" />
                    </ProfileField>

                    <ProfileField label="Clinical Notes" editing={editing}>
                        <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder="NO PREVIOUS LOGS" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase transition-all h-20 resize-none" />
                    </ProfileField>
                </div>
            </div>
        </div>

        {/* SIDE ACTIONS */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biological Age</p>
                        <h3 className="text-4xl font-bold tracking-tight mt-1">{ageData} <span className="text-xs font-normal text-slate-500 uppercase tracking-widest italic">YRS</span></h3>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                        <HeartIcon size={24} className="text-rose-500" />
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div className="space-y-4">
                    <button 
                        onClick={() => router.push(`/helpdesk/appointment-booking?patientId=${patientId}`)}
                        className="w-full py-4 bg-teal-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-teal-900/20 font-sans"
                    >
                        New OP Admission
                    </button>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center italic leading-relaxed">
                        Initialize a new clinical visit instance for this patient node.
                    </p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} className="text-emerald-500" /> Registry Protocol
                </p>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Log: HELPDESK-AUTO-SYNC<br/>
                    Status: RECORD-VERIFIED
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function ProfileField({ label, editing, children }: any) {
    if (!editing) {
        return (
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                <div className="text-[11px] font-bold text-slate-900 uppercase bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    {(children.props.value || 'N/A').toString()}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
