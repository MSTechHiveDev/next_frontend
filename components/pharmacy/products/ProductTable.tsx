'use client';

import React from 'react';
import { Edit2, Trash2, Tag, Info } from 'lucide-react';
import { PharmacyProduct } from '@/lib/integrations/types/product';

interface ProductTableProps {
    products: PharmacyProduct[];
    onEdit: (product: PharmacyProduct) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete, isLoading }) => {

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'In Stock':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'Low Stock':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
            case 'Out of Stock':
                return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="animate-pulse space-y-4 p-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-12 text-center shadow-sm">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new product.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generic Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Sch</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Expiry</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">MRP</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                        {product.brandName}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                                        {product.strength} | {product.form}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {product.genericName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {product.schedule?.split(' ')[0] || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        ₹{product.mrp.toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {product.currentStock}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusStyles(product.status)}`}>
                                        {product.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                                            title="Edit Product"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(product._id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductTable;
