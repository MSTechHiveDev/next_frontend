import { apiClient } from '../api/apiClient';
import { BillPayload, BillResponse } from '../types/labBilling';
import { LAB_ENDPOINTS } from '../config/endpoints';

export const LabBillingService = {
    // Create a new bill
    createBill: async (data: BillPayload): Promise<{ message: string; bill: BillResponse }> => {
        return apiClient<{ message: string; bill: BillResponse }>(LAB_ENDPOINTS.BILLING.BASE, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get bills history
    getBills: async (page = 1, limit = 10, all = false): Promise<{ bills: BillResponse[]; totalPages: number; currentPage: number }> => {
        return apiClient<{ bills: BillResponse[]; totalPages: number; currentPage: number }>(
            `${LAB_ENDPOINTS.BILLING.BASE}?page=${page}&limit=${limit}${all ? '&all=true' : ''}`
        );
    },
};
