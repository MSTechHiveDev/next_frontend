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
        expiringSoonCount: number;
    };
    paymentBreakdown: {
        Cash: number;
        Card: number;
        UPI: number;
        Credit: number;
        Mixed: number;
    };
}

export const PharmacyDashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response: any = await apiClient<any>(PHARMACY_ENDPOINTS.BILLS.STATS);
        const data = response.data;

        return {
            todayStats: {
                revenue: data.today.totalRevenue || 0,
                billCount: data.today.totalInvoices || 0,
                avgBillValue: data.today.totalInvoices > 0
                    ? data.today.totalRevenue / data.today.totalInvoices
                    : 0
            },
            inventoryStats: {
                totalProducts: data.totalProducts || 0,
                lowStockCount: data.lowStockCount || 0,
                outOfStockCount: data.outOfStockCount || 0,
                expiringSoonCount: data.expiringSoonCount || 0
            },
            paymentBreakdown: {
                Cash: data.paymentBreakdown.CASH || 0,
                Card: data.paymentBreakdown.CARD || 0,
                UPI: data.paymentBreakdown.UPI || 0,
                Credit: data.paymentBreakdown.CREDIT || 0,
                Mixed: data.paymentBreakdown.MIXED || 0
            }
        };
    }
};
