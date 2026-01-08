import { apiClient } from '../api/apiClient';
import { LabSample, UpdateSamplePayload } from '../types/labSample';
import { LAB_ENDPOINTS } from '../config/endpoints';

export const LabSampleService = {
    getSamples: async (status: string = 'All Samples'): Promise<LabSample[]> => {
        return apiClient<LabSample[]>(`${LAB_ENDPOINTS.SAMPLES.BASE}?status=${status}`);
    },

    getSampleById: async (id: string): Promise<LabSample> => {
        return apiClient<LabSample>(LAB_ENDPOINTS.SAMPLES.BY_ID(id));
    },

    updateResults: async (id: string, payload: UpdateSamplePayload): Promise<{ message: string; sample: LabSample }> => {
        return apiClient<{ message: string; sample: LabSample }>(LAB_ENDPOINTS.SAMPLES.RESULTS(id), {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    },

    collectSample: async (id: string): Promise<{ message: string; sample: LabSample }> => {
        return apiClient<{ message: string; sample: LabSample }>(LAB_ENDPOINTS.SAMPLES.STATUS(id), {
            method: 'PUT'
        });
    }
};
