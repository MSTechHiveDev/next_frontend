import { apiClient } from '../api/apiClient';

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
        return apiClient<DashboardStats>('/pharmacy/bills/stats');
    }
};
