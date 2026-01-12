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
    getStats: async (range?: string, startDate?: string, endDate?: string): Promise<DashboardStats> => {
        let url = PHARMACY_ENDPOINTS.BILLS.STATS;
        const params = new URLSearchParams();
        if (range) params.append('range', range);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response: any = await apiClient<any>(url);
        const data = response.data;
        const rangeData = data.requestedRange || data.today;

        return {
            todayStats: {
                revenue: rangeData.totalRevenue || 0,
                billCount: rangeData.totalInvoices || 0,
                avgBillValue: rangeData.totalInvoices > 0
                    ? rangeData.totalRevenue / rangeData.totalInvoices
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
