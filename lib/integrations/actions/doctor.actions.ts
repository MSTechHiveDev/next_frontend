'use server';

import { revalidatePath } from 'next/cache';
import { apiServer } from '../api/apiServer';
import { DOCTOR_ENDPOINTS, COMMON_ENDPOINTS } from '../config';
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
    const data = await apiServer(`${DOCTOR_ENDPOINTS.CALENDAR_STATS}?view=weekly&startDate=${today.toISOString()}`);
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
    const data = await apiServer<any[]>(DOCTOR_ENDPOINTS.CALENDAR_APPOINTMENTS);
    return { success: true, data: Array.isArray(data) ? data : [] };
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
    const patients = await apiServer<DoctorPatient[]>(DOCTOR_ENDPOINTS.MY_PATIENTS);
    return { success: true, data: patients };
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

