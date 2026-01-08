import { apiClient } from "../api";
import { Supplier, SupplierPayload } from "../types/supplier";
import { PharmacyProduct } from "../types/product";
import { PHARMACY_ENDPOINTS } from "../config/endpoints";

export const SupplierService = {
    getSuppliers: async (): Promise<Supplier[]> => {
        return apiClient<Supplier[]>(PHARMACY_ENDPOINTS.SUPPLIERS.BASE, {
            method: 'GET'
        });
    },

    getSupplierById: async (id: string): Promise<Supplier> => {
        return apiClient<Supplier>(PHARMACY_ENDPOINTS.SUPPLIERS.BY_ID(id), {
            method: 'GET'
        });
    },

    createSupplier: async (data: SupplierPayload): Promise<{ message: string; supplier: Supplier }> => {
        return apiClient<{ message: string; supplier: Supplier }>(PHARMACY_ENDPOINTS.SUPPLIERS.BASE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateSupplier: async (id: string, data: Partial<SupplierPayload>): Promise<{ message: string; supplier: Supplier }> => {
        return apiClient<{ message: string; supplier: Supplier }>(PHARMACY_ENDPOINTS.SUPPLIERS.BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteSupplier: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(PHARMACY_ENDPOINTS.SUPPLIERS.BY_ID(id), {
            method: 'DELETE'
        });
    },

    getSupplierProducts: async (id: string): Promise<PharmacyProduct[]> => {
        return apiClient<PharmacyProduct[]>(PHARMACY_ENDPOINTS.SUPPLIERS.PRODUCTS(id), {
            method: 'GET'
        });
    }
};
