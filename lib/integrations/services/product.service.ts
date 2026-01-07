import { apiClient } from '../api/apiClient';
import { PharmacyProduct, PharmacyProductPayload } from '../types/product';

export const ProductService = {
    // Add a new product
    addProduct: async (data: PharmacyProductPayload): Promise<PharmacyProduct> => {
        return apiClient<PharmacyProduct>('/pharmacy/products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get all products with optional filters
    getProducts: async (filters?: { search?: string; status?: string; supplier?: string; expiryStatus?: string }): Promise<PharmacyProduct[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.supplier) queryParams.append('supplier', filters.supplier);
        if (filters?.expiryStatus) queryParams.append('expiryStatus', filters.expiryStatus);
        
        const url = `/pharmacy/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiClient<PharmacyProduct[]>(url);
    },

    // Get single product
    getProductById: async (id: string): Promise<PharmacyProduct> => {
        return apiClient<PharmacyProduct>(`/pharmacy/products/${id}`);
    },

    // Update a product
    updateProduct: async (id: string, data: Partial<PharmacyProductPayload>): Promise<PharmacyProduct> => {
        return apiClient<PharmacyProduct>(`/pharmacy/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete a product
    deleteProduct: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/pharmacy/products/${id}`, {
            method: 'DELETE',
        });
    },

    // Bulk add products
    bulkAddProducts: async (data: PharmacyProductPayload[]): Promise<{ addedCount: number; errorCount: number; errors: any[] }> => {
        return apiClient<{ addedCount: number; errorCount: number; errors: any[] }>('/pharmacy/products/bulk', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};
