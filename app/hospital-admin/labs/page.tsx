"use client";

import React from "react";
import { FlaskConical } from "lucide-react";

export default function HospitalAdminLabs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
        Laboratory Management
      </h1>
      <div className="text-center py-12" style={{ color: 'var(--secondary-color)' }}>
        <FlaskConical size={48} className="mx-auto mb-4 opacity-50" />
        <p>Laboratory management feature coming soon</p>
      </div>
    </div>
  );
}

