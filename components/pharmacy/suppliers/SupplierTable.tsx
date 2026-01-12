'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Phone, Mail, Package, MapPin, ChevronDown, ChevronUp, Loader2, PackageOpen } from 'lucide-react';
import { Supplier } from '@/lib/integrations/types/supplier';
import { PharmacyProduct } from '@/lib/integrations/types/product';
import { SupplierService } from '@/lib/integrations/services/supplier.service';

interface SupplierTableProps {
    suppliers: Supplier[];
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

const SupplierProductsInline = ({ supplierId }: { supplierId: string }) => {
    const [products, setProducts] = useState<PharmacyProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await SupplierService.getSupplierProducts(supplierId);
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch supplier products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [supplierId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-3">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Inventory...</span>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <PackageOpen className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-gray-400 font-bold text-xs">No products linked to this supplier</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden mt-2 mb-4 mx-4">
            <div className="bg-gray-50/50 dark:bg-gray-700/30 px-6 py-3 border-b dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Supplied Products</span>
                </div>
                <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                    {products.length} Items
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/30 dark:bg-gray-800/20">
                            <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Product Name</th>
                            <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Generic</th>
                            <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                            <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">MRP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {products.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="text-[13px] font-black text-gray-800 dark:text-gray-200">{p.brandName}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{p.strength}</div>
                                </td>
                                <td className="px-6 py-3 text-[11px] font-bold text-gray-500">{p.genericName}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${p.currentStock <= p.minStockLevel ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {p.currentStock}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right font-black text-indigo-600 text-[12px]">₹{p.mrp.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete, isLoading }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-gray-900 rounded-[32px] border dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="animate-pulse space-y-4 p-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (suppliers.length === 0) {
        return (
            <div className="w-full bg-white dark:bg-gray-900 rounded-[32px] border dark:border-gray-800 p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">No suppliers found</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Start by adding your first vendor to the system.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-[32px] border dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Supplier Name</th>
                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact Details</th>
                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Business Info</th>
                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                        {suppliers.map((supplier) => (
                            <React.Fragment key={supplier._id}>
                                <tr className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors group ${expandedId === supplier._id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                    <td className="px-8 py-6">
                                        <div
                                            className="font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors text-base tracking-tight cursor-pointer flex items-center gap-2"
                                            onClick={() => toggleExpand(supplier._id)}
                                        >
                                            {supplier.name}
                                            {expandedId === supplier._id ? (
                                                <ChevronUp className="w-4 h-4 text-indigo-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400 font-bold uppercase">
                                            <MapPin className="w-3 h-3" />
                                            {supplier.address ? (supplier.address.length > 40 ? supplier.address.substring(0, 40) + '...' : supplier.address) : 'No address'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                                            <Phone className="w-4 h-4 text-indigo-400" />
                                            {supplier.phone}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-400 lowercase">
                                            <Mail className="w-4 h-4 text-gray-300" />
                                            {supplier.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[11px] font-black text-gray-400 uppercase mb-1">GSTIN</div>
                                        <div className="text-[13px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                            {supplier.gstNumber || '-'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => onEdit(supplier)}
                                                className="p-2.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 transition-all"
                                                title="Edit Supplier"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(supplier._id)}
                                                className="p-2.5 text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 transition-all"
                                                title="Delete Supplier"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === supplier._id && (
                                    <tr>
                                        <td colSpan={4} className="p-0 bg-gray-50/30 dark:bg-gray-900/50">
                                            <SupplierProductsInline supplierId={supplier._id} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupplierTable;
