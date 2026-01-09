import React from 'react';
import { PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';

interface PharmacyBillPrintProps {
    billData: PharmacyBill;
}

const PharmacyBillPrint: React.FC<PharmacyBillPrintProps> = ({ billData }) => {
    return (
        <div className="p-8 max-w-[800px] mx-auto bg-white text-gray-900 font-sans border-2 border-black">
            {/* Header */}
            <div className="flex justify-between items-stretch border-b-2 border-black pb-4 mb-6 gap-4">
                <div className="flex gap-4 flex-1">
                    <div className="w-18 h-18 bg-white border-2 border-black p-1 flex items-center justify-center">
                        <img
                            src="/assets/logo.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as any).style.display = 'none';
                                (e.target as any).parentElement.innerHTML = '<div class="font-black text-xl">mSana</div>';
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight mb-0.5">DLN MSANA</h1>
                        <p className="text-[10px] font-bold text-gray-800 uppercase leading-tight">Kadapa</p>
                        <p className="text-[10px] text-gray-600 leading-tight">Kadapa, Andhra Pradesh, 518501</p>
                        <p className="text-[10px] text-gray-600 font-black leading-tight">GSTIN: 36ABCDE1234F1Z5</p>
                        <p className="text-[10px] text-gray-600 leading-tight underline">Phone: 7288034327</p>
                        <p className="text-[10px] text-gray-600 leading-tight underline">Email: test01@gmail.com</p>
                    </div>
                </div>

                <div className="text-left border-2 border-black p-3 min-w-[220px] bg-gray-50/30">
                    <h2 className="text-sm font-black uppercase text-center border-b border-black pb-1 mb-2 tracking-widest">Tax Invoice</h2>
                    <div className="space-y-0.5">
                        <p className="text-[10px] flex justify-between"><span className="font-bold">Invoice No:</span> <span className="font-black">INV/{billData.invoiceId}</span></p>
                        <p className="text-[10px] flex justify-between"><span className="font-bold">Date:</span> <span>{new Date(billData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                        <p className="text-[10px] flex justify-between"><span className="font-bold">Time:</span> <span>{new Date(billData.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></p>
                    </div>
                    <div className="mt-2 border-t pt-1 border-black">
                        <p className="text-[10px] font-black uppercase text-center py-0.5 bg-black text-white">Status: {billData.paymentSummary.status}</p>
                    </div>
                </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-2 gap-0 mb-6 border-b-2 border-black divide-x-2 divide-black border-t-2 border-t-black">
                <div className="p-2 min-h-[80px]">
                    <h3 className="text-[9px] font-black uppercase mb-1 text-gray-500">Bill To:</h3>
                    <p className="text-sm font-black uppercase">{billData.patientName}</p>
                    <p className="text-[10px] text-gray-600">Phone: {billData.customerPhone}</p>
                </div>
                <div className="p-2 min-h-[80px]">
                    <h3 className="text-[9px] font-black uppercase mb-1 text-gray-500">Ship To:</h3>
                    <p className="text-sm font-black uppercase">{billData.patientName}</p>
                    <p className="text-[10px] text-gray-600">Place of Supply: Andhra Pradesh</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-6">
                <thead>
                    <tr className="border-y-2 border-black bg-gray-50/50">
                        <th className="py-2 text-left text-[9px] font-black uppercase px-2 w-10">S.No</th>
                        <th className="py-2 text-left text-[9px] font-black uppercase">Item Description</th>
                        <th className="py-2 text-center text-[9px] font-black uppercase w-16">HSN</th>
                        <th className="py-2 text-center text-[9px] font-black uppercase w-12">Qty</th>
                        <th className="py-2 text-right text-[9px] font-black uppercase w-20">Rate</th>
                        <th className="py-2 text-right text-[9px] font-black uppercase w-16">GST%</th>
                        <th className="py-2 text-right text-[9px] font-black uppercase px-2 w-24">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 divide-dashed border-b-2 border-black">
                    {billData.items.map((item, index) => (
                        <tr key={index} className="text-[11px] leading-relaxed">
                            <td className="py-2.5 text-left px-2 border-r border-gray-100">{index + 1}</td>
                            <td className="py-2.5 text-left font-bold uppercase">{item.itemName}</td>
                            <td className="py-2.5 text-center text-gray-400 border-x border-gray-100">{item.hsn || '-'}</td>
                            <td className="py-2.5 text-center font-bold border-r border-gray-100">{item.qty}</td>
                            <td className="py-2.5 text-right font-medium">₹{Number(item.rate || 0).toFixed(2)}</td>
                            <td className="py-2.5 text-right border-x border-gray-100">{item.gst || item.gstPct || 0}%</td>
                            <td className="py-2.5 text-right font-black px-2">₹{Number(item.total || item.amount || 0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Calculations Summary */}
            <div className="flex flex-col items-end gap-1 mb-6 pr-2">
                <div className="flex justify-between w-full max-w-[200px]">
                    <span className="text-[10px] font-bold text-gray-600">Subtotal:</span>
                    <span className="text-[10px] font-bold">₹{billData.paymentSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px]">
                    <span className="text-[10px] font-bold text-gray-600">Taxable Amount:</span>
                    <span className="text-[10px] font-bold">₹{billData.paymentSummary.taxableAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between w-full max-w-[200px] border-y-2 border-black py-2.5 my-1 bg-gray-50/50 px-1">
                    <span className="text-xs font-black uppercase tracking-tighter">Total Amount:</span>
                    <span className="text-lg font-black tracking-tight">₹{billData.paymentSummary.grandTotal.toFixed(0)}</span>
                </div>

                <div className="flex justify-between w-full max-w-[200px] pt-1">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">Paid Amount:</span>
                    <span className="text-[10px] font-black">₹{billData.paymentSummary.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[200px]">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">Payment Mode:</span>
                    <span className="text-[10px] font-black uppercase bg-gray-100 px-1 rounded">{billData.paymentSummary.paymentMode}</span>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="text-left border-t-2 border-black pt-4 mb-4">
                <h4 className="text-[10px] font-black uppercase mb-2 tracking-widest border-b border-black/10 inline-block">Terms & Conditions:</h4>
                <ol className="text-[9px] text-gray-600 space-y-0.5 list-decimal ml-4 uppercase font-bold leading-normal">
                    <li>All medicines are billed as per MRP inclusive of applicable GST, unless otherwise mentioned.</li>
                    <li>Once the bill is generated, no changes or cancellations are allowed.</li>
                    <li>Payment must be made in full at the time of purchase (Cash / Card).</li>
                    <li>GSTIN: 36ABCDE1234F1Z5</li>
                </ol>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-gray-200 pt-4 text-center">
                <p className="text-[11px] font-black uppercase tracking-widest mb-1">Thank you for your business!</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase">This is a computer generated invoice and does not require signature.</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">For queries, contact: 7288034327</p>
            </div>
        </div>
    );
};

export default PharmacyBillPrint;
