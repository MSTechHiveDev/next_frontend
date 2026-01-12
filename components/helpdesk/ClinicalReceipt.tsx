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

  React.useEffect(() => {
    // Auto-trigger print after a short delay to ensure rendering is complete
    const timer = setTimeout(() => {
      handlePrint();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
            background: white !important;
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
            color: #0f172a !important; /* text-slate-900 */
          }
          
          /* Compact table cells */
          #clinical-bill-print table td,
          #clinical-bill-print table th {
            padding: 4px 8px !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
            border-color: #f1f5f9 !important; /* border-slate-100 */
          }

          #clinical-bill-print table th {
            background-color: #f8fafc !important; /* bg-slate-50 */
          }
          
          /* Compact headings */
          #clinical-bill-print h1 {
            font-size: 20px !important;
            margin-bottom: 4px !important;
            color: #0d9488 !important; /* text-teal-600 */
          }
          
          #clinical-bill-print h2 {
            font-size: 16px !important;
            margin-bottom: 4px !important;
            color: #0d9488 !important; /* text-teal-600 */
          }
          
          #clinical-bill-print .border-b-2 {
            border-color: #0d9488 !important;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        {/* Action Buttons - Hidden in Print */}
        <div className="absolute top-4 right-4 flex gap-3 no-print z-50">
          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Printer size={18} /> Print Record
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white hover:bg-slate-50 text-slate-500 rounded-xl shadow-lg transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill Content */}
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
          <div id="clinical-bill-print" className="p-10 text-slate-900">
            
            {/* Hospital Header */}
            <div className="text-center border-b-2 border-teal-600 pb-6 mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter uppercase">{hospital.name}</h1>
              <p className="text-sm font-medium text-slate-400 mb-1">{hospital.address}</p>
              <div className="flex items-center justify-center gap-8 text-xs font-bold text-teal-600 mt-3 uppercase tracking-widest">
                <span>Phone: {hospital.contact}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>Email: {hospital.email}</span>
              </div>
            </div>

            {/* Bill Info */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Clinical Manifest</h2>
                <p className="text-xl font-bold text-slate-900 uppercase">Patient Registration Bill</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Reference # {appointment.appointmentId}</p>
                <p className="text-sm font-bold text-teal-600 mt-1">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Sections Mapping */}
            <div className="space-y-8">
                {/* 1. Patient Data */}
                <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-4 h-px bg-slate-200" /> Patient Profile
                    </h3>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase w-1/4 border border-slate-100">Patient Name</td>
                                <td className="py-3 px-4 text-sm font-bold text-slate-900 border border-slate-100">{patient.name}</td>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase w-1/4 border border-slate-100">MRN ID</td>
                                <td className="py-3 px-4 text-sm font-bold text-teal-600 border border-slate-100">{patient.mrn}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border border-slate-100">Age / Gender</td>
                                <td className="py-3 px-4 text-sm font-bold text-slate-900 border border-slate-100">{patient.age}Y • {patient.gender}</td>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border border-slate-100">Mobile</td>
                                <td className="py-3 px-4 text-sm font-bold text-slate-900 border border-slate-100">{patient.mobile}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* 2. Clinical Data */}
                <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-4 h-px bg-slate-200" /> Appointment Logic
                    </h3>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase w-1/4 border border-slate-100">Assigned Doctor</td>
                                <td className="py-3 px-4 text-sm font-bold text-slate-900 border border-slate-100">{appointment.doctorName}</td>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase w-1/4 border border-slate-100">Department</td>
                                <td className="py-3 px-4 text-sm font-bold text-teal-600 border border-slate-100">{appointment.specialization || "General Medicine"}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border border-slate-100">Schedule</td>
                                <td className="py-3 px-4 text-sm font-bold text-slate-900 border border-slate-100">{appointment.date} @ {appointment.time}</td>
                                <td className="py-3 px-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border border-slate-100">Visit Type</td>
                                <td className="py-3 px-4 text-sm font-bold text-slate-900 border border-slate-100 uppercase">{appointment.type}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* 3. Vitals */}
                {patient.vitals && (
                    <section>
                         <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-4 h-px bg-slate-200" /> Vital Statistics
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { l: 'Temp', v: patient.vitals.temp || '-', u: '°F' },
                                { l: 'BP', v: patient.vitals.bp || '-', u: '' },
                                { l: 'Pulse', v: patient.vitals.pulse || '-', u: 'BPM' },
                                { l: 'Weight', v: patient.vitals.weight || '-', u: 'KG' },
                                { l: 'SpO2', v: patient.vitals.spo2 || '-', u: '%' },
                            ].map((v, i) => (
                                <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{v.l}</p>
                                    <p className="text-sm font-bold text-slate-900">{v.v} <span className="text-[10px] text-slate-400 font-medium">{v.u}</span></p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Billing */}
                <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-4 h-px bg-slate-200" /> Revenue Summary
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="py-3 px-6 text-left">Description</th>
                                    <th className="py-3 px-6 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="py-4 px-6 text-sm font-bold text-slate-700">Registration & Consultation Fee</td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right">{payment.amount.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-slate-900 font-bold">
                                    <td className="py-4 px-6 text-sm text-white uppercase">Gross Total</td>
                                    <td className="py-4 px-6 text-xl text-teal-400 text-right tracking-tight">₹ {payment.amount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white p-2">
                        <p>Status: <span className="text-emerald-500 font-bold">{payment.status}</span></p>
                        <p>Gateway: <span className="text-teal-600 font-bold">{payment.method}</span></p>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Digital Healthcare Protocol v3.0</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">System Timestamp: {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <div className="w-48 border-b border-slate-200 mb-2 ml-auto" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Registrar</p>
                </div>
            </div>

          </div>
        </div>
        
        <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>
      </div>
    </>
  );
}
