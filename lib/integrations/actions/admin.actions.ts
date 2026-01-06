"use server";

import { apiServer } from '../api/apiServer';
import { endpoints } from '../config';
import type { 
  DashboardStats, 
  Hospital, 
  Doctor, 
  Patient, 
  Helpdesk, 
  AuditLog, 
  SupportTicket 
} from '../types';

export async function getDashboardAction() {
  return apiServer<DashboardStats>(endpoints.admin.dashboard);
}

export async function getHospitalsAction() {
  return apiServer<Hospital[]>(endpoints.admin.hospitals);
}

export async function getDoctorsAction() {
  return apiServer<Doctor[]>(endpoints.admin.doctors);
}

export async function getPatientsAction() {
  return apiServer<Patient[]>(endpoints.admin.patients);
}

export async function getHelpdesksAction() {
  return apiServer<Helpdesk[]>(endpoints.admin.helpdesks);
}

export async function getAuditsAction() {
  return apiServer<AuditLog[]>(endpoints.admin.audits);
}

export async function getSupportRequestsAction() {
  return apiServer<SupportTicket[]>(endpoints.admin.supportRequests);
}
export async function getUsersByRoleAction(role?: string) {
  const url = role ? `${endpoints.admin.users}?role=${role}` : endpoints.admin.users;
  return apiServer<any[]>(url);
}

// Mutations
export async function createHospitalAction(data: any) {
  const result = await apiServer<Hospital>(endpoints.admin.createHospital, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  import('next/cache').then(m => m.revalidatePath('/admin/hospitals'));
  return result;
}

export async function updateHospitalStatusAction(id: string, status: string) {
  const result = await apiServer<Hospital>(endpoints.admin.updateHospitalStatus(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  import('next/cache').then(m => m.revalidatePath('/admin/hospitals'));
  return result;
}

export async function deleteHospitalAction(id: string) {
  const result = await apiServer<void>(endpoints.admin.deleteHospital(id), {
    method: 'DELETE',
  });
  import('next/cache').then(m => m.revalidatePath('/admin/hospitals'));
  return result;
}
