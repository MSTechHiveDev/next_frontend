'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Printer, Save, User, ShoppingCart, CreditCard } from 'lucide-react';
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
    const [price, setPrice] = useState(0); // Editable price
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

    // Calculations (BEFORE Effects using them)
    // Inclusive GST: subtotal is sum of MRPs
    const subtotal = cart.reduce((sum, item: any) => sum + (item.total || 0), 0);
    const totalDiscount = discountType === '%' ? (subtotal * discount / 100) : discount;
    const grandTotal = Math.max(0, subtotal - totalDiscount);

    // Tax is derived FROM the discounted total (MRP is inclusive)
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

    // Auto-update paid amount
    useEffect(() => {
        const roundedTotal = Math.round(grandTotal);
        setPaidAmount(roundedTotal);
        if (paymentMode === 'Mixed') {
            setMixedPayments({ cash: roundedTotal, card: 0, upi: 0 });
        }
    }, [grandTotal, paymentMode]);

    // Search logic
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
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-indigo-600" />
                    Billing
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Details */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4 border-l-4 border-emerald-500 pl-3">
                            <User className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Patient Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Patient Name</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={patientName}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === '' || /^[a-zA-Z\s]*$/.test(val)) {
                                            setPatientName(val);
                                        }
                                    }}
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={mobileNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setMobileNumber(val);
                                    }}
                                    placeholder="Enter mobile (10 digits)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Products */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4 border-l-4 border-indigo-500 pl-3">
                            <Plus className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Add Products</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1 block">Search Product</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Type to search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {searchResults && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                        {searchResults.map(product => (
                                            <div
                                                key={product._id}
                                                className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                                                onClick={() => handleSelectProduct(product)}
                                            >
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{product.brandName}</p>
                                                    <p className="text-xs text-gray-500">{product.genericName} - {product.strength}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xs text-indigo-600">₹{product.mrp}</p>
                                                    <p className="text-[10px] text-gray-400">Stock: {product.currentStock}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={quantity}
                                        min="1"
                                        onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-8 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                            value={price || ''}
                                            min="0"
                                            onChange={e => setPrice(Math.max(0, Number(e.target.value)))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        className="w-full bg-indigo-600 text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                                        onClick={handleAddItem}
                                    >
                                        <Plus className="w-5 h-5" /> Add Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border dark:border-gray-800 overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-gray-700">
                                    <th className="px-6 py-4 text-left">#</th>
                                    <th className="px-6 py-4 text-left">Product</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {cart.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <ShoppingCart className="w-12 h-12 opacity-20" />
                                                <p className="font-bold">Your cart is empty</p>
                                                <p className="text-sm">Add items to proceed</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cart.map((item, index) => (
                                        <tr key={index} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{item.itemName}</td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="number"
                                                    className="w-16 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-2 py-1 text-center font-black outline-none focus:ring-1 focus:ring-indigo-500"
                                                    value={item.qty}
                                                    min="1"
                                                    onChange={e => {
                                                        const newQty = Math.max(1, Number(e.target.value)) || 1;
                                                        const diff = newQty - item.qty;

                                                        // Update cart
                                                        const newCart = [...cart];
                                                        newCart[index] = { ...item, qty: newQty, total: newQty * item.rate };
                                                        setCart(newCart);

                                                        // Update local stock
                                                        const updatedSearchResults = searchResults.map(p =>
                                                            p._id === item.productId ? { ...p, currentStock: p.currentStock - diff } : p
                                                        );
                                                        setSearchResults(updatedSearchResults);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="text-gray-400">₹</span>
                                                    <input
                                                        type="number"
                                                        className="w-20 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-2 py-1 text-right font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={item.rate}
                                                        min="0"
                                                        onChange={e => {
                                                            const newRate = Math.max(0, Number(e.target.value)) || 0;
                                                            const newCart = [...cart];
                                                            newCart[index] = { ...item, rate: newRate, total: item.qty * newRate };
                                                            setCart(newCart);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-indigo-600">₹{(item.total || item.amount || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar - Summary */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border dark:border-gray-800 space-y-6">
                        <div className="flex items-center gap-2 mb-2 border-l-4 border-indigo-500 pl-3">
                            <CreditCard className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Payment & Summary</h2>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Cash', 'UPI', 'Card', 'Mixed'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode as any)}
                                        className={`py-2 rounded-xl text-[10px] font-black transition-all border ${paymentMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                                    >
                                        {mode.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mixed Payment Details */}
                        {paymentMode === 'Mixed' && (
                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-[10px] font-black text-indigo-600 uppercase">Split Amount</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500 w-12">CASH</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-gray-900 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={mixedPayments.cash || ''}
                                            min="0"
                                            onChange={e => {
                                                const val = Math.max(0, Number(e.target.value));
                                                setMixedPayments({ ...mixedPayments, cash: val });
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500 w-12">CARD</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-gray-900 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={mixedPayments.card || ''}
                                            min="0"
                                            onChange={e => {
                                                const val = Math.max(0, Number(e.target.value));
                                                setMixedPayments({ ...mixedPayments, card: val });
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500 w-12">UPI</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-gray-900 border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={mixedPayments.upi || ''}
                                            min="0"
                                            onChange={e => {
                                                const val = Math.max(0, Number(e.target.value));
                                                setMixedPayments({ ...mixedPayments, upi: val });
                                            }}
                                        />
                                    </div>
                                    <div className="pt-2 border-t dark:border-gray-700 flex justify-between text-[10px] font-black text-gray-400">
                                        <span>TOTAL SPLIT:</span>
                                        <span className={Math.abs(mixedPayments.cash + mixedPayments.card + mixedPayments.upi - Math.round(grandTotal)) > 2 ? 'text-red-500' : 'text-emerald-500'}>
                                            ₹{mixedPayments.cash + mixedPayments.card + mixedPayments.upi} / ₹{Math.round(grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status & Discount */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                >
                                    <option>Paid</option>
                                    <option>Partial</option>
                                    <option>Due</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount</label>
                                <div className="flex">
                                    <input
                                        className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-l-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        type="number"
                                        placeholder="0"
                                        value={discount || ''}
                                        min="0"
                                        onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                                    />
                                    <select
                                        className="bg-gray-100 dark:bg-gray-700 border-y border-r dark:border-gray-600 rounded-r-xl px-2 text-xs font-bold outline-none"
                                        value={discountType}
                                        onChange={e => setDiscountType(e.target.value as any)}
                                    >
                                        <option>%</option>
                                        <option>₹</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tax */}


                        {/* Paid Amount */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
                                <input
                                    className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl pl-8 pr-4 py-3 text-lg font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                                    type="number"
                                    value={paidAmount || ''}
                                    min="0"
                                    onChange={e => setPaidAmount(Math.max(0, Number(e.target.value)))}
                                />
                            </div>
                        </div>

                        {/* Calculations Summary */}
                        <div className="space-y-2 pt-4 border-t border-dashed dark:border-gray-700 font-medium">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-gray-800 dark:text-gray-200">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Tax (GST)</span>
                                <span className="text-gray-800 dark:text-gray-200">₹{taxGST.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Grand Total</span>
                                <span className="text-3xl font-black text-emerald-500">₹{Math.round(grandTotal)}</span>
                            </div>
                        </div>

                        <button
                            className="w-full bg-[#b388ff] text-white py-4 rounded-2xl font-black uppercase tracking-[2px] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={isGenerating}
                            onClick={handleSaveAndPrint}
                        >
                            <Printer className="w-5 h-5" />
                            {isGenerating ? 'Processing...' : 'Save and Print'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div className="hidden">
                <div ref={printRef}>
                    {generatedBill && <PharmacyBillPrint billData={generatedBill} />}
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
