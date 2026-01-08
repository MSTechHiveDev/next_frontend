'use client';

import React, { useState, useRef } from 'react';
import { Search, Printer, Sparkles, Plus, Trash2, FileText, User } from 'lucide-react';

// Mock Patient Data
const PATIENTS = [
  { id: 'MRN-12345', name: 'John Doe', age: 45, gender: 'Male' },
  { id: 'MRN-67890', name: 'Sarah Smith', age: 32, gender: 'Female' },
  { id: 'MRN-11223', name: 'Michael Brown', age: 55, gender: 'Male' },
];

export default function PrescriptionPage() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would search the backend. 
    // For demo, we just auto-select the first match if 3 chars entered
    const term = e.target.value;
    if (term.length > 2) {
       const found = PATIENTS.find(p => p.name.toLowerCase().includes(term.toLowerCase()));
       if (found) setSelectedPatient(found);
    }
  };

  const generateAIPrescription = () => {
    setIsGenerating(true);
    // Simulate AI delay
    setTimeout(() => {
        const aiMeds = [
            { name: 'Amoxicillin', dosage: '500mg', freq: '1-0-1', duration: '5 Days', notes: 'After food' },
            { name: 'Paracetamol', dosage: '650mg', freq: '1-0-1', duration: '3 Days', notes: 'For fever' },
            { name: 'Cetirizine', dosage: '10mg', freq: '0-0-1', duration: '5 Days', notes: 'At night' },
        ];
        setMedicines(aiMeds);
        setIsGenerating(false);
    }, 1500);
  };

  const addMedicine = () => {
      setMedicines([...medicines, { name: '', dosage: '', freq: '', duration: '', notes: '' }]);
  };

  const updateMedicine = (index: number, field: string, value: string) => {
      const newMeds = [...medicines];
      newMeds[index][field] = value;
      setMedicines(newMeds);
  };

  const removeMedicine = (index: number) => {
      setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-purple-500" /> AI Prescription
          </h1>
          <p className="text-gray-500 mt-1">Generate smart prescriptions powered by AI.</p>
        </div>
        <button 
            onClick={handlePrint}
            disabled={!selectedPatient || medicines.length === 0}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Printer size={18} /> Print Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
          
          {/* Left Column: Inputs (Hidden on Print) */}
          <div className="space-y-6 print:hidden">
              {/* Patient Selector */}
              <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Patient Details</h3>
                  <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search patient (e.g. John)..." 
                        onChange={handlePatientSearch}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                  </div>
                  
                  {selectedPatient ? (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-purple-600 font-bold">
                              {selectedPatient.name.charAt(0)}
                          </div>
                          <div>
                              <p className="font-bold text-gray-900 dark:text-white">{selectedPatient.name}</p>
                              <p className="text-sm text-gray-500">{selectedPatient.age} Yrs • {selectedPatient.gender}</p>
                              <p className="text-xs font-mono text-gray-400 mt-1">{selectedPatient.id}</p>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
                          <User size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Select a patient to proceed</p>
                      </div>
                  )}
              </div>

              {/* Symptoms & AI */}
              <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Clinical Notes</h3>
                  <textarea 
                      className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl resize-none outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm mb-4"
                      placeholder="Describe symptoms, diagnosis, or clinical observations..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                  ></textarea>
                  
                  <button 
                    onClick={generateAIPrescription}
                    disabled={!selectedPatient || !symptoms}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                      {isGenerating ? (
                          <>Generating...</> 
                      ) : (
                          <><Sparkles size={18} /> Generate AI Suggestion</>
                      )}
                  </button>
              </div>
          </div>

          {/* Right Column: Prescription Preview (Visible on Print) */}
          <div className="lg:col-span-2 print:col-span-3">
              <div id="prescription-preview" className="bg-white text-black p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[600px] flex flex-col relative print:shadow-none print:border-none print:p-0">
                  
                  {/* Print Header */}
                  <div className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-start">
                      <div>
                          <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900">HealthPlus Hospital</h1>
                          <p className="text-sm font-bold text-gray-600 uppercase mt-1">Multi-Specialty Center</p>
                          <p className="text-sm text-gray-500 mt-1">123, Health Avenue, Medical District, NY 10001</p>
                      </div>
                      <div className="text-right">
                          <p className="text-2xl font-bold text-blue-900">Dr. Lakshmi Prasad</p>
                          <p className="text-sm font-bold text-gray-500 uppercase">Senior Consultant</p>
                          <p className="text-sm text-gray-400">Cardiology Dept.</p>
                      </div>
                  </div>

                  {/* Patient Info Bar */}
                  {selectedPatient && (
                      <div className="bg-gray-50 border-y-2 border-gray-200 py-3 px-4 mb-6 flex justify-between text-sm print:bg-transparent print:border-black">
                          <div><span className="font-bold text-gray-500 uppercase mr-2">Patient:</span> <span className="font-bold text-lg">{selectedPatient.name}</span></div>
                          <div><span className="font-bold text-gray-500 uppercase mr-2">Age/Sex:</span> <span className="font-medium">{selectedPatient.age} / {selectedPatient.gender}</span></div>
                          <div><span className="font-bold text-gray-500 uppercase mr-2">Date:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span></div>
                      </div>
                  )}

                  {/* Rx Symbol */}
                  <div className="text-4xl font-serif font-bold text-gray-300 mb-4 ml-2">Rx</div>

                  {/* Medicine List */}
                  <div className="flex-1">
                      {medicines.length > 0 ? (
                          <table className="w-full text-left mb-6">
                              <thead className="bg-gray-50 border-b border-gray-200 print:bg-transparent print:border-black">
                                  <tr>
                                      <th className="py-2 px-2 text-xs font-bold text-gray-500 uppercase w-10">#</th>
                                      <th className="py-2 px-2 text-xs font-bold text-gray-500 uppercase">Medicine Name</th>
                                      <th className="py-2 px-2 text-xs font-bold text-gray-500 uppercase w-24">Dosage</th>
                                      <th className="py-2 px-2 text-xs font-bold text-gray-500 uppercase w-24">Frequency</th>
                                      <th className="py-2 px-2 text-xs font-bold text-gray-500 uppercase w-24">Duration</th>
                                      <th className="py-2 px-2 text-xs font-bold text-gray-500 uppercase print:hidden w-10"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                  {medicines.map((med, idx) => (
                                      <tr key={idx} className="group">
                                          <td className="py-3 px-2 text-sm text-gray-400 font-mono">{idx + 1}</td>
                                          <td className="py-3 px-2">
                                              <input 
                                                type="text" 
                                                value={med.name} 
                                                onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                                                className="w-full bg-transparent outline-none font-bold text-gray-900 placeholder-gray-300" 
                                                placeholder="Medicine Name"
                                              />
                                              <input 
                                                type="text" 
                                                value={med.notes} 
                                                onChange={(e) => updateMedicine(idx, 'notes', e.target.value)}
                                                className="w-full bg-transparent outline-none text-xs text-gray-500 italic mt-1 placeholder-gray-300" 
                                                placeholder="Instructions (e.g. after food)"
                                              />
                                          </td>
                                          <td className="py-3 px-2">
                                              <input type="text" value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="--"/>
                                          </td>
                                          <td className="py-3 px-2">
                                              <input type="text" value={med.freq} onChange={(e) => updateMedicine(idx, 'freq', e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="--"/>
                                          </td>
                                          <td className="py-3 px-2">
                                              <input type="text" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="--"/>
                                          </td>
                                          <td className="py-3 px-2 print:hidden text-right">
                                              <button onClick={() => removeMedicine(idx)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      ) : (
                          <div className="h-48 flex items-center justify-center text-gray-300 text-sm italic border-2 border-dashed border-gray-100 rounded-xl print:hidden">
                              Prescription Area (Empty)
                          </div>
                      )}

                      <button onClick={addMedicine} className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors print:hidden">
                          <Plus size={16} /> Add Medicine
                      </button>
                  </div>

                  {/* Print Footer */}
                  <div className="mt-8 pt-8 border-t-2 border-black flex justify-between items-end">
                      <div className="text-xs text-gray-500">
                          <p>Generated by MSCureChain AI</p>
                          <p>{new Date().toLocaleString()}</p>
                      </div>
                      <div className="text-center w-48">
                         <img src="/assets/signature-placeholder.png" className="h-10 mx-auto opacity-0" alt="" /> {/* Placeholder for spacing */}
                         <div className="h-px bg-black w-full mb-2"></div>
                         <p className="text-xs font-bold uppercase tracking-widest">Doctor's Signature</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
