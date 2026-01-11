"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import {
    Lock,
    Smartphone,
    Eye,
    EyeOff,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";

export default function PharmacyLogin() {
    const router = useRouter();
    const { login, logout } = useAuthStore();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers
        if (/^\d*$/.test(value)) {
            // Limit to 10 digits
            if (value.length <= 10) {
                setIdentifier(value);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (identifier.length !== 10) {
            toast.error("Mobile number must be exactly 10 digits");
            return;
        }

        setLoading(true);

        try {
            // Use the centralized auth store login
            await login(identifier, password);

            // Get the user state after successful login logic
            const user = useAuthStore.getState().user;

            if (!user) {
                throw new Error("Login failed to retrieve user session.");
            }

            // Strict Role Validation for Pharmacy
            if (user.role !== 'pharma-owner' && user.role !== 'pharmacy') {
                // Unauthorized: Logout immediately
                logout();

                toast.error("Unauthorized access – Pharmacy users only", {
                    icon: '🚫',
                    style: {
                        borderRadius: '1rem',
                        background: '#1e293b',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                return;
            }

            // Success Redirect
            toast.success("Login successful!", {
                icon: '💊',
                style: {
                    borderRadius: '1rem',
                    background: '#1e293b',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

            router.push("/pharmacy/dashboard");

        } catch (err: any) {
            console.error("❌ Login failed:", err);
            // If it was a role error (handled above but just in case) or network error
            const errorMessage = err.message || "Login failed. Please check your credentials.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-gray-50 dark:bg-black">
            <div className="flex w-full max-w-[1300px] min-h-screen lg:min-h-[800px] lg:h-auto rounded-2xl overflow-hidden shadow-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">

                {/* Left Side: Branding & Info */}
                <div className="hidden lg:flex flex-col w-1/2 items-start justify-center px-16 relative overflow-hidden bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 w-full max-w-[520px]">
                        {/* Top Branding */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                                <Image src="/assets/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                MSCureChain
                            </h1>
                        </div>

                        {/* Main Visual */}
                        <Image
                            src="/assets/image.png"
                            width={480}
                            height={480}
                            className="w-[80%] max-w-[480px] rounded-2xl shadow-2xl border border-gray-700/50 mb-6 hover:scale-[1.02] transition-transform duration-500"
                            alt="Pharmacy Portal"
                        />

                        {/* Left Text Content */}
                        <h2 className="text-2xl font-semibold leading-tight mb-4">
                            Smart Pharmacy Management,<br />
                            Efficient & Integrated.
                        </h2>
                        <p className="text-lg max-w-[480px] leading-relaxed opacity-70">
                            Streamline inventory, manage prescriptions, and accelerate billing with our secure pharmacy portal.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 flex justify-center items-center p-2 lg:p-12 bg-white dark:bg-gray-900">
                    <div className="w-full max-w-[420px]">
                        {/* Mobile Top Branding */}
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <Image src="/assets/logo.png" alt="Logo" width={32} height={32} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">MSCureChain</span>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold mb-2">Pharmacy Login</h1>
                            <p className="text-sm opacity-60">Sign in to manage pharmacy operations</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 shadow-sm border rounded-xl p-6 border-gray-100 dark:border-gray-800">
                            {/* Identifier Field */}
                            <div>
                                <label className="text-sm font-medium mb-2.5 block opacity-70">
                                    Mobile Number
                                </label>
                                <div className="flex items-center border rounded-xl px-4 py-3 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <Smartphone className="w-5 h-5 mr-3 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={identifier}
                                        onChange={handleIdentifierChange}
                                        className="w-full bg-transparent outline-none placeholder-gray-500"
                                        placeholder="Enter mobile number"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-right mt-1 opacity-50">{identifier.length}/10</p>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex justify-between items-center mb-2.5">
                                    <label className="text-sm font-medium opacity-70">
                                        Password
                                    </label>
                                </div>
                                <div className="flex items-center border rounded-xl px-4 py-3 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 relative">
                                    <Lock className="w-5 h-5 mr-3 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent outline-none placeholder-gray-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-gray-400 hover:text-cyan-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed py-3.5 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-6 flex justify-center">
                            <button
                                onClick={() => router.push('/')}
                                className="text-xs font-bold text-gray-400 hover:text-cyan-600 transition-colors flex items-center gap-2 group uppercase tracking-widest"
                            >
                                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                                Return to central hub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
