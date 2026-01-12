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
    },

    finalizeOrder: async (id: string, payload: { totalAmount: number; tests?: any[] }): Promise<{ message: string; order: any; transaction: any }> => {
        return apiClient<{ message: string; order: any; transaction: any }>(`/lab/orders/${id}/finalize`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    },

    payOrder: async (id: string, payload: { paymentMode: string; paymentDetails?: any }): Promise<{ message: string; order: any }> => {
        return apiClient<{ message: string; order: any }>(`/lab/orders/${id}/pay`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};
