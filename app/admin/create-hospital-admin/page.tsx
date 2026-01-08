"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminService, createHospitalAdminAction, createPharmaAction, createLabsAction } from "@/lib/integrations";
import { Building2, UserPlus, Eye, EyeOff, Search, Pill, FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Card, FormInput, Button } from "@/components/admin";
import type { Hospital } from "@/lib/integrations/types";

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  hospitalId: string;
}

interface OptionalStaffData {
  enabled: boolean;
  name: string;
  email: string;
  mobile: string;
  password: string;
}

interface ShowPassword {
  admin: boolean;
  pharma: boolean;
  labs: boolean;
}

export default function CreateHospitalAdmin() {
  const router = useRouter();
  
  // Hospital Admin Data (Required)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    hospitalId: ""
  });

  // Optional Pharma Staff Data
  const [pharmaData, setPharmaData] = useState<OptionalStaffData>({
    enabled: false,
    name: "",
    email: "",
    mobile: "",
    password: ""
  });

  // Optional Labs Staff Data
  const [labsData, setLabsData] = useState<OptionalStaffData>({
    enabled: false,
    name: "",
    email: "",
    mobile: "",
    password: ""
  });

  // UI State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [showPassword, setShowPassword] = useState<ShowPassword>({
    admin: false,
    pharma: false,
    labs: false
  });
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showPharmaSection, setShowPharmaSection] = useState(false);
  const [showLabsSection, setShowLabsSection] = useState(false);

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.hospital-dropdown-container')) {
        setShowHospitalDropdown(false);
      }
    };

    if (showHospitalDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showHospitalDropdown]);

  // Filter hospitals based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.hospitalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [searchQuery, hospitals]);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const data = await adminService.getHospitalsClient();
      setHospitals(data || []);
      setFilteredHospitals(data || []);
    } catch (error: any) {
      console.error("Failed to fetch hospitals:", error);
      toast.error(error.message || "Failed to load hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    section: 'admin' | 'pharma' | 'labs'
  ) => {
    const { name, value } = e.target;
    
    // Mobile number validation - only allow 10 digits
    if (name === "mobile") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    if (section === 'admin') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (section === 'pharma') {
      setPharmaData(prev => ({ ...prev, [name]: value }));
    } else if (section === 'labs') {
      setLabsData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setFormData(prev => ({ ...prev, hospitalId: hospital._id }));
    setShowHospitalDropdown(false);
    setSearchQuery(hospital.name);
  };

  const selectedHospital = hospitals.find(h => h._id === formData.hospitalId);

  const validateForm = (): boolean => {
    // Validate Hospital Admin
    if (formData.mobile.length !== 10) {
      toast.error("Hospital Admin mobile number must be exactly 10 digits.");
      return false;
    }

    if (!formData.hospitalId) {
      toast.error("Please select a hospital.");
      return false;
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all Hospital Admin details.");
      return false;
    }

    // Validate Pharma if enabled
    if (pharmaData.enabled) {
      if (!pharmaData.name || !pharmaData.email || !pharmaData.mobile || !pharmaData.password) {
        toast.error("Please fill all Pharma staff details or disable the section.");
        return false;
      }
      if (pharmaData.mobile.length !== 10) {
        toast.error("Pharma staff mobile number must be exactly 10 digits.");
        return false;
      }
    }

    // Validate Labs if enabled
    if (labsData.enabled) {
      if (!labsData.name || !labsData.email || !labsData.mobile || !labsData.password) {
        toast.error("Please fill all Labs staff details or disable the section.");
        return false;
      }
      if (labsData.mobile.length !== 10) {
        toast.error("Labs staff mobile number must be exactly 10 digits.");
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", mobile: "", password: "", hospitalId: "" });
    setPharmaData({ enabled: false, name: "", email: "", mobile: "", password: "" });
    setLabsData({ enabled: false, name: "", email: "", mobile: "", password: "" });
    setSearchQuery("");
    setShowPharmaSection(false);
    setShowLabsSection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const createdRoles: string[] = [];

    try {
      // 1. Create Hospital Admin (Required)
      const adminResult = await createHospitalAdminAction({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        hospitalId: formData.hospitalId
      });

      if (!adminResult.success) {
        throw new Error(adminResult.error || 'Failed to create hospital admin');
      }
      createdRoles.push("Hospital Admin");

      // 2. Create Pharma Staff if enabled
      if (pharmaData.enabled) {
        const pharmaResult = await createPharmaAction({
          name: pharmaData.name,
          email: pharmaData.email,
          mobile: pharmaData.mobile,
          password: pharmaData.password,
          hospitalId: formData.hospitalId
        });

        if (!pharmaResult.success) {
          console.error("Pharma creation error:", pharmaResult.error);
          toast.error(`Pharma Staff creation failed: ${pharmaResult.error || 'Unknown error'}`);
        } else {
          createdRoles.push("Pharma Staff");
        }
      }

      // 3. Create Labs Staff if enabled
      if (labsData.enabled) {
        const labsResult = await createLabsAction({
          name: labsData.name,
          email: labsData.email,
          mobile: labsData.mobile,
          password: labsData.password,
          hospitalId: formData.hospitalId
        });

        if (!labsResult.success) {
          console.error("Labs creation error:", labsResult.error);
          toast.error(`Labs Staff creation failed: ${labsResult.error || 'Unknown error'}`);
        } else {
          createdRoles.push("Labs Staff");
        }
      }

      // Success message
      const successMessage = createdRoles.length > 1
        ? `Successfully created: ${createdRoles.join(", ")} for ${selectedHospital?.name}!`
        : `Hospital admin "${formData.name}" created successfully!`;

      toast.success(successMessage, {
        duration: 5000,
      });

      // Clear form
      resetForm();

      // Redirect after delay
      setTimeout(() => {
        router.push("/admin/hospital-admins");
      }, 2000);
    } catch (err: any) {
      let errorMessage = "Failed to create hospital admin";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = typeof err.error === 'string' ? err.error : err.error.message || errorMessage;
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (section: keyof ShowPassword) => {
    setShowPassword(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        icon={<Building2 className="text-blue-500" />}
        title="Create Hospital Staff"
        subtitle="Create hospital administrator and optionally add Pharma & Labs staff simultaneously"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hospital Selection */}
        <Card title="Select Hospital" padding="p-6">
          <div className="relative hospital-dropdown-container">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
              Hospital <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery || selectedHospital?.name || ""}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowHospitalDropdown(true);
                }}
                onFocus={() => setShowHospitalDropdown(true)}
                placeholder="Search and select a hospital"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-color)'
                }}
                required
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {showHospitalDropdown && filteredHospitals.length > 0 && (
              <div
                className="absolute z-10 w-full mt-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                {filteredHospitals.map((hospital) => (
                  <button
                    key={hospital._id}
                    type="button"
                    onClick={() => handleHospitalSelect(hospital)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b last:border-b-0"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div className="font-semibold" style={{ color: 'var(--text-color)' }}>
                      {hospital.name}
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--secondary-color)' }}>
                      {hospital.hospitalId} • {hospital.address}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedHospital && (
              <div className="mt-3 p-4 rounded-xl border bg-blue-50 dark:bg-blue-900/10" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  ✓ Selected: {selectedHospital.name}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
                  {selectedHospital.hospitalId} • {selectedHospital.address}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Hospital Admin Section */}
        <Card title="Hospital Administrator (Required)" icon={<UserPlus className="text-blue-500" />} padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={(e) => handleChange(e, 'admin')}
              placeholder="Enter full name"
            />

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => handleChange(e, 'admin')}
              placeholder="Enter email address"
            />

            <FormInput
              label="Mobile Number (10 digits)"
              type="tel"
              name="mobile"
              required
              value={formData.mobile}
              onChange={(e) => handleChange(e, 'admin')}
              placeholder="10-digit mobile"
            />

            <div className="relative">
              <FormInput
                label="Password"
                type={showPassword.admin ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={(e) => handleChange(e, 'admin')}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('admin')}
                className="absolute right-3 top-10 text-gray-500 hover:text-blue-500 transition-colors"
              >
                {showPassword.admin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </Card>

        {/* Optional Pharma Section */}
        <Card padding="p-0">
          <button
            type="button"
            onClick={() => setShowPharmaSection(!showPharmaSection)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Pill className="text-green-500" size={24} />
              <div className="text-left">
                <h3 className="font-bold" style={{ color: 'var(--text-color)' }}>
                  Pharma Staff (Optional)
                </h3>
                <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                  {pharmaData.enabled ? "✓ Enabled" : "Click to add pharmacy staff"}
                </p>
              </div>
            </div>
            {showPharmaSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showPharmaSection && (
            <div className="p-6 pt-0 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={pharmaData.enabled}
                  onChange={(e) => setPharmaData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 accent-green-600 rounded"
                />
                <span className="font-medium group-hover:text-green-600 transition-colors">
                  Create Pharma Staff Account
                </span>
              </label>

              {pharmaData.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormInput
                    label="Full Name"
                    type="text"
                    name="name"
                    value={pharmaData.name}
                    onChange={(e) => handleChange(e, 'pharma')}
                    placeholder="Pharma staff name"
                  />

                  <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={pharmaData.email}
                    onChange={(e) => handleChange(e, 'pharma')}
                    placeholder="pharma@example.com"
                  />

                  <FormInput
                    label="Mobile Number"
                    type="tel"
                    name="mobile"
                    value={pharmaData.mobile}
                    onChange={(e) => handleChange(e, 'pharma')}
                    placeholder="10-digit mobile"
                  />

                  <div className="relative">
                    <FormInput
                      label="Password"
                      type={showPassword.pharma ? "text" : "password"}
                      name="password"
                      value={pharmaData.password}
                      onChange={(e) => handleChange(e, 'pharma')}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('pharma')}
                      className="absolute right-3 top-10 text-gray-500 hover:text-green-500 transition-colors"
                    >
                      {showPassword.pharma ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Optional Labs Section */}
        <Card padding="p-0">
          <button
            type="button"
            onClick={() => setShowLabsSection(!showLabsSection)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="text-purple-500" size={24} />
              <div className="text-left">
                <h3 className="font-bold" style={{ color: 'var(--text-color)' }}>
                  Labs Staff (Optional)
                </h3>
                <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                  {labsData.enabled ? "✓ Enabled" : "Click to add laboratory staff"}
                </p>
              </div>
            </div>
            {showLabsSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showLabsSection && (
            <div className="p-6 pt-0 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={labsData.enabled}
                  onChange={(e) => setLabsData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 accent-purple-600 rounded"
                />
                <span className="font-medium group-hover:text-purple-600 transition-colors">
                  Create Labs Staff Account
                </span>
              </label>

              {labsData.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormInput
                    label="Full Name"
                    type="text"
                    name="name"
                    value={labsData.name}
                    onChange={(e) => handleChange(e, 'labs')}
                    placeholder="Labs staff name"
                  />

                  <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={labsData.email}
                    onChange={(e) => handleChange(e, 'labs')}
                    placeholder="labs@example.com"
                  />

                  <FormInput
                    label="Mobile Number"
                    type="tel"
                    name="mobile"
                    value={labsData.mobile}
                    onChange={(e) => handleChange(e, 'labs')}
                    placeholder="10-digit mobile"
                  />

                  <div className="relative">
                    <FormInput
                      label="Password"
                      type={showPassword.labs ? "text" : "password"}
                      name="password"
                      value={labsData.password}
                      onChange={(e) => handleChange(e, 'labs')}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('labs')}
                      className="absolute right-3 top-10 text-gray-500 hover:text-purple-500 transition-colors"
                    >
                      {showPassword.labs ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<UserPlus size={18} />}
            className="px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {pharmaData.enabled || labsData.enabled
              ? `Create ${[
                  'Hospital Admin',
                  pharmaData.enabled && 'Pharma',
                  labsData.enabled && 'Labs'
                ].filter(Boolean).join(' + ')}`
              : 'Create Hospital Admin'}
          </Button>
        </div>
      </form>
    </div>
  );
}
