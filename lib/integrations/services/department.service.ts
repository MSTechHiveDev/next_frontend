import { apiClient } from '../api/apiClient';
import { Department, DepartmentPayload } from '../types/department';

export const DepartmentService = {
    // Add a new department
    addDepartment: async (data: DepartmentPayload): Promise<{ message: string; department: Department }> => {
        return apiClient<{ message: string; department: Department }>('/lab/departments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all departments
    getDepartments: async (): Promise<Department[]> => {
        return apiClient<Department[]>('/lab/departments');
    },

    // Delete a department
    deleteDepartment: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/lab/departments/${id}`, {
            method: 'DELETE',
        });
    },
};
