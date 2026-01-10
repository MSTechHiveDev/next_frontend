import React from 'react';
import { PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';

export interface ShopDetails {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
    dlNo?: string;
    logo?: string;
}

interface PharmacyBillPrintProps {
    billData: PharmacyBill;
    shopDetails: ShopDetails;
}

const PharmacyBillPrint: React.FC<PharmacyBillPrintProps> = ({ billData, shopDetails }) => {
    return (
        <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-black p-8 font-sans leading-tight relative">
            {/* Main Outer Border Box */}
            <div className="border-2 border-black min-h-[250mm] flex flex-col">

                {/* Header Section */}
                <div className="flex p-4 border-b-2 border-black">
                    {/* Logo & Company Details */}
                    <div className="flex-1 flex gap-4">
                        <div className="w-24 h-24 border border-black flex items-center justify-center p-1 overflow-hidden shrink-0">
                            {shopDetails.logo ? (
                                <img
                                    src={shopDetails.logo}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as any).style.display = 'none';
                                        (e.target as any).parentElement.innerHTML = `<div class="font-bold text-xs text-center break-words">${shopDetails.name.substring(0, 10)}</div>`;
                                    }}
                                />
                            ) : (
                                <div className="font-bold text-3xl text-gray-300">{shopDetails.name.charAt(0)}</div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xl font-bold uppercase tracking-wide mb-1">{shopDetails.name}</h1>
                            <p className="text-[10px] max-w-[300px] mb-1 whitespace-pre-line">{shopDetails.address}</p>
                            <div className="text-[10px] space-y-0.5">
                                <p><span className="font-bold">Phone:</span> {shopDetails.phone}</p>
                                <p><span className="font-bold">Email:</span> {shopDetails.email}</p>
                                <p><span className="font-bold">GSTIN:</span> {shopDetails.gstin}</p>
                                {shopDetails.dlNo && <p><span className="font-bold">DL No:</span> {shopDetails.dlNo}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Invoice Meta Box */}
                    <div className="w-48 border border-black h-fit">
                        <div className="text-center font-bold text-xs border-b border-black py-1 bg-gray-50">TAX INVOICE</div>
                        <div className="p-2 space-y-1 text-[10px]">
                            <div className="flex justify-between">
                                <span className="font-semibold">Invoice No:</span>
                                <span>{billData.invoiceId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Date:</span>
                                <span>{new Date(billData.createdAt).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Time:</span>
                                <span>{new Date(billData.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Status:</span>
                                <span className="uppercase font-bold">{billData.paymentSummary.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Details Row */}
                <div className="flex border-b border-black divide-x divide-black text-[10px]">
                    {/* Bill To */}
                    <div className="w-1/2 p-2">
                        <p className="font-bold uppercase text-[9px] text-gray-600 mb-1">Bill To:</p>
                        <p className="font-bold text-sm uppercase">{billData.patientName}</p>
                        <p className="mt-1">Phone: {billData.customerPhone}</p>
                    </div>
                    {/* Ship To */}
                    <div className="w-1/2 p-2">
                        <p className="font-bold uppercase text-[9px] text-gray-600 mb-1">Ship To:</p>
                        <p className="font-bold text-sm uppercase">{billData.patientName}</p>
                        <p className="mt-1">Place of Supply: ANDHRA PRADESH (37)</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex-1">
                    <table className="w-full text-[10px] border-collapse">
                        <thead>
                            <tr className="border-b border-black font-bold text-left">
                                <th className="py-2 px-2 w-[40px] text-center border-r border-black">S.No</th>
                                <th className="py-2 px-2 border-r border-black">Item Description</th>
                                <th className="py-2 px-2 w-[50px] text-center border-r border-black">HSN</th>
                                <th className="py-2 px-2 w-[40px] text-center border-r border-black">Qty</th>
                                <th className="py-2 px-2 w-[60px] text-right border-r border-black">Rate</th>
                                <th className="py-2 px-2 w-[40px] text-right border-r border-black">GST</th>
                                <th className="py-2 px-2 w-[70px] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed divide-gray-300">
                            {billData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-1 px-2 text-center border-r border-black">{index + 1}</td>
                                    <td className="py-1 px-2 border-r border-black font-medium">{item.itemName}</td>
                                    <td className="py-1 px-2 text-center border-r border-black">{item.hsn || '-'}</td>
                                    <td className="py-1 px-2 text-center border-r border-black">{item.qty}</td>
                                    <td className="py-1 px-2 text-right border-r border-black">{Number(item.rate || 0).toFixed(2)}</td>
                                    <td className="py-1 px-2 text-right border-r border-black">{item.gst || item.gstPct || 0}%</td>
                                    <td className="py-1 px-2 text-right font-bold">{Number(item.total || item.amount || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="border-t border-black flex text-[10px]">
                    {/* Left: T&C / Details */}
                    <div className="w-[60%] p-4 border-r border-black flex flex-col justify-between">
                        <div>
                            <p className="font-bold underline mb-1">Terms & Conditions:</p>
                            <ol className="list-decimal list-inside space-y-0.5 text-[9px] text-gray-700">
                                <li>Goods once sold will not be taken back.</li>
                                <li>Interact with doctor for any queries regarding medicine.</li>
                                <li>Subject to local jurisdiction.</li>
                            </ol>
                            <p className="mt-4 font-bold">GSTIN: {shopDetails.gstin}</p>
                        </div>

                        <div className="mt-8 text-[8px] italic text-gray-500">
                            This is a computer generated invoice.
                        </div>
                    </div>

                    {/* Right: Totals */}
                    <div className="w-[40%]">
                        <div className="border-b border-black divide-y divide-gray-200">
                            <div className="flex justify-between px-2 py-1">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{billData.paymentSummary.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between px-2 py-1 text-red-600">
                                <span>Discount:</span>
                                <span>-{billData.paymentSummary.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between px-2 py-1">
                                <span>Taxable Amount:</span>
                                <span className="font-semibold">{billData.paymentSummary.taxableAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between px-2 py-1">
                                <span>Total GST:</span>
                                <span className="font-semibold">{billData.paymentSummary.taxGST.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between px-2 py-2 border-b border-black bg-gray-100 font-bold text-sm">
                            <span>Total Amount:</span>
                            <span>₹{billData.paymentSummary.grandTotal.toFixed(0)}</span>
                        </div>

                        <div className="p-2 space-y-1">
                            <div className="flex justify-between">
                                <span className="font-medium">Amount Paid:</span>
                                <span className="font-bold">₹{billData.paymentSummary.paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Balance Due:</span>
                                <span className="font-bold text-red-600">₹{0.00}</span>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-300">
                                <span className="font-medium">Payment Mode:</span>
                                <span className="font-bold uppercase">{billData.paymentSummary.paymentMode}</span>
                            </div>
                        </div>

                        <div className="mt-8 mb-4 text-center px-4">
                            <p className="border-t border-black pt-1 text-[9px]">Authorized Signatory</p>
                            <p className="text-[8px] font-bold mt-1">For {shopDetails.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-2 text-[9px] font-bold text-gray-400">
                Thank you for your business!
            </div>
        </div>
    );
};

export default PharmacyBillPrint;
