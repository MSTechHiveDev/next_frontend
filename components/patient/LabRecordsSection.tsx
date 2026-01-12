'use client';

import React from 'react';
import { FlaskConical, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/admin';
import { format } from 'date-fns';

interface Test {
    name: string;
    category: string;
    instructions?: string;
}

interface LabRecord {
    _id: string;
    tokenNumber: string;
    tests: Test[];
    priority: 'routine' | 'urgent' | 'stat';
    status: 'pending' | 'collected' | 'processing' | 'completed';
    notes?: string;
    createdAt: string;
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

interface LabRecordsSectionProps {
    labRecords: LabRecord[];
}

export default function LabRecordsSection({ labRecords }: LabRecordsSectionProps) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            'collected': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'processing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'routine': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            'urgent': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'stat': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    if (!labRecords || labRecords.length === 0) {
        return (
            <Card className="p-8 text-center">
                <FlaskConical className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No lab records found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your lab test records will appear here</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {labRecords.map((record) => (
                <Card key={record._id} className="p-6 hover:shadow-lg transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-purple-600" />
                                Lab Token
                            </h3>
                            <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mt-1">
                                {record.tokenNumber}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                                {record.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(record.priority)}`}>
                                {record.priority.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Doctor & Hospital Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {record.doctor?.user?.name || record.doctor?.name || 'Unknown Doctor'}
                                </span>
                                {record.doctor?.specialties?.[0] && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                        • {record.doctor.specialties[0]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                                {record.hospital?.name}
                            </span>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                            Ordered on {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                        </span>
                    </div>

                    {/* Tests */}
                    {record.tests && record.tests.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Ordered Tests</h4>
                            <div className="space-y-2">
                                {record.tests.map((test, idx) => (
                                    <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                        <div className="flex items-start justify-between mb-1">
                                            <h5 className="font-bold text-gray-900 dark:text-white">{test.name}</h5>
                                            <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                                                {test.category}
                                            </span>
                                        </div>
                                        {test.instructions && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                                {test.instructions}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {record.notes}
                            </p>
                        </div>
                    )}

                    {/* Appointment ID */}
                    {record.appointment?.appointmentId && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Related to appointment: <span className="font-mono text-gray-700 dark:text-gray-300">
                                    {record.appointment.appointmentId}
                                </span>
                            </p>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}
