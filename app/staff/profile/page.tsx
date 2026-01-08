'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Shield, 
  CheckCircle2, 
  Clock,
  Edit,
  Camera,
  Heart,
  Globe,
  Award,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { staffService } from '@/lib/integrations';
import type { StaffProfile } from '@/lib/integrations/types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await staffService.getProfile();
      setProfile(data.staff);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header / Cover Section */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-linear-to-r from-indigo-600 to-blue-500 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-20 -mr-20 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -mb-10 -ml-10 blur-2xl"></div>
        </div>
        
        <div className="px-8 -mt-24 relative z-10 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl p-1.5 shadow-xl">
               <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
                  <User className="w-16 h-16 text-gray-400" />
                  <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-6 h-6" />
                  </button>
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          
          <div className="flex-1 pb-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 drop-shadow-sm">{profile.user.name}</h1>
                  <p className="text-gray-500 font-bold flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.designation} • {profile.department || 'General'}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:shadow-indigo-100 transition-all border border-indigo-100 active:scale-95">
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left Column: Personal Info & Contact */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Contact Information
             </h3>
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.user.email}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Phone className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.user.mobile || 'Not updated'}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Work Location</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{profile.hospital.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Code: {profile.hospital.code}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Additional Details
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</p>
                   <p className="font-bold text-gray-900 mt-1">B+ Positive</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined On</p>
                   <p className="font-bold text-gray-900 mt-1">{new Date(profile.joiningDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}</p>
                </div>
             </div>
             <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                   {['English', 'Hindi', 'Gujarati'].map(lang => (
                     <span key={lang} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600">{lang}</span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Experience, Education, Skills */}
        <div className="lg:col-span-2 space-y-6">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-700 rounded-3xl p-6 text-white flex justify-between items-center group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                 <div className="relative z-10 font-bold">
                    <p className="text-indigo-200 text-xs uppercase tracking-widest">Total Experience</p>
                    <p className="text-3xl font-black mt-2">4 Years</p>
                 </div>
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10 backdrop-blur-md">
                    <Award className="w-6 h-6 text-indigo-100" />
                 </div>
              </div>
              <div className="bg-emerald-600 rounded-3xl p-6 text-white flex justify-between items-center group overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                 <div className="relative z-10 font-bold">
                    <p className="text-emerald-100 text-xs uppercase tracking-widest">Performance</p>
                    <p className="text-3xl font-black mt-2">9.2 / 10</p>
                 </div>
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10 backdrop-blur-md">
                    <CheckCircle2 className="w-6 h-6 text-emerald-100" />
                 </div>
              </div>
           </div>

           {/* Professional Background */}
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" /> 
                    Qualifications & Education
                 </h3>
                 <button className="text-sm font-bold text-indigo-600 hover:scale-105 transition-transform">Add New</button>
              </div>
              <div className="p-6 space-y-8">
                 <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
                       <Award className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900">Hospital Management PG Diploma</h4>
                       <p className="text-sm text-gray-500 font-medium">Mount Sinai Training Institute • 2021</p>
                       <p className="text-xs text-gray-400 mt-2 leading-relaxed">Specialized in healthcare administration, patient safety protocols, and resource management.</p>
                    </div>
                 </div>
                 <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
                       <Globe className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900">Bachelor of Science in Biology</h4>
                       <p className="text-sm text-gray-500 font-medium">Gujarat University • 2019</p>
                       <p className="text-xs text-gray-400 mt-2 leading-relaxed">Foundation in biological sciences, clinical research basics, and laboratory management.</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Skills & Certifications */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Skills & Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                 {['Patient Care', 'EMR Systems', 'First Aid', 'Billing', 'Crisis Management', 'Medical Coding', 'Lab Safety', 'Infection Control'].map(skill => (
                   <span key={skill} className="px-4 py-2 bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-default">
                     {skill}
                   </span>
                 ))}
                 <button className="px-4 py-2 border-2 border-dashed border-gray-200 text-gray-400 font-bold text-xs rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all group">
                   + Add Skill
                 </button>
              </div>
           </div>

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Shield className="w-6 h-6 text-amber-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-amber-900">Account Security</h4>
                    <p className="text-sm text-amber-700/70 font-medium">Protect your portal access and sensitive data.</p>
                 </div>
              </div>
              <ChevronRight className="w-6 h-6 text-amber-500 group-hover:translate-x-2 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );
}
