import { apiClient } from '../api/apiClient';
import { LabSample, UpdateSamplePayload } from '../types/labSample';

export const LabSampleService = {
    getSamples: async (status: string = 'All Samples'): Promise<LabSample[]> => {
        return apiClient<LabSample[]>(`/lab/samples?status=${status}`);
    },

    getSampleById: async (id: string): Promise<LabSample> => {
        return apiClient<LabSample>(`/lab/samples/${id}`);
    },

    updateResults: async (id: string, payload: UpdateSamplePayload): Promise<{ message: string; sample: LabSample }> => {
        return apiClient<{ message: string; sample: LabSample }>(`/lab/samples/${id}/results`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }
};
