
export const generateClinicalReceiptHtml = (data: any) => {
  const { hospital, patient, appointment, payment } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Patient Registration Bill - ${patient.name}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          line-height: 1.45;
          margin: 0;
          padding: 12px;
          background: white;
          font-size: 12px;
        }
        .receipt-container {
          width: 95%;
          margin: 0 auto;
        }
        .hospital-header {
          text-align: center;
          margin-bottom: 14px;
          border-bottom: 1px solid #000;
          padding-bottom: 6px;
        }
        .hospital-name {
          font-size: 25px;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
        }
        .hospital-info {
          font-size: 12px;
          margin: 4px 0;
        }
        .bill-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .bill-title {
          font-size: 17px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .bill-subtitle {
           font-size: 11px;
           color: #666;
        }
        .bill-meta {
          text-align: right;
          font-size: 12px;
        }
        .section {
          margin-bottom: 12px;
        }
        .section-header {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 5px;
          border-bottom: 1px solid #eee;
          padding-bottom: 3px;
        }
        .data-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .data-grid td {
          padding: 5px 8px;
          border: 1px solid #ddd;
          font-size: 11px;
        }
        .label {
          font-weight: bold;
          background-color: #fcfcfc;
          width: 20%;
        }
        .value {
          width: 30%;
        }
        .vitals-grid {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .vitals-grid th, .vitals-grid td {
          border: 1px solid #ddd;
          padding: 5px 8px;
          text-align: left;
          font-size: 11px;
        }
        .vitals-grid th {
          background-color: #fcfcfc;
        }
        .symptoms-box {
          border-left: 4px solid #f59e0b;
          background-color: #fffbeb;
          padding: 10px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 5px;
        }
        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
        }
        .payment-table th, .payment-table td {
          padding: 7px;
          border: 1px solid #ddd;
          text-align: left;
          font-size: 12px;
        }
        .payment-table th {
          background-color: #fcfcfc;
          font-weight: bold;
        }
        .total-row td {
          font-weight: bold;
          font-size: 16px;
        }
        .payment-footer {
          margin-top: 8px;
          font-size: 10px;
          font-weight: bold;
        }
        .status-paid {
          color: #10b981;
        }
        .footer {
          margin-top: 18px;
          border-top: 1px solid #eee;
          padding-top: 10px;
          font-size: 10px;
          color: #777;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .signatory-box {
          text-align: right;
        }
        .sign-line {
          width: 180px;
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
          margin-left: auto;
        }
      </style>
    </head>
    <body onload="window.print(); setTimeout(() => window.close(), 1000);">
      <div class="receipt-container">
        <!-- Hospital Header -->
        <div class="hospital-header">
          <h1 class="hospital-name">${hospital.name}</h1>
          <p class="hospital-info">${hospital.address || "Central Healthcare District"}</p>
          <p class="hospital-info">Phone: ${hospital.contact} | Email: ${hospital.email}</p>
        </div>

        <!-- Bill Title Row -->
        <div class="bill-title-row">
          <div>
            <div class="bill-title">Patient Registration Bill</div>
            <div class="bill-subtitle">Appointment Receipt</div>
          </div>
          <div class="bill-meta">
            <div><strong>Date:</strong> ${appointment.date}</div>
            <div><strong>Bill No:</strong> ${appointment.appointmentId}</div>
          </div>
        </div>

        <!-- Patient Details -->
        <div class="section">
          <div class="section-header">Patient Details</div>
          <table class="data-grid">
            <tr>
              <td class="label">MRN:</td>
              <td class="value">${patient.mrn}</td>
              <td class="label">Blood Group:</td>
              <td class="value">${patient.bloodGroup || '-'}</td>
            </tr>
            <tr>
              <td class="label">Name:</td>
              <td class="value">${patient.name}</td>
              <td class="label">DOB:</td>
              <td class="value">${patient.dob ? patient.dob.split('T')[0] : '-'}</td>
            </tr>
            <tr>
              <td class="label">Age/Gender:</td>
              <td class="value">${patient.age} Yrs / ${patient.gender}</td>
              <td class="label">Mobile:</td>
              <td class="value">${patient.mobile}</td>
            </tr>
            <tr>
              <td class="label">Email:</td>
              <td class="value">${patient.email || '-'}</td>
              <td class="label">Alt. Contact:</td>
              <td class="value">${patient.emergencyContact || '-'}</td>
            </tr>
            <tr>
              <td class="label">Address:</td>
              <td colspan="3" class="value">${patient.address || '-'}</td>
            </tr>
          </table>
        </div>

        <!-- Appointment Details -->
        <div class="section">
          <div class="section-header">Appointment Details</div>
          <table class="data-grid">
            <tr>
              <td class="label">Consulting Doctor:</td>
              <td class="value">Dr. ${appointment.doctorName}</td>
              <td class="label">Appointment Date:</td>
              <td class="value">${appointment.date}</td>
            </tr>
            <tr>
              <td class="label">Qualification:</td>
              <td class="value">${appointment.qualification || 'MBBS, DM'}</td>
              <td class="label">Appointment Time:</td>
              <td class="value">${appointment.time || 'IN QUEUE'}</td>
            </tr>
            <tr>
              <td class="label">Specialization:</td>
              <td class="value">${appointment.specialization || 'General Doctor'}</td>
              <td class="label">Visit Type:</td>
              <td class="value">${appointment.type || 'Consultation'}</td>
            </tr>
          </table>
        </div>

        <!-- Vital Signs -->
        <div class="section">
          <div class="section-header">Vital Signs (Current Visit)</div>
          <table class="vitals-grid">
            <tr>
              <th>Height</th>
              <th>Weight</th>
              <th>Temp</th>
              <th>BP</th>
              <th>Pulse</th>
              <th>SpO2</th>
              <th>Sugar</th>
            </tr>
            <tr>
              <td>${patient.vitals?.height ? patient.vitals.height + ' cm' : '-'}</td>
              <td>${patient.vitals?.weight ? patient.vitals.weight + ' kg' : '-'}</td>
              <td>${patient.vitals?.temperature ? patient.vitals.temperature + ' °F' : '-'}</td>
              <td>${patient.vitals?.bloodPressure || patient.vitals?.bp || '-'}</td>
              <td>${patient.vitals?.pulse ? patient.vitals.pulse + ' bpm' : '-'}</td>
              <td>${patient.vitals?.spO2 || patient.vitals?.spo2 ? (patient.vitals?.spO2 || patient.vitals?.spo2) + '%' : '-'}</td>
              <td>${patient.vitals?.sugar ? patient.vitals.sugar + ' mg/dL' : '-'}</td>
            </tr>
          </table>
        </div>

        <!-- Allergies & History -->
        ${((patient.allergies && patient.allergies.length > 0 && patient.allergies !== 'None' && patient.allergies !== 'NONE') || (patient.medicalHistory && patient.medicalHistory !== 'None' && patient.medicalHistory !== 'NONE' && patient.medicalHistory !== 'CLEAR')) ? `
        <div class="section">
          <div class="section-header">Medical History & Allergies</div>
          <table class="data-grid">
            ${(patient.allergies && patient.allergies.length > 0 && patient.allergies !== 'None' && patient.allergies !== 'NONE') ? `
            <tr>
              <td class="label" style="color: #e11d48;">Allergies:</td>
              <td colspan="3" class="value" style="color: #e11d48;">${Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies}</td>
            </tr>` : ''}
            ${(patient.medicalHistory && patient.medicalHistory !== 'None' && patient.medicalHistory !== 'NONE' && patient.medicalHistory !== 'CLEAR') ? `
            <tr>
              <td class="label">Hist/Issues:</td>
              <td colspan="3" class="value">${patient.medicalHistory}</td>
            </tr>` : ''}
          </table>
        </div>` : ''}

        <!-- Symptoms -->
        ${appointment.notes ? `
        <div class="section">
          <div class="section-header">Current Symptoms</div>
          <div class="symptoms-box">
            ${appointment.notes}
          </div>
        </div>` : ''}

        <!-- Payment Summary -->
        <div class="section">
          <div class="section-header">Payment Summary</div>
          <table class="payment-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consultation Fee (OPD)</td>
                <td style="text-align: right;">${payment.amount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL AMOUNT</td>
                <td style="text-align: right;">₹ ${payment.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="payment-footer">
            <div>Payment Method: ${payment.method}</div>
            <div class="${payment.status === 'PAID' ? 'status-paid' : ''}">Payment Status: ${payment.status}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <div class="signatory-box">
            <div class="sign-line"></div>
            <div style="font-weight: bold; text-transform: uppercase;">Authorized Signatory</div>
            <div style="font-size: 10px;">${hospital.name}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};


// --- NEW HELPERS FOR REPRINTING (MATCHING DOCTOR TEMPLATES) ---


export const generatePrescriptionHtml = (data: any) => {
    const { hospital, patient, doctor, prescription } = data;
    const medicines = prescription.medicines || [];
    const dietAdvice = prescription.dietAdvice || [];
    
    // Helper to avoid double Dr. prefix
    const formatDoctorName = (name: string) => {
        if (!name) return 'Unknown Doctor';
        return name.toLowerCase().startsWith('dr') ? name : `Dr. ${name}`;
    };

    const getHonorific = (gender: string, age?: number) => {
        if (!gender) return '';
        const g = gender.toLowerCase();
        if (g === 'male') return (age && age < 13) ? 'Master.' : 'Mr.';
        if (g === 'female') return (age && age < 13) ? 'Miss.' : 'Ms.';
        return '';
    };

    const patientName = `${getHonorific(patient.gender, patient.age)} ${patient.name}`.trim();
    const ageDisplay = (patient.age && patient.age !== '-') ? `${patient.age} Y` : 'N/A';
    const genderDisplay = (patient.gender && patient.gender !== '-') ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A';

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Prescription - ${patientName}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                    
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    }

                    body { 
                        font-family: 'Inter', sans-serif; 
                        margin: 0;
                        padding: 0;
                        background: white;
                        font-size: 11px;
                        line-height: 1.4;
                        color: #111;
                    }

                    .container {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        padding: 15mm 20mm;
                        position: relative;
                        box-sizing: border-box;
                    }

                    /* Header */
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                    }
                    .brand h1 { margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                    .brand p { margin: 4px 0 0; font-size: 9px; color: #555; }
                    
                    .doctor { text-align: right; }
                    .doctor h2 { margin: 0; font-size: 14px; font-weight: 700; }
                    .doctor p { margin: 2px 0 0; font-size: 9px; font-weight: 600; text-transform: uppercase; color: #555; }

                    /* Patient Grid - Clean, No Box */
                    .patient-info {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 15px;
                        margin-bottom: 25px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #eee;
                    }
                    .info-label { display: block; font-size: 8px; font-weight: 700; text-transform: uppercase; color: #777; margin-bottom: 3px; letter-spacing: 0.5px; }
                    .info-val { font-size: 12px; font-weight: 600; text-transform: uppercase; }

                    /* Diagnosis */
                    .diagnosis-box { margin-bottom: 20px; }
                    .diagnosis-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #777; letter-spacing: 0.5px; }
                    .diagnosis-val { font-size: 12px; font-weight: 600; margin-left: 6px; }

                    /* Med List/Table */
                    .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #000; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; letter-spacing: 0.5px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #777; padding: 0 0 8px 0; border-bottom: 1px solid #eee; }
                    td { padding: 10px 0; border-bottom: 1px solid #f9f9f9; vertical-align: top; }
                    
                    .med-name { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
                    .med-meta { font-size: 10px; color: #555; }
                    
                    /* Advice Grid */
                    .advice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                    .advice-list { list-style: none; padding: 0; margin: 0; }
                    .advice-list li { margin-bottom: 6px; padding-left: 10px; position: relative; font-size: 11px; }
                    .advice-list li:before { content: "•"; position: absolute; left: 0; color: #aaa; }

                    /* Follow up */
                    .follow-up { margin-top: 30px; padding-top: 15px; border-top: 1px dashed #eee; font-size: 11px; }
                    .follow-up strong { font-weight: 700; text-transform: uppercase; font-size: 9px; color: #777; margin-right: 5px; }

                    /* Footer */
                    .footer { position: absolute; bottom: 15mm; left: 20mm; right: 20mm; display: flex; justify-content: space-between; align-items: flex-end; }
                    .footer-l span { display: block; font-size: 8px; color: #999; line-height: 1.5; }
                    
                    .sig-block { text-align: center; }
                    .sig-img { height: 40px; display: block; margin: 0 auto 5px; }
                    .sig-line { border-top: 1px solid #ccc; padding-top: 5px; font-size: 9px; font-weight: 600; text-transform: uppercase; min-width: 120px; }

                </style>
            </head>
            <body onload="window.print();">
                <div class="container">
                    <div class="header">
                        <div class="brand">
                            <h1>${hospital.name || "CureChain Medical Center"}</h1>
                            <p>${hospital.address || "Medical District, City Center"}</p>
                            <p>${hospital.contact || ""} ${hospital.email ? `• ${hospital.email}` : ""}</p>
                        </div>
                        <div class="doctor">
                            <h2>${formatDoctorName(doctor.name)}</h2>
                            <p>${doctor.specialization || "Consultant Physician"}</p>
                        </div>
                    </div>

                    <div class="patient-info">
                        <div>
                            <span class="info-label">Name</span>
                            <span class="info-val">${patientName}</span>
                        </div>
                        <div>
                            <span class="info-label">Age / Gender</span>
                            <span class="info-val">${ageDisplay} / ${genderDisplay}</span>
                        </div>
                        <div>
                            <span class="info-label">ID</span>
                            <span class="info-val">${patient.mrn || '-'}</span>
                        </div>
                        <div>
                            <span class="info-label">Date</span>
                            <span class="info-val">${new Date(prescription.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>

                    ${prescription.diagnosis ? `
                    <div class="diagnosis-box">
                        <span class="diagnosis-label">Diagnosis:</span>
                        <span class="diagnosis-val">${prescription.diagnosis}</span>
                    </div>
                    ` : ''}

                    <div class="section-label">Medications</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%">Medicine</th>
                                <th style="width: 20%">Dosage</th>
                                <th style="width: 20%">Frequency</th>
                                <th style="width: 10%">Days</th>
                                <th style="width: 10%">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medicines.map((med: any) => `
                            <tr>
                                <td>
                                    <div class="med-name">${med.name}</div>
                                </td>
                                <td class="med-meta">${med.dosage || '-'}</td>
                                <td class="med-meta">${med.freq || med.frequency || '-'}</td>
                                <td class="med-meta">${med.duration || '-'}</td>
                                <td class="med-meta">${med.quantity || '-'}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="advice-grid">
                        ${dietAdvice.length > 0 ? `
                        <div>
                            <div class="section-label" style="border-bottom: 1px solid #eee; margin-top: 10px;">Advice</div>
                            <ul class="advice-list">
                                ${dietAdvice.filter((i: string) => i.trim()).map((d: string) => `<li>${d}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>

                    ${prescription.advice ? `
                    <div class="follow-up">
                        <strong>Advice / Follow Up:</strong> ${prescription.advice}
                    </div>
                    ` : ''}

                    <div class="footer">
                        <div class="footer-l">
                            <span>Generated by MsCurechain Systems</span>
                            <span>Valid for 30 days</span>
                        </div>
                        <div class="sig-block">
                            ${doctor.signature ? `<img src="${doctor.signature}" class="sig-img" />` : '<div style="height: 40px;"></div>'}
                            <div class="sig-line">Authorized Signature</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
    `;
};

export const generateLabTokenHtml = (data: any) => {
    const { hospital, patient, doctor, labToken } = data;
    const tests = labToken.tests || [];
    const priority = labToken.priority || 'routine';
    const notes = labToken.notes;
    
    const formatDoctorName = (name: string) => {
        if (!name) return 'Unknown Doctor';
        return name.toLowerCase().startsWith('dr') ? name : `Dr. ${name}`;
    };

    const getHonorific = (gender: string, age?: number) => {
        if (!gender) return '';
        const g = gender.toLowerCase();
        if (g === 'male') return (age && age < 13) ? 'Master.' : 'Mr.';
        if (g === 'female') return (age && age < 13) ? 'Miss.' : 'Ms.';
        return '';
    };

    const patientName = `${getHonorific(patient.gender, patient.age)} ${patient.name}`.trim();
    const ageDisplay = (patient.age && patient.age !== '-') ? `${patient.age} Y` : 'N/A';
    const genderDisplay = (patient.gender && patient.gender !== '-') ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A';

    return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lab Token</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 12mm 15mm 12mm 25mm; }
              }
              body { font-family: Arial, sans-serif; background: white; }
              .header { text-align: center; border-bottom: 4px solid #9333ea; padding-bottom: 10px; margin-bottom: 20px; }
              .token-badge { background: #1f2937; color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
              th { background: #f9fafb; font-weight: bold; }
              .priority { padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
              .priority-stat { background: #dc2626; color: white; }
              .priority-urgent { background: #f97316; color: white; }
              .priority-routine { background: #2563eb; color: white; }
            </style>
          </head>
          <body onload="window.print();">
            <div class="header">
              <h1 style="color: #9333ea; margin: 0; font-size: 24px;">LAB REQUISITION</h1>
              <h2 style="margin: 8px 0; font-size: 18px;">${hospital.name || 'CureChain Medical Center'}</h2>
              <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Department of Pathology & Radiodiagnosis</p>
              <div class="token-badge" style="margin-top: 12px;">
                <p style="margin: 0; font-size: 10px; opacity: 0.7;">TOKEN</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">${labToken.tokenNumber}</p>
              </div>
              <p style="margin-top: 8px; font-size: 12px;"><strong>Date:</strong> ${new Date(labToken.createdAt).toLocaleDateString('en-GB')}</p>
              <span class="priority priority-${priority}">${priority}</span>
            </div>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="margin: 4px 0;"><strong>Patient:</strong> ${patientName}</p>
              <p style="margin: 4px 0;"><strong>Age/Gender:</strong> ${ageDisplay} / ${genderDisplay}</p>
              <p style="margin: 4px 0;"><strong>MRN:</strong> ${patient.mrn || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Ordering Physician:</strong> ${formatDoctorName(doctor.name)}</p>
            </div>

            <h3 style="color: #9333ea; font-size: 14px; margin-bottom: 12px;">CLINICAL INVESTIGATIONS</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Instructions</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${tests.filter((t: any) => t.name.trim()).map((test: any, idx: number) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td style="font-weight: bold;">${test.name}</td>
                    <td>${test.category}</td>
                    <td style="font-style: italic; color: #6b7280;">${test.instructions || 'Standard'}</td>
                    <td style="text-align: right; font-weight: 600;">₹${(parseFloat(String(test.price)) || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${notes ? `<div style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; font-size: 12px;">Physician Remarks:</p>
              <p style="margin: 4px 0 0 0; font-style: italic;">${notes}</p>
            </div>` : ''}

            <div style="text-align: right; margin-top: 40px;">
              <p style="font-family: cursive; font-size: 18px; font-weight: bold; margin-bottom: 4px;">${formatDoctorName(doctor.name)}</p>
              <p style="border-top: 1px solid #000; display: inline-block; padding-top: 4px; font-size: 10px;">Medical Officer</p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 8px; text-align: center; font-size: 8px; color: #9ca3af;">
              <p style="margin: 0;">Generated by MsCureChain • ${new Date().toLocaleString()}</p>
            </div>
          </body>
          </html>
    `;
};
