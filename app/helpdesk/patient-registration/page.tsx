'use client';

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Save, 
  RotateCcw, 
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Activity,
  User,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  Heart
} from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FieldError {
  [key: string]: string;
}

export default function PatientRegistration() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState({
    honorific: 'Mr',
    name: '',
    age: '',
    dob: '',
    gender: 'male',
    address: '',
    mobile: '',
    emergencyContact: '',
    emergencyContactEmail: '',
    bloodGroup: 'O+',
    allergies: '',
    medicalHistory: ''
  });

  // Auto-calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age >= 0) {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  }, [formData.dob]);

  // Auto-set gender based on honorific
  useEffect(() => {
    if (formData.honorific === 'Mr') {
      setFormData(prev => ({ ...prev, gender: 'male' }));
    } else if (formData.honorific === 'Mrs' || formData.honorific === 'Ms') {
      setFormData(prev => ({ ...prev, gender: 'female' }));
    }
  }, [formData.honorific]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Minimum 2 characters';
        if (!/^[a-zA-Z\s.]+$/.test(value)) return 'Letters and spaces only';
        return '';
      case 'mobile':
        if (!value.trim()) return 'Mobile is required';
        if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) return 'Must be 10 digits';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 5) return 'Address is too short';
        return '';
      case 'age':
        if (!value.trim()) return 'Age is required';
        if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 120) return 'Invalid age';
        return '';
      case 'dob':
        if (!value.trim()) return 'Date of birth is required';
        const date = new Date(value);
        if (date > new Date()) return 'Cannot be in future';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'mobile' || name === 'emergencyContact') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    if (touched[name]) {
        const error = validateField(name, processedValue);
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, (formData as any)[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FieldError = {};
    let hasError = false;
    
    ['name', 'mobile', 'address', 'age', 'dob'].forEach(field => {
        const err = validateField(field, (formData as any)[field]);
        if (err) {
            newErrors[field] = err;
            hasError = true;
        }
    });

    setErrors(newErrors);
    setTouched({
        name: true, mobile: true, address: true, age: true, dob: true
    });

    if (hasError) {
        toast.error("Please fix form errors");
        return;
    }

    try {
      setSubmitting(true);
      const registrationData = {
        ...formData,
        age: parseInt(formData.age),
        name: formData.name.trim().toUpperCase(),
        address: formData.address.trim().toUpperCase(),
        allergies: formData.allergies ? [formData.allergies] : []
      };

      const res = await helpdeskService.registerPatient(registrationData as any);
      toast.success(`Successfully Registered: ${res.patient.mrn}`);
      setTimeout(() => {
        router.push(`/helpdesk/appointment-booking?patientId=${res.patient.id}`);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-5xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reception / Patient Admission</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Patient Registration
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Enter patient details to create a new registration</p>
        </div>
        <div className="hidden md:block">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
            <Shield size={14} /> HIPAA COMPLIANT
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10">
            
            <div className="space-y-10">
                {/* PERSONAL INFORMATION SECTION */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <User size={18} className="text-teal-600" />
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Personal Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput 
                            label="Honorific" 
                            required 
                            component={
                                <select 
                                    name="honorific" 
                                    value={formData.honorific} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all"
                                >
                                    <option value="Mr">Mr.</option>
                                    <option value="Mrs">Mrs.</option>
                                    <option value="Ms">Ms.</option>
                                    <option value="Dr">Dr.</option>
                                </select>
                            }
                        />
                        <FormInput 
                            label="Full Name" 
                            required 
                            error={touched.name ? errors.name : ''}
                            component={
                                <input 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Enter full name"
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border ${errors.name && touched.name ? 'border-rose-500' : 'border-slate-200'} focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase transition-all`}
                                />
                            }
                        />
                         <FormInput 
                            label="Mobile Number" 
                            required 
                            error={touched.mobile ? errors.mobile : ''}
                            component={
                                <input 
                                    name="mobile" 
                                    value={formData.mobile} 
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('mobile')}
                                    placeholder="10-digit mobile number"
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border ${errors.mobile && touched.mobile ? 'border-rose-500' : 'border-slate-200'} focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all`}
                                />
                            }
                        />

                        <FormInput 
                            label="Date of Birth" 
                            required 
                            error={touched.dob ? errors.dob : ''}
                            component={
                                <input 
                                    type="date"
                                    name="dob" 
                                    value={formData.dob} 
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('dob')}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border ${errors.dob && touched.dob ? 'border-rose-500' : 'border-slate-200'} focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all`}
                                />
                            }
                        />
                        <FormInput 
                            label="Age" 
                            required 
                            error={touched.age ? errors.age : ''}
                            component={
                                <input 
                                    name="age"
                                    type="number"
                                    value={formData.age} 
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('age')}
                                    placeholder="Calculated age"
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border ${errors.age && touched.age ? 'border-rose-500' : 'border-slate-200'} focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all`}
                                />
                            }
                        />
                        <FormInput 
                            label="Gender" 
                            required
                            component={
                                <select 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            }
                        />
                    </div>
                </section>

                {/* ADDRESS & CONTACT SECTION */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <MapPin size={18} className="text-teal-600" />
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Address Details</h2>
                        </div>
                        <FormInput 
                            label="Residential Address" 
                            required 
                            error={touched.address ? errors.address : ''}
                            component={
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('address')}
                                    rows={4}
                                    placeholder="Enter full address"
                                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border ${errors.address && touched.address ? 'border-rose-500' : 'border-slate-200'} focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase resize-none transition-all`}
                                />
                            }
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Phone size={18} className="text-teal-600" />
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Emergency Contact</h2>
                        </div>
                        <FormInput 
                            label="Emergency Mobile" 
                            component={
                                <input 
                                    name="emergencyContact" 
                                    value={formData.emergencyContact} 
                                    onChange={handleChange}
                                    placeholder="10-digit number"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all"
                                />
                            }
                        />
                        <FormInput 
                            label="Email Address" 
                            component={
                                <input 
                                    name="emergencyContactEmail" 
                                    type="email"
                                    value={formData.emergencyContactEmail} 
                                    onChange={handleChange}
                                    placeholder="patient@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all"
                                />
                            }
                        />
                    </div>
                </section>

                {/* CLINICAL DATA SECTION */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Droplets size={18} className="text-teal-600" />
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Medical Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <FormInput 
                            label="Blood Group" 
                            component={
                                <select 
                                    name="bloodGroup" 
                                    value={formData.bloodGroup} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold transition-all"
                                >
                                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            }
                        />
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput 
                                label="Previous Allergies" 
                                component={
                                    <input 
                                        name="allergies" 
                                        value={formData.allergies} 
                                        onChange={handleChange}
                                        placeholder="Any known allergies..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase transition-all"
                                    />
                                }
                            />
                            <FormInput 
                                label="Health Issues / History" 
                                component={
                                    <input 
                                        name="medicalHistory" 
                                        value={formData.medicalHistory} 
                                        onChange={handleChange}
                                        placeholder="Pre-existing conditions..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white outline-none text-xs font-bold uppercase transition-all"
                                    />
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* SUBMIT BUTTON */}
                <div className="pt-4 flex justify-end gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({
                            honorific: 'Mr', name: '', age: '', dob: '', gender: 'male', address: '',
                            mobile: '', emergencyContact: '', emergencyContactEmail: '', bloodGroup: 'O+',
                            allergies: '', medicalHistory: ''
                        })}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Reset Form
                    </button>
                    <button 
                        type="submit"
                        disabled={submitting}
                        className="px-10 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>Complete Registration <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </div>
        </form>
      </div>

    </div>
  );
}

function FormInput({ label, required, component, error }: any) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
                {component}
            </div>
            {error && (
                <p className="text-[9px] font-bold text-rose-500 uppercase mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {error}
                </p>
            )}
        </div>
    );
}
