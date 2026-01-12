'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Download,
    FileSpreadsheet,
    ChevronDown,
    RefreshCcw,
    LayoutGrid
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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Stock');
    const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
    const [expiryStatusFilter, setExpiryStatusFilter] = useState(searchParams.get('expiryStatus') || 'All');

    const fetchProducts = async (page = 1) => {
        setIsLoading(true);
        try {
            const data = await ProductService.getProductsPaginated(
                page,
                10, // Limit
                {
                    search: searchTerm,
                    status: statusFilter === 'All Stock' ? undefined : statusFilter,
                    supplier: supplierFilter === 'All Suppliers' ? undefined : supplierFilter,
                    expiryStatus: expiryStatusFilter === 'All' ? undefined : expiryStatusFilter
                }
            );
            setProducts(data.products);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalProducts(data.totalProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load inventory data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(1);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, supplierFilter, expiryStatusFilter]);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const handleSaveProduct = async (data: PharmacyProductPayload) => {
        try {
            if (editingProduct) {
                await ProductService.updateProduct(editingProduct._id, data);
                toast.success('Inventory record updated');
            } else {
                await ProductService.addProduct(data);
                toast.success('SKU added to registry');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            toast.error(error.message || 'Registry update failed');
            throw error;
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Warning: This will permanently remove the SKU from the registry. Continue?')) {
            try {
                await ProductService.deleteProduct(id);
                toast.success('SKU deregistered');
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
                toast.error('Deregistration failed');
            }
        }
    };

    const handleEditProduct = (product: PharmacyProduct) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleExportExcel = async () => {
        if (products.length === 0) {
            toast.error('No registry data to export');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Report');

        worksheet.mergeCells('A2:H2');
        const titleCell = worksheet.getCell('A2');
        titleCell.value = 'Pharmacy Inventory Manifest';
        titleCell.font = { size: 20, bold: true };
        titleCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A3:H3');
        const subtitleCell = worksheet.getCell('A3');
        subtitleCell.value = 'Owner Manifest Audit';
        subtitleCell.font = { size: 14, bold: true };
        subtitleCell.alignment = { horizontal: 'center' };

        worksheet.getCell('A5').value = 'Export Date:';
        worksheet.getCell('B5').value = new Date().toLocaleDateString('en-GB');
        worksheet.getCell('A5').font = { bold: true };

        const columns = [
            { header: 'SKU_ID', key: 'sku', width: 15 },
            { header: 'NOMENCLATURE', key: 'brandName', width: 25 },
            { header: 'COMPOSITION', key: 'genericName', width: 25 },
            { header: 'SCH', key: 'schedule', width: 10 },
            { header: 'MRP_VAL', key: 'mrp', width: 12 },
            { header: 'UNIT_STOCK', key: 'stock', width: 10 },
            { header: 'STATUS', key: 'status', width: 15 },
            { header: 'EXP_DATE', key: 'expiry', width: 12 },
        ];

        const headerRow = worksheet.getRow(7);
        columns.forEach((col, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = col.header;
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1F2937' }
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

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
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `Pharma_Registry_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Registry manifest exported');
    };

    const suppliers = ['All Suppliers', ...Array.from(new Set(products.map(p => {
        if (typeof p.supplier === 'object' && p.supplier !== null) {
            return (p.supplier as any).name;
        }
        return p.supplier;
    }))).filter(Boolean)];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Inventory Registry</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">SKU Management & Stock Oversight</p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900/30"
                    >
                        <FileSpreadsheet size={16} />
                        Bulk Manifest
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm dark:bg-indigo-950/20 dark:border-indigo-900/30"
                    >
                        <Download size={16} />
                        Export Audit
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
                    >
                        <Plus size={16} />
                        Onboard SKU
                    </button>
                </div>
            </div>

            {/* Controller Area */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl md:rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full lg:w-auto">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by nomenclature, composition, or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-3 flex-1 md:flex-none flex justify-center rounded-xl transition-all ${isFilterOpen ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-blue-500'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => fetchProducts(currentPage)}
                        className="p-3 flex-1 md:flex-none flex justify-center bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-blue-500 transition-all"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="h-10 w-px bg-gray-100 dark:bg-gray-700 hidden md:block mx-1" />
                    <button className="p-3 flex-1 md:flex-none flex justify-center bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-blue-500 transition-all">
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            {isFilterOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stock Threshold</p>
                        <select
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>All Stock</option>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                        </select>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vendor Origin</p>
                        <select
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white"
                            value={supplierFilter}
                            onChange={(e) => setSupplierFilter(e.target.value)}
                        >
                            {suppliers.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stability Status</p>
                        <select
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white"
                            value={expiryStatusFilter}
                            onChange={(e) => setExpiryStatusFilter(e.target.value)}
                        >
                            <option>All</option>
                            <option>Expired</option>
                            <option>Expiring Soon (30 days)</option>
                            <option>Expiring in 3 months</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Registry List */}
            <ProductTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                isLoading={isLoading}
            />

            {/* Pagination Controls */}
            {!isLoading && products.length > 0 && (
                <div className="flex justify-between items-center mt-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={handleSaveProduct}
                initialData={editingProduct}
            />

            <BulkProductUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default ProductsPage;
