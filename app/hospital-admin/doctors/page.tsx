"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations";
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Mail, 
  Phone,
  Award,
  Calendar,
  DollarSign,
  Search,
  Filter
} from "lucide-react";
import { PageHeader, Card, Button } from "@/components/admin";

export default function HospitalAdminDoctors() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await hospitalAdminService.getDoctors();
      setDoctors(data.doctors || []);
    } catch (error: any) {
      console.error("Failed to fetch doctors:", error);
      toast.error(error.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate Dr. ${name}? The doctor will no longer be active but their profile will be preserved.`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      await hospitalAdminService.deactivateDoctor(id);
      toast.success(`Dr. ${name} has been deactivated successfully`);
      fetchDoctors(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to deactivate doctor:", error);
      toast.error(error.message || "Failed to deactivate doctor");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleActivate = async (id: string, name: string) => {
    setDeleteLoading(id);
    try {
      await hospitalAdminService.activateDoctor(id);
      toast.success(`Dr. ${name} has been activated successfully`);
      fetchDoctors(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to activate doctor:", error);
      toast.error(error.message || "Failed to activate doctor");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ PERMANENT DELETE: Are you sure you want to permanently remove Dr. ${name} from your hospital? This action cannot be undone!`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      await hospitalAdminService.deleteDoctor(id);
      toast.success(`Dr. ${name} has been permanently removed from the hospital`);
      fetchDoctors(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to delete doctor:", error);
      toast.error(error.message || "Failed to delete doctor");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get unique specialties for filter
  const specialties = Array.from(
    new Set(doctors.flatMap((d) => d.specialties || []))
  ).sort();

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctorId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = 
      !filterSpecialty || 
      doctor.specialties?.includes(filterSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--secondary-color)' }}>Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        icon={<Stethoscope className="text-blue-500" />}
        title="Doctors Management"
        subtitle={`Manage your hospital's ${doctors.length} doctor${doctors.length !== 1 ? 's' : ''}`}
      />

      {/* Search and Filter Bar */}
      <Card padding="p-4" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                color: 'var(--text-color)', 
                borderColor: 'var(--border-color)' 
              }}
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                color: 'var(--text-color)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <option value="">All Specialties</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => router.push('/hospital-admin/doctors/create')}
            icon={<Plus size={20} />}
            className="whitespace-nowrap"
          >
            Add Doctor
          </Button>
        </div>
      </Card>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <Card padding="p-12">
          <div className="text-center">
            <Stethoscope className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
              {searchTerm || filterSpecialty ? 'No doctors found' : 'No doctors yet'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--secondary-color)' }}>
              {searchTerm || filterSpecialty 
                ? 'Try adjusting your search or filter criteria' 
                : 'Add your first doctor to get started'}
            </p>
            {!searchTerm && !filterSpecialty && (
              <Button 
                onClick={() => router.push('/hospital-admin/doctors/create')}
                icon={<Plus size={20} />}
              >
                Add First Doctor
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor._id} padding="p-0" className={`overflow-hidden hover:shadow-xl transition-shadow ${doctor.status === 'inactive' ? 'opacity-75' : ''}`}>
              {/* Header Section */}
              <div className={`p-6 text-white ${doctor.status === 'inactive' ? 'bg-gradient-to-br from-gray-500 to-gray-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                <div className="flex items-start gap-4 mb-4">
                  {doctor.profilePic ? (
                    <img
                      src={doctor.profilePic}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                      <Stethoscope size={28} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-xl truncate">
                        {doctor.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.status === 'inactive'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {doctor.status === 'inactive' ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm font-medium">
                      {doctor.doctorId || 'ID pending'}
                    </p>
                  </div>
                </div>
                
                {/* Specialties */}
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.slice(0, 2).map((spec: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm"
                      >
                        {spec}
                      </span>
                    ))}
                    {doctor.specialties.length > 2 && (
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                        +{doctor.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Body Section */}
              <div className="p-6 space-y-3">
                {doctor.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-blue-500 flex-shrink-0" />
                    <span className="truncate" style={{ color: 'var(--text-color)' }}>
                      {doctor.email}
                    </span>
                  </div>
                )}
                
                {doctor.mobile && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-green-500 flex-shrink-0" />
                    <span style={{ color: 'var(--text-color)' }}>{doctor.mobile}</span>
                  </div>
                )}
                
                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award size={16} className="text-purple-500 flex-shrink-0" />
                    <span className="truncate" style={{ color: 'var(--text-color)' }}>
                      {doctor.qualifications.join(', ')}
                    </span>
                  </div>
                )}
                
                {doctor.experienceYears !== undefined && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-orange-500 flex-shrink-0" />
                    <span style={{ color: 'var(--text-color)' }}>
                      {doctor.experienceYears} years experience
                    </span>
                  </div>
                )}
                
                {doctor.consultationFee && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign size={16} className="text-green-600 flex-shrink-0" />
                    <span style={{ color: 'var(--text-color)' }}>
                      ₹{doctor.consultationFee} consultation fee
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => router.push(`/hospital-admin/doctors/${doctor.doctorProfileId || doctor._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                >
                  <Eye size={18} />
                  View
                </button>
                {doctor.status !== 'inactive' && (
                  <>
                    <button
                      onClick={() => router.push(`/hospital-admin/doctors/edit/${doctor._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium"
                    >
                      <Edit size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(doctor.doctorProfileId || doctor._id, doctor.name)}
                      disabled={deleteLoading === (doctor.doctorProfileId || doctor._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading === (doctor.doctorProfileId || doctor._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Deactivate
                    </button>
                  </>
                )}
                {doctor.status === 'inactive' && (
                  <>
                    <button
                      onClick={() => handleActivate(doctor.doctorProfileId || doctor._id, doctor.name)}
                      disabled={deleteLoading === (doctor.doctorProfileId || doctor._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading === (doctor.doctorProfileId || doctor._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        "✓"
                      )}
                      Activate
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(doctor.doctorProfileId || doctor._id, doctor.name)}
                      disabled={deleteLoading === (doctor.doctorProfileId || doctor._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading === (doctor.doctorProfileId || doctor._id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Delete
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
