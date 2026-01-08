'use server';

import { DoctorStats, DoctorAppointment, DoctorPatient, DoctorReport, DoctorProfile } from '../types/doctor';

// Mock Data
const MOCK_STATS: DoctorStats = {
  totalPatients: 124,
  appointmentsToday: 8,
  pendingReports: 3,
  consultationsValue: 1250
};

const MOCK_APPOINTMENTS: DoctorAppointment[] = [
  { id: 'APT-1001', patientName: 'John Doe', patientId: 'MRN-12345', time: '09:00 AM', type: 'Consultation', status: 'Scheduled' },
  { id: 'APT-1002', patientName: 'Sarah Smith', patientId: 'MRN-67890', time: '10:30 AM', type: 'Follow-up', status: 'Scheduled' },
  { id: 'APT-1003', patientName: 'Michael Brown', patientId: 'MRN-11223', time: '11:15 AM', type: 'Consultation', status: 'Scheduled' },
  { id: 'APT-1004', patientName: 'Emily Davis', patientId: 'MRN-33445', time: '02:00 PM', type: 'Follow-up', status: 'Scheduled' },
];

const MOCK_PATIENTS: DoctorPatient[] = [
  { id: 'MRN-12345', name: 'John Doe', age: 45, gender: 'Male', lastVisit: '2023-10-15', condition: 'Hypertension' },
  { id: 'MRN-67890', name: 'Sarah Smith', age: 32, gender: 'Female', lastVisit: '2023-11-01', condition: 'Migraine' },
  { id: 'MRN-11223', name: 'Michael Brown', age: 55, gender: 'Male', lastVisit: '2023-10-20', condition: 'Type 2 Diabetes' },
];

const MOCK_REPORTS: DoctorReport[] = [
  { id: 'RPT-881', patientName: 'John Doe', patientId: 'MRN-12345', testName: 'Complete Blood Count', date: '2024-01-05', status: 'Pending', priority: 'Urgent' },
  { id: 'RPT-882', patientName: 'Sarah Smith', patientId: 'MRN-67890', testName: 'MRI Scan', date: '2024-01-04', status: 'Ready', priority: 'Normal' },
  { id: 'RPT-883', patientName: 'Michael Brown', patientId: 'MRN-11223', testName: 'Lipid Profile', date: '2024-01-03', status: 'Ready', priority: 'Normal' },
];

const MOCK_PROFILE: DoctorProfile = {
  id: 'DOC-001',
  name: 'Dr. Emily Carter',
  specialty: 'Cardiologist',
  email: 'emily.carter@curechain.health',
  phone: '+1 (555) 123-4567',
  experience: '12 Years',
  availability: 'Mon - Fri (09:00 AM - 05:00 PM)',
  bio: 'Senior Consultant Cardiologist with over a decade of experience in treating complex cardiac conditions. Dedicated to patient-centered care and advanced diagnostics.'
};

export async function getDoctorStatsAction(): Promise<{ success: boolean; data: DoctorStats }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: MOCK_STATS };
}

export async function getTodayAppointmentsAction(): Promise<{ success: boolean; data: DoctorAppointment[] }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: MOCK_APPOINTMENTS };
}

export async function getAllAppointmentsAction(): Promise<{ success: boolean; data: DoctorAppointment[] }> {
   await new Promise(resolve => setTimeout(resolve, 800));
   // Mocking a larger list for the full view
   return { success: true, data: [...MOCK_APPOINTMENTS, 
      { id: 'APT-1005', patientName: 'Robert Wilson', patientId: 'MRN-99887', time: 'Tomorrow 09:00 AM', type: 'Consultation', status: 'Scheduled' },
      { id: 'APT-1006', patientName: 'Lisa Anderson', patientId: 'MRN-77665', time: 'Yesterday', type: 'Follow-up', status: 'Completed' }
   ] };
}

export async function getRecentPatientsAction(): Promise<{ success: boolean; data: DoctorPatient[] }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: MOCK_PATIENTS };
}

export async function getDoctorReportsAction(): Promise<{ success: boolean; data: DoctorReport[] }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, data: MOCK_REPORTS };
}

export async function getDoctorProfileAction(): Promise<{ success: boolean; data: DoctorProfile }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { success: true, data: MOCK_PROFILE };
}
