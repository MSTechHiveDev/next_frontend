import { apiClient } from '../api/apiClient';
import { PharmacyProduct, PharmacyProductPayload } from '../types/product';
import { PHARMACY_ENDPOINTS } from '../config/endpoints';

export const ProductService = {
    // Add a new product
    addProduct: async (data: PharmacyProductPayload): Promise<PharmacyProduct> => {
        const payload = {
            ...data,
            brand: data.brandName,
            generic: data.genericName,
            stock: data.currentStock,
            minStock: data.minStockLevel,
            gstPercent: data.gst
        };
        return apiClient<PharmacyProduct>(PHARMACY_ENDPOINTS.PRODUCTS.BASE, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    // Get all products with optional filters
    getProducts: async (filters?: { search?: string; status?: string; supplier?: string; expiryStatus?: string }): Promise<PharmacyProduct[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.supplier) queryParams.append('supplier', filters.supplier);
        if (filters?.expiryStatus) queryParams.append('expiryStatus', filters.expiryStatus);

        const url = `${PHARMACY_ENDPOINTS.PRODUCTS.BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response: any = await apiClient<any>(url);

        // Backend returns { success: true, data: [...] }
        const products = response.data || [];

        return products.map((p: any) => ({
            ...p,
            brandName: p.brand,
            genericName: p.generic,
            currentStock: p.stock,
            minStockLevel: p.minStock,
            gst: p.gstPercent,
            status: p.stock === 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock"
        }));
    },

    // Get single product
    getProductById: async (id: string): Promise<PharmacyProduct> => {
        return apiClient<PharmacyProduct>(PHARMACY_ENDPOINTS.PRODUCTS.BY_ID(id));
    },

    // Update a product
    updateProduct: async (id: string, data: Partial<PharmacyProductPayload>): Promise<PharmacyProduct> => {
        const payload = {
            ...data,
            brand: data.brandName,
            generic: data.genericName,
            stock: data.currentStock,
            minStock: data.minStockLevel,
            gstPercent: data.gst
        };
        return apiClient<PharmacyProduct>(PHARMACY_ENDPOINTS.PRODUCTS.BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    // Delete a product
    deleteProduct: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(PHARMACY_ENDPOINTS.PRODUCTS.BY_ID(id), {
            method: 'DELETE',
        });
    },

    // Bulk add products
    bulkAddProducts: async (data: PharmacyProductPayload[]): Promise<{ addedCount: number; errorCount: number; errors: any[] }> => {
        return apiClient<{ addedCount: number; errorCount: number; errors: any[] }>(PHARMACY_ENDPOINTS.PRODUCTS.BULK, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};
