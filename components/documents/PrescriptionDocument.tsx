
import React from 'react';

// Common interfaces
interface Medicine {
  name: string;
  instructions?: string;
  dosage: string;
  frequency: string;
  duration: string;
  freq?: string;
}

interface PrescriptionDocumentProps {
  prescription: any; // Using any to match existing data structures
  patient?: any;
  doctor?: any;
  hospital?: any;
}

// Hardcoded safe colors to avoid 'lab'/'oklch' CSS function errors in html2canvas
const colors = {
    blue600: '#2563eb',
    blue500: '#3b82f6',
    blue400: '#60a5fa',
    blue100: '#dbeafe',
    blue100Translucent: 'rgba(219, 234, 254, 0.3)',
    blue50Translucent: 'rgba(239, 246, 255, 0.4)',
    gray900: '#111827',
    gray800: '#1f2937',
    gray700: '#374151',
    gray600: '#4b5563',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray300: '#d1d5db',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#f9fafb',
    white: '#ffffff',
    rose600: '#e11d48',
};

export const PrescriptionDocument: React.FC<PrescriptionDocumentProps> = ({ 
  prescription, 
  patient: propPatient, 
  doctor: propDoctor, 
  hospital: propHospital 
}) => {
  // Fallback logic to robustly get data regardless of where it's nested
  const rx = prescription || {};
  
  const patient = 
    propPatient || 
    rx.patient || 
    rx.appointment?.patient || 
    rx.appointment?.patientDetails || 
    {};
    
  const doctor = 
    propDoctor || 
    rx.doctor || 
    rx.appointment?.doctor || 
    {};
    
  const hospital = 
    propHospital || 
    rx.hospital || 
    rx.appointment?.hospital || 
    {
      name: 'RIMS Government General Hospital Kadapa',
      address: 'RIMS Road, Putlampalli, Kadapa, Andhra Pradesh'
    };

  return (
    <div className="relative font-sans print-prescription-document" 
         style={{ 
            width: '210mm', 
            height: '296mm', 
            margin: '0 auto', 
            padding: '12mm 15mm 12mm 25mm',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            overflow: 'hidden', // Ensure content stays within A4
            color: colors.gray900
         }}>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4" style={{ borderBottom: `2px solid ${colors.blue500}` }}>
            <div className="flex gap-4">
                <div className="w-16 h-16">
                    {/* Ensure logo path is absolute or correct. Using /logo.png as per original */}
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        style={{ opacity: 0.9 }} 
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} 
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter italic leading-none" style={{ color: colors.blue600 }}>PRESCRIPTION</h1>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: colors.gray400 }}>Medical Record Node • Verified Registry</p>
                    <div className="mt-2" style={{ color: colors.gray800 }}>
                        <h2 className="font-black text-lg uppercase leading-none">{hospital.name}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-tight mt-1" style={{ color: colors.gray500 }}>{hospital.address}</p>
                    </div>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
                <div className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1" style={{ backgroundColor: colors.gray900, color: colors.white }}>Official Document</div>
                <p className="text-[10px] font-black uppercase" style={{ color: colors.gray900 }}>Date: <span className="font-medium">{new Date(rx.createdAt || new Date()).toLocaleDateString('en-GB')}</span></p>
                <p className="text-[10px] font-black uppercase tracking-tighter" style={{ color: colors.gray900 }}>RX ID: <span className="font-medium" style={{ color: colors.blue600 }}>#{rx._id?.slice(-8).toUpperCase()}</span></p>
            </div>
        </div>

        {/* Patient & Doctor Card */}
        <div className="rounded-xl p-6 mb-6 grid grid-cols-2 gap-x-8 gap-y-3 text-xs" 
             style={{ 
                 backgroundColor: colors.blue50Translucent, 
                 border: `1px solid ${colors.blue100Translucent}` 
             }}>
            <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.blue600 }}>Patient Details</p>
                <p className="text-base font-black uppercase tracking-tight inline-block" style={{ color: colors.gray900, borderBottom: `1px solid ${colors.gray200}` }}>{patient.name}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: colors.gray600 }}>
                    <span>{patient.age}Y</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    <span>•</span>
                    <span>MRN: {patient.mrn || 'N/A'}</span>
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.blue600 }}>Prescribing Physician</p>
                <p className="text-base font-black uppercase tracking-tight" style={{ color: colors.gray900 }}>Dr. {doctor.name || 'Medical Officer'}</p>
                <div className="text-[10px] font-bold" style={{ color: colors.gray600 }}>
                    <span>{doctor.specialization || 'General Medicine'}</span>
                </div>
            </div>

            <div className="col-span-2 space-y-1 mt-1 pt-2" style={{ borderTop: `1px solid ${colors.blue100Translucent}` }}>
                <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.blue600 }}>Clinical Diagnosis</p>
                <p className="text-[11px] font-bold italic leading-snug truncate" style={{ color: colors.gray800 }}>"{rx.diagnosis || 'General Consultation'}"</p>
            </div>
        </div>

        {/* Rx Symbol */}
        <div className="mb-4 pl-2" style={{ opacity: 0.8 }}>
            <span className="text-3xl font-serif italic" style={{ color: colors.blue600 }}>Rx</span>
        </div>

        {/* Medicines List */}
        <div className="mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b pb-1" style={{ color: colors.gray900, borderColor: colors.gray200 }}>Prescribed Medications</h3>
            <ul className="space-y-4">
                {rx.medicines?.map((med: Medicine, idx: number) => (
                    <li key={idx} className="flex justify-between items-start pb-3" style={{ borderBottom: `1px solid ${colors.gray50}` }}>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[12px] font-bold uppercase" style={{ color: colors.gray900 }}>{idx + 1}. {med.name}</span>
                                <span className="text-[10px] font-medium" style={{ color: colors.gray600 }}>({med.dosage})</span>
                            </div>
                            {med.instructions && (
                                <p className="text-[9px] mt-1 italic" style={{ color: colors.gray500 }}>
                                    Note: {med.instructions}
                                </p>
                            )}
                        </div>
                        <div className="text-right pl-4">
                            <p className="text-[10px] font-bold uppercase" style={{ color: colors.gray800 }}>{med.frequency || med.freq}</p>
                            <p className="text-[9px]" style={{ color: colors.gray500 }}>Duration: {med.duration}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
                <h3 className="text-[9px] font-black uppercase tracking-widest mb-3 pb-1" style={{ color: colors.blue600, borderBottom: `1px solid ${colors.gray100}` }}>Dietary Regimen</h3>
                <ul className="space-y-1.5">
                    {rx.dietAdvice?.length > 0 ? rx.dietAdvice.map((item: string, idx: number) => (
                        <li key={idx} className="text-[10px] font-bold flex items-start gap-1.5" style={{ color: colors.gray700 }}>
                            <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: colors.blue400 }} /> {item}
                        </li>
                    )) : <li className="text-[10px] italic" style={{ color: colors.gray300 }}>No specific dietary advice</li>}
                </ul>
            </div>
            <div>
                <h3 className="text-[9px] font-black uppercase tracking-widest mb-3 pb-1" style={{ color: colors.blue600, borderBottom: `1px solid ${colors.gray100}` }}>Investigations Required</h3>
                <ul className="space-y-1.5">
                    {rx.suggestedTests?.length > 0 ? rx.suggestedTests.map((item: string, idx: number) => (
                        <li key={idx} className="text-[10px] font-bold flex items-start gap-1.5" style={{ color: colors.gray700 }}>
                            <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: colors.blue400 }} /> {item}
                        </li>
                    )) : <li className="text-[10px] italic" style={{ color: colors.gray300 }}>No investigations suggested</li>}
                </ul>
            </div>
        </div>

        {/* Clinical Advice */}
        {rx.advice && (
            <div className="p-4 rounded-xl mb-6 font-medium text-[10px] leading-relaxed italic" 
                 style={{ 
                     backgroundColor: colors.gray50, 
                     border: `1px solid ${colors.gray100}`,
                     color: colors.gray600
                 }}>
               "{rx.advice}"
            </div>
        )}

        {/* Follow Up */}
        <div className="grid grid-cols-2 gap-8 mb-10">
            {rx.followUpDate && (
                <div className="flex gap-2">
                    <span className="text-[9px] font-black uppercase italic" style={{ color: colors.blue600 }}>Follow Up:</span>
                    <span className="text-[10px] font-black uppercase" style={{ color: colors.gray800 }}>{new Date(rx.followUpDate).toLocaleDateString('en-GB')}</span>
                </div>
            )}
            {rx.avoid?.length > 0 && (
                <div className="flex gap-2 truncate">
                    <span className="text-[9px] font-black uppercase italic" style={{ color: colors.rose600 }}>Avoid:</span>
                    <span className="text-[10px] font-bold uppercase" style={{ color: colors.gray700 }}>{rx.avoid.join(', ')}</span>
                </div>
            )}
        </div>

        {/* Signature */}
        <div className="absolute bottom-24 right-12 w-48 text-center">
            <div className="h-16 flex items-end justify-center mb-1">
                 {/* Check for signature image or fallback */}
                 {doctor.signature ? (
                    <img src={doctor.signature} alt="Signature" className="h-16 object-contain" crossOrigin="anonymous" />
                 ) : (
                    <span className="font-handwriting text-2xl font-bold" style={{ fontFamily: '"Brush Script MT", cursive', color: '#1e3a8a' }}>Dr. {doctor.name}</span>
                 )}
            </div>
            <div className="pt-1" style={{ borderTop: `1px solid ${colors.gray900}` }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.gray900 }}>Medical Officer</p>
                <p className="text-[7px] font-bold mt-0.5 uppercase tracking-tighter" style={{ color: colors.gray400 }}>REG: {doctor.medicalRegistrationNumber || 'N/A'}</p>
            </div>
        </div>

        {/* Footer Trace */}
        <div className="absolute bottom-8 left-[25mm] right-12 pt-3 flex justify-between items-center text-[7px] font-black uppercase tracking-widest" 
             style={{ 
                 borderTop: `1px solid ${colors.gray100}`,
                 color: colors.gray300
             }}>
            <p>Generated by MsCureChain Digital Health Portal</p>
            <p>Ref: {rx._id}</p>
            <p>Page 1 of 1</p>
        </div>

        {/* Styles specific to this document */}
        <style jsx>{`
            .font-handwriting {
                font-family: 'Brush Script MT', cursive;
            }
            @media print {
                .print-prescription-document {
                    width: 210mm;
                    height: 296mm;
                    page-break-after: always;
                }
            }
        `}</style>
    </div>
  );
};
