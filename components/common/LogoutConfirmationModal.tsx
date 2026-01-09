'use client';

import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon & Title */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 mb-2">
                            <LogOut size={32} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Sign Out Confirmation
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Are you sure you want to sign out? You will need to log in again to access your account.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-[0.98]"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;
