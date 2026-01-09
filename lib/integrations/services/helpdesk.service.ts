import { HELPDESK_ENDPOINTS, BOOKING_ENDPOINTS, DOCTOR_ENDPOINTS } from '../config';
import { apiClient } from '../api';
import { calculateEffectiveSlot } from '../../utils/time-slots';
import type {
  HelpdeskDashboard,
  HelpdeskProfile,
  HelpdeskDoctor,
  PatientRegistrationRequest,
  PatientRegistrationResponse,
} from '../types/helpdesk';

/**
 * Helpdesk Service
 * Client-side service for helpdesk operations
 * Used in client components for interactive features
 */
export const helpdeskService = {
  // ==================== Dashboard ====================
  /**
   * Get helpdesk dashboard with stats and recent data
   * @returns Dashboard data including stats, recent patients, and appointments
   */
  getDashboard: () =>
    apiClient<HelpdeskDashboard>(HELPDESK_ENDPOINTS.DASHBOARD),

  // ==================== Profile ====================
  /**
   * Get helpdesk profile information
   * @returns Profile data including hospital assignment
   */
  getMe: () =>
    apiClient<HelpdeskProfile>(HELPDESK_ENDPOINTS.ME),

  /**
   * Update helpdesk profile
   * @param data Updated profile information
   */
  updateProfile: (data: Partial<HelpdeskProfile>) =>
    apiClient<HelpdeskProfile>(HELPDESK_ENDPOINTS.ME, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ==================== Doctors ====================
  /**
   * Get all doctors in the helpdesk's hospital
   * @returns List of doctors
   */
  getDoctors: () =>
    apiClient<HelpdeskDoctor[]>(HELPDESK_ENDPOINTS.DOCTORS),

  /**
   * Create a new doctor and assign to hospital
   * @param data Doctor information
   */
  createDoctor: (data: any) =>
    apiClient<{ message: string; doctor: HelpdeskDoctor }>(
      HELPDESK_ENDPOINTS.CREATE_DOCTOR,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // ==================== Patients ====================
  /**
   * Register a new patient
   * @param data Patient registration data
   */
  registerPatient: (data: PatientRegistrationRequest) =>
    apiClient<PatientRegistrationResponse>(HELPDESK_ENDPOINTS.REGISTER_PATIENT, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Search for patients by name or mobile
   * @param query Search query
   */
  searchPatients: (query: string) =>
    apiClient<any[]>(`${HELPDESK_ENDPOINTS.PATIENTS_SEARCH}?q=${encodeURIComponent(query)}`),

  /**
   * Get patient details by ID
   * @param patientId Patient ID
   */
  getPatientById: (patientId: string) =>
    apiClient<any>(HELPDESK_ENDPOINTS.PATIENT_DETAILS(patientId)),

  // ==================== Appointments ====================
  /**
   * Create a new appointment
   * @param data Appointment data
   */
  createAppointment: (data: any) =>
    apiClient<any>(HELPDESK_ENDPOINTS.APPOINTMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Update appointment status
   * @param appointmentId Appointment ID
   * @param status New status
   */
  updateAppointmentStatus: (appointmentId: string, status: string) =>
    apiClient<any>(HELPDESK_ENDPOINTS.APPOINTMENT_STATUS(appointmentId), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  /**
   * Cancel appointment
   * @param appointmentId Appointment ID
   */
  cancelAppointment: (appointmentId: string) =>
    apiClient<any>(HELPDESK_ENDPOINTS.APPOINTMENT_STATUS(appointmentId), {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    }),

  /**
   * Get doctor availability for a specific hospital and date
   * @param doctorId Doctor ID
   * @param hospitalId Hospital ID
   * @param date Date string (YYYY-MM-DD)
   */
  getAvailability: async (doctorId: string, hospitalId: string, date: string) => {
    // Reusing the centralized calendar stats endpoint as per requirements
    // Fetch weekly view to get slot details for the specific date
    const response = await apiClient<any>(`${DOCTOR_ENDPOINTS.CALENDAR_STATS}?view=weekly&startDate=${date}&doctorId=${doctorId}`);

    // Transform response to match Helpdesk UI expectations
    // Response format: { timeSlots: [], days: [{ date, slots: {} }] }
    // Expected format: { slots: [{ timeSlot, isFull, availableCount, totalCapacity, effectiveStart, effectiveEnd }] }

    const targetDateStr = new Date(date).toDateString();
    const dayData = response.days?.find((d: any) => new Date(d.date).toDateString() === targetDateStr);

    const slots = response.timeSlots?.map((slot: string) => {
      const slotInfo = dayData?.slots?.[slot] || { count: 0, isFull: false };
      const HOURLY_LIMIT = 12; // Matching backend constant
      const count = slotInfo.count || 0;

      // Calculate the specific 5-minute increment for the NEXT booking
      const { startTime, endTime } = calculateEffectiveSlot(slot, count, 5);

      return {
        timeSlot: slot, // Display Label (e.g., "9:00 AM - 10:00 AM")
        isFull: slotInfo.isFull || count >= HOURLY_LIMIT,
        availableCount: Math.max(0, HOURLY_LIMIT - count),
        totalCapacity: HOURLY_LIMIT,
        effectiveStart: startTime, // Specific 5-min start (e.g., "9:10 AM")
        effectiveEnd: endTime      // Specific 5-min end (e.g., "9:15 AM")
      };
    }) || [];

    return { slots };
  },

  /**
   * Get all appointments for the helpdesk
   * @returns List of appointments
   */
  getAppointments: () =>
    apiClient<any[]>(HELPDESK_ENDPOINTS.APPOINTMENTS),

  /**
   * Get all transactions/payments
   * @returns List of transactions
   */
  getTransactions: () =>
    apiClient<any[]>(HELPDESK_ENDPOINTS.TRANSACTIONS),
};
