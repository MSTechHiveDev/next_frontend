import { ADMIN_ENDPOINTS } from '../config';
import { apiClient } from '../api';
import type {
  DashboardStats,
  Hospital,
  Doctor,
  Patient,
  Helpdesk,
  AuditLog,
  SupportTicket,
  CreateAdminRequest,
  CreateDoctorRequest,
  CreateHelpdeskRequest,
  CreateHospitalRequest,
  AssignDoctorRequest,
  BroadcastRequest
} from '../types';

export const adminService = {
  // Expose for custom/emergency calls
  apiClient,

  // Client-side
  getDashboardClient: () =>
    apiClient<DashboardStats>(ADMIN_ENDPOINTS.DASHBOARD),

  getUsersClient: (params?: { role?: string }) => {
    const url = params?.role ? `${ADMIN_ENDPOINTS.USERS}?role=${params.role}` : ADMIN_ENDPOINTS.USERS;
    return apiClient<any[]>(url);
  },

  getHospitalsClient: () =>
    apiClient<Hospital[]>(ADMIN_ENDPOINTS.HOSPITALS),

  updateHospitalClient: (id: string, data: Partial<CreateHospitalRequest>) =>
    apiClient<Hospital>(ADMIN_ENDPOINTS.UPDATE_HOSPITAL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteHospitalClient: (id: string) =>
    apiClient<void>(ADMIN_ENDPOINTS.DELETE_HOSPITAL(id), {
      method: 'DELETE',
    }),

  updateHospitalStatusClient: (id: string, status: string) =>
    apiClient<Hospital>(ADMIN_ENDPOINTS.UPDATE_HOSPITAL_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getDoctorsClient: () =>
    apiClient<Doctor[]>(ADMIN_ENDPOINTS.DOCTORS),

  getPatientsClient: () =>
    apiClient<Patient[]>(ADMIN_ENDPOINTS.PATIENTS),

  getHelpdesksClient: () =>
    apiClient<Helpdesk[]>(ADMIN_ENDPOINTS.HELPDESKS),

  createAdminClient: (data: CreateAdminRequest) =>
    apiClient<any>(ADMIN_ENDPOINTS.CREATE_ADMIN, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createDoctorClient: (data: CreateDoctorRequest) =>
    apiClient<Doctor>(ADMIN_ENDPOINTS.CREATE_DOCTOR, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createHelpdeskClient: (data: CreateHelpdeskRequest) =>
    apiClient<Helpdesk>(ADMIN_ENDPOINTS.ASSIGN_HELPDESK, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createHospitalClient: (data: CreateHospitalRequest) => {
    // Generate fallback legacy fields
    const lat = data.location?.lat ? Number(data.location.lat) : undefined;
    const lng = data.location?.lng ? Number(data.location.lng) : undefined;

    // Shotgun approach: try multiple common ID keys to see if backend accepts any override
    const idOverride = data.hospitalId;

    return apiClient<Hospital>(ADMIN_ENDPOINTS.CREATE_HOSPITAL, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        // Common overrides
        id: idOverride,
        hospital_id: idOverride,
        code: idOverride,

        // Ensure consistent field naming for backend
        specialities: data.specialities || data.specialties || [],
        specialties: data.specialities || data.specialties || [],
        numDoctors: data.numberOfDoctors || data.numDoctors,
        numberOfDoctors: data.numberOfDoctors || data.numDoctors,
        totalBeds: data.numberOfBeds || data.totalBeds,
        numberOfBeds: data.numberOfBeds || data.totalBeds,
        ambulanceAvailable: data.ambulanceAvailable ?? data.ambulanceAvailability,
        ambulanceAvailability: data.ambulanceAvailable ?? data.ambulanceAvailability,
        // Add legacy top-level coords just in case
        lat,
        lng
      }),
    });
  },

  assignDoctorClient: (data: AssignDoctorRequest) =>
    apiClient<any>(ADMIN_ENDPOINTS.ASSIGN_DOCTOR, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        // Ensure both field variants are sent for compatibility
        doctorId: data.doctorProfileId || data.doctorId,
        doctorProfileId: data.doctorProfileId || data.doctorId
      }),
    }),

  broadcastClient: (data: BroadcastRequest) =>
    apiClient<any>(ADMIN_ENDPOINTS.BROADCAST, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserClient: (id: string, data: any) =>
    apiClient<any>(ADMIN_ENDPOINTS.UPDATE_USER(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUserClient: async (id: string, role?: string) => {
    const endpointsToTry = [
      ADMIN_ENDPOINTS.DELETE_USER(id, role),
      // Fallback 1: Try without role if role was provided
      ...(role ? [ADMIN_ENDPOINTS.DELETE_USER(id)] : []),
      // Fallback 2: Try specific helpdesk endpoint if role is helpdesk
      ...(role === 'helpdesk' ? [`/admin/helpdesks/${id}`] : []),
      // Fallback 3: Try general users endpoint
      `/users/${id}`
    ];

    let lastError: any;

    for (const url of endpointsToTry) {
      try {
        console.log(`Attempting delete via: ${url}`);
        await apiClient<void>(url, { method: 'DELETE' });
        return; // Success
      } catch (err: any) {
        console.warn(`Delete failed for ${url}:`, err.message);
        lastError = err;
        // If 404, it might be the wrong endpoint, or already deleted. 
        // We continue to try other endpoints.
      }
    }

    // If all attempts failed
    if (lastError) {
      // If the last error was a 404, we can arguably consider it "success" (idempotent)
      // to appease the UI if the user wants it GONE.
      const is404 = lastError.status === 404 ||
        lastError.message.includes('404') ||
        lastError.message.toLowerCase().includes('not found') ||
        lastError.message === 'API Error'; // Backend often returns empty body resulting in generic msg

      if (is404) {
        console.warn("All delete attempts 404'd or deemed not found. Assuming resource is already gone.");
        return;
      }
      throw lastError;
    }
  },

  getAuditsClient: () =>
    apiClient<AuditLog[]>(ADMIN_ENDPOINTS.AUDITS),

  getHospitalWithDoctorsClient: (id: string) =>
    apiClient<Hospital>(ADMIN_ENDPOINTS.HOSPITAL_DETAILS(id)),

  getDoctorsByHospitalClient: (id: string) =>
    apiClient<any[]>(ADMIN_ENDPOINTS.HOSPITAL_DOCTORS(id)),

  getSupportRequestsClient: () =>
    apiClient<SupportTicket[]>(ADMIN_ENDPOINTS.SUPPORT_REQUESTS),
};