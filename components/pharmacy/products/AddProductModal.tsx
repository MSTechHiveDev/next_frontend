'use client';

import React, { useState } from 'react';
import { X, Layout, PoundSterling, Package, Info, Calendar, Plus } from 'lucide-react';
import { PharmacyProduct, PharmacyProductPayload } from '@/lib/integrations/types/product';
import { SupplierService } from '@/lib/integrations/services/supplier.service';
import { Supplier } from '@/lib/integrations/types/supplier';
import Link from 'next/link';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PharmacyProductPayload) => Promise<void>;
    initialData?: PharmacyProduct | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const defaultFormData: PharmacyProductPayload = {
        sku: '',
        genericName: '',
        brandName: '',
        strength: '',
        form: 'TABLET',
        schedule: 'OTC',
        mrp: 0,
        gst: 12,
        currentStock: 0,
        minStockLevel: 10,
        unitsPerPack: 1,
        supplier: '',
        hsnCode: '',
        batchNumber: '',
        expiryDate: '',
    };

    const [formData, setFormData] = React.useState<PharmacyProductPayload>(defaultFormData);

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                sku: initialData.sku || '',
                genericName: initialData.genericName || '',
                brandName: initialData.brandName || '',
                strength: initialData.strength || '',
                form: initialData.form || 'Tablet',
                schedule: initialData.schedule || 'OTC - Over the Counter',
                mrp: initialData.mrp || 0,
                gst: initialData.gst || 12,
                currentStock: initialData.currentStock || 0,
                minStockLevel: initialData.minStockLevel || 10,
                unitsPerPack: initialData.unitsPerPack || 1,
                supplier: initialData.supplier || '',
                hsnCode: initialData.hsnCode || '',
                batchNumber: initialData.batchNumber || '',
                expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [initialData, isOpen]);

    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);

    React.useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await SupplierService.getSuppliers();
                setSuppliers(data);
            } catch (error) {
                console.error('Failed to fetch suppliers', error);
            }
        };
        if (isOpen) {
            fetchSuppliers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to save product. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold border-b pb-2">
                            <Layout className="w-5 h-5" />
                            <h3>Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU <span className="text-red-500">*</span></label>
                                <input name="sku" value={formData.sku} onChange={handleChange} required placeholder="e.g., PAR500TAB" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generic Name <span className="text-red-500">*</span></label>
                                <input name="genericName" value={formData.genericName} onChange={handleChange} required placeholder="e.g., Paracetamol" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Name <span className="text-red-500">*</span></label>
                                <input name="brandName" value={formData.brandName} onChange={handleChange} required placeholder="e.g., Crocin" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Strength <span className="text-red-500">*</span></label>
                                <input name="strength" value={formData.strength} onChange={handleChange} required placeholder="e.g., 500mg" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Form <span className="text-red-500">*</span></label>
                                <select name="form" value={formData.form} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="TABLET">TAB - Tablet</option>
                                    <option value="CAPSULE">CAP - Capsule</option>
                                    <option value="SYRUP">SYR - Syrup</option>
                                    <option value="INJECTION">INJ - Injection</option>
                                    <option value="CREAM">CRM - Cream</option>
                                    <option value="DROPS">DRP - Drops</option>
                                    <option value="SUSPENSION">SUSP - Suspension</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule <span className="text-red-500">*</span></label>
                                <select name="schedule" value={formData.schedule} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="OTC">OTC - Over the Counter</option>
                                    <option value="H">H - Prescription Required</option>
                                    <option value="H1">H1</option>
                                    <option value="X">X</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Tax */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold border-b pb-2">
                            <PoundSterling className="w-5 h-5" />
                            <h3>Pricing & Tax</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">MRP (₹) <span className="text-red-500">*</span></label>
                                <input type="number" name="mrp" value={isNaN(formData.mrp as any) ? '' : formData.mrp} onChange={handleChange} required step="0.01" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GST %</label>
                                <select name="gst" value={formData.gst} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value={0}>0%</option>
                                    <option value={5}>5%</option>
                                    <option value={12}>12%</option>
                                    <option value={18}>18%</option>
                                    <option value={28}>28%</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Management */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold border-b pb-2">
                            <Package className="w-5 h-5" />
                            <h3>Inventory Management</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Stock</label>
                                <input type="number" name="currentStock" value={isNaN(formData.currentStock as any) ? '' : formData.currentStock} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Stock Level</label>
                                <input type="number" name="minStockLevel" value={isNaN(formData.minStockLevel as any) ? '' : formData.minStockLevel} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Units Per Pack</label>
                                <input type="number" name="unitsPerPack" value={isNaN(formData.unitsPerPack as any) ? '' : formData.unitsPerPack} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier <span className="text-red-500">*</span></label>
                                    <Link href="/pharmacy/suppliers" className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1">
                                        <Plus className="w-2.5 h-2.5" /> Manage
                                    </Link>
                                </div>
                                <select
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                    {formData.supplier && !suppliers.find(s => s._id === formData.supplier || s.name === formData.supplier) && (
                                        <option value={formData.supplier}>{formData.supplier}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold border-b pb-2">
                            <Info className="w-5 h-5" />
                            <h3>Additional Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">HSN Code</label>
                                <input name="hsnCode" value={formData.hsnCode} onChange={handleChange} placeholder="e.g., 30049099" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
                                <input name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Enter batch number" className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> Expiry Date
                                </label>
                                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-800">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
