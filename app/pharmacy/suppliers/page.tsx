'use client';

import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Truck, 
    Filter,
    RefreshCw,
    LayoutGrid,
    List
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
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await SupplierService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast.error('Failed to load supplier list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this supplier? Allied products will remain but will be unlinked from this vendor.')) return;
        
        try {
            await SupplierService.deleteSupplier(id);
            toast.success('Supplier deleted successfully');
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier');
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
        <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-[24px] shadow-sm border dark:border-gray-700 flex items-center justify-center">
                        <Truck className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">Suppliers</h1>
                        <p className="text-gray-400 font-bold mt-1 text-sm uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Vendor & Supply Chain Network
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchSuppliers}
                        className="p-4 bg-white dark:bg-gray-900 text-gray-400 rounded-2xl border dark:border-gray-800 hover:text-indigo-500 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
                    </button>
                    <button 
                        onClick={() => {
                            setEditingSupplier(null);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Supplier
                    </button>
                </div>
            </div>

            {/* Stats & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text"
                            className="w-full bg-white dark:bg-gray-900 border-2 border-transparent dark:border-gray-800 rounded-3xl pl-16 pr-8 py-5 outline-none focus:border-indigo-500 shadow-sm transition-all font-medium text-base"
                            placeholder="Find by vendor name, phone number, or GSTIN..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
               
            </div>

            {/* Main Table */}
            <SupplierTable 
                suppliers={filteredSuppliers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={loading}
            />

            {/* Modal */}
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
