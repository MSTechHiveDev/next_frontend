import React from 'react';
import { BillPayload } from '@/lib/integrations/types/labBilling';
import Image from 'next/image';

interface BillPrintViewProps {
    billData: BillPayload;
    invoiceId?: string; // Optional because previews might not have it yet
    date?: string;
}

// This component is designed to look like the reference image when printed
// It should be wrapped in a container that typically handles visibility (hidden on screen, visible on print)
// OR used in a modal that is then printed.

const BillPrintView: React.FC<BillPrintViewProps> = ({ billData, invoiceId, date }) => {
    const currentDate = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="p-8 bg-white text-black font-sans max-w-4xl mx-auto" id="printable-bill">
            {/* Header with Logo */}
            <div className="flex flex-col items-center mb-6">
                {/* Placeholder for Logo - In a real app, use the actual URL */}
                <div className="w-24 h-24 relative mb-2">
                    {/* You can replace this with an <img> tag if Next/Image causes print issues with external URLs, 
                or ensure the asset is local. Using a placeholder for now as per constraints. */}
                    <div className="w-full h-full rounded-full border-4 border-blue-900 flex items-center justify-center text-blue-900 font-bold bg-blue-50">
                        LOGO
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">MediLab Laboratory</h1>
                <p className="text-sm text-gray-600 mt-1">Please set your lab address</p>
                <p className="text-sm text-gray-600">Contact: 7987654321 | Email: admin@medilab.com</p>
                <p className="text-sm text-gray-600">GST: 23NA23492N34455</p>
            </div>

            <div className="flex justify-center mb-6 relative">
                <h2 className="text-xl font-bold border-b-2 border-black pb-1 uppercase absolute top-[-10px] bg-white px-2">INVOICE</h2>
                <div className="w-full border-t border-black mt-3"></div>
            </div>


            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-0 border border-black mb-6">

                {/* Invoice Info */}
                <div className="border-r border-black p-4">
                    <h3 className="font-bold text-sm uppercase mb-3 text-blue-900">INVOICE INFORMATION</h3>
                    <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm">
                        <span className="font-semibold text-gray-700">Invoice ID:</span>
                        <span>{invoiceId || 'N/A'}</span>

                        <span className="font-semibold text-gray-700">Date:</span>
                        <span>{currentDate}</span>

                        <span className="font-semibold text-gray-700">Payment Mode:</span>
                        <span>{billData.paymentMode}</span>

                        <span className="font-semibold text-gray-700">Status:</span>
                        <span>{billData.balance > 0 ? (billData.paidAmount > 0 ? "Partial" : "Due") : "Paid"}</span>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="p-4">
                    <h3 className="font-bold text-sm uppercase mb-3 text-blue-900">PATIENT INFORMATION</h3>
                    <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm">
                        <span className="font-semibold text-gray-700">Name:</span>
                        <span>{billData.patientDetails.name}</span>

                        <span className="font-semibold text-gray-700">Age / Gender:</span>
                        <span>{billData.patientDetails.age} Years / {billData.patientDetails.gender}</span>

                        <span className="font-semibold text-gray-700">Mobile:</span>
                        <span>{billData.patientDetails.mobile}</span>

                        <span className="font-semibold text-gray-700">Ref. Doctor:</span>
                        <span>{billData.patientDetails.refDoctor || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse border border-black mb-2 text-sm">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-2 text-left w-12 text-blue-900 uppercase">#</th>
                        <th className="border border-black p-2 text-left text-blue-900 uppercase">TEST DESCRIPTION</th>
                        <th className="border border-black p-2 text-right w-32 text-blue-900 uppercase">AMOUNT (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {billData.items.map((item, index) => (
                        <tr key={index}>
                            <td className="border border-black p-2">{index + 1}</td>
                            <td className="border border-black p-2 font-medium">{item.testName}</td>
                            <td className="border border-black p-2 text-right font-bold">₹{item.price.toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows if needed to make it look full, skipping for now */}
                </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end mb-6">
                <div className="w-64 border border-black text-sm">
                    <div className="flex justify-between p-2 border-b border-gray-300">
                        <span className="font-bold text-gray-700">Total Amount:</span>
                        <span className="font-bold">₹{billData.totalAmount.toFixed(2)}</span>
                    </div>
                    {billData.discount > 0 && (
                        <div className="flex justify-between p-2 border-b border-gray-300">
                            <span className="font-bold text-gray-700">Discount:</span>
                            <span>- ₹{billData.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between p-2 border-b border-gray-300">
                        <span className="font-bold text-gray-700">Final Amount:</span>
                        <span className="font-bold">₹{billData.finalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b border-black">
                        <span className="font-bold text-gray-700">Paid Amount:</span>
                        <span className="font-bold">₹{billData.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50">
                        <span className="font-bold text-gray-700">Status:</span>
                        <span className="font-bold text-right">{billData.balance > 0 ? "Due" : "Paid"}</span>
                    </div>
                </div>
            </div>

            {/* Payment Summary Box (Similar to footer in image) */}
            <div className="border border-black p-3 mb-6 text-sm">
                <div className="flex justify-between mb-1">
                    <span className="font-bold text-gray-700">Payment Mode:</span>
                    <span>{billData.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Payment Status:</span>
                    <span>{billData.balance > 0 ? "Partially Paid" : "Fully Paid"}</span>
                </div>
            </div>

            {/* Terms */}
            <div className="border border-black p-3 text-xs mb-8">
                <h4 className="font-bold text-blue-900 uppercase mb-1">TERMS & CONDITIONS</h4>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Reports are for clinical correlation only.</li>
                    <li>In case of any disparity, please repeat the test.</li>
                </ol>
            </div>

            {/* Footer */}
            <div className="text-center text-xs italic text-gray-500">
                This is a computer-generated invoice. No signature required.
            </div>

            {/* Print Styles Injection */}
            <style jsx global>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-bill, #printable-bill * {
                visibility: visible;
            }
            #printable-bill {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                border: none; /* Remove border for print if browser adds margins */
            }
             /* Small fix to hide Next.js dev overlays if present */
            nextjs-portal, #__next-build-watcher {
                display: none !important;
            }
        }
      `}</style>
        </div>
    );
};

export default BillPrintView;
