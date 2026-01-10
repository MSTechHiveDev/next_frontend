'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TicketDetailView from '@/components/support/TicketDetailView';

export default function HelpdeskTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <TicketDetailView
                ticketId={resolvedParams.id}
                isAdmin={false}
                onBack={() => router.back()}
            />
        </div>
    );
}
