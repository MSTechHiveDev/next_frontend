"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations/services/hospitalAdmin.service";
import { Building2, Edit } from "lucide-react";

export default function HospitalAdminHospital() {
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospital();
  }, []);

  const fetchHospital = async () => {
    try {
      const data = await hospitalAdminService.getHospital();
      setHospital(data.hospital);
    } catch (error: any) {
      console.error("Failed to fetch hospital:", error);
      toast.error(error.message || "Failed to load hospital details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!hospital) {
    return <div className="text-center py-8 text-red-500">Hospital not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
          Hospital Details
        </h1>
        <button
          onClick={() => {/* TODO: Add edit modal */}}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit size={20} />
          Edit Hospital
        </button>
      </div>

      <div
        className="p-6 rounded-xl border shadow-lg"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Hospital Name</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
              {hospital.name}
            </p>
          </div>
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Hospital ID</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
              {hospital.hospitalId}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Address</p>
            <p className="text-lg" style={{ color: 'var(--text-color)' }}>
              {hospital.address}
            </p>
          </div>
          {hospital.phone && (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Phone</p>
              <p className="text-lg" style={{ color: 'var(--text-color)' }}>
                {hospital.phone}
              </p>
            </div>
          )}
          {hospital.email && (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Email</p>
              <p className="text-lg" style={{ color: 'var(--text-color)' }}>
                {hospital.email}
              </p>
            </div>
          )}
          {hospital.website && (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Website</p>
              <p className="text-lg" style={{ color: 'var(--text-color)' }}>
                {hospital.website}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                hospital.status === 'approved' ? 'bg-green-100 text-green-800' :
                hospital.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {hospital.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

