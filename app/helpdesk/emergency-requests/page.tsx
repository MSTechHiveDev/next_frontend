"use client";

import { useState, useEffect } from "react";
import { helpdeskEmergencyService } from "@/lib/integrations/services/helpdesk-emergency.service";
import { EmergencyRequest } from "@/lib/integrations/types/emergency";

export default function EmergencyRequestsPage() {
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
    const [notes, setNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        loadRequests();
        // Poll every 30 seconds for new requests
        const interval = setInterval(loadRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadRequests = async () => {
        try {
            const response = await helpdeskEmergencyService.getHospitalEmergencyRequests();
            setRequests(response.requests);
        } catch (error) {
            console.error("Error loading emergency requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!selectedRequest) return;

        setProcessingId(selectedRequest._id);
        try {
            await helpdeskEmergencyService.acceptRequest(selectedRequest._id, notes);
            await loadRequests();
            setShowAcceptModal(false);
            setNotes("");
            setSelectedRequest(null);
        } catch (error: any) {
            alert(error.message || "Failed to accept request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        setProcessingId(selectedRequest._id);
        try {
            await helpdeskEmergencyService.rejectRequest(
                selectedRequest._id,
                rejectionReason
            );
            await loadRequests();
            setShowRejectModal(false);
            setRejectionReason("");
            setSelectedRequest(null);
        } catch (error: any) {
            alert(error.message || "Failed to reject request");
        } finally {
            setProcessingId(null);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-300";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "low":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const pendingRequests = requests.filter((r) => r.status === "pending");
    const respondedRequests = requests.filter((r) => r.status !== "pending");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading emergency requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
                    <p className="text-gray-600">Manage incoming ambulance emergency requests</p>
                </div>
                <button
                    onClick={loadRequests}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {pendingRequests.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Accepted</p>
                            <p className="text-3xl font-bold text-green-600">
                                {requests.filter((r) => r.status === "accepted").length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Pending Requests ({pendingRequests.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {pendingRequests.map((request) => (
                            <div key={request._id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {request.patientName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {request.patientAge} years, {request.patientGender}
                                            {request.patientMobile && ` • ${request.patientMobile}`}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                                            request.severity
                                        )}`}
                                    >
                                        {request.severity.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Emergency Type</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {request.emergencyType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Current Location</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {request.currentLocation}
                                        </p>
                                    </div>
                                    {request.eta && (
                                        <div>
                                            <p className="text-xs text-gray-500">ETA</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {request.eta} minutes
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-500">Ambulance</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {request.ambulancePersonnel.vehicleNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-700">{request.description}</p>
                                </div>

                                {request.vitals && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Vitals</p>
                                        <div className="grid grid-cols-4 gap-3 text-xs">
                                            {request.vitals.bloodPressure && (
                                                <div>
                                                    <span className="text-gray-500">BP:</span>{" "}
                                                    <span className="font-medium">
                                                        {request.vitals.bloodPressure}
                                                    </span>
                                                </div>
                                            )}
                                            {request.vitals.heartRate && (
                                                <div>
                                                    <span className="text-gray-500">HR:</span>{" "}
                                                    <span className="font-medium">
                                                        {request.vitals.heartRate} bpm
                                                    </span>
                                                </div>
                                            )}
                                            {request.vitals.temperature && (
                                                <div>
                                                    <span className="text-gray-500">Temp:</span>{" "}
                                                    <span className="font-medium">
                                                        {request.vitals.temperature}°F
                                                    </span>
                                                </div>
                                            )}
                                            {request.vitals.oxygenLevel && (
                                                <div>
                                                    <span className="text-gray-500">SpO2:</span>{" "}
                                                    <span className="font-medium">
                                                        {request.vitals.oxygenLevel}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Received: {new Date(request.createdAt).toLocaleString()}
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowRejectModal(true);
                                            }}
                                            disabled={processingId === request._id}
                                            className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowAcceptModal(true);
                                            }}
                                            disabled={processingId === request._id}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            Accept Patient
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Responded Requests */}
            {respondedRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Request History ({respondedRequests.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {respondedRequests.map((request) => (
                            <div key={request._id} className="p-6 bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {request.patientName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {request.emergencyType} • {request.currentLocation}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            request.status
                                        )}`}
                                    >
                                        {request.status.toUpperCase()}
                                    </span>
                                </div>
                                {request.notes && (
                                    <p className="text-sm text-gray-700 mt-2">Notes: {request.notes}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(request.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {requests.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-gray-600">No emergency requests</p>
                </div>
            )}

            {/* Accept Modal */}
            {showAcceptModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Accept Emergency Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to accept this patient? The ambulance will be
                            notified immediately.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="Add any preparation notes..."
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowAcceptModal(false);
                                    setNotes("");
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={!!processingId}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {processingId ? "Accepting..." : "Accept"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Reject Emergency Request
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="e.g., No beds available, Facility not equipped..."
                                required
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!!processingId || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {processingId ? "Rejecting..." : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
