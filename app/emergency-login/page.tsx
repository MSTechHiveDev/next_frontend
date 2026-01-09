"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emergencyService } from "@/lib/integrations/services/emergency.service";

export default function EmergencyLogin() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        console.log("🔐 Attempting emergency login with:", { identifier, password: "***" });

        try {
            const response = await emergencyService.login(identifier, password);
            
            console.log("✅ Login successful:", response);

            // Store tokens in sessionStorage (apiClient reads from sessionStorage)
            sessionStorage.setItem("accessToken", response.tokens.accessToken);
            sessionStorage.setItem("refreshToken", response.tokens.refreshToken);
            sessionStorage.setItem("userRole", "ambulance");
            sessionStorage.setItem("user", JSON.stringify(response.user));

            console.log("✅ Tokens stored in sessionStorage");
            
            // Verify storage
            const storedToken = sessionStorage.getItem("accessToken");
            const storedRefresh = sessionStorage.getItem("refreshToken");
            const storedUser = sessionStorage.getItem("user");
            const storedRole = sessionStorage.getItem("userRole");
            
            console.log("🔍 Verification check:");
            console.log("  - Access token stored:", !!storedToken);
            console.log("  - Refresh token stored:", !!storedRefresh);
            console.log("  - User stored:", !!storedUser);
            console.log("  - Role stored:", storedRole);
            
            if (!storedToken || !storedRefresh) {
                console.error("❌ Token storage failed!");
                setError("Failed to store authentication tokens. Please try again.");
                return;
            }
            
            console.log("✅ All tokens verified, redirecting to dashboard...");
            
            // Small delay to ensure storage is fully written
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Use window.location instead of router.push to ensure storage is persisted
            window.location.href = "/ambulance";
        } catch (err: any) {
            console.error("❌ Login failed:", err);
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const fillTestCredentials = () => {
        setIdentifier("AMB-001");
        setPassword("AMB123");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Emergency Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                        <svg
                            className="w-12 h-12 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Emergency Login
                    </h1>
                    <p className="text-gray-600">
                        Ambulance Personnel Access
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee ID / Mobile
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="AMB-001 or 9876543210"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? "Logging in..." : "Emergency Login"}
                        </button>

                        {/* Test Credentials Button */}
                        <button
                            type="button"
                            onClick={fillTestCredentials}
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all border border-gray-300"
                        >
                            🧪 Fill Test Credentials (AMB-001)
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                            For emergency personnel only
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Need help? Contact: 1800-EMERGENCY
                        </p>
                    </div>
                </div>

                {/* Back to Regular Login */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push("/login")}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                        ← Back to Regular Login
                    </button>
                </div>
            </div>
        </div>
    );
}
