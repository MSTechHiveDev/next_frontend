import React from 'react';
import { PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';

interface PharmacyBillPrintProps {
    billData: PharmacyBill;
}

const PharmacyBillPrint: React.FC<PharmacyBillPrintProps> = ({ billData }) => {
    return (
        <div className="p-8 max-w-[800px] mx-auto bg-white text-gray-900 font-sans border border-gray-300">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 border-2 border-black rounded-lg flex items-center justify-center p-2">
                        {/* Placeholder for Logo */}
                        <div className="grid grid-cols-3 gap-1">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-full border border-indigo-600"></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">DLN MSANA</h1>
                        <p className="text-sm font-semibold text-gray-600">Kadapa</p>
                        <p className="text-sm text-gray-500">Kadapa, Andhra Pradesh, 518501</p>
                        <p className="text-sm text-gray-500 font-bold">GSTIN: 36ABCDE1234F1Z5</p>
                        <p className="text-sm text-gray-500">Phone: 7288034327</p>
                        <p className="text-sm text-gray-500">Email: test01@gmail.com</p>
                    </div>
                </div>
                <div className="text-right border-2 border-black p-4 min-w-[200px]">
                    <h2 className="text-xl font-black uppercase mb-1">Tax Invoice</h2>
                    <p className="text-sm"><span className="font-bold">Invoice No:</span> {billData.invoiceId}</p>
                    <p className="text-sm"><span className="font-bold">Date:</span> {new Date(billData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm"><span className="font-bold">Time:</span> {new Date(billData.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    <div className="mt-2 border-t pt-1 border-gray-400">
                        <p className="text-sm font-black uppercase">Status: {billData.paymentSummary.status}</p>
                    </div>
                </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border-t border-black pt-2">
                    <h3 className="text-sm font-black uppercase mb-2">Bill To:</h3>
                    <p className="text-lg font-bold">{billData.patientDetails.name}</p>
                    <p className="text-sm text-gray-600">Phone: {billData.patientDetails.mobile}</p>
                </div>
                <div className="border-t border-black pt-2">
                    <h3 className="text-sm font-black uppercase mb-2">Ship To:</h3>
                    <p className="text-lg font-bold">{billData.patientDetails.name}</p>
                    <p className="text-sm text-gray-600">Place of Supply: Andhra Pradesh</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-8 border-y-2 border-black">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        <th className="py-2 text-left text-xs font-black uppercase">S.No</th>
                        <th className="py-2 text-left text-xs font-black uppercase">Item Description</th>
                        <th className="py-2 text-center text-xs font-black uppercase">HSN</th>
                        <th className="py-2 text-center text-xs font-black uppercase">Qty</th>
                        <th className="py-2 text-right text-xs font-black uppercase">Rate</th>
                        <th className="py-2 text-right text-xs font-black uppercase">GST%</th>
                        <th className="py-2 text-right text-xs font-black uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-b-2 border-gray-400 border-dotted">
                    {billData.items.map((item, index) => (
                        <tr key={index} className="text-sm">
                            <td className="py-3 text-left">{index + 1}</td>
                            <td className="py-3 text-left font-bold">{item.itemName}</td>
                            <td className="py-3 text-center text-gray-500">{item.hsn || '-'}</td>
                            <td className="py-3 text-center font-bold">{item.qty}</td>
                            <td className="py-3 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="py-3 text-right">{item.gst}%</td>
                            <td className="py-3 text-right font-bold">₹{item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary */}
            <div className="flex flex-col items-end gap-2 mb-8 pr-2 border-b-2 border-gray-200 pb-4">
                <div className="flex justify-between w-full max-w-[250px]">
                    <span className="text-sm font-semibold">Subtotal:</span>
                    <span className="text-sm font-bold">₹{billData.paymentSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[250px]">
                    <span className="text-sm font-semibold">Taxable Amount:</span>
                    <span className="text-sm font-bold">₹{billData.paymentSummary.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[250px] border-y-2 border-black py-2 mt-2">
                    <span className="text-lg font-black uppercase">Total Amount:</span>
                    <span className="text-2xl font-black">₹{billData.paymentSummary.grandTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[250px] pt-1">
                    <span className="text-sm font-semibold">Paid Amount:</span>
                    <span className="text-sm font-bold">₹{billData.paymentSummary.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[250px]">
                    <span className="text-sm font-semibold">Payment Mode:</span>
                    <span className="text-sm font-black uppercase">{billData.paymentSummary.paymentMode}</span>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="text-left border-t-2 border-black pt-4">
                <h4 className="text-sm font-black uppercase mb-2 tracking-wider">Terms & Conditions:</h4>
                <ol className="text-[10px] text-gray-700 space-y-1 list-decimal ml-4 uppercase font-semibold">
                    <li>All medicines are billed as per MRP inclusive of applicable GST, unless otherwise mentioned.</li>
                    <li>Once the bill is generated, no changes or cancellations are allowed.</li>
                    <li>Payment must be made in full at the time of purchase (Cash / Card).</li>
                    <li>GSTIN: 36ABCDE1234F1Z5</li>
                </ol>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-sm font-bold">Thank you for your business!</p>
                <p className="text-[10px] text-gray-500 italic mt-1 uppercase">This is a computer generated invoice and does not require signature.</p>
                <p className="text-[10px] text-gray-500 uppercase">For queries, contact: 7288034327</p>
            </div>
        </div>
    );
};

export default PharmacyBillPrint;
