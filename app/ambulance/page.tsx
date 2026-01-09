"use client";

import { useState, useEffect } from "react";
import { emergencyService } from "@/lib/integrations/services/emergency.service";
import { 
    EmergencyRequest, 
    CreateEmergencyRequestData,
    Hospital 
} from "@/lib/integrations/types/emergency";

export default function AmbulanceDashboard() {
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [myRequests, setMyRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateEmergencyRequestData>({
        patientName: "",
        patientAge: 0,
        patientGender: "male",
        patientMobile: "",
        emergencyType: "",
        description: "",
        severity: "high",
        currentLocation: "",
        eta: undefined,
        vitals: {
            bloodPressure: "",
            heartRate: undefined,
            temperature: undefined,
            oxygenLevel: undefined,
        },
        targetHospitals: [], // Empty = send to all
    });

    // Load hospitals and requests on mount
    useEffect(() => {
        // Add small delay to allow sessionStorage to fully persist after navigation
        const checkAuth = async () => {
            // Wait a tiny bit for sessionStorage to be ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Debug: Check if token exists
            const token = sessionStorage.getItem("accessToken");
            const user = sessionStorage.getItem("user");
            const role = sessionStorage.getItem("userRole");
            
            console.log("🔐 Dashboard Auth Check:");
            console.log("  - Token exists:", !!token);
            console.log("  - Token preview:", token?.substring(0, 30) + "...");
            console.log("  - User:", user ? JSON.parse(user).name : "None");
            console.log("  - Role:", role);
            
            if (!token) {
                console.error("❌ No token found! Redirecting to login...");
                console.log("📦 SessionStorage contents:", {
                    accessToken: sessionStorage.getItem("accessToken"),
                    refreshToken: sessionStorage.getItem("refreshToken"),
                    user: sessionStorage.getItem("user"),
                    userRole: sessionStorage.getItem("userRole")
                });
                window.location.href = "/emergency-login";
                return;
            }
            
            console.log("✅ Token found, loading dashboard data...");
            loadData();
        };
        
        checkAuth();
    }, []);

    const loadData = async () => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
            console.error("❌ No token available for API calls");
            return;
        }
        
        setLoading(true);
        console.log("📡 Loading dashboard data...");
        try {
            const [hospitalsData, requestsData] = await Promise.all([
                emergencyService.getAvailableHospitals(),
                emergencyService.getMyRequests(),
            ]);
            console.log("✅ Hospitals loaded:", hospitalsData.hospitals.length);
            console.log("✅ Requests loaded:", requestsData.requests.length);
            setHospitals(hospitalsData.hospitals);
            setMyRequests(requestsData.requests);
        } catch (error: any) {
            console.error("❌ Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const response = await emergencyService.createEmergencyRequest(formData);
            setMessage({
                type: "success",
                text: (formData.targetHospitals?.length || 0) > 0 
                    ? `Emergency request sent to ${formData.targetHospitals?.length} selected hospital(s)!`
                    : "Emergency request sent successfully to all available hospitals!",
            });

            // Reset form
            setFormData({
                patientName: "",
                patientAge: 0,
                patientGender: "male",
                patientMobile: "",
                emergencyType: "",
                description: "",
                severity: "high",
                currentLocation: "",
                eta: undefined,
                vitals: {
                    bloodPressure: "",
                    heartRate: undefined,
                    temperature: undefined,
                    oxygenLevel: undefined,
                },
                targetHospitals: [],
            });

            // Reload requests
            loadData();
            setActiveTab("history");
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Failed to send emergency request",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
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

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Available Hospitals</p>
                            <p className="text-3xl font-bold text-gray-900">{hospitals.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {myRequests.filter(r => r.status === "pending").length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900">{myRequests.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab("new")}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "new"
                                    ? "border-red-600 text-red-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            New Emergency Request
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "history"
                                    ? "border-red-600 text-red-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Request History
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === "new" ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div
                                    className={`px-4 py-3 rounded-lg text-sm ${
                                        message.type === "success"
                                            ? "bg-green-50 text-green-800 border border-green-200"
                                            : "bg-red-50 text-red-800 border border-red-200"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient Details */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Patient Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.patientName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, patientName: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Patient Age *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.patientAge || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, patientAge: parseInt(e.target.value) })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender *
                                    </label>
                                    <select
                                        value={formData.patientGender}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                patientGender: e.target.value as "male" | "female" | "other",
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Patient Mobile
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.patientMobile || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, patientMobile: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Type *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emergencyType}
                                        onChange={(e) =>
                                            setFormData({ ...formData, emergencyType: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="e.g., Heart Attack, Accident, etc."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Severity *
                                    </label>
                                    <select
                                        value={formData.severity}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                severity: e.target.value as "critical" | "high" | "medium" | "low",
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.currentLocation}
                                        onChange={(e) =>
                                            setFormData({ ...formData, currentLocation: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ETA (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.eta || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                eta: e.target.value ? parseInt(e.target.value) : undefined,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Vitals */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Vitals (Optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">
                                            Blood Pressure
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.vitals?.bloodPressure || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    vitals: {
                                                        ...formData.vitals,
                                                        bloodPressure: e.target.value,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="120/80"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">
                                            Heart Rate (bpm)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.vitals?.heartRate || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    vitals: {
                                                        ...formData.vitals,
                                                        heartRate: e.target.value
                                                            ? parseInt(e.target.value)
                                                            : undefined,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="72"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">
                                            Temperature (°F)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.vitals?.temperature || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    vitals: {
                                                        ...formData.vitals,
                                                        temperature: e.target.value
                                                            ? parseFloat(e.target.value)
                                                            : undefined,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="98.6"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2">
                                            Oxygen Level (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.vitals?.oxygenLevel || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    vitals: {
                                                        ...formData.vitals,
                                                        oxygenLevel: e.target.value
                                                            ? parseInt(e.target.value)
                                                            : undefined,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="98"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hospital Selection */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Send to Hospitals (Select specific or leave empty for ALL)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {hospitals.map((hospital) => (
                                        <label
                                            key={hospital._id}
                                            className={`flex items-start p-3 border rounded-xl cursor-pointer transition-all ${
                                                formData.targetHospitals?.includes(hospital._id)
                                                    ? "border-red-500 bg-red-50 ring-1 ring-red-500"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                            }`}
                                        >
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.targetHospitals?.includes(hospital._id)}
                                                    onChange={() => {
                                                        const current = [...(formData.targetHospitals || [])];
                                                        if (current.includes(hospital._id)) {
                                                            setFormData({
                                                                ...formData,
                                                                targetHospitals: current.filter((id) => id !== hospital._id),
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                targetHospitals: [...current, hospital._id],
                                                            });
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <span className="font-medium text-gray-900">{hospital.name}</span>
                                                <p className="text-gray-500 text-xs truncate">{hospital.address}</p>
                                            </div>
                                        </label>
                                    ))}
                                    {hospitals.length === 0 && (
                                        <div className="col-span-full p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center">
                                            <p className="text-sm text-gray-500 italic">No hospitals available. Request will be broadcasted.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {submitting ? "Sending..." : "Send Emergency Request"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading requests...</p>
                                </div>
                            ) : myRequests.length === 0 ? (
                                <div className="text-center py-12">
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
                                    <p className="text-gray-600">No emergency requests yet</p>
                                </div>
                            ) : (
                                myRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {request.patientName}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {request.patientAge} years, {request.patientGender}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                                                        request.severity
                                                    )}`}
                                                >
                                                    {request.severity.toUpperCase()}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        request.status
                                                    )}`}
                                                >
                                                    {request.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Emergency:</span>{" "}
                                                <span className="font-medium">{request.emergencyType}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Location:</span>{" "}
                                                <span className="font-medium">{request.currentLocation}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-700 mb-3">{request.description}</p>

                                        {/* Hospital Responses */}
                                        <div className="border-t border-gray-200 pt-3">
                                            <p className="text-xs font-medium text-gray-600 mb-2">
                                                Hospital Responses:
                                            </p>
                                            <div className="space-y-2">
                                                {request.requestedHospitals.map((rh, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between items-center text-sm"
                                                    >
                                                        <span className="text-gray-700">
                                                            {rh.hospital.name}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                                                rh.status
                                                            )}`}
                                                        >
                                                            {rh.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {request.acceptedByHospital && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm font-medium text-green-800">
                                                    ✓ Accepted by {request.acceptedByHospital.name}
                                                </p>
                                                {request.notes && (
                                                    <p className="text-xs text-green-700 mt-1">
                                                        Notes: {request.notes}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-3">
                                            Submitted: {new Date(request.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
