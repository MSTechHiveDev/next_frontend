"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Loader2, 
  Beaker, 
  Printer, 
  Clock, 
  Activity,
  CheckCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doctorService } from '@/lib/integrations/services/doctor.service';
import { getAppointmentDetailsAction, getDoctorProfileAction } from '@/lib/integrations/actions/doctor.actions';

export default function CreateLabTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tests, setTests] = useState([
    { name: '', category: 'Blood Test', instructions: '', price: 0 }
  ]);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [notes, setNotes] = useState('');
  
  // Dynamic Data State
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [testCategories, setTestCategories] = useState<string[]>([]);
  
  // Search State for each row
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [patientData, setPatientData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [tokenNumber, setTokenNumber] = useState<string>('');
  
  // Success State
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<{labToken: string, billing: string} | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (appointmentId) {
      const fetchDetails = async () => {
        const res = await getAppointmentDetailsAction(appointmentId);
        if (res.success && res.data) {
          setPatientData(res.data.patient || res.data.patientDetails);
        }
      };
      fetchDetails();
    }
  }, [appointmentId]);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getDoctorProfileAction();
      if (res.success && res.data) {
        setDoctorData(res.data);
      }
    };
    fetchProfile();
  }, []);

  // Fetch Lab Tests
  useEffect(() => {
    const fetchTests = async () => {
        try {
            const res = await doctorService.getLabTests();
            if (res) {
                setAvailableTests(res);
                const categories = Array.from(new Set(res.map((t: any) => t.departmentId?.name || t.category || 'General')));
                setTestCategories(categories as string[]);
            }
        } catch (err) {
            console.error("Failed to fetch lab tests", err);
        }
    };
    fetchTests();
  }, []);

  const addTest = () => {
    setTests([...tests, { name: '', category: 'Blood Test', instructions: '', price: 0 }]);
  };

  // Handle Test Search
  const handleSearch = (query: string, index: number) => {
      const updated = [...tests];
      updated[index] = { ...updated[index], name: query };
      setTests(updated);

      if (!query) {
          setSearchResults([]);
          return;
      }

      setActiveSearchIndex(index);
      const filtered = availableTests.filter((t: any) => 
          (t.testName || t.name).toLowerCase().includes(query.toLowerCase()) || 
          (t.testCode || '').toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10)); // Limit to 10
  };

  const selectTest = (test: any, index: number) => {
      const updated = [...tests];
      updated[index] = {
          name: test.testName || test.name,
          category: test.departmentId?.name || 'General',
          instructions: '',
          price: test.price || 0
      };
      setTests(updated);
      setActiveSearchIndex(null);
      setSearchResults([]);
      calculateBilling(updated);
  };


  const removeTest = (index: number) => {
    setTests(tests.filter((_, i) => i !== index));
  };

  const updateTest = (index: number, field: string, value: string | number) => {
    const updated = [...tests];
    updated[index] = { ...updated[index], [field]: value };
    setTests(updated);
    if (field === 'price') {
      calculateBilling(updated);
    }
  };

  const calculateBilling = (currentTests = tests) => {
    const sub = currentTests.reduce((sum, test) => sum + (parseFloat(String(test.price)) || 0), 0);
    const taxAmt = sub * 0.18;
    const tot = sub + taxAmt;
    setSubtotal(sub);
    setTax(taxAmt);
    setTotal(tot);
  };

  const handleSubmit = async () => {
    if (tests.filter(t => t.name.trim()).length === 0) {
      toast.error('Please add at least one test');
      return;
    }

    try {
      setIsSaving(true);
      const res = await doctorService.createLabToken({
        appointmentId,
        tests: tests.filter(t => t.name.trim()),
        priority,
        notes
      });

      if (res.success) {
        const genTokenNumber = res.labToken?.tokenNumber || `LAB-${Date.now()}`;
        setTokenNumber(genTokenNumber);
        
        // Calculate billing
        calculateBilling();

        // Generate Lab Token HTML
        const labTokenHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lab Token</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 12mm 15mm 12mm 25mm; }
              }
              body { font-family: Arial, sans-serif; background: white; }
              .header { text-align: center; border-bottom: 4px solid #9333ea; padding-bottom: 10px; margin-bottom: 20px; }
              .token-badge { background: #1f2937; color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
              th { background: #f9fafb; font-weight: bold; }
              .priority { padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
              .priority-stat { background: #dc2626; color: white; }
              .priority-urgent { background: #f97316; color: white; }
              .priority-routine { background: #2563eb; color: white; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="color: #9333ea; margin: 0; font-size: 24px;">LAB REQUISITION</h1>
              <h2 style="margin: 8px 0; font-size: 18px;">${doctorData?.hospital?.name || 'RIMS Government General Hospital Kadapa'}</h2>
              <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Department of Pathology & Radiodiagnosis</p>
              <div class="token-badge" style="margin-top: 12px;">
                <p style="margin: 0; font-size: 10px; opacity: 0.7;">TOKEN</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">${genTokenNumber}</p>
              </div>
              <p style="margin-top: 8px; font-size: 12px;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
              <span class="priority priority-${priority}">${priority}</span>
            </div>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="margin: 4px 0;"><strong>Patient:</strong> ${patientData?.name || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Age/Gender:</strong> ${patientData?.age}Y / ${patientData?.gender}</p>
              <p style="margin: 4px 0;"><strong>MRN:</strong> ${patientData?.mrn || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Ordering Physician:</strong> Dr. ${doctorData?.user?.name || doctorData?.name || 'Medical Officer'}</p>
            </div>

            <h3 style="color: #9333ea; font-size: 14px; margin-bottom: 12px;">CLINICAL INVESTIGATIONS</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Instructions</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${tests.filter(t => t.name.trim()).map((test, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td style="font-weight: bold;">${test.name}</td>
                    <td>${test.category}</td>
                    <td style="font-style: italic; color: #6b7280;">${test.instructions || 'Standard'}</td>
                    <td style="text-align: right; font-weight: 600;">₹${(parseFloat(String(test.price)) || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${notes ? `<div style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; font-size: 12px;">Physician Remarks:</p>
              <p style="margin: 4px 0 0 0; font-style: italic;">${notes}</p>
            </div>` : ''}

            <div style="text-align: right; margin-top: 40px;">
              <p style="font-family: cursive; font-size: 18px; font-weight: bold; margin-bottom: 4px;">Dr. ${doctorData?.user?.name || doctorData?.name || 'Medical Officer'}</p>
              <p style="border-top: 1px solid #000; display: inline-block; padding-top: 4px; font-size: 10px;">Medical Officer</p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 8px; text-align: center; font-size: 8px; color: #9ca3af;">
              <p style="margin: 0;">Generated by MsCureChain • ${new Date().toLocaleString()}</p>
            </div>
          </body>
          </html>
        `;

        // Generate Billing HTML
        const billingHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lab Billing Receipt</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 12mm 15mm; }
              }
              body { font-family: Arial, sans-serif; background: white; }
              .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              th, td { border: 1px solid #e5e7eb; padding: 10px; }
              th { background: #f3f4f6; font-weight: bold; text-align: left; }
              .summary { background: #f9fafb; padding: 16px; border-radius: 8px; max-width: 300px; margin-left: auto; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">LAB BILLING RECEIPT</h1>
              <h2 style="margin: 8px 0; font-size: 18px;">RIMS Government General Hospital Kadapa</h2>
            </div>
            
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 4px 0;"><strong>Patient:</strong> ${patientData?.name || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>MRN:</strong> ${patientData?.mrn || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
              <p style="margin: 4px 0;"><strong>Token:</strong> ${genTokenNumber}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${tests.filter(t => t.name.trim()).map(test => `
                  <tr>
                    <td style="font-weight: 600;">${test.name}</td>
                    <td>${test.category}</td>
                    <td style="text-align: right; font-weight: 600;">₹${(parseFloat(String(test.price)) || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Subtotal:</strong></span>
                <span style="font-weight: 600;">₹${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span><strong>Tax (18% GST):</strong></span>
                <span style="font-weight: 600;">₹${tax.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-top: 2px solid #d1d5db; padding-top: 12px; margin-top: 12px; font-size: 16px;">
                <span style="font-weight: bold;">Total Amount:</span>
                <span style="font-weight: bold; color: #16a34a;">₹${total.toFixed(2)}</span>
              </div>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 12px; text-align: center; font-size: 10px; color: #9ca3af;">
              <p style="margin: 0;">Thank you for choosing RIMS Hospital</p>
              <p style="margin: 4px 0 0 0;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </body>
          </html>
        `;

        // Save HTML for printing
        setGeneratedHtml({
          labToken: labTokenHtml,
          billing: billingHtml
        });
        setShowSuccess(true);
        toast.success('Lab Token Created Successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create lab token');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintDocument = (type: 'labToken' | 'billing') => {
    if (!generatedHtml) return;
    
    const html = type === 'labToken' ? generatedHtml.labToken : generatedHtml.billing;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print after content loads
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast.error('Please allow popups to print documents');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-4xl mx-auto p-6 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Beaker className="text-purple-600" size={28} />
                Lab Investigation Request
              </h1>
              <p className="text-sm text-gray-500">Create token for laboratory tests</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-6">
          {/* Priority */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Request Priority</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'routine', label: 'Routine', color: 'blue' },
                { value: 'urgent', label: 'Urgent', color: 'orange' },
                { value: 'stat', label: 'Immediate (STAT)', color: 'red' }
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value as any)}
                  className={`p-4 rounded-xl border-2 font-bold transition-all text-sm ${
                    priority === p.value
                      ? `border-${p.color}-600 bg-${p.color}-50 dark:bg-${p.color}-900/20 text-${p.color}-700 dark:text-${p.color}-400`
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Investigations</label>
              <button
                onClick={addTest}
                className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-bold bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full transition-all"
              >
                <Plus size={14} />
                Add Test
              </button>
            </div>
            
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="group relative bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:border-purple-200 dark:hover:border-purple-900/50">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Test Name *</label>
                          <div className="relative">
                            <input
                                type="text"
                                value={test.name}
                                onChange={(e) => handleSearch(e.target.value, index)}
                                onFocus={() => handleSearch(test.name, index)}
                                placeholder="Search test..."
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                            />
                            {activeSearchIndex === index && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                    {searchResults.map((res: any) => (
                                        <button
                                            key={res._id}
                                            onClick={() => selectTest(res, index)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="text-sm font-bold text-slate-700 group-hover:text-purple-600">{res.testName || res.name}</div>
                                                <div className="text-xs text-slate-400">{res.departmentId?.name || 'General'}</div>
                                            </div>
                                            <div className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                                ₹{res.price}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeSearchIndex === index && (
                                <div 
                                    className="fixed inset-0 z-40 bg-transparent" 
                                    onClick={() => setActiveSearchIndex(null)}
                                />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
                          <select
                            value={test.category}
                            onChange={(e) => updateTest(index, 'category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                          >
                            {testCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Instructions</label>
                          <input
                            type="text"
                            value={test.instructions}
                            onChange={(e) => updateTest(index, 'instructions', e.target.value)}
                            placeholder="e.g. Fasting required"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Price (₹)</label>
                          <input
                            type="number"
                            value={test.price}
                            onChange={(e) => updateTest(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>
                    {tests.length > 1 && (
                      <button
                        onClick={() => removeTest(index)}
                        className="self-start mt-7 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Additional Clinical Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific information for the pathologist or radiologist..."
              rows={3}
              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-[2] px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create & Print Documents
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && generatedHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Lab Token Created!</h2>
              <p className="text-gray-500">Ready to print documents</p>
            </div>
            
            <div className="grid gap-3">
              <button 
                onClick={() => handlePrintDocument('labToken')}
                className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print Lab Token
              </button>
              <button 
                onClick={() => handlePrintDocument('billing')}
                className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print Billing Receipt
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={() => router.push(`/doctor/appointment/${appointmentId}`)}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
              >
                Done & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
