export interface BillItem {
    productId?: string;
    itemName: string;
    qty: number;
    rate: number;
    hsn?: string;
    gst: number;
    total: number;
}

export interface PaymentSummary {
    subtotal: number;
    taxableAmount: number;
    taxGST: number;
    discount: number;
    grandTotal: number;
    paidAmount: number;
    balanceDue: number;
    paymentMode: 'Cash' | 'UPI' | 'Card';
    status: 'Paid' | 'Partial' | 'Due';
}

export interface PharmacyBillPayload {
    patientDetails: {
        name: string;
        mobile: string;
    };
    items: BillItem[];
    paymentSummary: PaymentSummary;
}

export interface PharmacyBill extends PharmacyBillPayload {
    _id: string;
    invoiceId: string;
    pharmacyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PharmacyBillsResponse {
    bills: PharmacyBill[];
    currentPage: number;
    totalPages: number;
    totalBills: number;
}
