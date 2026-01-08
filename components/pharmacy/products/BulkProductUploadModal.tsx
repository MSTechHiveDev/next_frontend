'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { PharmacyProductPayload } from '@/lib/integrations/types/product';
import { ProductService } from '@/lib/integrations/services/product.service';
import { toast } from 'react-hot-toast';

interface BulkProductUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BulkProductUploadModal: React.FC<BulkProductUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PharmacyProductPayload[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ addedCount: number; errorCount: number; errors: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsParsing(true);
        setUploadResults(null);

        try {
            const data = await parseFile(selectedFile);
            setPreviewData(data);
        } catch (error: any) {
            console.error('File parsing error:', error);
            toast.error(error.message || 'Failed to parse file');
            setFile(null);
        } finally {
            setIsParsing(false);
        }
    };

    const parseFile = async (file: File): Promise<PharmacyProductPayload[]> => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        if (extension === 'xlsx' || extension === 'xls') {
            return parseExcel(file);
        } else if (extension === 'csv') {
            return parseCSV(file);
        } else {
            throw new Error('Unsupported file format. Please use .xlsx or .csv');
        }
    };

    const normalizeForm = (val: string): any => {
        const validForms = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Drops", "Other"];
        if (!val) return "Other";
        const found = validForms.find(f => f.toLowerCase() === val.toLowerCase() || val.toLowerCase().includes(f.toLowerCase()));
        return found || "Other";
    };

    const normalizeSchedule = (val: string): string => {
        if (!val) return "OTC - Over the Counter";
        if (val.toLowerCase().includes('otc')) return "OTC - Over the Counter";
        if (val.toLowerCase().startsWith('h1')) return "H1";
        if (val.toLowerCase() === 'x') return "X";
        if (val.toLowerCase().includes('prescription') || val.toLowerCase() === 'h') return "H - Prescription Required";
        return val;
    };

    const parseExcel = async (file: File): Promise<PharmacyProductPayload[]> => {
        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);
        
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw new Error('No worksheet found');

        const products: PharmacyProductPayload[] = [];
        
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const sku = row.getCell(1).text?.trim();
            const brandName = row.getCell(2).text?.trim();
            const genericName = row.getCell(3).text?.trim();
            
            if (!sku || !brandName || !genericName) return;

            products.push({
                sku: sku,
                brandName: brandName,
                genericName: genericName,
                strength: row.getCell(4).text?.trim() || '',
                form: normalizeForm(row.getCell(5).text?.trim()),
                schedule: normalizeSchedule(row.getCell(6).text?.trim()),
                mrp: Number(row.getCell(7).value) || 0,
                currentStock: Number(row.getCell(8).value) || 0,
                minStockLevel: Number(row.getCell(9).value) || 10,
                supplier: row.getCell(10).text?.trim() || '',
                expiryDate: row.getCell(11).value ? new Date(row.getCell(11).value as any).toISOString() : '',
                gst: Number(row.getCell(12).value) || 12,
                unitsPerPack: Number(row.getCell(13).value) || 1,
            });
        });

        return products;
    };

    const parseCSV = async (file: File): Promise<PharmacyProductPayload[]> => {
        const text = await file.text();
        const lines = text.split('\n');
        const products: PharmacyProductPayload[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length < 3) continue;

            products.push({
                sku: cols[0],
                brandName: cols[1],
                genericName: cols[2],
                strength: cols[3] || '',
                form: normalizeForm(cols[4]),
                schedule: normalizeSchedule(cols[5]),
                mrp: Number(cols[6]) || 0,
                currentStock: Number(cols[7]) || 0,
                minStockLevel: Number(cols[8]) || 10,
                supplier: cols[9] || '',
                expiryDate: cols[10] ? new Date(cols[10]).toISOString() : '',
                gst: Number(cols[11]) || 12,
                unitsPerPack: Number(cols[12]) || 1,
            });
        }
        return products;
    };

    const handleUpload = async () => {
        if (previewData.length === 0) return;

        setIsUploading(true);
        try {
            const result = await ProductService.bulkAddProducts(previewData);
            setUploadResults(result);
            if (result.errorCount === 0) {
                toast.success(`Successfully added ${result.addedCount} products`);
                onSuccess();
                setTimeout(onClose, 2000);
            } else {
                toast.error(`Completed with ${result.errorCount} errors`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload products');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products Template');
        
        worksheet.columns = [
            { header: 'SKU*', key: 'sku', width: 15 },
            { header: 'Brand Name*', key: 'brandName', width: 25 },
            { header: 'Generic Name*', key: 'genericName', width: 25 },
            { header: 'Strength', key: 'strength', width: 15 },
            { header: 'Form', key: 'form', width: 15 },
            { header: 'Schedule', key: 'schedule', width: 20 },
            { header: 'MRP', key: 'mrp', width: 10 },
            { header: 'Current Stock', key: 'stock', width: 15 },
            { header: 'Min Stock', key: 'min', width: 12 },
            { header: 'Supplier', key: 'supplier', width: 20 },
            { header: 'Expiry (YYYY-MM-DD)', key: 'expiry', width: 20 },
            { header: 'GST%', key: 'gst', width: 8 },
            { header: 'Units/Pack', key: 'units', width: 12 },
        ];

        // Add example row
        worksheet.addRow(['PAR500', 'Crocin', 'Paracetamol', '500mg', 'Tablet', 'OTC', 20, 100, 10, 'HealthCare Inc', '2026-12-31', 12, 10]);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pharmacy_products_template.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Upload className="w-6 h-6 text-indigo-600" />
                            Bulk Product Upload
                        </h2>
                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest text-emerald-600">Import inventory via Excel or CSV</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all group">
                        <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                    {!file ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                        <FileSpreadsheet className="w-10 h-10 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select File</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">Upload your .xlsx or .csv product list</p>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                                    >
                                        Browse Files
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept=".xlsx, .xls, .csv" 
                                        className="hidden" 
                                    />
                                </div>
                                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border-2 border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-center space-y-4">
                                    <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                        <Download className="w-5 h-5" />
                                        Need a template?
                                    </h3>
                                    <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">Download our sample Excel file to ensure your data is formatted correctly for a smooth import.</p>
                                    <button 
                                        onClick={downloadTemplate}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 transition-all shadow-sm"
                                    >
                                        <FileSpreadsheet className="w-5 h-5" />
                                        Download Template
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                                <div className="text-xs text-amber-800 dark:text-amber-400 font-bold space-y-1">
                                    <p className="uppercase tracking-widest text-[10px]">Important Note</p>
                                    <p className="text-[13px] font-medium leading-relaxed">Ensure SKU, Brand Name, and Generic Name are present for every row. Duplicates by SKU within your pharmacy will be skipped during upload.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
                                        <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs text-gray-500 font-bold">{(file.size / 1024).toFixed(1)} KB • {previewData.length} records found</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setPreviewData([]); setUploadResults(null); }}
                                    className="text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                                >
                                    Change File
                                </button>
                            </div>

                            {/* Preview Table */}
                            <div className="border dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-gray-500">SKU</th>
                                                <th className="px-4 py-3 font-bold text-gray-500">Brand Name</th>
                                                <th className="px-4 py-3 font-bold text-gray-500">Generic Name</th>
                                                <th className="px-4 py-3 font-bold text-gray-500">Stock</th>
                                                <th className="px-4 py-3 font-bold text-gray-500">MRP</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-800">
                                            {previewData.slice(0, 10).map((p, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">{p.sku}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.brandName}</td>
                                                    <td className="px-4 py-3 text-gray-500">{p.genericName}</td>
                                                    <td className="px-4 py-3 font-bold text-emerald-600">{p.currentStock}</td>
                                                    <td className="px-4 py-3 font-bold text-indigo-600">₹{p.mrp}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewData.length > 10 && (
                                        <div className="p-4 text-center text-xs font-bold text-gray-400 bg-gray-50/30 dark:bg-gray-800/30">
                                            + {previewData.length - 10} more records
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Results */}
                            {uploadResults && (
                                <div className={`p-6 rounded-3xl border-2 ${uploadResults.errorCount === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex items-start gap-4">
                                        {uploadResults.errorCount === 0 ? (
                                            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                                        )}
                                        <div className="space-y-3 flex-1">
                                            <h4 className={`text-lg font-black ${uploadResults.errorCount === 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                                                Import Complete
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/60 p-3 rounded-2xl flex flex-col">
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Added</span>
                                                    <span className="text-2xl font-black text-gray-900">{uploadResults.addedCount}</span>
                                                </div>
                                                <div className="bg-white/60 p-3 rounded-2xl flex flex-col">
                                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Errors</span>
                                                    <span className="text-2xl font-black text-gray-900">{uploadResults.errorCount}</span>
                                                </div>
                                            </div>
                                            {uploadResults.errors.length > 0 && (
                                                <div className="mt-4 max-h-[150px] overflow-y-auto bg-white/40 rounded-2xl p-4">
                                                    <p className="text-xs font-black text-red-700 uppercase mb-2">Error Details</p>
                                                    <ul className="space-y-2">
                                                        {uploadResults.errors.slice(0, 50).map((err, i) => (
                                                            <li key={i} className="text-[11px] font-bold text-red-800 flex items-center justify-between">
                                                                <span>{err.brandName} ({err.sku})</span>
                                                                <span className="bg-red-100 px-2 py-0.5 rounded-lg opacity-70">{err.message}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all"
                    >
                        {uploadResults ? 'Close' : 'Cancel'}
                    </button>
                    {!uploadResults && file && (
                        <button 
                            onClick={handleUpload}
                            disabled={isUploading || isParsing || previewData.length === 0}
                            className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center gap-2 group"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                    Import {previewData.length} Products
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkProductUploadModal;
