import { apiClient } from '../api/apiClient';
import { LAB_ENDPOINTS } from '../config/endpoints';

export interface DashboardStats {
    revenue: number;
    collections: number;
    patients: number;
    totalTests: number;
    totalTestMaster?: number;
    totalDepartments?: number;
    pendingSamples: number;
    paymentBreakdown: {
        Cash: number;
        UPI: number;
        Card: number;
    };
    topTests: {
        name: string;
        revenue: number;
        count: number;
    }[];
}

export const LabDashboardService = {
    getStats: async (range: string = 'today'): Promise<DashboardStats> => {
        return apiClient<DashboardStats>(`${LAB_ENDPOINTS.DASHBOARD.STATS}?range=${range}`);
    }
};
