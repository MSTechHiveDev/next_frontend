import { DOCTOR_ENDPOINTS } from '../config';
import { apiClient } from '../api';
import type { DoctorStats, DoctorAppointment, DoctorPatient } from '../types/doctor';

export interface DoctorDashboard {
  stats: {
    totalPatients: number;
    appointmentsToday: number;
    pendingReports: number;
    consultationsValue: number;
  };
  appointments: Array<{
    id: string;
    patientName: string;
    patientId: string;
    time: string;
    type: string;
    status: string;
    hospital: string;
  }>;
  recentPatients: Array<{
    id: string;
    name: string;
    mobile?: string;
    email?: string;
    lastVisit: Date;
  }>;
}

export const doctorService = {
  // Dashboard
  getDashboard: () =>
    apiClient<DoctorDashboard>(DOCTOR_ENDPOINTS.DASHBOARD),

  // Profile
  getProfile: () =>
    apiClient<any>(DOCTOR_ENDPOINTS.PROFILE),

  // Patients
  getMyPatients: () =>
    apiClient<DoctorPatient[]>(DOCTOR_ENDPOINTS.MY_PATIENTS),

  getPatientDetails: (id: string) =>
    apiClient<any>(DOCTOR_ENDPOINTS.PATIENT_DETAILS(id)),

  // Calendar
  getCalendarStats: (params?: { month?: number; year?: number; view?: string; startDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.view) queryParams.append('view', params.view);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    const query = queryParams.toString();
    return apiClient<any>(`${DOCTOR_ENDPOINTS.CALENDAR_STATS}${query ? `?${query}` : ''}`);
  },

  getCalendarAppointments: (params?: { date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    const query = queryParams.toString();
    return apiClient<DoctorAppointment[]>(`${DOCTOR_ENDPOINTS.CALENDAR_APPOINTMENTS}${query ? `?${query}` : ''}`);
  },

  // Quick Notes
  getQuickNotes: () =>
    apiClient<any[]>(DOCTOR_ENDPOINTS.QUICK_NOTES),

  addQuickNote: (data: { text: string }) =>
    apiClient<any>(DOCTOR_ENDPOINTS.QUICK_NOTES, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteQuickNote: (id: string) =>
    apiClient<void>(`${DOCTOR_ENDPOINTS.QUICK_NOTES}/${id}`, {
      method: 'DELETE',
    }),

  // Appointments
  startNextAppointment: () =>
    apiClient<any>(DOCTOR_ENDPOINTS.START_NEXT, {
      method: 'POST',
    }),
};

