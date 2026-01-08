"use client";

import React from "react";
import { Pill } from "lucide-react";

export default function HospitalAdminPharma() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
        Pharmacy Management
      </h1>
      <div className="text-center py-12" style={{ color: 'var(--secondary-color)' }}>
        <Pill size={48} className="mx-auto mb-4 opacity-50" />
        <p>Pharmacy management feature coming soon</p>
      </div>
    </div>
  );
}

