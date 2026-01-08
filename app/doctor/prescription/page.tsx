'use client';

import React, { useState, useRef } from 'react';
import { 
  Search, 
  Printer, 
  Sparkles, 
  Plus, 
  Trash2, 
  FileText, 
  User,
  BrainCircuit,
  ArrowRight,
  Stethoscope,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Patient Data
const PATIENTS = [
  { id: 'MRN-88291', name: 'Johnathon Doe', age: 45, gender: 'Male', bloodGroup: 'O+' },
  { id: 'MRN-67890', name: 'Sarah Smith', age: 32, gender: 'Female', bloodGroup: 'A-' },
  { id: 'MRN-11223', name: 'Michael Brown', age: 55, gender: 'Male', bloodGroup: 'B+' },
];

export default function PrescriptionPage() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    if (term.length > 2) {
       const found = PATIENTS.find(p => p.name.toLowerCase().includes(term.toLowerCase()));
       if (found) {
         setSelectedPatient(found);
         toast.success(`Patient Profile Linked: ${found.name}`, { icon: '🔗' });
       }
    }
  };

  const generateAIPrescription = () => {
    if (!symptoms) return toast.error("Clinical symptoms required for AI analysis");
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
        toast.success("AI Diagnostic Protocol Generated", { 
           icon: '🧠',
           style: { borderRadius: '16px', fontWeight: '900', fontSize: '12px' }
        });
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase flex items-center gap-3">
             <BrainCircuit className="text-indigo-600" /> Clinical Prescriptions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">AI-Assisted Diagnostic & Treatment Interface</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            disabled={!selectedPatient || medicines.length === 0}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black hover:bg-black dark:hover:bg-gray-100 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Printer size={18} className="group-hover:scale-110 transition-transform" /> PRINT RX DOCUMENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* Left Panel: Inputs (Hidden on Print) */}
          <div className="lg:col-span-4 space-y-8 print:hidden">
              {/* Patient Profile Selector */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-6 text-gray-400">
                     <User size={16} />
                     <h3 className="text-[10px] font-black uppercase tracking-widest">Patient Linking</h3>
                  </div>
                  
                  <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Scan or Search MRN/Name..." 
                        onChange={handlePatientSearch}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all"
                      />
                  </div>
                  
                  {selectedPatient ? (
                      <div className="p-6 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-3xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                          <div className="flex items-center gap-4 relative z-10">
                              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                                  {selectedPatient.name.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedPatient.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{selectedPatient.age} Yrs • {selectedPatient.gender} • {selectedPatient.bloodGroup}</p>
                                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-indigo-800 mt-2">
                                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                     <span className="text-[9px] font-black text-indigo-500 uppercase">{selectedPatient.id}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center p-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl text-gray-300">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-50 dark:border-gray-700">
                             <User size={32} className="opacity-30" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed px-4">Initialize connection by selecting a patient profile</p>
                      </div>
                  )}
              </div>

              {/* AI Clinical Integration */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-6 text-gray-400">
                     <Stethoscope size={16} />
                     <h3 className="text-[10px] font-black uppercase tracking-widest">Diagnostic Logic</h3>
                  </div>
                  <textarea 
                      className="w-full h-40 p-6 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl resize-none outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all text-xs font-bold mb-6 placeholder:text-gray-400"
                      placeholder="Input clinical observations, symptomology, or diagnostic indices..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                  ></textarea>
                  
                  <button 
                    onClick={generateAIPrescription}
                    disabled={!selectedPatient || !symptoms || isGenerating}
                    className="w-full py-4 bg-linear-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                  >
                      {isGenerating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                          <><Sparkles size={18} /> GENERATE AI PROTOCOL</>
                      )}
                  </button>
              </div>
          </div>

          {/* Right Panel: Rx Preview (Visible on Print) */}
          <div className="lg:col-span-8 print:col-span-12">
              <div className="bg-white text-black p-12 md:p-16 rounded-[3rem] border border-gray-100 shadow-2xl min-h-[850px] flex flex-col relative print:shadow-none print:border-none print:p-0 print:rounded-none">
                  
                  {/* High-End Document Header */}
                  <div className="border-b-4 border-gray-900 pb-10 mb-10 flex flex-col md:flex-row justify-between items-start gap-8">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 bg-gray-900 flex items-center justify-center text-white font-black rounded-xl">CP</div>
                             <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 leading-none">CureChain<br/>PolyClinic</h1>
                          </div>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Precision Global Healthcare Matrix</p>
                          <div className="space-y-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                             <p>102 Clinical Plaza, Innovation District, NY</p>
                             <p>T: +1 800-CURE-HUB • WIB: www.curechain.ai</p>
                          </div>
                      </div>
                      <div className="md:text-right">
                          <p className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Dr. Lakshmi Prasad</p>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1 mb-4">Senior Clinical Specialist (MD, PHD)</p>
                          <div className="inline-flex flex-col md:items-end gap-1.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                             <p className="text-[9px] font-black text-gray-400 uppercase">Registry Index</p>
                             <p className="text-xs font-black text-gray-700 tracking-widest">NMC-8829-XPL</p>
                          </div>
                      </div>
                  </div>

                  {/* Patient Telemetry Bar */}
                  {selectedPatient && (
                      <div className="bg-gray-50/50 border-y-2 border-gray-200 py-4 px-6 mb-10 grid grid-cols-1 md:grid-cols-4 gap-6 text-[10px] font-black uppercase tracking-widest print:bg-transparent print:border-black">
                          <div><span className="text-gray-400 mr-2">Subject:</span> <span className="text-gray-900 text-sm">{selectedPatient.name}</span></div>
                          <div className="md:text-center"><span className="text-gray-400 mr-2">Physiology:</span> <span className="text-gray-900 text-sm">{selectedPatient.age}Y • {selectedPatient.gender}</span></div>
                          <div className="md:text-center"><span className="text-gray-400 mr-2">Hema Group:</span> <span className="text-gray-900 text-sm">{selectedPatient.bloodGroup}</span></div>
                          <div className="md:text-right"><span className="text-gray-400 mr-2">Timestamp:</span> <span className="text-gray-900 text-sm">{new Date().toLocaleDateString()}</span></div>
                      </div>
                  )}

                  {/* Rx Symbol */}
                  <div className="text-6xl font-serif font-black text-gray-100 mb-6 absolute top-72 left-12 pointer-events-none opacity-50">Rx</div>

                  {/* Medication Matrix */}
                  <div className="flex-1 relative z-10">
                      {medicines.length > 0 ? (
                          <div className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b-2 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest print:border-black">
                                <div className="md:col-span-5">Clinical Pharmaceutical</div>
                                <div className="md:col-span-2 text-center">Dosage</div>
                                <div className="md:col-span-2 text-center">Cycle</div>
                                <div className="md:col-span-2 text-center">Span</div>
                                <div className="md:col-span-1 print:hidden"></div>
                             </div>
                             
                             {medicines.map((med, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
                                   <div className="md:col-span-5">
                                       <input 
                                         type="text" 
                                         value={med.name} 
                                         onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                                         className="w-full bg-transparent outline-none font-black text-gray-900 placeholder-gray-200 uppercase tracking-tight text-lg" 
                                         placeholder="DRUG NAME"
                                       />
                                       <input 
                                         type="text" 
                                         value={med.notes} 
                                         onChange={(e) => updateMedicine(idx, 'notes', e.target.value)}
                                         className="w-full bg-transparent outline-none text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1 placeholder-gray-200" 
                                         placeholder="PROTOCOL (E.G. AFTER MEALS)"
                                       />
                                   </div>
                                   <div className="md:col-span-2 text-center">
                                       <input type="text" value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} className="w-full bg-transparent outline-none text-center font-bold text-gray-700" placeholder="--"/>
                                   </div>
                                   <div className="md:col-span-2 text-center">
                                       <input type="text" value={med.freq} onChange={(e) => updateMedicine(idx, 'freq', e.target.value)} className="w-full bg-transparent outline-none text-center font-bold text-gray-700" placeholder="--"/>
                                   </div>
                                   <div className="md:col-span-2 text-center">
                                       <input type="text" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} className="w-full bg-transparent outline-none text-center font-bold text-gray-700" placeholder="--"/>
                                   </div>
                                   <div className="md:col-span-1 text-right print:hidden">
                                       <button onClick={() => removeMedicine(idx)} className="p-2 text-gray-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                   </div>
                                </div>
                             ))}
                          </div>
                      ) : (
                          <div className="h-64 flex flex-col items-center justify-center text-gray-200 border-4 border-dashed border-gray-50 rounded-[2.5rem] print:hidden">
                              <FileText size={48} className="mb-4 opacity-20" />
                              <p className="text-xs font-black uppercase tracking-[0.3em] italic">Awaiting clinical input transmission</p>
                          </div>
                      )}

                      <button onClick={addMedicine} className="mt-8 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2.5 rounded-xl transition-all print:hidden border border-indigo-100">
                          <Plus size={16} /> APPEND DRUG ENTRY
                      </button>
                  </div>

                  {/* High-Integrity Document Footer */}
                  <div className="mt-16 pt-10 border-t-2 border-gray-900 flex flex-col md:flex-row justify-between items-end gap-12">
                      <div className="text-[9px] font-black text-gray-400 uppercase space-y-2">
                          <p>Verifiable Digital ID: SHA-256/MSC-993-882-1</p>
                          <p>Generated: {new Date().toLocaleString().toUpperCase()}</p>
                          <p>© CURECHAIN MEDICARE SYSTEM V4.2</p>
                      </div>
                      <div className="text-center w-64">
                         <div className="mb-4 h-16 flex items-center justify-center relative">
                            <img src="/signature-line.png" className="absolute bottom-0 w-full opacity-10" alt="" />
                            <p className="font-serif italic text-2xl text-indigo-800 opacity-60">Dr. Lakshmi Prasad</p>
                         </div>
                         <div className="h-0.5 bg-gray-900 w-full mb-3"></div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Authorized Medical Signature</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
