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
  Award,
  Calendar,
  DollarSign,
  Clock,
  Building,
  CreditCard,
  Shield,
  Globe,
  Stethoscope,
  Edit,
  Trash2,
  FileText,
  User,
  Briefcase
} from "lucide-react";
import { PageHeader, Card, Button } from "@/components/admin";

export default function DoctorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDoctor();
    }
  }, [id]);

  const fetchDoctor = async () => {
    try {
      // Try to get doctor details from backend first
      try {
        const data = await hospitalAdminService.getDoctorById(id);
        setDoctor(data.doctor);
        return;
      } catch (detailError: any) {
        // If detail endpoint fails (404), fall back to list endpoint
        if (detailError.status === 404 ||
            detailError.message?.includes('404') ||
            detailError.message?.toLowerCase().includes('not found')) {
          const data = await hospitalAdminService.getDoctors();
          const doctorData = data.doctors?.find((doc: any) => doc._id === id);

          if (!doctorData) {
            throw new Error("Doctor not found");
          }

          setDoctor(doctorData);
          return;
        }
        // Re-throw other errors
        throw detailError;
      }
    } catch (error: any) {
      console.error("Failed to fetch doctor:", error);
      toast.error(error.message || "Failed to load doctor details");
      router.push('/hospital-admin/doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to deactivate Dr. ${doctor?.name}? The doctor will no longer be active but their profile will be preserved.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      await hospitalAdminService.deleteDoctor(doctor?.doctorProfileId || id);
      toast.success(`Dr. ${doctor?.name} has been deactivated successfully`);
      router.push('/hospital-admin/doctors');
    } catch (error: any) {
      console.error("Failed to deactivate doctor:", error);
      toast.error(error.message || "Failed to deactivate doctor");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--secondary-color)' }}>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => router.push('/hospital-admin/doctors')}
        className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Doctors
      </button>

      <PageHeader
        icon={<Stethoscope className="text-blue-500" />}
        title={doctor.name}
        subtitle={doctor.doctorId || 'Doctor Profile'}
      />

      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          doctor.status === 'inactive'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {doctor.status === 'inactive' ? 'Inactive Doctor' : 'Active Doctor'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {doctor.status !== 'inactive' && (
          <>
            <Button
              onClick={() => router.push(`/hospital-admin/doctors/edit/${id}`)}
              icon={<Edit size={18} />}
              variant="secondary"
            >
              Edit Profile
            </Button>
            <Button
              onClick={handleDelete}
              loading={deleteLoading}
              icon={<Trash2 size={18} />}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Deactivate Doctor
            </Button>
          </>
        )}
        {doctor.status === 'inactive' && (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">
              This doctor has been deactivated and is no longer active in the system.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card padding="p-6">
            <div className="text-center">
              {doctor.profilePic ? (
                <img 
                  src={doctor.profilePic} 
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="text-white" size={48} />
                </div>
              )}
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                {doctor.name}
              </h2>
              <p className="text-blue-600 font-medium mb-2">
                {doctor.designation || 'Consultant'}
              </p>
              <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                {doctor.department || 'Department not assigned'}
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" icon={<Mail className="text-green-500" />} padding="p-6">
            <div className="space-y-4">
              {doctor.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Email</p>
                    <a href={`mailto:${doctor.email}`} className="text-sm text-blue-600 hover:underline">
                      {doctor.email}
                    </a>
                  </div>
                </div>
              )}
              
              {doctor.mobile && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Mobile</p>
                    <a href={`tel:${doctor.mobile}`} className="text-sm" style={{ color: 'var(--text-color)' }}>
                      {doctor.mobile}
                    </a>
                  </div>
                </div>
              )}

              {doctor.gender && (
                <div className="flex items-start gap-3">
                  <User size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Gender</p>
                    <p className="text-sm capitalize" style={{ color: 'var(--text-color)' }}>{doctor.gender}</p>
                  </div>
                </div>
              )}

              {doctor.dateOfBirth && (
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Date of Birth</p>
                    <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                      {new Date(doctor.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {doctor.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Address</p>
                    <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                      {[doctor.address.street, doctor.address.city, doctor.address.state, doctor.address.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card title="Quick Stats" icon={<Briefcase className="text-blue-500" />} padding="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>Consultation Fee</span>
                <span className="font-semibold text-green-600">₹{doctor.consultationFee || 'Not set'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>Duration</span>
                <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.consultationDuration || 15} mins</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>Max Appointments</span>
                <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.maxAppointmentsPerDay || 20}/day</span>
              </div>

              {doctor.room && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--secondary-color)' }}>Room</span>
                  <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.room}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Details */}
          <Card title="Professional Details" icon={<Award className="text-purple-500" />} padding="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctor.specialties && doctor.specialties.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--secondary-color)' }}>Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((spec: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--secondary-color)' }}>Qualifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.qualifications.map((qual: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Award size={14} /> {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {doctor.experienceStart && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} className="text-orange-500" />
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>Experience</h4>
                </div>
                <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                  Practicing since {new Date(doctor.experienceStart).toLocaleDateString()}
                  {doctor.experienceYears && ` (${doctor.experienceYears} years)`}
                </p>
              </div>
            )}
          </Card>

          {/* Medical Registration */}
          <Card
            title="Medical Registration"
            icon={<CreditCard className="text-yellow-500" />}
            padding="p-6"
            className="border-2 border-yellow-200 dark:border-yellow-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Registration Number</p>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.medicalRegistrationNumber || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Council</p>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.registrationCouncil || 'National Medical Commission (NMC)'}</p>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Registration Year</p>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.registrationYear || 'Not specified'}</p>
              </div>

              {doctor.registrationExpiryDate && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Expiry Date</p>
                  <p className="font-semibold" style={{ color: 'var(--text-color)' }}>
                    {new Date(doctor.registrationExpiryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Department & Scheduling */}
          <Card title="Department & Scheduling" icon={<Building className="text-indigo-500" />} padding="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Department</p>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.department || 'Not assigned'}</p>
              </div>

              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Designation</p>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.designation || 'Consultant'}</p>
              </div>

              {doctor.employeeId && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--secondary-color)' }}>Employee ID</p>
                  <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{doctor.employeeId}</p>
                </div>
              )}
            </div>

            {doctor.availability && doctor.availability.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                  <Clock size={16} /> Weekly Schedule
                </h4>
                <div className="space-y-3">
                  {doctor.availability.map((slot: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg border" 
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}
                    >
                      <div className="flex flex-wrap gap-2 mb-2">
                        {slot.days?.map((day: string) => (
                          <span 
                            key={day}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                        {slot.startTime} - {slot.endTime}
                        {slot.breakStart && slot.breakEnd && (
                          <span style={{ color: 'var(--secondary-color)' }}>
                            {' '}(Break: {slot.breakStart} - {slot.breakEnd})
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* System Permissions */}
          <Card title="System Permissions" icon={<Shield className="text-red-500" />} padding="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(doctor.permissions || {
                canAccessEMR: true,
                canAccessBilling: false,
                canAccessLabReports: true,
                canPrescribe: true,
                canAdmitPatients: false,
                canPerformSurgery: false
              }).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg border-2 ${
                    value
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>
                      {key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bio */}
          <Card title="About" icon={<FileText className="text-blue-500" />} padding="p-6">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
              {doctor.bio || `Dr. ${doctor.name} is a ${doctor.designation || 'Consultant'} specializing in ${doctor.specialties?.join(', ') || 'medical care'}.`}
            </p>
          </Card>

          {/* Languages & Awards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctor.languages && doctor.languages.length > 0 && (
              <Card title="Languages" icon={<Globe className="text-blue-500" />} padding="p-6">
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Globe size={14} /> {lang}
                    </span>
                  ))}
                </div>
              </Card>
            )}
            
            {doctor.awards && doctor.awards.length > 0 && (
              <Card title="Awards & Recognition" icon={<Award className="text-amber-500" />} padding="p-6">
                <div className="space-y-2">
                  {doctor.awards.map((award: string, idx: number) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg"
                    >
                      <Award className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-sm" style={{ color: 'var(--text-color)' }}>{award}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Signature */}
          {doctor.signature && (
            <Card title="Digital Signature" icon={<FileText className="text-purple-500" />} padding="p-6">
              <img 
                src={doctor.signature} 
                alt="Doctor's Signature"
                className="max-w-xs h-auto border rounded-lg p-4" 
                style={{ borderColor: 'var(--border-color)' }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
