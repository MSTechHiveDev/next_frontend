'use client';

import React from 'react';

export const PrintableDischargeSummary = React.forwardRef<HTMLDivElement, { data: any, consultants: string[] }>(({ data, consultants }, ref) => {
    if (!data) return null;

    const sections = [
        { label: 'Provisional Diagnosis at the time of Admission', value: data.provisionalDiagnosis },
        { label: 'Final Diagnosis at the time of Discharge', value: data.diagnosis },
        { label: 'Admit Reason', value: data.reasonForAdmission },
        { label: 'Chief Complaints', value: data.chiefComplaints },
        { label: 'Condition at Discharge', value: data.conditionAtDischarge },
        ...(data.conditionAtDischarge === 'Referred to Higher Hospital' ? [
            { label: 'Suggested Doctor', value: data.suggestedDoctorName },
            { label: 'Hospital', value: data.hospitalName }
        ] : []),
        {
            label: 'Key findings, on physical examination at the time of admission',
            subSections: [
                { label: 'Vital Signs', value: data.vitalSigns },
                { label: 'General Appearance', value: data.generalAppearance }
            ]
        },
        { label: 'Summary of key investigations during Hospitalization', value: data.investigationsPerformed },
        { label: 'Course in the Hospital including complications if any', value: data.hospitalCourse },
        { label: 'Treatment Given', value: data.treatmentGiven },
        { label: 'Surgery Notes', value: data.surgeryNotes },
        { label: 'Surgical Procedures', value: data.surgicalProcedures },
        { label: 'Medications Prescribed', value: data.medicationsPrescribed },
        { label: 'Advice on Discharge', value: data.adviceAtDischarge },
        { label: 'Activity Restrictions', value: data.activityRestrictions },
        { label: 'Follow-up Instructions', value: data.followUpInstructions },
    ];

    return (
        <div ref={ref} className="p-4 bg-white text-black font-serif text-[12px] leading-relaxed w-full">
            <style>
                {`
                    @media print {
                        @page {
                            margin-top: 20mm;
                            margin-bottom: 0;
                            margin-left: 10mm;
                            margin-right: 10mm;
                        }
                        body {
                            margin: 0;
                        }
                    }
                `}
            </style>
            <div className="border-[1.5px] border-solid border-black p-10 min-h-[1050px] flex flex-col relative">
                {/* Header Section */}
                <div className="text-center mb-6">
                    <p className="text-[10px] font-bold italic mb-1 uppercase tracking-widest text-gray-600">Center of Excellence in Patient Care & Clinical Research</p>
                    <p className="text-[9px] text-gray-500">123 Health Avenue, Medical District • Phone: +1 (555) 000-9999 • Email: info@hospital.com</p>
                    <div className="my-4 border-t-2 border-black" />
                    <div className="inline-block border-2 border-black px-10 py-2 mb-6">
                        <h1 className="text-2xl font-black uppercase tracking-[0.4em]">Discharge Summary</h1>
                    </div>
                </div>

                {/* Patient Information Table-like Layout */}
                <div className="grid grid-cols-2 border-2 border-black mb-8">
                    {/* Row 1 */}
                    <div className="border-r border-b border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Patient Name:</span>
                        <span className="font-bold">
                            {(data.patientTitle || 'Mr')}. {data.patientName}
                        </span>
                    </div>
                    <div className="border-b border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">MRN:</span>
                        <span className="font-bold">{data.mrn}</span>
                    </div>

                    {/* Row 2 */}
                    <div className="border-r border-b border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Age / Gender:</span>
                        <span className="font-bold">{data.age} / {data.gender}</span>
                    </div>
                    <div className="border-b border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Department:</span>
                        <span className="font-bold">{data.department || 'General Medicine'}</span>
                    </div>

                    {/* Row 3 */}
                    <div className="border-r border-b border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Admission:</span>
                        <span className="font-bold font-mono text-[11px]">{data.admissionDate ? new Date(data.admissionDate).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="border-b border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Discharge:</span>
                        <span className="font-bold font-mono text-[11px]">{data.dischargeDate ? new Date(data.dischargeDate).toLocaleString() : 'N/A'}</span>
                    </div>

                    {/* Row 4 */}
                    <div className="border-r border-black p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Room Type:</span>
                        <span className="font-bold">{data.roomType}</span>
                    </div>
                    <div className="p-3 flex">
                        <span className="font-bold uppercase w-32 text-[10px]">Room Number:</span>
                        <span className="font-bold">{data.roomNo}</span>
                    </div>
                </div>

                {/* Consultants Section */}
                <div className="mb-6">
                    <h3 className="font-bold text-[13px] mb-2">Other Consultants:</h3>
                    <div className="pl-4">
                        {consultants?.filter(c => c).map((c, i) => (
                            <p key={i} className="font-medium">• {c}</p>
                        ))}
                    </div>
                </div>

                {/* Clinical Content Sections */}
                <div className="space-y-6 flex-1">
                    {sections.map((section, idx) => {
                        const hasContent = section.value || (section.subSections && section.subSections.some(s => s.value));
                        if (!hasContent) return null;

                        return (
                            <div key={idx} className="break-inside-avoid mb-4">
                                <div className="flex items-start gap-1">
                                    <span className="font-sans text-[14px] leading-none mt-0.5">•</span>
                                    <h3 className="font-bold text-[13px]">{section.label}:</h3>
                                </div>

                                <div className="pl-5 mt-1">
                                    {section.value && (
                                        <p className="whitespace-pre-wrap text-[11px] font-medium tracking-tight leading-normal">
                                            {section.value}
                                        </p>
                                    )}

                                    {section.subSections && section.subSections.map((sub, sIdx) => (
                                        sub.value && (
                                            <div key={sIdx} className="mt-2 break-inside-avoid">
                                                <p className="font-bold text-[11px]">- {sub.label}:</p>
                                                <p className="pl-4 text-[10px] whitespace-pre-wrap leading-normal">{sub.value}</p>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Divider for clarity between major sections */}
                                {['General Appearance', 'Course in the Hospital', 'Surgery Notes', 'Treatment Given'].some(label => section.label.includes(label)) && (
                                    <div className="mt-4 border-t border-black/10" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Signatures Area */}
                <div className="mt-auto pt-10 border-t-2 border-black grid grid-cols-2 gap-20 page-break-inside-avoid">
                    <div className="text-center">
                        <div className="border-t border-black mt-8 pt-2">
                            <p className="font-bold uppercase text-[9px]">Patient / Caretaker Signature</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black mt-8 pt-2">
                            <p className="font-bold uppercase text-[9px]">Authorized Medical Personnel</p>
                            <p className="text-[8px] opacity-60">Verified Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Page Numbering */}
                <div className="mt-4 text-right">
                    <p className="text-[10px] italic font-medium">Page 1</p>
                </div>
            </div>
        </div>
    );
});

PrintableDischargeSummary.displayName = 'PrintableDischargeSummary';
