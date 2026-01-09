import { PATIENT_ENDPOINTS } from '../config';
import { apiClient } from '../api';
import type { PatientProfile, UpdatePatientProfileRequest } from '../types/patient';

export const patientService = {
    // Profile
    getProfile: () =>
        apiClient<PatientProfile>(PATIENT_ENDPOINTS.PROFILE),

    getProfileById: (id: string) =>
        apiClient<PatientProfile>(PATIENT_ENDPOINTS.PROFILE_BY_ID(id)),

    updateProfile: (data: UpdatePatientProfileRequest) =>
        apiClient<PatientProfile>(PATIENT_ENDPOINTS.UPDATE_PROFILE, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
};
