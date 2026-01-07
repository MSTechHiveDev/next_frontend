import { apiClient } from "../api";
import { Supplier, SupplierPayload } from "../types/supplier";
import { PharmacyProduct } from "../types/product";

export const SupplierService = {
    getSuppliers: async (): Promise<Supplier[]> => {
        return apiClient<Supplier[]>("/pharmacy/suppliers", {
            method: 'GET'
        });
    },

    getSupplierById: async (id: string): Promise<Supplier> => {
        return apiClient<Supplier>(`/pharmacy/suppliers/${id}`, {
            method: 'GET'
        });
    },

    createSupplier: async (data: SupplierPayload): Promise<{ message: string; supplier: Supplier }> => {
        return apiClient<{ message: string; supplier: Supplier }>("/pharmacy/suppliers", {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateSupplier: async (id: string, data: Partial<SupplierPayload>): Promise<{ message: string; supplier: Supplier }> => {
        return apiClient<{ message: string; supplier: Supplier }>(`/pharmacy/suppliers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteSupplier: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/pharmacy/suppliers/${id}`, {
            method: 'DELETE'
        });
    },

    getSupplierProducts: async (id: string): Promise<PharmacyProduct[]> => {
        return apiClient<PharmacyProduct[]>(`/pharmacy/suppliers/${id}/products`, {
            method: 'GET'
        });
    }
};
