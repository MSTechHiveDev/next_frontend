'use client';

import React from 'react';
import { Pill, Calendar, User, FileText, Download } from 'lucide-react';
import { Card } from '@/components/admin';
import { format } from 'date-fns';

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface Prescription {
    _id: string;
    prescriptionDate: string;
    diagnosis: string;
    symptoms?: string[];
    medicines: Medicine[];
    advice?: string;
    dietAdvice?: string[];
    suggestedTests?: string[];
    avoid?: string[];
    followUpDate?: string;
    notes?: string;
    doctor: {
        user?: {
            name: string;
        };
        name?: string; // Fallback
        specialties?: string[];
    };
    hospital: {
        name: string;
    };
    appointment?: {
        appointmentId: string;
        date: string;
    };
}

interface PrescriptionsSectionProps {
    prescriptions: Prescription[];
}

export default function PrescriptionsSection({ prescriptions }: PrescriptionsSectionProps) {
    if (!prescriptions || prescriptions.length === 0) {
        return (
            <Card className="p-8 text-center">
                <Pill className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No prescriptions found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your prescriptions will appear here</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {prescriptions.map((prescription) => (
                <Card key={prescription._id} className="p-6 hover:shadow-lg transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <Pill className="w-5 h-5 text-blue-600" />
                                Prescription
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {format(new Date(prescription.prescriptionDate), 'MMM dd, yyyy')}
                            </p>
                        </div>
                        {prescription.appointment?.appointmentId && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-mono">
                                {prescription.appointment.appointmentId}
                            </span>
                        )}
                    </div>

                    {/* Doctor & Hospital Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {prescription.doctor?.user?.name || prescription.doctor?.name || 'Unknown Doctor'}
                                </span>
                                {prescription.doctor?.specialties?.[0] && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                        • {prescription.doctor.specialties[0]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                                {prescription.hospital?.name}
                            </span>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Diagnosis</h4>
                        <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            {prescription.diagnosis}
                        </p>
                    </div>

                    {/* Medicines */}
                    {prescription.medicines && prescription.medicines.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Medicines</h4>
                            <div className="space-y-2">
                                {prescription.medicines.map((medicine, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <h5 className="font-bold text-gray-900 dark:text-white">{medicine.name}</h5>
                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                                                {medicine.duration}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Dosage:</span> {medicine.dosage}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Frequency:</span> {medicine.frequency}
                                            </p>
                                        </div>
                                        {medicine.instructions && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                                                {medicine.instructions}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advice */}
                    {prescription.advice && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Medical Advice</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                {prescription.advice}
                            </p>
                        </div>
                    )}

                    {/* Diet Advice */}
                    {prescription.dietAdvice && prescription.dietAdvice.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Diet Advice</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                {prescription.dietAdvice.map((advice, idx) => (
                                    <li key={idx}>{advice}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Suggested Tests */}
                    {prescription.suggestedTests && prescription.suggestedTests.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Suggested Tests</h4>
                            <div className="flex flex-wrap gap-2">
                                {prescription.suggestedTests.map((test, idx) => (
                                    <span key={idx} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
                                        {test}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Follow-up Date */}
                    {prescription.followUpDate && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-600 dark:text-gray-300">
                                    Follow-up on: <span className="font-bold text-gray-900 dark:text-white">
                                        {format(new Date(prescription.followUpDate), 'MMM dd, yyyy')}
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}
