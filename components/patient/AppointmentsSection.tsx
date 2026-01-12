'use client';

import React from 'react';
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
import { Card } from '@/components/admin';
import { format } from 'date-fns';

interface Appointment {
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
        address?: string;
    };
    reason?: string;
    type?: string;
}

interface AppointmentsSectionProps {
    appointments: Appointment[];
}

export default function AppointmentsSection({ appointments }: AppointmentsSectionProps) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Booked': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'confirmed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'completed': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'in-progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    if (!appointments || appointments.length === 0) {
        return (
            <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your appointment history will appear here</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {appointments.map((appointment) => (
                <Card key={appointment._id} className="p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                        {appointment.doctor?.user?.name || appointment.doctor?.name || 'Unknown Doctor'}
                                    </h3>
                                    {(appointment.doctor?.specialties || appointment.doctor?.department) && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                            {appointment.doctor?.specialties?.[0] || ''}
                                            {appointment.doctor.department && ` • ${appointment.doctor.department}`}
                                        </p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {format(new Date(appointment.date), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                {appointment.appointmentTime && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {appointment.appointmentTime}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300 truncate">
                                        {appointment.hospital?.name || 'Unknown Hospital'}
                                    </span>
                                </div>
                                {appointment.appointmentId && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {appointment.appointmentId}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reason */}
                            {appointment.reason && (
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">Reason: </span>
                                        {appointment.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
