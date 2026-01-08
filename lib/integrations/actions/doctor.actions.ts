'use server';

import { apiServer } from '../api/apiServer';
import { DOCTOR_ENDPOINTS, COMMON_ENDPOINTS } from '../config';
import { DoctorStats, DoctorAppointment, DoctorPatient, DoctorReport, DoctorProfile } from '../types/doctor';

export async function getDoctorDashboardAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await apiServer(DOCTOR_ENDPOINTS.DASHBOARD);
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

export async function getDoctorStatsAction(): Promise<{ success: boolean; data?: DoctorStats; error?: string }> {
  try {
    const dashboard = await apiServer(DOCTOR_ENDPOINTS.DASHBOARD) as any;
    return { success: true, data: dashboard.stats };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch stats' };
  }
}

export async function getTodayAppointmentsAction(): Promise<{ success: boolean; data?: DoctorAppointment[]; error?: string }> {
  try {
    const dashboard = await apiServer(DOCTOR_ENDPOINTS.DASHBOARD) as any;
    return { success: true, data: dashboard.appointments || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch appointments' };
  }
}

export async function getAllAppointmentsAction(): Promise<{ success: boolean; data?: DoctorAppointment[]; error?: string }> {
  try {
    const data = await apiServer(DOCTOR_ENDPOINTS.CALENDAR_APPOINTMENTS);
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch appointments' };
  }
}

export async function getRecentPatientsAction(): Promise<{ success: boolean; data?: DoctorPatient[]; error?: string }> {
  try {
    const dashboard = await apiServer(DOCTOR_ENDPOINTS.DASHBOARD) as any;
    return { success: true, data: dashboard.recentPatients || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch patients' };
  }
}

export async function getDoctorReportsAction(): Promise<{ success: boolean; data?: DoctorReport[]; error?: string }> {
  try {
    // TODO: Implement when reports endpoint is available
    return { success: true, data: [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch reports' };
  }
}

export async function getDoctorMeAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await apiServer(DOCTOR_ENDPOINTS.PROFILE);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profile' };
  }
}

export async function getDoctorProfileAction(): Promise<{ success: boolean; data?: DoctorProfile; error?: string }> {
  try {
    const data = await apiServer(DOCTOR_ENDPOINTS.PROFILE) as DoctorProfile;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch profile' };
  }
}
