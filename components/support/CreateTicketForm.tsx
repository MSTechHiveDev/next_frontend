import React, { useState } from 'react';
import { supportService } from '@/lib/integrations/services/support.service';
import { toast } from 'react-hot-toast';
import { Upload, X, Send, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ImageCropper from '../ui/ImageCropper';

interface CreateTicketFormProps {
    onSuccess?: () => void;
    basePath: string; // e.g. '/hospital-admin/support'
}

export default function CreateTicketForm({ onSuccess, basePath }: CreateTicketFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'feedback',
        message: '',
    });
    const [files, setFiles] = useState<File[]>([]);

    // Cropper State
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]; // Process one by one for cropping

            if (files.length >= 3) {
                toast.error("Maximum 3 images allowed");
                return;
            }

            // If image, open cropper
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setImageToCrop(reader.result as string);
                    setPendingFile(file);
                };
                reader.readAsDataURL(file);
            } else {
                // If not image (unlikely given accept="image/*"), just add
                setFiles(prev => [...prev, file]);
            }

            // Generate a random key to reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleCropComplete = (croppedDataUrl: string) => {
        if (!pendingFile) return;

        // Convert Data URL to File
        fetch(croppedDataUrl)
            .then(res => res.blob())
            .then(blob => {
                const croppedFile = new File([blob], pendingFile.name, { type: 'image/jpeg' });
                setFiles(prev => [...prev, croppedFile]);
                setImageToCrop(null);
                setPendingFile(null);
            });
    };

    const handleCropCancel = () => {
        setImageToCrop(null);
        setPendingFile(null);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('subject', formData.subject);
        data.append('category', formData.category);
        data.append('message', formData.message);
        data.append('priority', 'medium'); // Default priority

        files.forEach(file => {
            data.append('attachments', file);
        });

        try {
            await supportService.createTicket(data);
            toast.success("Ticket created successfully");
            if (onSuccess) onSuccess();
            else router.push(basePath);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {imageToCrop && (
                <ImageCropper
                    src={imageToCrop}
                    onCrop={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <select
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white transition-all appearance-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="feedback">Feedback</option>
                            <option value="complaint">Complaint</option>
                            <option value="bug">Bug Report</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                        <input
                            type="text"
                            required
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white"
                            placeholder="Brief summary of the issue"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea
                        required
                        rows={6}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium dark:text-white resize-none"
                        placeholder="Describe your issue in detail..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attachments (Optional)</label>
                    <div className="flex flex-wrap gap-4">
                        {files.map((file, i) => (
                            <div key={i} className="relative group">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    {file.type.startsWith('image/') ? (
                                        <ImagePreview file={file} />
                                    ) : (
                                        <span className="text-xs text-gray-500 text-center p-2 break-all">{file.name}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {files.length < 3 && (
                            <label className="w-24 h-24 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 transition-colors">
                                <Upload size={20} className="text-gray-400 mb-1" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Add Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Max 3 images. Supported formats: JPG, PNG.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : <><Send size={18} /> Submit Ticket</>}
                </button>
            </form>
        </>
    );
}

function ImagePreview({ file }: { file: File }) {
    const [preview, setPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (!preview) return null;
    return <img src={preview} alt="preview" className="w-full h-full object-cover" />;
}
