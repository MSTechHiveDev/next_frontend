"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { hospitalAdminService } from "@/lib/integrations";
import {
  Edit,
  Eye,
  EyeOff,
  Calendar,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  MapPin,
  Clock,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Card, FormInput, Button } from "@/components/admin";

interface FormData {
  // Personal
  name: string;
  email: string;
  mobile: string;
  password: string;
  gender: string;
  dateOfBirth: string;

  // Address
  street: string;
  city: string;
  state: string;
  pincode: string;

  // Professional
  department: string;
  designation: string;
  employeeId: string;
  employmentType: string;
  experienceYears: string;
  joiningDate: string;

  // Contact
  emergencyContactName: string;
  emergencyContactMobile: string;
  emergencyContactRelationship: string;

  // Work
  shift: string;
  startTime: string;
  endTime: string;
  weeklyOff: string[];

  // Qualifications
  qualifications: string[];
  certifications: string[];
  skills: string[];


  // Additional
  bloodGroup: string;
  languages: string[];
  notes: string;

  // Status
  status: string;
  terminationDate: string;
  terminationReason: string;

  // Leave Policy
  sickLeaveQuota: string;
  emergencyLeaveQuota: string;
}

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EditStaff() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", mobile: "", password: "", gender: "",
    dateOfBirth: "",
    street: "", city: "", state: "", pincode: "",
    department: "", designation: "", employeeId: "", employmentType: "full-time",
    experienceYears: "", joiningDate: "",
    emergencyContactName: "", emergencyContactMobile: "", emergencyContactRelationship: "",
    shift: "morning", startTime: "09:00", endTime: "17:00", weeklyOff: ["Saturday", "Sunday"],
    qualifications: [], certifications: [], skills: [],
    bloodGroup: "", languages: [], notes: "",
    status: "active", terminationDate: "", terminationReason: "",
    sickLeaveQuota: "1", emergencyLeaveQuota: "1"
  });

  const [tempQualification, setTempQualification] = useState("");
  const [tempCertification, setTempCertification] = useState("");
  const [tempSkill, setTempSkill] = useState("");
  const [tempLanguage, setTempLanguage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [shifts, setShifts] = useState<any[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchShifts();
      if (id) {
        await fetchStaff();
      }
    };
    init();
  }, [id]);

  const fetchShifts = async () => {
    try {
      const data = await hospitalAdminService.getShifts();
      setShifts(data);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fetchStaff = async () => {
    try {
      // Try to get staff details from backend first
      try {
        const data = await hospitalAdminService.getStaffById(id);
        const staff = data.staff;

        // Map backend data to form data
        setFormData({
          name: staff.name || "",
          email: staff.email || "",
          mobile: staff.mobile || "",
          password: "", // Keep password empty for security
          gender: staff.gender || "",
          dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : "",
          street: staff.address?.street || "",
          city: staff.address?.city || "",
          state: staff.address?.state || "",
          pincode: staff.address?.pincode || "",
          department: staff.department || "",
          designation: staff.designation || "",
          employeeId: staff.employeeId || "",
          employmentType: staff.employmentType || "full-time",
          experienceYears: staff.experienceYears?.toString() || "",
          joiningDate: staff.joiningDate ? new Date(staff.joiningDate).toISOString().split('T')[0] : "",
          emergencyContactName: staff.emergencyContact?.name || "",
          emergencyContactMobile: staff.emergencyContact?.mobile || "",
          emergencyContactRelationship: staff.emergencyContact?.relationship || "",
          shift: staff.shift || "morning",
          startTime: staff.workingHours?.start || "09:00",
          endTime: staff.workingHours?.end || "17:00",
          weeklyOff: staff.weeklyOff || ["Saturday", "Sunday"],
          qualifications: staff.qualifications || [],
          certifications: staff.certifications || [],
          skills: staff.skills || [],
          bloodGroup: staff.bloodGroup || "",
          languages: staff.languages || [],
          notes: staff.notes || "",
          status: staff.status || "active",
          terminationDate: staff.terminationDate ? new Date(staff.terminationDate).toISOString().split('T')[0] : "",
          terminationReason: staff.terminationReason || "",
          sickLeaveQuota: staff.sickLeaveQuota?.toString() || "1",
          emergencyLeaveQuota: staff.emergencyLeaveQuota?.toString() || "1"
        });
        return;
      } catch (detailError: any) {
        // If detail endpoint fails (404), fall back to list endpoint
        if (detailError.status === 404 ||
            detailError.message?.includes('404') ||
            detailError.message?.toLowerCase().includes('not found')) {
          const data = await hospitalAdminService.getStaff();
          const staffData = data.staff?.find((member: any) => (member._id || member.staffProfileId) === id);

          if (!staffData) {
            throw new Error("Staff member not found");
          }

          // Map list data to form data (limited fields available)
          setFormData(prev => ({
            ...prev,
            name: staffData.name || "",
            email: staffData.email || "",
            mobile: staffData.mobile || "",
            gender: staffData.gender || "",
            dateOfBirth: staffData.dateOfBirth ? new Date(staffData.dateOfBirth).toISOString().split('T')[0] : "",
            department: staffData.department || "",
            designation: staffData.designation || "",
            employeeId: staffData.employeeId || "",
            joiningDate: staffData.joiningDate ? new Date(staffData.joiningDate).toISOString().split('T')[0] : "",
            basicSalary: staffData.basicSalary?.toString() || "",
            status: staffData.status || "active"
          }));
          return;
        }
        throw detailError;
      }
    } catch (error: any) {
      console.error("Failed to fetch staff:", error);
      toast.error(error.message || "Failed to load staff details");
      router.push('/hospital-admin/staff');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Validation for specific fields
    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;
    if (["basicSalary", "hra", "conveyance", "medical", "lta", "sickLeaveQuota", "emergencyLeaveQuota"].includes(name) && !/^\d*$/.test(value)) return;
    if (name === "pincode" && !/^\d{0,6}$/.test(value)) return;
    if (name === "experienceYears" && !/^\d*$/.test(value)) return;

    if (name === 'shift') {
      const selectedShift = shifts.find(s => s._id === value);
      if (selectedShift) {
        setFormData(prev => ({ 
          ...prev, 
          shift: value, 
          startTime: selectedShift.startTime, 
          endTime: selectedShift.endTime 
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const toggleWeeklyOff = (day: string) => {
    setFormData(prev => ({
      ...prev,
      weeklyOff: prev.weeklyOff.includes(day)
        ? prev.weeklyOff.filter(d => d !== day)
        : [...prev.weeklyOff, day]
    }));
  };

  const addItem = (type: 'qualification' | 'certification' | 'skill' | 'language', value: string) => {
    const tempValue = type === 'qualification' ? tempQualification :
                     type === 'certification' ? tempCertification :
                     type === 'skill' ? tempSkill : tempLanguage;

    const key = type + 's' as keyof Pick<FormData, 'qualifications' | 'certifications' | 'skills' | 'languages'>;

    if (tempValue && !formData[key].includes(tempValue)) {
      setFormData(prev => ({
        ...prev,
        [key]: [...prev[key], tempValue]
      }));

      if (type === 'qualification') setTempQualification("");
      else if (type === 'certification') setTempCertification("");
      else if (type === 'skill') setTempSkill("");
      else setTempLanguage("");
    }
  };

  const removeItem = (type: keyof Pick<FormData, 'qualifications' | 'certifications' | 'skills' | 'languages'>, item: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((i: string) => i !== item)
    }));
  };

  const validateForm = (): boolean => {
    // Required fields
    if (!formData.name.trim()) return toast.error("Please enter staff name"), false;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return toast.error("Please enter a valid email address"), false;
    if (formData.mobile.length !== 10) return toast.error("Mobile number must be exactly 10 digits"), false;
    if (!formData.department.trim()) return toast.error("Please enter department"), false;
    if (!formData.designation.trim()) return toast.error("Please enter designation"), false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const staffData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,

        address: formData.street || formData.city ? {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India"
        } : undefined,

        department: formData.department.trim(),
        designation: formData.designation.trim(),
        employeeId: formData.employeeId.trim() || undefined,
        employmentType: formData.employmentType,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
        joiningDate: formData.joiningDate || undefined,

        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          mobile: formData.emergencyContactMobile,
          relationship: formData.emergencyContactRelationship
        } : undefined,

        shift: formData.shift,
        workingHours: {
          start: formData.startTime,
          end: formData.endTime
        },
        weeklyOff: formData.weeklyOff,

        qualifications: formData.qualifications,
        certifications: formData.certifications,
        skills: formData.skills,


        bloodGroup: formData.bloodGroup || undefined,
        languages: formData.languages,
        notes: formData.notes.trim() || undefined,

        status: formData.status,
        terminationDate: formData.terminationDate || undefined,
        terminationReason: formData.terminationReason || undefined,
        
        sickLeaveQuota: parseInt(formData.sickLeaveQuota) || 1,
        emergencyLeaveQuota: parseInt(formData.emergencyLeaveQuota) || 1,
        
        role: 'staff'
      };

      // Only include password if it was changed
      if (formData.password) {
        staffData.password = formData.password;
      }

      await hospitalAdminService.updateStaff(id, staffData);

      toast.success(`Staff member "${formData.name}" updated successfully!`, { duration: 4000 });

      setTimeout(() => {
        router.push("/hospital-admin/staff");
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update staff member", { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--secondary-color)' }}>Loading staff details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        icon={<Edit className="text-green-500" />}
        title="Edit Staff Member"
        subtitle={`Update details for ${formData.name}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Section */}
        <Card title="Employment Status" icon={<User className="text-blue-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {formData.status === 'terminated' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Termination Date
                  </label>
                  <input type="date" name="terminationDate" value={formData.terminationDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
                </div>

                <FormInput label="Termination Reason" type="text" name="terminationReason"
                  value={formData.terminationReason} onChange={handleChange} placeholder="Reason for termination" />
              </>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information" icon={<User className="text-blue-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput label="Full Name" type="text" name="name" required
              value={formData.name} onChange={handleChange} placeholder="John Doe" />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Gender
              </label>
              <select name="gender" value={formData.gender} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Date of Birth
              </label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                onChange={handleChange} max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card title="Contact Information" icon={<Mail className="text-green-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput label="Email Address" type="email" name="email" required
              value={formData.email} onChange={handleChange} placeholder="staff@hospital.com" />
            <FormInput label="Mobile Number (10 digits)" type="tel" name="mobile" required
              value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile" />
            <div className="relative">
              <FormInput label="Password (Leave blank to keep current)" type={showPassword ? "text" : "password"} name="password"
                value={formData.password} onChange={handleChange} placeholder="New password (optional)" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-blue-500">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
              <MapPin size={16} /> Address (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Street" type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street address" />
              <FormInput label="City" type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
              <FormInput label="State" type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
              <FormInput label="Pincode" type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" />
            </div>
          </div>
        </Card>

        {/* Professional Details */}
        <Card title="Professional Details" icon={<Briefcase className="text-purple-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput label="Department" type="text" name="department" required
              value={formData.department} onChange={handleChange} placeholder="e.g., Administration" />
            <FormInput label="Designation" type="text" name="designation" required
              value={formData.designation} onChange={handleChange} placeholder="e.g., Nurse" />
            <FormInput label="Employee ID" type="text" name="employeeId"
              value={formData.employeeId} onChange={handleChange} placeholder="EMP001" />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Employment Type
              </label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <FormInput label="Experience (years)" type="text" name="experienceYears"
              value={formData.experienceYears} onChange={handleChange} placeholder="0" />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Joining Date
              </label>
              <input type="date" name="joiningDate" value={formData.joiningDate}
                onChange={handleChange} max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card title="Emergency Contact" icon={<Phone className="text-red-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Contact Name" type="text" name="emergencyContactName"
              value={formData.emergencyContactName} onChange={handleChange} placeholder="Emergency contact name" />
            <FormInput label="Contact Mobile" type="tel" name="emergencyContactMobile"
              value={formData.emergencyContactMobile} onChange={handleChange} placeholder="10-digit mobile" />
            <FormInput label="Relationship" type="text" name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship} onChange={handleChange} placeholder="e.g., Spouse, Parent" />
          </div>
        </Card>

        {/* Leave Policy */}
        <Card title="Leave Policy (Monthly Quota)" icon={<Calendar className="text-pink-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Sick Leave Quota" type="text" name="sickLeaveQuota"
              value={formData.sickLeaveQuota} onChange={handleChange} placeholder="1" />
            <FormInput label="Emergency Leave Quota" type="text" name="emergencyLeaveQuota"
              value={formData.emergencyLeaveQuota} onChange={handleChange} placeholder="1" />
            <div className="flex flex-col justify-center">
              <p className="text-xs text-gray-500 italic mt-6">Total monthly allowance: {parseInt(formData.sickLeaveQuota || "0") + parseInt(formData.emergencyLeaveQuota || "0")} days</p>
            </div>
          </div>
        </Card>

        {/* Work Schedule */}
        <Card title="Work Schedule" icon={<Clock className="text-orange-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Select Shift
              </label>
              {loadingShifts ? (
                <div className="animate-pulse h-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
              ) : (
                <select name="shift" value={formData.shift} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                  <option value="">Select Shift</option>
                  {shifts.map((s: any) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                Start Time
              </label>
              <input type="time" value={formData.startTime} readOnly
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                End Time
              </label>
              <input type="time" value={formData.endTime} readOnly
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Weekly Off Days</h4>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button key={day} type="button"
                  onClick={() => toggleWeeklyOff(day)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                    formData.weeklyOff.includes(day)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                  }`}>
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Qualifications & Skills */}
        <Card title="Qualifications & Skills" icon={<FileText className="text-indigo-500" />} padding="p-6">
          <div className="space-y-6">
            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium mb-2">Qualifications</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={tempQualification} onChange={(e) => setTempQualification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('qualification', tempQualification))}
                  placeholder="e.g., B.Sc Nursing, Diploma" className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
                <Button type="button" variant="secondary" onClick={() => addItem('qualification', tempQualification)} disabled={!tempQualification}>Add</Button>
              </div>
              {formData.qualifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.qualifications.map(q => (
                    <span key={q} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-sm font-medium flex items-center gap-2">
                      {q} <button type="button" onClick={() => removeItem('qualifications', q)} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium mb-2">Certifications</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={tempCertification} onChange={(e) => setTempCertification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certification', tempCertification))}
                  placeholder="e.g., BLS, ACLS" className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
                <Button type="button" variant="secondary" onClick={() => addItem('certification', tempCertification)} disabled={!tempCertification}>Add</Button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm font-medium flex items-center gap-2">
                      {c} <button type="button" onClick={() => removeItem('certifications', c)} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={tempSkill} onChange={(e) => setTempSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skill', tempSkill))}
                  placeholder="e.g., Patient Care, Administration" className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
                <Button type="button" variant="secondary" onClick={() => addItem('skill', tempSkill)} disabled={!tempSkill}>Add</Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg text-sm font-medium flex items-center gap-2">
                      {s} <button type="button" onClick={() => removeItem('skills', s)} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>


        {/* Additional Information */}
        <Card title="Additional Information" icon={<FileText className="text-indigo-500" />} padding="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                  Blood Group
                </label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Languages Spoken</label>
                <div className="flex gap-2 mb-3">
                  <select value={tempLanguage} onChange={(e) => setTempLanguage(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>
                  <Button type="button" variant="secondary" onClick={() => addItem('language', tempLanguage)} disabled={!tempLanguage}>Add</Button>
                </div>
                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map(l => (
                      <span key={l} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-sm flex items-center gap-2">
                        <Globe size={14} /> {l} <button type="button" onClick={() => removeItem('languages', l)} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4}
                placeholder="Additional notes about the staff member..."
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.push("/hospital-admin/staff")}
            disabled={loading} className="px-8">Cancel</Button>
          <Button type="submit" variant="primary" loading={loading} icon={<Edit size={18} />}
            className="px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
            Update Staff Member
          </Button>
        </div>
      </form>
    </div>
  );
}