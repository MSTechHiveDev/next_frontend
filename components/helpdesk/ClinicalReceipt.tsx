"use client";

import React from 'react';
import { Printer, X, Receipt } from 'lucide-react';

interface ReceiptProps {
  hospital: {
    name: string;
    address?: string;
    contact?: string;
    email?: string;
  };
  patient: {
    name: string;
    mrn: string;
    age: string | number;
    gender: string;
    mobile: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    bloodGroup?: string;
    dateOfBirth?: string;
    vitals?: {
        bp?: string;
        pulse?: string;
        temp?: string;
        weight?: string;
        spo2?: string;
    };
  };
  appointment: {
    doctorName: string;
    specialization?: string;
    degree?: string;
    date: string;
    time: string;
    type: string;
    appointmentId: string;
  };
  payment: {
    amount: number;
    method: 'cash' | 'card' | 'upi' | string;
    status: string;
  };
  onClose: () => void;
}

export default function ClinicalReceipt({ hospital, patient, appointment, payment, onClose }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print-specific styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Hide EVERYTHING first */
          body * {
            visibility: hidden !important;
          }
          
          /* Show ONLY the bill container and its children */
          #clinical-bill-print,
          #clinical-bill-print * {
            visibility: visible !important;
          }
          
          /* Position the bill at absolute top */
          #clinical-bill-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 8mm !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          
          /* Compact table cells */
          #clinical-bill-print table td,
          #clinical-bill-print table th {
            padding: 3px 6px !important;
            font-size: 10px !important;
            line-height: 1.25 !important;
          }
          
          /* Compact headings */
          #clinical-bill-print h1 {
            font-size: 16px !important;
            margin-bottom: 2px !important;
            line-height: 1.2 !important;
          }
          
          #clinical-bill-print h2 {
            font-size: 14px !important;
            margin-bottom: 2px !important;
            line-height: 1.2 !important;
          }
          
          #clinical-bill-print h3 {
            font-size: 11px !important;
            padding: 2px 6px !important;
            margin: 0 !important;
            line-height: 1.2 !important;
          }
          
          /* Minimal section spacing */
          #clinical-bill-print > div {
            margin-bottom: 3px !important;
          }
          
          /* Minimal text spacing */
          #clinical-bill-print p {
            margin: 0.5px 0 !important;
            line-height: 1.25 !important;
          }
          
          /* Compact borders */
          #clinical-bill-print .border-b-2 {
            padding-bottom: 2px !important;
            margin-bottom: 2px !important;
            border-width: 1px !important;
          }
          
          /* Reduce text sizes globally */
          #clinical-bill-print .text-sm {
            font-size: 9px !important;
          }
          
          #clinical-bill-print .text-base {
            font-size: 10px !important;
          }
          
          #clinical-bill-print .text-lg {
            font-size: 11px !important;
          }
          
          #clinical-bill-print .text-xs {
            font-size: 8px !important;
          }
          
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Remove modal styling for print */
          .clinical-receipt-modal {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            inset: 0 !important;
            z-index: 0 !important;
          }
          
          .print-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

      <div className="clinical-receipt-modal fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        {/* Action Buttons - Hidden in Print */}
        <div className="absolute top-4 right-4 flex gap-3 no-print z-[100000]">
          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl transition-all"
          >
            <Printer size={18} /> Print Bill
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl shadow-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill Content */}
        <div className="print-content bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div id="clinical-bill-print" className="p-8 print:p-6">
            
            {/* Hospital Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6 print:pb-3 print:mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl print:mb-1">{hospital.name}</h1>
              <p className="text-base text-gray-700 mb-1 print:text-sm">{hospital.address}</p>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mt-2 print:text-xs print:gap-4">
                <span><strong>Phone:</strong> {hospital.contact}</span>
                <span><strong>Email:</strong> {hospital.email}</span>
              </div>
            </div>

            {/* Bill Type & Date */}
            <div className="flex justify-between items-start mb-6 print:mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 print:text-xl">PATIENT REGISTRATION BILL</h2>
                <p className="text-sm text-gray-600 mt-1 print:text-xs">Appointment Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 print:text-xs">Bill Date:</p>
                <p className="text-base font-semibold print:text-sm">{new Date().toLocaleDateString('en-IN')}</p>
                <p className="text-sm text-gray-600 mt-2 print:text-xs print:mt-1">Bill No:</p>
                <p className="text-base font-semibold print:text-sm">{appointment.appointmentId}</p>
              </div>
            </div>

            {/* Patient Details Section */}
            <div className="mb-4 print:mb-3">
              <div className="bg-gray-100 px-4 py-2 mb-3 print:mb-2 print:py-1">
                <h3 className="text-lg font-bold text-gray-900 print:text-base">PATIENT DETAILS</h3>
              </div>
              <table className="w-full border border-gray-300">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm w-1/4">MRN / Patient ID:</td>
                    <td className="px-4 py-2 text-base font-bold">{patient.mrn}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm w-1/4">Blood Group:</td>
                    <td className="px-4 py-2 text-base">{patient.bloodGroup !== "N/A" ? patient.bloodGroup : "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Patient Name:</td>
                    <td className="px-4 py-2 text-base font-semibold">{patient.name}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Date of Birth:</td>
                    <td className="px-4 py-2 text-base">
                      {patient.dateOfBirth && patient.dateOfBirth !== "N/A" 
                        ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN') 
                        : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Age / Gender:</td>
                    <td className="px-4 py-2 text-base">{patient.age} Years / {patient.gender}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Mobile:</td>
                    <td className="px-4 py-2 text-base">{patient.mobile}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Email:</td>
                    <td className="px-4 py-2 text-base">{patient.email !== "N/A" ? patient.email : "-"}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Emergency Contact:</td>
                    <td className="px-4 py-2 text-base">{patient.emergencyContact !== "N/A" ? patient.emergencyContact : "-"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Address:</td>
                    <td colSpan={3} className="px-4 py-2 text-base">{patient.address !== "N/A" ? patient.address : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Doctor & Appointment Details */}
            <div className="mb-4 print:mb-3">
              <div className="bg-gray-100 px-4 py-2 mb-3 print:mb-2 print:py-1">
                <h3 className="text-lg font-bold text-gray-900 print:text-base">APPOINTMENT DETAILS</h3>
              </div>
              <table className="w-full border border-gray-300">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm w-1/4">Consulting Doctor:</td>
                    <td className="px-4 py-2 text-base font-semibold">{appointment.doctorName}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm w-1/4">Appointment Date:</td>
                    <td className="px-4 py-2 text-base">{appointment.date}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Qualification:</td>
                    <td className="px-4 py-2 text-base">{appointment.degree || "MBBS"}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Appointment Time:</td>
                    <td className="px-4 py-2 text-base">{appointment.time}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Specialization:</td>
                    <td className="px-4 py-2 text-base">{appointment.specialization || "-"}</td>
                    <td className="px-4 py-2 bg-gray-50 font-semibold text-sm">Visit Type:</td>
                    <td className="px-4 py-2 text-base">{appointment.type}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Vitals Section */}
            {patient.vitals && (
              <div className="mb-4 print:mb-3">
                <div className="bg-gray-100 px-4 py-2 mb-3 print:mb-2 print:py-1">
                  <h3 className="text-lg font-bold text-gray-900 print:text-base">VITAL SIGNS</h3>
                </div>
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold text-sm border-r border-gray-300">Temperature</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm border-r border-gray-300">Blood Pressure</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm border-r border-gray-300">Pulse Rate</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm border-r border-gray-300">Weight</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm">SpO2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-base border-r border-gray-300">{patient.vitals.temp || "-"} °C</td>
                      <td className="px-4 py-3 text-base border-r border-gray-300">{patient.vitals.bp || "-"}</td>
                      <td className="px-4 py-3 text-base border-r border-gray-300">{patient.vitals.pulse || "-"} bpm</td>
                      <td className="px-4 py-3 text-base border-r border-gray-300">{patient.vitals.weight || "-"} kg</td>
                      <td className="px-4 py-3 text-base">{patient.vitals.spo2 || "-"}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Details */}
            <div className="mb-4 print:mb-3">
              <div className="bg-gray-100 px-4 py-2 mb-3 print:mb-2 print:py-1">
                <h3 className="text-lg font-bold text-gray-900 print:text-base">PAYMENT SUMMARY</h3>
              </div>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-sm border-r border-gray-300">Description</th>
                    <th className="px-4 py-2 text-right font-semibold text-sm w-32">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 text-base">Consultation Fee (OPD)</td>
                    <td className="px-4 py-3 text-base text-right">{payment.amount.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3 text-base">TOTAL AMOUNT</td>
                    <td className="px-4 py-3 text-lg text-right">₹ {payment.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 flex justify-between items-center px-4 print:mt-2 print:px-2">
                <div className="text-sm print:text-xs">
                  <p className="font-semibold">Payment Method: <span className="font-normal uppercase">{payment.method}</span></p>
                  <p className="font-semibold mt-1 print:mt-0">Payment Status: 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      payment.status.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4 print:pt-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-600 mb-1 print:text-[10px]">This is a computer-generated receipt and does not require a signature.</p>
                  <p className="text-xs text-gray-600 print:text-[10px]">Generated on: {new Date().toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700 print:text-xs">Authorized Signatory</p>
                  <div className="border-b border-gray-400 w-48 mt-6 mb-1 print:w-32 print:mt-3"></div>
                  <p className="text-xs text-gray-600 print:text-[10px]">{hospital.name}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
