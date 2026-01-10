'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/lib/integrations/services/user.service';
import { toast } from 'react-hot-toast';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    Camera,
    Save,
    CreditCard,
    FileText,
    Loader2
} from 'lucide-react';
import ImageCropper from '@/components/ui/ImageCropper';

const PharmacyProfile = () => {
    const { user, checkAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        gstin: '',
        shopName: '',
        licenseNo: ''
    });

    // Image Cropper State
    const [logo, setLogo] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string>('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: (user as any).email || '',
                mobile: (user as any).mobile || '',
                address: (user as any).address || '',
                gstin: (user as any).gstin || '',
                shopName: (user as any).shopName || user.name || '',
                licenseNo: (user as any).licenseNo || ''
            });
            setLogo((user as any).image || (user as any).logo || null);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempImage(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    };

    const handleCropApplied = (croppedImage: string) => {
        setLogo(croppedImage);
        setIsCropperOpen(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await userService.updateProfile({
                ...formData,
                image: logo // Send the base64 logo string
            } as any);

            await checkAuth(); // Refresh user data in store
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Pharmacist Protocol</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Node Configuration & Branding</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Commit Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-4xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center text-center h-full">
                        <div className="relative group mb-6">
                            <div className="w-40 h-40 rounded-3xl bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden shadow-inner">
                                {logo ? (
                                    <img src={logo} alt="Shop Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Camera size={32} />
                                        <span className="text-[10px] font-black uppercase">No Logo</span>
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-black transition-colors shadow-lg">
                                Change
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{formData.shopName || 'Shop Name'}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Branding Visual</p>

                        <div className="mt-8 w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed">
                                This logo will be reflected on all generated invoices and reports. Ensure high resolution for best print quality.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-4xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl dark:bg-indigo-900/30">
                                <Building size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Entity Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Shop / Entity Name</label>
                                <input
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="ENTER SHOP NAME"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Owner Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="FULL LEGAL NAME"
                                />
                            </div>
                            <div className="space-y-2 col-span-full">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-10 pr-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder="STREET, CITY, STATE, ZIP"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Legal */}
                    <div className="bg-white dark:bg-gray-800 rounded-4xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl dark:bg-emerald-900/30">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Legal & Contact</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">GSTIN Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-10 pr-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white uppercase"
                                        placeholder="22AAAAA0000A1Z5"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Drug License No.</label>
                                <input
                                    name="licenseNo"
                                    value={formData.licenseNo}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white uppercase"
                                    placeholder="DL-00000-00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-10 pr-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder="PHONE NUMBER"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-10 pr-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder="EMAIL@DOMAIN.COM"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCropperOpen && (
                <ImageCropper
                    src={tempImage}
                    onCrop={handleCropApplied}
                    onCancel={() => setIsCropperOpen(false)}
                    aspectRatio={1} // Square logo preferred
                />
            )}
        </div>
    );
};

export default PharmacyProfile;
