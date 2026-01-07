'use client';

import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    Filter, 
    Download, 
    FileSpreadsheet, 
    ChevronDown, 
    RefreshCcw 
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ProductService } from '@/lib/integrations/services/product.service';
import { PharmacyProduct, PharmacyProductPayload } from '@/lib/integrations/types/product';
import ProductTable from '@/components/pharmacy/products/ProductTable';
import AddProductModal from '@/components/pharmacy/products/AddProductModal';
import BulkProductUploadModal from '@/components/pharmacy/products/BulkProductUploadModal';
import { toast } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ProductsPage = () => {
    const [products, setProducts] = useState<PharmacyProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<PharmacyProduct | null>(null);
    
    // Filter states
    const searchParams = useSearchParams();
    
    // Filter states - initialized with URL params if available
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Stock');
    const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
    const [expiryStatusFilter, setExpiryStatusFilter] = useState(searchParams.get('expiryStatus') || 'All');

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await ProductService.getProducts({
                search: searchTerm,
                status: statusFilter,
                supplier: supplierFilter === 'All Suppliers' ? undefined : supplierFilter,
                expiryStatus: expiryStatusFilter
            });
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, supplierFilter, expiryStatusFilter]);

    const handleSaveProduct = async (data: PharmacyProductPayload) => {
        try {
            if (editingProduct) {
                await ProductService.updateProduct(editingProduct._id, data);
                toast.success('Product updated successfully');
            } else {
                await ProductService.addProduct(data);
                toast.success('Product added successfully');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            toast.error(error.message || 'Failed to save product');
            throw error;
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await ProductService.deleteProduct(id);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const handleEditProduct = (product: PharmacyProduct) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleExportExcel = async () => {
        if (products.length === 0) {
            toast.error('No products to export');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Report');

        // Add Header Information (matching the style of the user's 2nd image)
        worksheet.mergeCells('A2:H2');
        const titleCell = worksheet.getCell('A2');
        titleCell.value = 'Inventory Report';
        titleCell.font = { size: 20, bold: true };
        titleCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A3:H3');
        const subtitleCell = worksheet.getCell('A3');
        subtitleCell.value = 'Pharmacy Management System';
        subtitleCell.font = { size: 14, bold: true };
        subtitleCell.alignment = { horizontal: 'center' };

        worksheet.getCell('A5').value = 'Report Date:';
        worksheet.getCell('B5').value = new Date().toLocaleDateString('en-GB');
        worksheet.getCell('A5').font = { bold: true };

        // Define Columns
        const columns = [
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Brand Name', key: 'brandName', width: 25 },
            { header: 'Generic Name', key: 'genericName', width: 25 },
            { header: 'Schedule', key: 'schedule', width: 10 },
            { header: 'MRP (₹)', key: 'mrp', width: 12 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Expiry', key: 'expiry', width: 12 },
        ];

        // Add Table Header (Row 7)
        const headerRow = worksheet.getRow(7);
        columns.forEach((col, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = col.header;
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1B5E20' } // Dark Green matching the image
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add Data
        products.forEach((product, index) => {
            const row = worksheet.getRow(8 + index);
            const rowData = [
                product.sku,
                product.brandName,
                product.genericName,
                product.schedule?.split(' ')[0] || '-',
                product.mrp,
                product.currentStock,
                product.status,
                product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : '-'
            ];

            rowData.forEach((val, colIndex) => {
                const cell = row.getCell(colIndex + 1);
                cell.value = val;
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Add Totals (optional but nice)
        const totalRow = worksheet.getRow(8 + products.length);
        totalRow.getCell(5).value = 'Total Items:';
        totalRow.getCell(6).value = products.length;
        totalRow.getCell(5).font = { bold: true };
        totalRow.getCell(6).font = { bold: true };

        // Export to Buffer and Save
        const buffer = await workbook.xlsx.writeBuffer();
        const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel report exported successfully');
    };

    // Get unique suppliers for filter dropdown
    const suppliers = ['All Suppliers', ...Array.from(new Set(products.map(p => p.supplier))).filter(Boolean)];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your inventory</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isFilterOpen ? 'bg-indigo-600 text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold transition-all hover:bg-emerald-700 shadow-sm shadow-emerald-200 dark:shadow-none hover:translate-y-[-1px]"
                    >
                        <FileSpreadsheet size={18} />
                        Bulk Import
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold transition-all hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none hover:translate-y-[-1px]"
                    >
                        <Download size={18} />
                        Excel
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 dark:shadow-none hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Search and Quick Actions Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                        type="search" 
                        placeholder="Search products by name, brand, generic, or SKU..." 
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={fetchProducts}
                    className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-gray-500"
                    title="Refresh List"
                >
                    <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Advanced Filters */}
            {isFilterOpen && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                            <Filter size={18} className="text-indigo-600" />
                            Advanced Filters
                        </div>
                        <button onClick={() => setIsFilterOpen(false)} className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium">✕ Close</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Status</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option>All Stock</option>
                                    <option>In Stock</option>
                                    <option>Low Stock</option>
                                    <option>Out of Stock</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                    value={supplierFilter}
                                    onChange={(e) => setSupplierFilter(e.target.value)}
                                >
                                    {suppliers.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Status</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                    value={expiryStatusFilter}
                                    onChange={(e) => setExpiryStatusFilter(e.target.value)}
                                >
                                    <option>All</option>
                                    <option>Expired</option>
                                    <option>Expiring Soon (30 days)</option>
                                    <option>Expiring in 3 months</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Summary */}
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-2">
                <div>Showing <span className="text-gray-900 dark:text-white">{products.length}</span> of {products.length} products</div>
            </div>

            {/* Product Table */}
            <ProductTable 
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                isLoading={isLoading}
            />

            {/* Add Product Modal */}
            <AddProductModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleSaveProduct}
                initialData={editingProduct}
            />

            {/* Bulk Upload Modal */}
            <BulkProductUploadModal 
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default ProductsPage;
