import React from 'react';
import { Mail, Phone, Award, Clock, MapPin, Edit2 } from 'lucide-react';
import { getDoctorProfileAction } from '@/lib/integrations';

export default async function DoctorProfilePage() {
  const { data: profile } = await getDoctorProfileAction();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="relative h-48 bg-linear-to-r from-emerald-600 to-teal-800 rounded-3xl overflow-hidden">
           <div className="absolute inset-0 bg-black/10"></div>
       </div>

       <div className="px-6 -mt-20 relative flex flex-col md:flex-row gap-6 items-end md:items-end">
           <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-[#111] p-1.5 rounded-full shadow-2xl">
               <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-4xl font-bold text-emerald-700">
                   {profile?.name.charAt(0)}
               </div>
           </div>
           <div className="flex-1 pb-2 text-center md:text-left">
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.name}</h1>
               <p className="text-lg text-gray-500">{profile?.specialty} • {profile?.experience} Experience</p>
           </div>
           <div className="pb-4">
               <button className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl flex items-center gap-2 shadow-lg">
                   <Edit2 size={16} /> Edit Profile
               </button>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Left Info Column */}
           <div className="space-y-6">
               <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                   <h3 className="font-bold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                   
                   <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                       <Mail size={18} />
                       <span className="text-sm">{profile?.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                       <Phone size={18} />
                       <span className="text-sm">{profile?.phone}</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                       <MapPin size={18} />
                       <span className="text-sm">Main Campus, Block B</span>
                   </div>
               </div>

                <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                   <h3 className="font-bold text-gray-900 dark:text-white mb-2">Availability</h3>
                   <div className="flex items-center gap-3 text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                       <Clock size={18} />
                       <span className="text-sm">{profile?.availability}</span>
                   </div>
               </div>
           </div>

           {/* Right Bio Column */}
           <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#111] p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="text-emerald-500" /> About Me
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {profile?.bio}
                    </p>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <h4 className="font-bold text-sm uppercase text-gray-400 mb-4">Credentials & Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                            {['MBBS', 'MD (Cardiology)', 'FACC', 'Board Certified'].map((cert) => (
                                <span key={cert} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-sm font-medium">
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
           </div>
       </div>
    </div>
  );
}
