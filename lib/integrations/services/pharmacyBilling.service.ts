import { apiClient } from "../api";
import { PharmacyBill, PharmacyBillPayload, PharmacyBillsResponse } from "../types/pharmacyBilling";
import { PHARMACY_ENDPOINTS } from "../config/endpoints";

export const PharmacyBillingService = {
    createBill: async (data: PharmacyBillPayload): Promise<{ message: string; bill: PharmacyBill }> => {
        return apiClient<{ message: string; bill: PharmacyBill }>(PHARMACY_ENDPOINTS.BILLS.BASE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getBills(
        page = 1, 
        limit = 10, 
        invoiceId?: string, 
        paymentMode?: string, 
        date?: string
    ): Promise<PharmacyBillsResponse> {
        let url = `${PHARMACY_ENDPOINTS.BILLS.BASE}?page=${page}&limit=${limit}`;
        if (invoiceId) url += `&invoiceId=${encodeURIComponent(invoiceId)}`;
        if (paymentMode && paymentMode !== 'All Methods') url += `&paymentMode=${encodeURIComponent(paymentMode)}`;
        if (date) url += `&date=${date}`;
        
        return apiClient<PharmacyBillsResponse>(url, {
            method: 'GET'
        });
    },

    getBillById: async (id: string): Promise<PharmacyBill> => {
        return apiClient<PharmacyBill>(PHARMACY_ENDPOINTS.BILLS.BY_ID(id), {
            method: 'GET'
        });
    },
    
    deleteBill: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(PHARMACY_ENDPOINTS.BILLS.BY_ID(id), {
            method: 'DELETE'
        });
    }
};
