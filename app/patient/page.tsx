import React from 'react';
import { getPatientProfileAction } from '@/lib/integrations';
import PatientProfile from '@/components/patient/PatientProfile';
import { AlertCircle } from 'lucide-react';

export default async function PatientPage() {
    const response = await getPatientProfileAction();

    if (!response.success || !response.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="text-rose-500 w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2">Transmission Interrupt</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest max-w-md">
                    {response.error || 'The medical data retrieval was unsuccessful. Please verify your credentials or network status.'}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <PatientProfile profile={response.data} />
        </div>
    );
}
