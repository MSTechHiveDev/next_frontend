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

export default function LabLogin() {
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
            await login(identifier, password);
            const user = useAuthStore.getState().user;

            if (!user) {
                throw new Error("Login failed to retrieve user session.");
            }

            // Strict Role Validation
            if (user.role !== 'lab') {
                logout(); // Ensure clean logout
                toast.error("Unauthorized access – Lab users only", {
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

            toast.success("Login successful!", {
                icon: '🧪',
                style: {
                    borderRadius: '1rem',
                    background: '#1e293b',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

            router.push("/lab/dashboard");
        } catch (err: any) {
            console.error("❌ Login failed:", err);
            const errorMessage = err.message || "Login failed. Please check your credentials.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-gray-50 dark:bg-black/95 transition-all duration-700 overflow-hidden">
            <div className="flex w-full max-w-[1400px] min-h-screen lg:min-h-[850px] lg:h-auto rounded-[40px] overflow-hidden shadow-[0_32px_128px_-15px_rgba(0,0,0,0.1)] border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-all m-4">

                {/* Left Side: Strategic Branding */}
                <div className="hidden lg:flex flex-col w-3/5 items-start justify-center px-24 relative overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white">
                    {/* Background Orchestration */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>

                    <div className="relative z-10 w-full max-w-[600px] space-y-12">
                        {/* Branding Node */}
                        <div className="flex items-center gap-5 translate-y-[-20px] animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-200">
                                <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="object-contain brightness-0 invert" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                                MSCure<span className="text-indigo-600">Chain</span>
                            </h1>
                        </div>

                        {/* Visual Asset Container */}
                        <div className="relative group animate-in fade-in zoom-in duration-1000 delay-300">
                            <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-600 rounded-[40px] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700"></div>
                            <Image
                                src="/assets/image.png"
                                width={560}
                                height={560}
                                className="relative w-full rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 hover:scale-[1.01] transition-transform duration-700"
                                alt="Laboratory Portal"
                            />
                        </div>

                        {/* Narrative Segment */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                            <h2 className="text-4xl font-bold leading-[1.2] text-gray-900 dark:text-white">
                                Precision Diagnostics.<br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Secure. Reliable. Fast.</span>
                            </h2>
                            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Access the laboratory management system to manage samples, tests, and reports in real-time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Authentication Node */}
                <div className="w-full lg:w-2/5 flex justify-center items-center p-8 lg:p-20 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm border-l border-gray-100 dark:border-gray-800">
                    <div className="w-full max-w-[440px] space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                        {/* Mobile Optimized Branding */}
                        <div className="lg:hidden flex items-center gap-4 mb-12">
                            <div className="p-2 bg-indigo-600 rounded-xl">
                                <Image src="/assets/logo.png" alt="Logo" width={24} height={24} className="brightness-0 invert" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">CureChain</span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Lab Portal Login</h1>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Sign in to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800/50 p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                            {/* Identifier Input */}
                            <div className="space-y-4">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">
                                    Mobile Number
                                </label>
                                <div className="group flex items-center border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl">
                                    <div className="p-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Smartphone size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={identifier}
                                        onChange={handleIdentifierChange}
                                        className="w-full bg-transparent py-4 outline-none font-bold text-sm tracking-widest text-gray-900 dark:text-white placeholder:text-gray-400"
                                         placeholder="ENTER MOBILE NUMBER..."
                                        required
                                    />
                                    <div className="pr-6 text-[10px] font-bold text-gray-300">
                                        {identifier.length}/10
                                    </div>
                                </div>
                            </div>

                            {/* Credential Input */}
                            <div className="space-y-4">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">
                                    Password
                                </label>
                                <div className="group flex items-center border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl relative">
                                    <div className="p-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent py-4 outline-none font-bold text-sm tracking-widest text-gray-900 dark:text-white placeholder:text-gray-400"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 dark:shadow-none active:scale-95 group/btn"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                         <span>Sign In</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-3 px-6 py-3 rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                            >
                                 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[2px]">Back to Home</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
