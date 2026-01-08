'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Smartphone,
  MapPin,
  HeartPulse,
  Scale,
  Ruler,
  Droplets,
  Activity,
  ShieldAlert,
  Thermometer,
  Pill,
  Edit,
  Save,
  X,
} from 'lucide-react';

import { Card } from '@/components/admin';
import type { PatientProfile as PatientProfileType } from '@/lib/integrations';

interface PatientProfileProps {
  profile: PatientProfileType;
}

type EditableProfile = {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  conditions?: string;
  allergies?: string;
  medications?: string;
};

export default function PatientProfile({ profile }: PatientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditableProfile>({});

  const infoGroups = [
    {
      title: 'Identity',
      icon: <User size={18} className="text-blue-600" />,
      items: [
        { label: 'Name', value: profile.user?.name },
        { label: 'MRN', value: profile.mrn },
        { label: 'Gender', value: profile.gender },
        { label: 'Age', value: profile.age ? `${profile.age} Years` : '---' },
      ],
    },
    {
      title: 'Contact',
      icon: <Smartphone size={18} className="text-emerald-600" />,
      items: [
        { label: 'Mobile', value: profile.user?.mobile },
        { label: 'Email', value: profile.user?.email },
        { label: 'Address', value: profile.address },
      ],
    },
    {
      title: 'Clinical Vitals',
      icon: <HeartPulse size={18} className="text-rose-600" />,
      items: [
        { label: 'Height', value: profile.height },
        { label: 'Weight', value: profile.weight },
        { label: 'Blood Group', value: profile.bloodGroup },
        { label: 'Marital Status', value: profile.maritalStatus },
      ],
    },
  ];

  const clinicalDetails = [
    { label: 'Conditions', value: profile.conditions, icon: <ShieldAlert /> },
    { label: 'Allergies', value: profile.allergies, icon: <Thermometer /> },
    { label: 'Medications', value: profile.medications, icon: <Pill /> },
  ];

  const handleEditClick = () => {
    setFormData({
      name: profile.user?.name,
      email: profile.user?.email,
      mobile: profile.user?.mobile,
      address: profile.address,
      height: profile.height,
      weight: profile.weight,
      bloodGroup: profile.bloodGroup,
      maritalStatus: profile.maritalStatus,
      conditions: profile.conditions,
      allergies: profile.allergies,
      medications: profile.medications,
    });
    setIsEditing(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { patientService } = await import(
        '@/lib/integrations/services/patient.service'
      );

      // Use 'as any' to bypass strict type check for now, ensuring the payload goes through
      await patientService.updateProfile(formData as any);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8">
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">{key}</label>
                  <input
                    name={key}
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={key}
                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoGroups.map((group, idx) => (
          <Card key={idx} className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              {group.icon}
              {group.title}
            </h3>
            {group.items.map((item, i) => (
              <p key={i} className="text-sm">
                <strong>{item.label}:</strong> {item.value || '---'}
              </p>
            ))}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-bold mb-4">Clinical Summary</h3>
        {clinicalDetails.map((d, i) => (
          <p key={i}>
            <strong>{d.label}:</strong> {d.value || 'None'}
          </p>
        ))}
      </Card>

      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-indigo-600" />
          Medical History
        </h3>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {profile.medicalHistory || 'No medical history records available.'}
        </p>
      </Card>

      <button
        onClick={handleEditClick}
        className="px-6 py-3 bg-gray-900 text-white rounded-lg flex items-center gap-2"
      >
        <Edit size={16} />
        Edit Profile
      </button>
    </div>
  );
}
