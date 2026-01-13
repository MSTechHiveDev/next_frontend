import { apiClient } from "../api";
import { PharmacyBill, PharmacyBillPayload, PharmacyBillsResponse } from "../types/pharmacyBilling";
import { PHARMACY_ENDPOINTS } from "../config/endpoints";

const mapInvoiceToBill = (b: any): PharmacyBill => ({
    _id: b._id,
    invoiceId: b.invoiceNo,
    pharmacyId: b.pharmacy,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    patientName: b.patientName,
    customerPhone: b.customerPhone || '-',
    items: (b.items || []).map((item: any) => ({
        productId: item.drug,
        itemName: item.productName,
        qty: item.qty,
        rate: item.unitRate,
        gst: item.gstPct,
        total: item.amount,
        hsn: item.hsn
    })),
    paymentSummary: {
        subtotal: b.subTotal,
        taxableAmount: b.subTotal - b.discountTotal,
        taxGST: b.taxTotal,
        discount: b.discountTotal,
        grandTotal: b.netPayable,
        paidAmount: b.paid,
        balanceDue: b.balance,
        paymentMode: (b.mode === 'MIXED' ? 'Mixed' : b.mode === 'UPI' ? 'UPI' : b.mode === 'CARD' ? 'Card' : b.mode === 'CREDIT' ? 'Credit' : 'Cash') as any,
        status: b.status === 'PAID' ? 'Paid' : b.status === 'PENDING' ? 'Due' : 'Partial',
        paymentDetails: b.paymentDetails
    }
});

export const PharmacyBillingService = {
    createBill: async (data: PharmacyBillPayload): Promise<{ message: string; bill: PharmacyBill }> => {
        const response: any = await apiClient<any>(PHARMACY_ENDPOINTS.BILLS.BASE, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return {
            message: 'Invoice generated successfully',
            bill: mapInvoiceToBill(response.data || response)
        };
    },

    async getBills(
        page = 1,
        limit = 10,
        search?: string,
        paymentMode?: string,
        date?: string
    ): Promise<PharmacyBillsResponse> {
        let url = `${PHARMACY_ENDPOINTS.BILLS.BASE}?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (paymentMode && paymentMode !== 'All Methods') {
            url += `&mode=${paymentMode.toUpperCase()}`;
        }
        if (date) {
            url += `&startDate=${date}&endDate=${date}`;
        }

        const response: any = await apiClient<any>(url, {
            method: 'GET'
        });

        const bills = (response.data || []).map(mapInvoiceToBill);

        return {
            bills,
            currentPage: response.currentPage || 1,
            totalPages: response.totalPages || 1,
            totalBills: response.total || 0
        };
    },

    getBillById: async (id: string): Promise<PharmacyBill> => {
        const response: any = await apiClient<any>(PHARMACY_ENDPOINTS.BILLS.BY_ID(id), {
            method: 'GET'
        });

        return mapInvoiceToBill(response.data || response);
    },

    deleteBill: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(PHARMACY_ENDPOINTS.BILLS.BY_ID(id), {
            method: 'DELETE'
        });
    },

    getHospitalOrders: async (hospitalId: string, status?: string): Promise<any> => {
        let url = PHARMACY_ENDPOINTS.ORDERS(hospitalId);
        if (status) {
            url += `?status=${status}`;
        }
        return apiClient<any>(url, {
            method: 'GET'
        });
    },

    getPharmacyOrder: async (id: string): Promise<any> => {
        return apiClient<any>(`/pharmacy/orders/${id}`, {
            method: 'GET'
        });
    }
};
