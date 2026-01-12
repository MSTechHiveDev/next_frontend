import { apiClient } from '../api/apiClient';
import { LabSample, UpdateSamplePayload } from '../types/labSample';
import { LAB_ENDPOINTS } from '../config/endpoints';

export const LabSampleService = {
    getSamples: async (status: string = 'All Samples'): Promise<LabSample[]> => {
        // Fallback for non-paginated legacy usages (if any, though we aim to replace)
        // Or if backend now ONLY returns paginated structure, this might break.
        // Assuming backend handles no page/limit by defaulting to page 1 limit 10, but returns the { success, data... } structure.
        // We should check if we need to adjust this.
        // Based on my change, backend returns: { success: true, count, total, totalPages, currentPage, data }
        // So we need to extract .data
        const response: any = await apiClient(`${LAB_ENDPOINTS.SAMPLES.BASE}?status=${status}&limit=1000`); // High limit to simulate 'all'
        return response.data || [];
    },

    getSamplesPaginated: async (page: number = 1, limit: number = 10, status: string = 'All Samples'): Promise<{ samples: LabSample[], totalPages: number, currentPage: number, totalSamples: number }> => {
        const response: any = await apiClient(`${LAB_ENDPOINTS.SAMPLES.BASE}?status=${status}&page=${page}&limit=${limit}`);
        return {
            samples: response.data || [],
            totalPages: response.totalPages || 1,
            currentPage: response.currentPage || 1,
            totalSamples: response.total || 0
        };
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
