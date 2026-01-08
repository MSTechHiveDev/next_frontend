"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { hospitalAdminService } from "@/lib/integrations/services/hospitalAdmin.service";
import { useAuthStore } from "@/stores/authStore";
import {
  Building2,
  Edit,
  LogOut,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Star,
  Bed,
  Activity,
  ShieldCheck,
  User,
} from "lucide-react";

interface Hospital {
  _id: string;
  hospitalId?: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  pincode?: string;
  establishedYear?: number;
  numberOfBeds?: number;
  ICUBeds?: number;
  numberOfDoctors?: number;
  ambulanceAvailability?: boolean;
  specialities?: string[];
  services?: string[];
  status?: string;
  operatingHours?: string;
  rating?: string;
}

export default function HospitalAdminProfile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form data for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    pincode: "",
    operatingHours: "",
    numberOfBeds: "",
    ICUBeds: "",
    ambulanceAvailability: false,
  });

  useEffect(() => {
    fetchHospital();
  }, []);

  const fetchHospital = async () => {
    try {
      const data = await hospitalAdminService.getHospital();
      setHospital(data.hospital);
      // Pre-fill form data
      setEditFormData({
        name: data.hospital.name || "",
        email: data.hospital.email || "",
        phone: data.hospital.phone || "",
        website: data.hospital.website || "",
        address: data.hospital.address || "",
        pincode: data.hospital.pincode || "",
        operatingHours: data.hospital.operatingHours || "",
        numberOfBeds: data.hospital.numberOfBeds?.toString() || "",
        ICUBeds: data.hospital.ICUBeds?.toString() || "",
        ambulanceAvailability: data.hospital.ambulanceAvailability || false,
      });
    } catch (error: any) {
      console.error("Failed to fetch hospital:", error);
      toast.error(error.message || "Failed to load hospital details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEditFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setEditFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    if (editFormData.phone && editFormData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        website: editFormData.website?.trim() || "",
        address: editFormData.address.trim(),
        pincode: editFormData.pincode?.trim() || "",
        operatingHours: editFormData.operatingHours?.trim() || "",
        ambulanceAvailability: editFormData.ambulanceAvailability,
      };

      if (editFormData.numberOfBeds) {
        payload.numberOfBeds = parseInt(editFormData.numberOfBeds);
      }
      if (editFormData.ICUBeds) {
        payload.ICUBeds = parseInt(editFormData.ICUBeds);
      }

      await hospitalAdminService.updateHospital(payload);
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
      await fetchHospital();
    } catch (error: any) {
      console.error("Failed to update hospital:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium opacity-50">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="text-center py-16">
        <Building2 className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-xl font-bold opacity-50">Hospital not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Building2 className="text-blue-500" size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-color)" }}>
              Hospital Profile
            </h1>
            <p className="text-sm opacity-60 mt-1">Manage your hospital information</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
          >
            <Edit size={18} />
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div
        className="rounded-2xl border shadow-xl p-8"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Hospital Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Hospital Name */}
          <div className="col-span-full lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">
              Hospital Name
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>
              {hospital.name}
            </p>
          </div>

          {/* Hospital ID */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">
              Hospital ID
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-color)" }}>
              {hospital.hospitalId || "N/A"}
            </p>
          </div>

          {/* Email */}
          {hospital.email && (
            <div className="flex items-start gap-3">
              <Mail className="text-blue-500 mt-1" size={18} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
                  Email
                </p>
                <p className="font-medium" style={{ color: "var(--text-color)" }}>
                  {hospital.email}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {hospital.phone && (
            <div className="flex items-start gap-3">
              <Phone className="text-green-500 mt-1" size={18} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
                  Phone
                </p>
                <p className="font-medium" style={{ color: "var(--text-color)" }}>
                  {hospital.phone}
                </p>
              </div>
            </div>
          )}

          {/* Website */}
          {hospital.website && (
            <div className="flex items-start gap-3">
              <Globe className="text-purple-500 mt-1" size={18} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
                  Website
                </p>
                <a
                  href={hospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-500 hover:underline"
                >
                  {hospital.website}
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="col-span-full flex items-start gap-3">
            <MapPin className="text-red-500 mt-1" size={18} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
                Address
              </p>
              <p className="font-medium" style={{ color: "var(--text-color)" }}>
                {hospital.address}
                {hospital.pincode && ` - ${hospital.pincode}`}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-6" style={{ borderColor: "var(--border-color)" }}></div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Operating Hours */}
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-orange-500" size={20} />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                Operating Hours
              </p>
            </div>
            <p className="text-lg font-bold">
              {hospital.operatingHours || "24/7"}
            </p>
          </div>

          {/* Total Beds */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-3 mb-2">
              <Bed className="text-blue-500" size={20} />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                Total Beds
              </p>
            </div>
            <p className="text-lg font-bold">{hospital.numberOfBeds || 0}</p>
          </div>

          {/* ICU Beds */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-red-500" size={20} />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                ICU Beds
              </p>
            </div>
            <p className="text-lg font-bold text-red-500">{hospital.ICUBeds || 0}</p>
          </div>

          {/* Rating */}
          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-500" size={20} />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                Rating
              </p>
            </div>
            <p className="text-lg font-bold text-yellow-500">
              {hospital.rating || "4.5"} / 5
            </p>
          </div>
        </div>

        {/* Status and Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-500" size={20} />
                <span className="text-sm font-bold">Status</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  hospital.status === "approved" || hospital.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : hospital.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {hospital.status || "pending"}
              </span>
            </div>
          </div>

          {/* Ambulance */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="text-blue-500" size={20} />
                <span className="text-sm font-bold">Ambulance Service</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  hospital.ambulanceAvailability
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {hospital.ambulanceAvailability ? "AVAILABLE" : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Specialities and Services */}
        {(hospital.specialities?.length || hospital.services?.length) && (
          <>
            <div className="border-t mt-6 pt-6" style={{ borderColor: "var(--border-color)" }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialities */}
              {hospital.specialities && hospital.specialities.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">
                    Medical Specialities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialities.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-bold border border-blue-500/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {hospital.services && hospital.services.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-3">
                    Services Offered
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hospital.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Admin User Info Card */}
      {user && (
        <div
          className="rounded-2xl border shadow-lg p-6"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {user.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
                Logged in as
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--text-color)" }}>
                {user.name}
              </p>
              <p className="text-sm opacity-60">{(user as any).email || "No email available"}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold border border-purple-500/20">
                Hospital Administrator
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="max-w-2xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-inherit border-b px-6 py-4 flex justify-between items-center" style={{ borderColor: "var(--border-color)" }}>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>
                Edit Hospital Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-color)",
                    borderColor: "var(--border-color)",
                  }}
                />
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    required
                    placeholder="10 digits"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                  Website URL
                </label>
                <input
                  type="url"
                  name="website"
                  value={editFormData.website}
                  onChange={handleEditChange}
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-color)",
                    borderColor: "var(--border-color)",
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                  Address *
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-color)",
                    borderColor: "var(--border-color)",
                  }}
                />
              </div>

              {/* Pincode and Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={editFormData.pincode}
                    onChange={handleEditChange}
                    placeholder="6 digits"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    name="operatingHours"
                    value={editFormData.operatingHours}
                    onChange={handleEditChange}
                    placeholder="e.g., 24/7 or 9am - 8pm"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
              </div>

              {/* Beds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                    Total Beds
                  </label>
                  <input
                    type="number"
                    name="numberOfBeds"
                    value={editFormData.numberOfBeds}
                    onChange={handleEditChange}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--secondary-color)" }}>
                    ICU Beds
                  </label>
                  <input
                    type="number"
                    name="ICUBeds"
                    value={editFormData.ICUBeds}
                    onChange={handleEditChange}
                    placeholder="e.g., 20"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                </div>
              </div>

              {/* Ambulance Availability */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <input
                    type="checkbox"
                    name="ambulanceAvailability"
                    checked={editFormData.ambulanceAvailability}
                    onChange={handleEditChange}
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                  <span className="text-sm font-medium">Ambulance Service Available</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 flex justify-end gap-3" style={{ borderColor: "var(--border-color)" }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
