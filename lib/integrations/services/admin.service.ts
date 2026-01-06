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
    apiClient<Doctor[]>(`${ADMIN_ENDPOINTS.USERS}?role=doctor`),

  getPatientsClient: () =>
    apiClient<Patient[]>(`${ADMIN_ENDPOINTS.USERS}?role=patient`),

  getHelpdesksClient: () =>
    apiClient<Helpdesk[]>(`${ADMIN_ENDPOINTS.USERS}?role=helpdesk`),

  createAdminClient: (data: CreateAdminRequest) =>
    apiClient<any>('/admin/create-admin', { // Note: some endpoints aren't in ADMIN_ENDPOINTS constants yet, I'll use literal for now if missing
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createDoctorClient: (data: CreateDoctorRequest) =>
    apiClient<Doctor>('/admin/create-doctor', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createHelpdeskClient: (data: CreateHelpdeskRequest) =>
    apiClient<Helpdesk>(ADMIN_ENDPOINTS.ASSIGN_HELPDESK, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createHospitalClient: (data: CreateHospitalRequest) =>
    apiClient<Hospital>(ADMIN_ENDPOINTS.CREATE_HOSPITAL, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  assignDoctorClient: (data: AssignDoctorRequest) =>
    apiClient<any>(ADMIN_ENDPOINTS.ASSIGN_DOCTOR, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  broadcastClient: (data: BroadcastRequest) =>
    apiClient<any>(ADMIN_ENDPOINTS.BROADCAST, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserClient: (id: string, data: any) =>
    apiClient<any>(`${ADMIN_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUserClient: (id: string) =>
    apiClient<void>(`${ADMIN_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    }),

  getAuditsClient: () =>
    apiClient<AuditLog[]>(ADMIN_ENDPOINTS.AUDITS),

  getHospitalWithDoctorsClient: (id: string) =>
    apiClient<Hospital>(ADMIN_ENDPOINTS.HOSPITAL_DETAILS(id)),

  getDoctorsByHospitalClient: (id: string) =>
    apiClient<any[]>(ADMIN_ENDPOINTS.HOSPITAL_DOCTORS(id)),

  getSupportRequestsClient: () =>
    apiClient<SupportTicket[]>(ADMIN_ENDPOINTS.SUPPORT_REQUESTS),
};