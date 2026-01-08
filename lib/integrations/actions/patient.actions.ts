'use server';

import { apiServer } from '../api/apiServer';
import { PATIENT_ENDPOINTS } from '../config';
import { PatientProfile } from '../types/patient';

export async function getPatientProfileAction(): Promise<{ success: boolean; data?: PatientProfile; error?: string }> {
    try {
        const data = await apiServer(PATIENT_ENDPOINTS.PROFILE) as PatientProfile;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to fetch patient profile' };
    }
}
