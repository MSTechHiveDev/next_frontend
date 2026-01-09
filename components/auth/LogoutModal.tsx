'use client';

import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName?: string;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, userName }: LogoutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Top Accent Strip */}
                <div className="h-2 bg-linear-to-r from-rose-500 via-pink-500 to-rose-600" />

                <div className="p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:rotate-90"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon Area */}
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative">
                        <LogOut size={32} className="text-rose-600" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-gray-900">
                            <AlertTriangle size={12} fill="currentColor" className="text-amber-500" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center space-y-2 mb-10">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            Terminate Session?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                            {userName ? (
                                <>Attention <span className="text-rose-600 underline underline-offset-4">{userName}</span>! Are you sure you want to decouple from the current operational node?</>
                            ) : (
                                "Are you sure you want to safely terminate your current authenticated session?"
                            )}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            Confirm Logout
                        </button>
                    </div>
                </div>

                {/* Footer Hint */}
                <div className="bg-gray-50 dark:bg-black/20 p-4 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Security Protocol Active • MScurechain V2.4
                    </p>
                </div>
            </div>
        </div>
    );
}
