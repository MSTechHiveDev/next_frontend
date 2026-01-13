'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Truck,
    RefreshCw,
} from 'lucide-react';
import { SupplierService } from '@/lib/integrations/services/supplier.service';
import { Supplier } from '@/lib/integrations/types/supplier';
import SupplierTable from '@/components/pharmacy/suppliers/SupplierTable';
import AddSupplierModal from '@/components/pharmacy/suppliers/AddSupplierModal';
import { toast } from 'react-hot-toast';

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await SupplierService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast.error('Failed to load supplier network');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Warning: Deleting this vendor will unlink them from all associated SKUs. Proceed?')) return;

        try {
            await SupplierService.deleteSupplier(id);
            toast.success('Vendor profile terminated');
            fetchSuppliers();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsAddModalOpen(true);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        (s.gstNumber && s.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Supplier Network</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Vendor Management & Relations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSuppliers}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-emerald-500"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none flex-1 md:flex-none"
                    >
                        <Plus size={16} />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl md:rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search vendors by name, contact, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                </div>
            </div>

            {/* Suppliers List */}
            <SupplierTable
                suppliers={filteredSuppliers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={loading}
            />

            {/* Modals */}
            <AddSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingSupplier(null);
                }}
                onSuccess={fetchSuppliers}
                initialData={editingSupplier}
            />
        </div>
    );
};

export default SuppliersPage;
