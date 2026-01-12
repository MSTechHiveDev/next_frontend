
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
            </tr>
            <tr>
              <td>${patient.vitals?.height ? patient.vitals.height + ' cm' : '-'}</td>
              <td>${patient.vitals?.weight ? patient.vitals.weight + ' kg' : '-'}</td>
              <td>${patient.vitals?.temperature ? patient.vitals.temperature + ' °F' : '-'}</td>
              <td>${patient.vitals?.bloodPressure || '-'}</td>
              <td>${patient.vitals?.pulse ? patient.vitals.pulse + ' bpm' : '-'}</td>
              <td>${patient.vitals?.spO2 ? patient.vitals.spO2 + '%' : '-'}</td>
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
