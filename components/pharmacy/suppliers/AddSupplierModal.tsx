'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, 
    Building2, 
    Phone, 
    Mail, 
    Hash, 
    MapPin, 
    FileText,
    Loader2
} from 'lucide-react';
import { Supplier, SupplierPayload } from '@/lib/integrations/types/supplier';
import { SupplierService } from '@/lib/integrations/services/supplier.service';
import { toast } from 'react-hot-toast';

interface AddSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Supplier | null;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<SupplierPayload>({
        name: '',
        phone: '',
        email: '',
        gstNumber: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                phone: initialData.phone,
                email: initialData.email || '',
                gstNumber: initialData.gstNumber || '',
                address: initialData.address || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                email: '',
                gstNumber: '',
                address: '',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('Name and Phone are required');
            return;
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // GST validation (Standard 15 characters)
        if (formData.gstNumber && formData.gstNumber.length !== 15) {
            toast.error('GST Number must be exactly 15 characters');
            return;
        }

        // Phone validation (10 digits)
        if (formData.phone.length !== 10) {
            toast.error('Phone number must be 10 digits');
            return;
        }

        setIsLoading(true);
        try {
            if (initialData) {
                await SupplierService.updateSupplier(initialData._id, formData);
                toast.success('Supplier updated successfully');
            } else {
                await SupplierService.createSupplier(formData);
                toast.success('Supplier added successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save supplier');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                        {initialData ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-[24px] p-6 space-y-4 border border-indigo-100/50 dark:border-indigo-900/50">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                            <Building2 className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-wider">Basic Information</span>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-gray-500 uppercase">Supplier Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                placeholder="e.g., Pharma Solutions Ltd"
                                value={formData.name}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || /^[a-zA-Z\s]*$/.test(val)) {
                                        setFormData({ ...formData, name: val });
                                    }
                                }}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-gray-500 uppercase">Phone Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="tel"
                                        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                        placeholder="10-digit number"
                                        value={formData.phone}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: val });
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-gray-500 uppercase">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="email"
                                        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Details */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[24px] p-6 space-y-4 border border-emerald-100/50 dark:border-emerald-900/50">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-wider">Business Details</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-gray-500 uppercase">GST Number</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text"
                                    className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-all font-medium text-sm uppercase"
                                    placeholder="15-CHARACTER GST NUMBER"
                                    value={formData.gstNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
                                        setFormData({ ...formData, gstNumber: val });
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase pl-1">Format: 15 alphanumeric characters</p>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-[24px] p-6 space-y-4 border border-purple-100/50 dark:border-purple-900/50">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                            <MapPin className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-wider">Address Information</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-gray-500 uppercase">Complete Address</label>
                            <textarea 
                                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all font-medium text-sm min-h-[100px] resize-none"
                                placeholder="Enter complete office address with city, state, and pincode"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-[24px] p-6 space-y-4 border border-amber-100/50 dark:border-amber-900/50">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-wider">Additional Notes</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-gray-500 uppercase">Special Terms & Notes</label>
                            <textarea 
                                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-all font-medium text-sm min-h-[80px] resize-none"
                                placeholder="Special terms, delivery schedules, payment terms, etc."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t dark:border-gray-800 flex gap-4">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            initialData ? 'Update Supplier' : 'Create Supplier'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSupplierModal;
