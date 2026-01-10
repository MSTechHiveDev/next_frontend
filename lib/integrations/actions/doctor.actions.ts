'use server';

import { revalidatePath } from 'next/cache';
import { apiServer } from '../api/apiServer';
import { DOCTOR_ENDPOINTS, COMMON_ENDPOINTS, BOOKING_ENDPOINTS } from '../config';
import { DoctorDashboardData, DoctorQuickNote, DoctorPatient } from '../types/doctor';



export async function getDoctorDashboardAction(): Promise<{ success: boolean; data?: DoctorDashboardData; error?: string }> {
  try {
    const data = await apiServer<DoctorDashboardData>(DOCTOR_ENDPOINTS.DASHBOARD);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch dashboard data' };
  }
}

export async function getMyAnnouncementsAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await apiServer(COMMON_ENDPOINTS.MY_ANNOUNCEMENTS);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch announcements' };
  }
}

export async function getQuickNotesAction(): Promise<{ success: boolean; data?: DoctorQuickNote[]; error?: string }> {
  try {
    const data = await apiServer<DoctorQuickNote[]>(DOCTOR_ENDPOINTS.QUICK_NOTES);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch notes' };
  }
}

export async function addQuickNoteAction(text: string): Promise<{ success: boolean; data?: DoctorQuickNote; error?: string }> {
  try {
    const data = await apiServer<DoctorQuickNote>(DOCTOR_ENDPOINTS.QUICK_NOTES, {
      method: "POST",
      body: JSON.stringify({ text })
    });
    revalidatePath('/doctor');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add note' };
  }
}

export async function deleteQuickNoteAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiServer(`${DOCTOR_ENDPOINTS.QUICK_NOTES}/${id}`, {
      method: "DELETE"
    });
    revalidatePath('/doctor');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete note' };
  }
}

export async function getDoctorWeeklyStatsAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const today = new Date();
    // Default to last 7 days or start of current week for better visualization of flow
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6); // Last 7 days including today
    const data = await apiServer(`${DOCTOR_ENDPOINTS.CALENDAR_STATS}?view=weekly&startDate=${startOfWeek.toISOString()}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch weekly stats' };
  }
}

export async function getDoctorProfileAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await apiServer(DOCTOR_ENDPOINTS.PROFILE);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profile' };
  }
}

export async function getAllAppointmentsAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const data = await apiServer<any[]>(BOOKING_ENDPOINTS.MY_APPOINTMENTS);

    // Normalize data for UI
    const normalizedData = (Array.isArray(data) ? data : []).map(item => {
      // Logic to extract only time if it includes a date
      const formatTimeOnly = (t: string) => {
        if (!t) return null;
        if (t.includes('T')) {
          return t.split('T')[1]?.substring(0, 5) || t;
        }
        // If it looks like a date (contains / or - and is long), it's probably not just a time
        if ((t.includes('/') || t.includes('-')) && t.length > 8) {
          return null;
        }
        return t;
      };

      const tSlot = formatTimeOnly(item.timeSlot);
      const apptTime = formatTimeOnly(item.appointmentTime);
      const sTime = formatTimeOnly(item.startTime);
      const eTime = formatTimeOnly(item.endTime);

      const rawTime = tSlot || apptTime || (sTime && eTime ? `${sTime} - ${eTime}` : sTime) || 'N/A';

      return {
        ...item,
        id: item._id,
        patientName: item.patient?.name || item.patientDetails?.name || 'Unknown Patient',
        patientId: item.patient?.mrn || item.mrn || 'N/A',
        time: rawTime,
        symptoms: item.symptoms || [],
        status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'
      };
    });

    return { success: true, data: normalizedData };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch appointments' };
  }
}

export async function getRecentPatientsAction(): Promise<{ success: boolean; data?: DoctorPatient[]; error?: string }> {
  try {
    const dashboard = await apiServer<DoctorDashboardData>(DOCTOR_ENDPOINTS.DASHBOARD);
    return { success: true, data: dashboard.recentPatients || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch patients' };
  }
}

export async function getDoctorReportsAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    // Placeholder as endpoint might not exist or be separate
    return { success: true, data: [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch reports' };
  }
}

export async function getDoctorPatientsAction(): Promise<{ success: boolean; data?: DoctorPatient[]; error?: string }> {
  try {
    // Backend may restrict MY_PATIENTS, so we use MY_APPOINTMENTS and derive unique patients
    const res = await apiServer<any[]>(BOOKING_ENDPOINTS.MY_APPOINTMENTS);
    const appointments = Array.isArray(res) ? res : [];

    const uniquePatientsMap = new Map<string, DoctorPatient>();

    appointments.forEach((apt) => {
      if (!apt.patient) return;

      // Handle patient being an object or id
      const p = apt.patient;
      const pId = p._id || p.id || (typeof p === 'string' ? p : null);

      if (!pId) return;

      // Verify doctor ownership logic if needed, but appointments are already filtered by doctor context in backend.

      if (!uniquePatientsMap.has(pId)) {
        uniquePatientsMap.set(pId, {
          id: pId,
          name: p.name || apt.patientDetails?.name || 'Unknown',
          mrn: p.mrn || apt.patientDetails?.mrn || 'N/A',
          age: p.age || apt.patientDetails?.age,
          gender: p.gender || apt.patientDetails?.gender,
          lastVisit: apt.date || apt.startTime,
          condition: apt.reason || apt.symptoms?.[0] || 'Regular Checkup'
        });
      } else {
        // Update last visit if more recent
        const existing = uniquePatientsMap.get(pId)!;
        const newDate = new Date(apt.date || apt.startTime).getTime();
        const oldDate = new Date(existing.lastVisit).getTime();
        if (newDate > oldDate) {
          existing.lastVisit = apt.date || apt.startTime;
          existing.condition = apt.reason || apt.symptoms?.[0] || existing.condition;
        }
      }
    });

    const normalizedPatients = Array.from(uniquePatientsMap.values());
    return { success: true, data: normalizedPatients };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch patients' };
  }
}

export async function getDoctorPatientDetailsAction(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const patient = await apiServer<any>(DOCTOR_ENDPOINTS.PATIENT_DETAILS(id));
    return { success: true, data: patient };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch patient details' };
  }
}

export async function getAppointmentDetailsAction(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await apiServer<any>(BOOKING_ENDPOINTS.DETAILS(id));
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch appointment details' };
  }
}

