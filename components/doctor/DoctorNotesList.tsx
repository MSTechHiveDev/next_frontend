'use client';

import React, { useState, useEffect } from 'react';
import { deleteQuickNoteAction } from '@/lib/integrations/actions/doctor.actions';
import { DoctorQuickNote } from '@/lib/integrations/types/doctor';
import { FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DoctorNotesListProps {
    initialNotes: DoctorQuickNote[];
}

export default function DoctorNotesList({ initialNotes }: DoctorNotesListProps) {
    // We can use local state to instantly remove item on delete, while waiting for refresh
    const [notes, setNotes] = useState<DoctorQuickNote[]>(initialNotes);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const handleDeleteNote = async (id: string) => {
        setIsDeleting(id);
        try {
            const res = await deleteQuickNoteAction(id);
            if (res.success) {
                setNotes((prev) => prev.filter((n) => n._id !== id));
                toast.success('Note deleted');
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to delete note');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="bg-white dark:bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">My Notes</h3>
                </div>
                <button className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                    Clear All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {notes.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">No notes yet</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note._id}
                            className="p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-all group shadow-sm"
                        >
                            <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                {note.text}
                            </p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                <span className="text-[10px] text-blue-500 font-bold">
                                    {new Date(note.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                <button
                                    onClick={() => handleDeleteNote(note._id)}
                                    disabled={isDeleting === note._id}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    {isDeleting === note._id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 text-center">
                <p className="text-[10px] text-gray-400 font-medium">{notes.length} note{notes.length !== 1 ? 's' : ''} saved • Cloud storage</p>
            </div>
        </div>
    );
}
