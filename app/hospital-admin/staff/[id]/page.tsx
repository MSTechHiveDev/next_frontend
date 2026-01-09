"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building,
  Globe,
  Users,
  Edit,
  Trash2,
  FileText,
  User,
  Briefcase,
  ShieldCheck,
  Award,
  CircleUser,
  MoreVertical,
  Activity,
  CreditCard,
  Building2,
  ArrowRight
} from "lucide-react";

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStaff();
    }
  }, [id]);

  const fetchStaff = async () => {
    try {
      try {
        const data = await hospitalAdminService.getStaffById(id);
        setStaff(data.staff);
        return;
      } catch (detailError: any) {
        if (detailError.status === 404 ||
            detailError.message?.includes('404') ||
            detailError.message?.toLowerCase().includes('not found')) {
          const data = await hospitalAdminService.getStaff();
          const staffData = data.staff?.find((member: any) => (member._id || member.staffProfileId) === id);

          if (!staffData) {
            throw new Error("Staff member not found");
          }

          setStaff(staffData);
          return;
        }
        throw detailError;
      }
    } catch (error: any) {
      console.error("Failed to fetch staff:", error);
      toast.error(error.message || "Failed to load staff details");
      router.push('/hospital-admin/staff');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'deactivate' : 'activate';
    
    if (!confirm(`Are you sure you want to ${action} ${staff?.name}?`)) {
      return;
    }

    setStatusLoading(true);
    try {
      await hospitalAdminService.updateStaff(id, { status: newStatus });
      toast.success(`${staff?.name} has been ${action}d successfully`);
      setStaff({ ...staff, status: newStatus });
    } catch (error: any) {
      console.error(`Failed to ${action} staff:`, error);
      toast.error(error.message || `Failed to ${action} staff`);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${staff?.name} from the system?`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      await hospitalAdminService.deleteStaff(id);
      toast.success(`${staff?.name} has been removed from the directory`);
      router.push('/hospital-admin/staff');
    } catch (error: any) {
      console.error("Failed to delete staff:", error);
      toast.error(error.message || "Operation failed");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
       <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700 m-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling Personnel Profile...</p>
       </div>
    );
  }

  if (!staff) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header / Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/hospital-admin/staff')}
            className="p-3 bg-white dark:bg-gray-800 text-gray-400 rounded-2xl border border-gray-100 dark:border-gray-700 hover:text-blue-500 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Personnel Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Access ID: {staff.employeeId || id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/hospital-admin/staff/edit/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-black hover:bg-gray-50 transition-all shadow-sm"
          >
            <Edit size={18} /> Modify Entry
          </button>
          <button 
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
              staff.status === 'active' 
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {statusLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              staff.status === 'active' ? 'Deactivate' : 'Activate'
            )}
          </button>
          <button 
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-black hover:bg-rose-100 transition-all"
          >
            {deleteLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div> : <Trash2 size={18} />} Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 p-10 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${staff.status !== 'inactive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 {staff.status || 'Active'}
              </span>
           </div>

           <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-200 dark:shadow-none mb-6 group-hover:scale-105 transition-transform duration-500">
                 {staff.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{staff.name}</h2>
              <p className="text-blue-600 font-black text-sm uppercase tracking-widest mt-2">{staff.designation || 'Staff Member'}</p>
              
              <div className="w-full h-px bg-gray-50 dark:bg-gray-700 my-8" />

              <div className="w-full space-y-4">
                 <div className="flex items-center justify-between text-left p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100/50 dark:border-gray-600/30">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Department</p>
                       <p className="text-sm font-black text-gray-900 dark:text-white">{staff.department || 'Not Assigned'}</p>
                    </div>
                    <Building className="text-gray-300 w-5 h-5" />
                 </div>
                 <div className="flex items-center justify-between text-left p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100/50 dark:border-gray-600/30">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Joining Date</p>
                       <p className="text-sm font-black text-gray-900 dark:text-white">{staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'Not Set'}</p>
                    </div>
                    <Calendar className="text-gray-300 w-5 h-5" />
                 </div>
                 <div className="flex items-center justify-between text-left p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100/50 dark:border-gray-600/30">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Employment Type</p>
                       <p className="text-sm font-black text-blue-600 uppercase">{staff.employmentType || 'Full-Time'}</p>
                    </div>
                    <Briefcase className="text-gray-300 w-5 h-5" />
                 </div>
              </div>
           </div>
        </div>

        {/* Professional Details */}
        <div className="lg:col-span-2 space-y-8">
           {/* Info Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                       <Building2 size={20} />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Organization Hub</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Department</span>
                       <span className="text-gray-900 dark:text-white uppercase">{staff.department || 'Clinical'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Designation</span>
                       <span className="text-gray-900 dark:text-white uppercase">{staff.designation || 'Staff'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Employment Type</span>
                       <span className="text-blue-500 uppercase">{staff.employmentType || 'Permanent'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Experience Factor</span>
                       <span className="text-gray-900 dark:text-white">{staff.experienceYears || '0'} Years</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                       <Clock size={20} />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Chronometry</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Assigned Shift</span>
                       <span className="text-gray-900 dark:text-white uppercase">{staff.shift || 'General'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Duty Window</span>
                       <span className="text-gray-900 dark:text-white">{staff.workingHours?.start || '09:00'} - {staff.workingHours?.end || '17:00'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-gray-400">Weekly Offcycle</span>
                       <span className="text-rose-500 uppercase">{staff.weeklyOff?.join(', ') || 'Sunday'}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Personal & Contact */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                    <CircleUser size={20} />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          <Mail size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{staff.email || 'N/A'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          <Phone size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{staff.mobile || 'N/A'}</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          <MapPin size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Address</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                             {staff.address && (staff.address.city || staff.address.street) 
                                ? `${staff.address.street ? staff.address.street + ', ' : ''}${staff.address.city}, ${staff.address.state}` 
                                : 'Location not set'}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Emergency Contact Section */}
              {staff.emergencyContact && (
                 <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-4">Emergency Contact</p>
                     <div className="flex items-center justify-between">
                         <div>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{staff.emergencyContact.name}</p>
                             <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">{staff.emergencyContact.relationship}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{staff.emergencyContact.mobile}</p>
                         </div>
                     </div>
                 </div>
              )}
           </div>

           {/* Qualifications, Skills & Certifications */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-3 mb-6">
                    <FileText size={20} className="text-purple-500" />
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Qualifications</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {staff.qualifications?.length > 0 ? staff.qualifications.map((qual: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{qual}</span>
                    )) : <p className="text-xs text-gray-400 font-bold italic">No qualifications added</p>}
                 </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-3 mb-6">
                    <Award size={20} className="text-blue-500" />
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Skills</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {staff.skills?.length > 0 ? staff.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{skill}</span>
                    )) : <p className="text-xs text-gray-400 font-bold italic">No skills cataloged</p>}
                 </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={20} className="text-emerald-500" />
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Certifications</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {staff.certifications?.length > 0 ? staff.certifications.map((cert: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{cert}</span>
                    )) : <p className="text-xs text-gray-400 font-bold italic">No certifications verified</p>}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}