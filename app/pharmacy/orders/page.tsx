'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PharmacyBillingService } from '@/lib/integrations/services/pharmacyBilling.service';
import { Pill, Activity, Clock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

interface PharmacyOrder {
    _id: string;
    tokenNumber: string;
    patient: {
        name: string;
        age?: number;
        gender?: string;
        mobile?: string;
    };
    doctor: {
        name: string;
    };
    medicines: any[];
    status: string;
    createdAt: string;
}

export default function ActiveOrdersPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<PharmacyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const hospitalId = (user as any)?.hospital;

    useEffect(() => {
        if (hospitalId) {
            fetchActiveOrders(hospitalId);

            // Real-time updates
            const handleNewOrder = (data: any) => {
                console.log("🔔 New Pharmacy Order Received:", data);
               
                toast.success('New Prescription Order Received!', {
                    icon: '💊',
                    duration: 5000,
                    style: {
                        background: '#ecfdf5',
                        color: '#065f46',
                        fontWeight: 'bold',
                    },
                });

                // Optimistically update list
                setOrders(prev => {
                    if (prev.find(o => o._id === data._id)) return prev;
                    
                     const newOrder: PharmacyOrder = {
                        _id: data._id,
                        tokenNumber: data.tokenNumber,
                        patient: data.patientDetails, 
                        doctor: { name: data.doctorName || 'Dr. Staff' }, 
                        medicines: new Array(data.medicinesCount).fill({}), 
                        status: data.status || 'prescribed',
                        createdAt: new Date().toISOString()
                    };
                    return [newOrder, ...prev];
                });
                
                // Refresh full list to be safe
                fetchActiveOrders(hospitalId);
            };

            import('@/lib/integrations/api/socket').then(({ subscribeToSocket, unsubscribeFromSocket }) => {
                subscribeToSocket(`hospital_${hospitalId}`, 'new_pharmacy_order', handleNewOrder);
            });

             return () => {
                 import('@/lib/integrations/api/socket').then(({ unsubscribeFromSocket }) => {
                      unsubscribeFromSocket(`hospital_${hospitalId}`, 'new_pharmacy_order', handleNewOrder);
                 });
             };
        }
    }, [hospitalId]);

    const fetchActiveOrders = async (hospitalId: string) => {
        setLoading(true);
        try {
            const res = await PharmacyBillingService.getHospitalOrders(hospitalId);
            if (res.pharmacyOrders) {
                setOrders(res.pharmacyOrders.filter((o: any) => o.status !== 'completed'));
            }
        } catch (error) {
            console.error('❌ Error fetching active orders:', error);
            toast.error("Failed to load active orders");
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = (id: string) => {
        router.push(`/pharmacy/billing?orderId=${id}`);
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white tracking-tight">
                        <Pill className="w-8 h-8 text-emerald-500" />
                        Active Prescriptions
                    </h1>
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Manage incoming prescription orders for billing</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                            <tr>
                                <th className="p-6 border-b dark:border-gray-700">Token</th>
                                <th className="p-6 border-b dark:border-gray-700">Patient Details</th>
                                <th className="p-6 border-b dark:border-gray-700">Doctor</th>
                                <th className="p-6 border-b dark:border-gray-700 text-center">Medicines</th>
                                <th className="p-6 border-b dark:border-gray-700 text-center">Status</th>
                                <th className="p-6 border-b dark:border-gray-700 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Loading active orders...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center flex flex-col items-center gap-4">
                                    <Activity className="w-12 h-12 text-gray-200" />
                                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">No active orders found.</p>
                                </td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="border-b dark:border-gray-700/50 last:border-0 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                                         <td className="p-6">
                                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg font-bold text-xs uppercase">
                                                {order.tokenNumber}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{order.patient?.name || 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mt-0.5">
                                                {order.patient?.age || '-'}Y • {order.patient?.gender || '-'}
                                            </div>
                                        </td>
                                        <td className="p-6 text-gray-600 dark:text-gray-300 font-semibold uppercase text-[11px]">
                                            {(order.doctor as any)?.user?.name || order.doctor?.name || 'Dr. Staff'}
                                        </td>
                                         <td className="p-6 text-center">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {order.medicines?.length || 0} Items
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                             <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                             <button
                                                onClick={() => handleProcess(order._id)}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95"
                                            >
                                                <FileText size={14} />
                                                Create Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
