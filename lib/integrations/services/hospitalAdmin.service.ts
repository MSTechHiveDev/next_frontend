import { HOSPITAL_ADMIN_ENDPOINTS, ADMIN_ENDPOINTS } from '../config';
import { apiClient } from '../api';
import type {
  Hospital,
  Doctor,
  Helpdesk,
  CreateDoctorRequest,
  CreateHelpdeskRequest,
  CreateHospitalRequest,
  CreateHospitalHelpdeskRequest,
  AttendanceRecord,
  AttendanceStats
} from '../types';

export interface HospitalAdminDashboard {
  hospital: Hospital;
  stats: {
    totalDoctors: number;
    totalHelpdesk: number;
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
  };
}

export interface HospitalAdminPatient {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  lastAppointment: Date;
  totalAppointments: number;
}

export const hospitalAdminService = {
  // Dashboard
  getDashboard: () =>
    apiClient<HospitalAdminDashboard>(HOSPITAL_ADMIN_ENDPOINTS.DASHBOARD),

  // Hospital
  getHospital: () =>
    apiClient<{ hospital: Hospital }>(HOSPITAL_ADMIN_ENDPOINTS.HOSPITAL),

  updateHospital: (data: Partial<CreateHospitalRequest>) =>
    apiClient<Hospital>(HOSPITAL_ADMIN_ENDPOINTS.HOSPITAL, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Doctors
  getDoctors: () =>
    apiClient<{ doctors: Doctor[] }>(HOSPITAL_ADMIN_ENDPOINTS.DOCTORS),

  getDoctorById: async (id: string) => {
    const profile: any = await apiClient(HOSPITAL_ADMIN_ENDPOINTS.DOCTOR_DETAIL(id));
    const user = profile.user || {};
    
    // Flatten structure: profile fields first, then user fields override where needed
    const doctor = {
      ...profile,        // All profile fields (specialties, department, address, permissions, etc.)
      ...user,           // User fields
      _id: user._id,     // User ID serves as main ID for updates
      doctorProfileId: profile._id, // Keep profile ID reference
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      status: user.status,
      doctorId: user.doctorId,
      role: 'doctor',
      user: undefined,   // Remove nested user object
      hospital: profile.hospital // Keep hospital reference from profile
    };

    return { doctor };
  },

  createDoctor: async (data: CreateDoctorRequest) => {
    // Ensure doctor is created for the hospital admin's hospital
    try {
      const hospitalResponse = await apiClient<{ hospital: Hospital }>(HOSPITAL_ADMIN_ENDPOINTS.HOSPITAL);
      const hospitalId = hospitalResponse.hospital._id;

      return apiClient<Doctor>(HOSPITAL_ADMIN_ENDPOINTS.CREATE_DOCTOR, {
        method: 'POST',
        body: JSON.stringify({ ...data, hospitalId }),
      });
    } catch (error) {
      // Fallback: try without hospitalId if we can't get the hospital
      return apiClient<Doctor>(HOSPITAL_ADMIN_ENDPOINTS.CREATE_DOCTOR, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  updateDoctor: (id: string, data: Partial<CreateDoctorRequest>) =>
    apiClient<Doctor>(HOSPITAL_ADMIN_ENDPOINTS.UPDATE_DOCTOR(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Deactivate doctor (soft delete - sets status to inactive)
  deactivateDoctor: async (id: string) => {
    return apiClient<{ doctor: Doctor }>(HOSPITAL_ADMIN_ENDPOINTS.UPDATE_DOCTOR(id), {
      method: 'PUT',
      body: JSON.stringify({ status: 'inactive' }),
    });
  },

  // Activate doctor (sets status to active)
  activateDoctor: async (id: string) => {
    return apiClient<{ doctor: Doctor }>(HOSPITAL_ADMIN_ENDPOINTS.UPDATE_DOCTOR(id), {
      method: 'PUT',
      body: JSON.stringify({ status: 'active' }),
    });
  },

  // Permanent delete (removes doctor from hospital)
  deleteDoctor: async (id: string) => {
    return apiClient<{ success: boolean; message: string }>(HOSPITAL_ADMIN_ENDPOINTS.DELETE_DOCTOR(id), {
      method: 'DELETE',
    });
  },

  // Helpdesk
  getHelpdesks: () =>
    apiClient<{ helpdesks: Helpdesk[] }>(HOSPITAL_ADMIN_ENDPOINTS.HELPDESKS),

  createHelpdesk: (data: CreateHospitalHelpdeskRequest) =>
    apiClient<Helpdesk>(HOSPITAL_ADMIN_ENDPOINTS.CREATE_HELPDESK, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateHelpdesk: (id: string, data: any) =>
    apiClient<Helpdesk>(HOSPITAL_ADMIN_ENDPOINTS.HELPDESK_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteHelpdesk: (id: string) =>
    apiClient<{ message: string }>(HOSPITAL_ADMIN_ENDPOINTS.HELPDESK_DETAIL(id), {
      method: 'DELETE',
    }),

  sendHelpdeskCredentials: (data: { helpdeskId: string; loginId: string; password: string }) =>
    apiClient<{ success: boolean; message: string; email: string }>('/hospital-admin/helpdesks/send-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Patients
  getPatients: () =>
    apiClient<{ patients: HospitalAdminPatient[] }>(HOSPITAL_ADMIN_ENDPOINTS.PATIENTS),

  // Placeholders
  getPharma: () =>
    apiClient<any>(HOSPITAL_ADMIN_ENDPOINTS.PHARMA),

  getLabs: () =>
    apiClient<any>(HOSPITAL_ADMIN_ENDPOINTS.LABS),

  getStaff: () =>
    apiClient<{ staff: any[] }>(HOSPITAL_ADMIN_ENDPOINTS.STAFF),

  getStaffById: async (id: string) => {
    const profile: any = await apiClient(HOSPITAL_ADMIN_ENDPOINTS.STAFF_DETAIL(id));
    const user = profile.user || {};
    
    // Flatten structure: profile fields first, then user fields override where needed
    const staff = {
      ...profile,        // All profile fields (department, designation, skills, etc.)
      ...user,           // User fields override (but we'll manually set the important ones)
      _id: user._id,     // User ID serves as main ID for updates
      staffProfileId: profile._id, // Keep profile ID reference
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      status: user.status,
      role: 'staff',
      user: undefined,   // Remove nested user object to avoid confusion
      hospital: profile.hospital // Keep hospital reference from profile
    };

    return { staff };
  },

  createStaff: (data: any) =>
    apiClient<any>(HOSPITAL_ADMIN_ENDPOINTS.CREATE_STAFF, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStaff: (id: string, data: any) =>
    apiClient<any>(HOSPITAL_ADMIN_ENDPOINTS.UPDATE_STAFF(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStaff: (id: string) =>
    apiClient<{ message: string }>(HOSPITAL_ADMIN_ENDPOINTS.DELETE_STAFF(id), {
      method: 'DELETE',
    }),

  // Attendance Management
  getAttendance: (params?: { date?: string; status?: string; staffId?: string }) => {
    const url = new URL(HOSPITAL_ADMIN_ENDPOINTS.ATTENDANCE, window.location.origin);
    if (params?.date) url.searchParams.set('date', params.date);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.staffId) url.searchParams.set('staffId', params.staffId);
    return apiClient<{ attendance: AttendanceRecord[] }>(url.pathname + url.search);
  },

  getAttendanceStats: () =>
    apiClient<{ stats: AttendanceStats }>(HOSPITAL_ADMIN_ENDPOINTS.ATTENDANCE_STATS),

  getAttendanceById: (id: string) =>
    apiClient<{ attendance: AttendanceRecord }>(HOSPITAL_ADMIN_ENDPOINTS.ATTENDANCE_DETAIL(id)),

  updateAttendance: (id: string, data: Partial<AttendanceRecord>) =>
    apiClient<AttendanceRecord>(HOSPITAL_ADMIN_ENDPOINTS.UPDATE_ATTENDANCE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAttendance: (id: string) =>
    apiClient<{ message: string }>(HOSPITAL_ADMIN_ENDPOINTS.DELETE_ATTENDANCE(id), {
      method: 'DELETE',
    }),

  // Announcements
  getAnnouncements: () =>
    apiClient<{ announcements: any[] }>('/announcements/hospital'),

  createAnnouncement: (data: any) =>
    apiClient<any>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAnnouncement: (id: string, data: any) =>
    apiClient<any>(`/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAnnouncement: (id: string) =>
    apiClient<{ message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    }),

  // Transactions
  getTransactions: () =>
    apiClient<any[]>(HOSPITAL_ADMIN_ENDPOINTS.TRANSACTIONS),

  // Shifts
  getShifts: () =>
    apiClient<any[]>('/hospital/shifts'),

  createShift: (data: any) =>
    apiClient<any>('/hospital/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateShift: (id: string, data: any) =>
    apiClient<any>(`/hospital/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteShift: (id: string) =>
    apiClient<any>(`/hospital/shifts/${id}`, {
      method: 'DELETE',
    }),

  getShiftStaff: (id: string) =>
    apiClient<any[]>(`/hospital/shifts/${id}/staff`),

  assignStaffToShift: (id: string, staffIds: string[]) =>
    apiClient<any>(`/hospital/shifts/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ staffIds }),
    }),
};

