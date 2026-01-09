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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Supplier Network</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Vendor Management & Procurement Nodes</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSuppliers}
                        className="p-3.5 bg-white dark:bg-gray-800 text-gray-400 rounded-2xl border border-gray-100 dark:border-gray-700 hover:text-blue-500 transition-all shadow-sm"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5 font-black" />
                        Onboard New Vendor
                    </button>
                </div>
            </div>

            {/* Controller Area */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full lg:w-auto">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by vendor name, contact digits, or GSTIN taxonomy..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Active Nodes</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{filteredSuppliers.length}</p>
                </div>
            </div>

            {/* Vendor Grid/Table */}
            <div className="bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <SupplierTable
                    suppliers={filteredSuppliers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                />
            </div>

            {/* Modals */}
            <AddSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchSuppliers}
                initialData={editingSupplier}
            />
        </div>
    );
};

export default SuppliersPage;
