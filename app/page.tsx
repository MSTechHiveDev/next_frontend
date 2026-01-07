'use client';

import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Activity, Database, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import HeroCard from "@/components/cards/HeroCard";
import Footer from "@/components/footer/Footer";

export default function Home() {
    const router = useRouter();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }
        localStorage.setItem("theme", theme);

        // Dispatch custom event for other components to listen
        window.dispatchEvent(new Event('themeChange'));
    }, [theme]);

    // Listen for theme changes from other components
    useEffect(() => {
        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem("theme") || "light";
            setTheme(currentTheme);
        };

        window.addEventListener('themeChange', handleThemeChange);
        window.addEventListener('storage', handleThemeChange);

        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
            window.removeEventListener('storage', handleThemeChange);
        };
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <div className="min-h-screen p-2 selection:bg-blue-500/30" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Navbar */}
            <nav className="border-b backdrop-blur-md sticky top-0 z-50 transition-colors"
                style={{ backgroundColor: 'var(--navbar-bg)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/assets/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <span className="text-xl mr-10 font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            MSCureChain
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-lg transition-all hover:bg-blue-500/10"
                            style={{ color: 'var(--secondary-color)' }}
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => router.push('/auth/login')}
                            className="bg-blue-600 hover:bg-blue-700 max-sm:text-[10px] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <HeroCard />

            {/* Theme-based Platform Preview */}
            <div className="w-full max-w-6xl mx-auto -mt-10 mb-12 px-6 relative z-20">
                <img
                    src={theme === 'dark' ? '/assets/black.jpeg' : '/assets/landing.jpeg'}
                    alt="MSCureChain Dashboard Preview"
                    className="w-full rounded-2xl shadow-2xl border-4]"
                />
            </div>

            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 radial-gradient-center pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 py-10 lg:py-10 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                            <ShieldCheck size={14} />
                            <span>Secure & Private Healthcare</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Your Health Data, <br />
                            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                Secured & Accessible.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: 'var(--secondary-color)' }}>
                            A comprehensive Hospital Management System built for privacy, efficiency, and seamless care coordination.
                        </p>

                        <button
                            onClick={() => router.push('/auth/login')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                        >
                            Access Platform
                        </button>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        <FeatureCard
                            icon={Lock}
                            title="Privacy First"
                            desc="End-to-end encryption for all patient records and sensitive data."
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Real-time Updates"
                            desc="Instant synchronization of appointments, prescriptions, and vitals."
                        />
                        <FeatureCard
                            icon={Database}
                            title="Unified Records"
                            desc="A single source of truth for patient history across all departments."
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

const FeatureCard = ({ icon: Icon, title, desc }: { icon: React.ComponentType<any>; title: string; desc: string }) => (
    <div className="border p-6 rounded-2xl transition-colors duration-300 group hover:shadow-lg"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <Icon size={24} className="text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-color)' }}>{desc}</p>
    </div>
);
