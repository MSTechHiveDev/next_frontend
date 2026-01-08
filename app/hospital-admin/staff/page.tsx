"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Eye,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Search,
  Filter,
  UserPlus,
  Briefcase,
  Layers,
  MoreVertical,
  ShieldCheck,
  Building2
} from "lucide-react";
import { PageHeader, Card, Button } from "@/components/admin";

export default function HospitalAdminStaff() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await hospitalAdminService.getStaff();
      setStaff(data.staff || []);
    } catch (error: any) {
      console.error("Failed to fetch staff:", error);
      toast.error(error.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to retract ${name} from the active registry?`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      await hospitalAdminService.deleteStaff(id);
      toast.success(`${name} has been removed from the directory`);
      fetchStaff();
    } catch (error: any) {
      console.error("Failed to delete staff:", error);
      toast.error(error.message || "Operation failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get unique departments for filter
  const departments = Array.from(
    new Set(staff.map((member) => member.department).filter(Boolean))
  ).sort();

  // Filter staff based on search and department
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !filterDepartment || member.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Personnel Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Registry Status: {staff.length} Active Nodes</p>
        </div>
        <button 
          onClick={() => router.push('/hospital-admin/staff/create')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
        >
          <UserPlus className="w-5 h-5" /> Onboard Personnel
        </button>
      </div>

      {/* Controller Area */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
             <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Search by nomenclature, email, or ID..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
             />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-48">
                <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <select 
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
             </div>
             <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-blue-500 transition-all">
                <Layers className="w-5 h-5" />
             </button>
          </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling Personnel Database...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700">
          <Users className="mx-auto mb-6 text-gray-200" size={64} />
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic">Registry Void</h3>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">No personnel matches found in the current sector data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div key={member._id || member.staffProfileId} className="bg-white dark:bg-gray-800 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:border-blue-500 transition-all">
              {/* Card Decoration */}
              <div className="h-2 bg-linear-to-r from-blue-600 to-cyan-400" />
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl font-black text-blue-600 border border-gray-100 dark:border-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[150px] uppercase tracking-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3 text-emerald-500" /> {member.employeeId || 'ID_PENDING'}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Briefcase size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Designation</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{member.designation || 'Specialist'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Building2 size={14} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Department</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{member.department || 'General'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                   <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-gray-100/50 dark:border-gray-600/30">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Onboarding</p>
                      <p className="text-[10px] font-black text-gray-700 dark:text-gray-300">{member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'N/A'}</p>
                   </div>
                   <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-gray-100/50 dark:border-gray-600/30">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Base Salary</p>
                      <p className="text-[10px] font-black text-blue-600">₹{member.basicSalary?.toLocaleString() || '0'}</p>
                   </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/hospital-admin/staff/${member._id || member.staffProfileId}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <Eye size={16} /> Dashboard
                  </button>
                  <button
                    onClick={() => router.push(`/hospital-admin/staff/edit/${member._id || member.staffProfileId}`)}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id || member.staffProfileId, member.name)}
                    disabled={deleteLoading === (member._id || member.staffProfileId)}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 transition-all disabled:opacity-50"
                  >
                    {deleteLoading === (member._id || member.staffProfileId) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
