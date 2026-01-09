'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Printer, Save, User, ShoppingCart, CreditCard, ChevronRight, Calculator } from 'lucide-react';
import { ProductService } from '@/lib/integrations/services/product.service';
import { PharmacyBillingService } from '@/lib/integrations/services/pharmacyBilling.service';
import { PharmacyProduct } from '@/lib/integrations/types/product';
import { BillItem, PharmacyBillPayload, PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';
import PharmacyBillPrint from '@/components/pharmacy/billing/PharmacyBillPrint';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';

const BillingPage = () => {
    // State
    const [patientName, setPatientName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<PharmacyProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<PharmacyProduct | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [cart, setCart] = useState<BillItem[]>([]);

    // Payment State
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Mixed'>('Cash');
    const [mixedPayments, setMixedPayments] = useState({ cash: 0, card: 0, upi: 0 });
    const [status, setStatus] = useState<'Paid' | 'Partial' | 'Due'>('Paid');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'%' | '₹'>('%');
    const [paidAmount, setPaidAmount] = useState(0);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBill, setGeneratedBill] = useState<PharmacyBill | null>(null);

    // Refs
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: generatedBill ? `Invoice_${generatedBill.invoiceId}` : 'Invoice',
    });

    const subtotal = cart.reduce((sum, item: any) => sum + (item.total || 0), 0);
    const totalDiscount = discountType === '%' ? (subtotal * discount / 100) : discount;
    const grandTotal = Math.max(0, subtotal - totalDiscount);

    const taxGST = cart.reduce((sum, item: any) => {
        const itemTotal = item.total || 0;
        const itemWeight = itemTotal / (subtotal || 1);
        const itemDiscount = totalDiscount * itemWeight;
        const itemNetMRP = itemTotal - itemDiscount;
        const gst = item.gstPct || item.gst || 0;
        const itemTax = itemNetMRP - (itemNetMRP / (1 + (gst / 100)));
        return sum + itemTax;
    }, 0);

    const taxableAmount = Math.max(0, grandTotal - taxGST);

    useEffect(() => {
        const roundedTotal = Math.round(grandTotal);
        setPaidAmount(roundedTotal);
        if (paymentMode === 'Mixed') {
            setMixedPayments({ cash: roundedTotal, card: 0, upi: 0 });
        }
    }, [grandTotal, paymentMode]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const results = await ProductService.getProducts({ search: searchTerm });
                const adjustedResults = results.map(p => {
                    const cartItem = cart.find((item: any) => item.drug === p._id || item.productId === p._id);
                    return cartItem ? { ...p, currentStock: p.currentStock - cartItem.qty } : p;
                });
                setSearchResults(adjustedResults || []);
            } catch (err) {
                console.error("Search failed", err);
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, cart]);

    const handleSelectProduct = (product: PharmacyProduct) => {
        setSelectedProduct(product);
        setSearchTerm(product.brandName);
        setPrice(product.mrp);
        setSearchResults([]);
    };

    const handleAddItem = () => {
        if (!selectedProduct) {
            toast.error('Please select a product');
            return;
        }

        const safeQty = Number(quantity) || 0;
        const safePrice = Number(price) || 0;

        if (safeQty <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }

        if (safeQty > selectedProduct.currentStock) {
            toast.error(`Only ${selectedProduct.currentStock} units available in stock`);
            return;
        }

        const total = safeQty * safePrice;
        const newItem: any = {
            drug: selectedProduct._id,
            productId: selectedProduct._id,
            productName: `${selectedProduct.brandName} ${selectedProduct.strength} ${selectedProduct.form}`,
            itemName: `${selectedProduct.brandName} ${selectedProduct.strength} ${selectedProduct.form}`,
            qty: safeQty,
            unitRate: safePrice,
            rate: safePrice,
            hsn: selectedProduct.hsnCode,
            gstPct: selectedProduct.gst || 0,
            gst: selectedProduct.gst || 0,
            amount: total,
            total: total
        };

        setCart([...cart, newItem]);
        setSelectedProduct(null);
        setSearchTerm('');
        setQuantity(1);
        setPrice(0);
    };

    const removeItem = (index: number) => {
        const itemToRemove = cart[index];
        const updatedSearchResults = searchResults.map(p =>
            p._id === itemToRemove.productId || p._id === itemToRemove.drug ? { ...p, currentStock: p.currentStock + itemToRemove.qty } : p
        );
        setSearchResults(updatedSearchResults);
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleSaveAndPrint = async () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        if (!patientName || !mobileNumber) {
            toast.error('Please enter patient details');
            return;
        }

        if (paymentMode === 'Mixed') {
            const totalMixed = Number(mixedPayments.cash) + Number(mixedPayments.card) + Number(mixedPayments.upi);
            if (Math.abs(totalMixed - Math.round(grandTotal)) > 1) {
                toast.error(`Mixed payments (₹${totalMixed}) must match Grand Total (₹${Math.round(grandTotal)})`);
                return;
            }
        }

        setIsGenerating(true);
        try {
            const payload: PharmacyBillPayload = {
                patientName,
                customerPhone: mobileNumber,
                items: cart,
                paymentSummary: {
                    subtotal: Number(subtotal) || 0,
                    taxableAmount: Number(taxableAmount) || 0,
                    taxGST: Number(taxGST) || 0,
                    discount: Number(totalDiscount) || 0,
                    grandTotal: Number(Math.round(grandTotal)) || 0,
                    paidAmount: Number(paidAmount) || 0,
                    balanceDue: status === 'Paid' ? 0 : Math.round(grandTotal) - paidAmount,
                    paymentMode: paymentMode.toUpperCase() as any,
                    status: status.toUpperCase() as any,
                    paymentDetails: paymentMode === 'Mixed' ? mixedPayments : undefined
                }
            };

            const res = await PharmacyBillingService.createBill(payload);
            setGeneratedBill(res.bill);
            toast.success('Invoice generated successfully');

            setTimeout(() => {
                handlePrint();
            }, 300);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to generate invoice');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-gray-900 dark:text-white pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Terminal POS</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Real-time Sales Processing & Inventorial Sync</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Terminal</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Patient Context */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation Context</p>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Patient Registry</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Legal Name</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    value={patientName}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === '' || /^[a-zA-Z\s]*$/.test(val)) setPatientName(val);
                                    }}
                                    placeholder="ENTER PATIENT NAME..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Link</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    value={mobileNumber}
                                    onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="MOBILE (10 DIGITS)..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* SKU Selection */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Plus size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Probe</p>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">SKU Acquisition</h2>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Nomenclature Search</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-12 pr-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder="TYPE BRAND OR GENERIC..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {searchResults && searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        {searchResults.map(product => (
                                            <div
                                                key={product._id}
                                                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b dark:border-gray-700 last:border-none"
                                                onClick={() => handleSelectProduct(product)}
                                            >
                                                <div>
                                                    <p className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight">{product.brandName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.genericName} • {product.strength}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xs text-blue-600">₹{product.mrp}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">UNIT_STOCK: {product.currentStock}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Magnitude (Qty)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={quantity}
                                        min="1"
                                        onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tariff (Price)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[12px]">₹</span>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-10 pr-5 py-4 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                            value={price || ''}
                                            min="0"
                                            onChange={e => setPrice(Math.max(0, Number(e.target.value)))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        className="w-full bg-blue-600 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
                                        onClick={handleAddItem}
                                    >
                                        <Plus className="w-5 h-5 font-black" /> Inject to Registry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Registry */}
                    <div className="bg-white dark:bg-gray-800 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-black/10 px-8 py-5 border-b dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={18} className="text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active manifest Items</span>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[9px] font-black text-gray-500 uppercase">{cart.length} SKUS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-gray-700">
                                        <th className="px-8 py-5 text-left">IDX</th>
                                        <th className="px-8 py-5 text-left">Nomenclature</th>
                                        <th className="px-8 py-5 text-center">Mag</th>
                                        <th className="px-8 py-5 text-right">Tariff</th>
                                        <th className="px-8 py-5 text-right">Total</th>
                                        <th className="px-8 py-5 text-center">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700/50">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                                    <ShoppingCart className="w-16 h-16 opacity-10" />
                                                    <p className="text-xs font-black uppercase tracking-widest">Manifest Void</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Awaiting SKU acquisition...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map((item, index) => (
                                            <tr key={index} className="text-xs hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                <td className="px-8 py-5 font-black text-gray-400">{(index + 1).toString().padStart(2, '0')}</td>
                                                <td className="px-8 py-5">
                                                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.itemName}</span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-2 py-2 text-center font-black outline-none ring-1 ring-gray-100 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500"
                                                        value={item.qty}
                                                        min="1"
                                                        onChange={e => {
                                                            const newQty = Math.max(1, Number(e.target.value)) || 1;
                                                            const newCart = [...cart];
                                                            newCart[index] = { ...item, qty: newQty, total: newQty * item.rate };
                                                            setCart(newCart);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-8 py-5 text-right font-bold text-gray-500">₹{item.rate.toFixed(2)}</td>
                                                <td className="px-8 py-5 text-right font-black text-blue-600 text-sm">₹{(item.total || item.amount || 0).toFixed(2)}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <button
                                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Economic Summary */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</p>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Economic Hub</h2>
                            </div>
                        </div>

                        {/* Payment Mode */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Gateway Protocol</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Cash', 'UPI', 'Card', 'Mixed'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode as any)}
                                        className={`py-3 rounded-2xl text-[9px] font-black transition-all border ${paymentMode === mode ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 border-none'}`}
                                    >
                                        {mode.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Split Protocol */}
                        {paymentMode === 'Mixed' && (
                            <div className="space-y-4 p-5 bg-gray-50 dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Sector Allocation</p>
                                <div className="space-y-3">
                                    {['CASH', 'CARD', 'UPI'].map(type => (
                                        <div key={type} className="flex justify-between items-center gap-4">
                                            <span className="text-[10px] font-black text-gray-400 w-12">{type}</span>
                                            <input
                                                type="number"
                                                className="w-full bg-white dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-xs font-black outline-none ring-1 ring-gray-100 dark:ring-gray-600 focus:ring-2 focus:ring-blue-500"
                                                value={mixedPayments[type.toLowerCase() as keyof typeof mixedPayments] || ''}
                                                onChange={e => {
                                                    const val = Math.max(0, Number(e.target.value));
                                                    setMixedPayments({ ...mixedPayments, [type.toLowerCase()]: val });
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t dark:border-gray-700 flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">Total Flux:</span>
                                        <span className={Math.abs(mixedPayments.cash + mixedPayments.card + mixedPayments.upi - Math.round(grandTotal)) > 2 ? 'text-red-500' : 'text-emerald-500'}>
                                            ₹{mixedPayments.cash + mixedPayments.card + mixedPayments.upi} / {Math.round(grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validation & Modifiers */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Validation</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                >
                                    <option>Paid</option>
                                    <option>Partial</option>
                                    <option>Due</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reduction</label>
                                <div className="flex bg-gray-50 dark:bg-gray-700/50 rounded-2xl overflow-hidden">
                                    <input
                                        className="w-full bg-transparent border-none px-4 py-3 text-xs font-black outline-none dark:text-white"
                                        type="number"
                                        placeholder="0"
                                        value={discount || ''}
                                        onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                                    />
                                    <select
                                        className="bg-gray-100 dark:bg-gray-600 border-none px-3 text-[10px] font-black outline-none"
                                        value={discountType}
                                        onChange={e => setDiscountType(e.target.value as any)}
                                    >
                                        <option>%</option>
                                        <option>₹</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quantum Injection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Actual Collection</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">₹</span>
                                <input
                                    className="w-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl pl-11 pr-5 py-5 text-2xl font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                                    type="number"
                                    value={paidAmount || ''}
                                    onChange={e => setPaidAmount(Math.max(0, Number(e.target.value)))}
                                />
                            </div>
                        </div>

                        {/* Calculation Matrix */}
                        <div className="space-y-3 pt-6 border-t border-dashed dark:border-gray-700">
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Gross Subtotal</span>
                                <span className="text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Registry Tax (GST)</span>
                                <span className="text-gray-900 dark:text-white">₹{taxGST.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col gap-1 py-4 border-y border-dashed dark:border-gray-700 mt-2">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Aggregate Quantum</span>
                                <div className="flex items-center justify-between">
                                    <Calculator size={24} className="text-gray-200" />
                                    <span className="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">₹{Math.round(grandTotal).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-[3px] text-[11px] transition-all shadow-2xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 hover:bg-blue-700 dark:shadow-none"
                            disabled={isGenerating}
                            onClick={handleSaveAndPrint}
                        >
                            <Printer size={18} className="font-black" />
                            {isGenerating ? 'GENERATING QUANTUM...' : 'COMMIT & PRINT'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Buffer */}
            <div className="hidden">
                <div ref={printRef}>
                    {generatedBill && <PharmacyBillPrint billData={generatedBill} />}
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
