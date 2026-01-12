'use client';

import React from 'react';
import { FileCheck, Calendar, User, Download, ExternalLink } from 'lucide-react';
import { Card } from '@/components/admin';
import { format } from 'date-fns';

interface HelpdeskItem {
    _id: string;
    appointmentId: string;
    date: string;
    appointmentTime?: string;
    status: string;
    doctor: {
        user?: {
            name: string;
        };
        name?: string; // Fallback
        specialties?: string[];
        department?: string;
    };
    hospital: {
        name: string;
    };
    createdBy?: {
        name: string;
        role?: string;
    };
    prescription?: {
        _id: string;
        diagnosis: string;
    };
    labToken?: {
        _id: string;
        tokenNumber: string;
    };
}

interface HelpdeskPrescriptionsSectionProps {
    helpdeskItems: HelpdeskItem[];
}

export default function HelpdeskPrescriptionsSection({ helpdeskItems }: HelpdeskPrescriptionsSectionProps) {
    if (!helpdeskItems || helpdeskItems.length === 0) {
        return (
            <Card className="p-8 text-center">
                <FileCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No helpdesk bookings found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Appointments booked via helpdesk will appear here
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {helpdeskItems.map((item) => (
                <Card key={item._id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-indigo-600">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-indigo-600" />
                                Helpdesk Booking
                            </h3>
                            <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
                                {item.appointmentId}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400`}>
                            {item.status || 'Booked'}
                        </span>
                    </div>

                    {/* Doctor & Hospital Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {item.doctor?.user?.name || item.doctor?.name || 'Unknown Doctor'}
                                </span>
                                {(item.doctor?.specialties?.[0] || item.doctor?.department) && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">
                                        • {item.doctor?.specialties?.[0] || item.doctor?.department}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                                {format(new Date(item.date), 'MMM dd, yyyy')} {item.appointmentTime && ` • ${item.appointmentTime}`}
                            </span>
                        </div>
                    </div>

                    {/* Hospital Info */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                        <Calendar className="w-4 h-4 text-gray-400 opacity-0" /> {/* Spacer */}
                        <p className="text-gray-600 dark:text-gray-400">
                            Booked at <span className="font-semibold">{item.hospital?.name}</span>
                        </p>
                    </div>

                    {/* Created By Info */}
                    {item.createdBy && (
                        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                            <p className="text-sm text-indigo-900 dark:text-indigo-300">
                                <span className="font-bold">Booked By:</span> {item.createdBy.name}
                                {item.createdBy.role && <span className="opacity-70 ml-1">({item.createdBy.role})</span>}
                            </p>
                        </div>
                    )}

                    {/* Prescription & Lab Info Snippets */}
                    {(item.prescription || item.labToken) && (
                        <div className="mb-2 space-y-2">
                            {item.prescription && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-xs">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        Diagnosis: <span className="text-blue-600 dark:text-blue-400">{item.prescription.diagnosis}</span>
                                    </p>
                                </div>
                            )}
                            {item.labToken && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-xs">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        Lab Token: <span className="text-purple-600 dark:text-purple-400 font-mono">{item.labToken.tokenNumber}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}

