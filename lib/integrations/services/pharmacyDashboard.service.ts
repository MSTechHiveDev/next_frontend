import { apiClient } from '../api/apiClient';
import { PHARMACY_ENDPOINTS } from '../config/endpoints';

export interface DashboardStats {
    todayStats: {
        revenue: number;
        billCount: number;
        avgBillValue: number;
    };
    inventoryStats: {
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
    paymentBreakdown: {
        Cash: number;
        Card: number;
        UPI: number;
        Credit: number;
    };
}

export const PharmacyDashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        return apiClient<DashboardStats>(PHARMACY_ENDPOINTS.BILLS.STATS);
    }
};
