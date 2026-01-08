'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Search, FlaskConical } from 'lucide-react';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { LabTest } from '@/lib/integrations/types/labTest';

export default function TestListPage() {
    const router = useRouter();
    const [tests, setTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const data = await LabTestService.getTests();
            setTests(data);
        } catch (error) {
            console.error("Failed to fetch tests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this test?")) return;
        try {
            await LabTestService.deleteTest(id);
            fetchTests();
        } catch (error: any) {
            alert(error.message || "Failed to delete test");
        }
    };

    const filteredTests = tests.filter(test =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof test.departmentId === 'object' && test.departmentId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 h-full bg-gray-50 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Test Master</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all laboratory tests</p>
                </div>
                <button
                    onClick={() => router.push('/lab/tests/manage')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add New Test
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200 sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Test Name</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Sample</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading tests...</td>
                                </tr>
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tests found</td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                            <div className="bg-gray-100 p-1.5 rounded text-gray-500">
                                                <FlaskConical size={16} />
                                            </div>
                                            {test.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {typeof test.departmentId === 'object' ? test.departmentId.name : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">{test.sampleType || '-'}</td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">₹{test.price}</td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/lab/tests/manage?id=${test._id}`)}
                                                className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(test._id)}
                                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
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
