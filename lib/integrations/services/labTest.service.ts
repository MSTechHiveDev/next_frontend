import { apiClient } from '../api/apiClient';
import { LabTest, LabTestPayload } from '../types/labTest';

export const LabTestService = {
    // Add a new test
    addTest: async (data: LabTestPayload): Promise<{ message: string; test: LabTest }> => {
        return apiClient<{ message: string; test: LabTest }>('/lab/tests', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all tests
    getTests: async (): Promise<LabTest[]> => {
        return apiClient<LabTest[]>('/lab/tests');
    },

    // Get single test
    getTestById: async (id: string): Promise<LabTest> => {
        return apiClient<LabTest>(`/lab/tests/${id}`);
    },

    // Update a test
    updateTest: async (id: string, data: LabTestPayload): Promise<{ message: string; test: LabTest }> => {
        return apiClient<{ message: string; test: LabTest }>(`/lab/tests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete a test
    deleteTest: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/lab/tests/${id}`, {
            method: 'DELETE',
        });
    },
};
