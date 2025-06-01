import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface PatientData {
  id: number;
  name: string;
  gender: string;
  dob: string;
  age: number;
  medicare_number: string;
  phone: string;
  address: string;
  referring_doctor: string;
  practice_name: string;
  known_allergies: string;
  current_conditions: string;
  past_medical_history: string;
}

interface PatientsPDFData {
  title: string;
  generated: string;
  filters: {
    search: string;
    gender: string;
    ageRange: string;
    condition: string;
    doctor: string;
  };
  patients: PatientData[];
  summary: {
    totalPatients: number;
    genderDistribution: {
      male: number;
      female: number;
      other: number;
    };
    ageGroups: {
      '18-30': number;
      '31-50': number;
      '51-70': number;
      '70+': number;
    };
  };
}

const generatePatientsHTML = (data: PatientsPDFData) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const generatePatientRows = () => {
    if (!data.patients || data.patients.length === 0) {
      return '<tr><td colspan="7" class="text-center">No patients found</td></tr>';
    }

    return data.patients.map((patient) => `
      <tr>
        <td>${patient.id}</td>
        <td><strong>${patient.name}</strong><br><small>${patient.gender}, ${patient.age} years</small></td>
        <td>${formatDate(patient.dob)}</td>
        <td>${patient.medicare_number || 'N/A'}</td>
        <td>${patient.referring_doctor}<br><small>${patient.practice_name || ''}</small></td>
        <td>${patient.phone || 'N/A'}</td>
        <td class="conditions-cell">
          ${patient.current_conditions ? `<div class="condition-item">${patient.current_conditions}</div>` : 'None documented'}
          ${patient.known_allergies && patient.known_allergies !== 'None' ? `<div class="allergy-item"><strong>Allergies:</strong> ${patient.known_allergies}</div>` : ''}
        </td>
      </tr>
    `).join('');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Patients List Report</title>
  <style>
    .patients-report {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #000;
      max-width: 297mm;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #4472C4;
      padding-bottom: 10px;
    }

    .logo {
      font-weight: bold;
      font-size: 16pt;
      color: #4472C4;
    }

    .report-info {
      text-align: right;
      font-size: 9pt;
      color: #666;
    }

    .title-section {
      text-align: center;
      margin-bottom: 20px;
    }

    .title-section h1 {
      font-size: 20pt;
      font-weight: bold;
      margin: 0;
      color: #4472C4;
    }

    .title-section .subtitle {
      font-size: 12pt;
      color: #666;
      margin-top: 5px;
    }

    .summary-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 15px;
    }

    .summary-card h3 {
      font-size: 12pt;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #4472C4;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px dotted #ccc;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .filters-section {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .filters-section h3 {
      font-size: 11pt;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .filter-item {
      font-size: 9pt;
    }

    .filter-item strong {
      color: #333;
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 9pt;
    }

    .patients-table th,
    .patients-table td {
      border: 1px solid #ddd;
      padding: 8px;
      vertical-align: top;
      text-align: left;
    }

    .patients-table th {
      background-color: #4472C4;
      color: white;
      font-weight: bold;
      text-align: center;
      font-size: 9pt;
    }

    .patients-table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .patients-table tbody tr:hover {
      background-color: #e8f4fd;
    }

    .conditions-cell {
      max-width: 120px;
      word-wrap: break-word;
    }

    .condition-item {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 3px;
      padding: 2px 4px;
      margin: 2px 0;
      font-size: 8pt;
    }

    .allergy-item {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 3px;
      padding: 2px 4px;
      margin: 2px 0;
      font-size: 8pt;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }

    .page-break {
      page-break-before: always;
    }

    @media print {
      .patients-report {
        margin: 0;
        padding: 15px;
      }
      
      .page-break {
        page-break-before: always;
      }
    }

    @page {
      margin: 15mm;
      size: A4 landscape;
    }
  </style>
</head>
<body>
  <div class="patients-report">
    <!-- Header -->
    <div class="header">
      <div class="logo">LAL MedReviews</div>
      <div class="report-info">
        Generated: ${new Date(data.generated).toLocaleDateString('en-AU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}<br>
        Total Patients: ${data.summary.totalPatients}
      </div>
    </div>

    <!-- Title Section -->
    <div class="title-section">
      <h1>Patients List Report</h1>
      <div class="subtitle">Complete patient database export with summary statistics</div>
    </div>

    <!-- Summary Statistics -->
    <div class="summary-section">
      <div class="summary-card">
        <h3>Demographics Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span>Total Patients:</span>
            <span><strong>${data.summary.totalPatients}</strong></span>
          </div>
          <div class="summary-item">
            <span>Male:</span>
            <span>${data.summary.genderDistribution.male}</span>
          </div>
          <div class="summary-item">
            <span>Female:</span>
            <span>${data.summary.genderDistribution.female}</span>
          </div>
          <div class="summary-item">
            <span>Other/Unknown:</span>
            <span>${data.summary.genderDistribution.other}</span>
          </div>
        </div>
      </div>

      <div class="summary-card">
        <h3>Age Distribution</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span>18-30 years:</span>
            <span>${data.summary.ageGroups['18-30']}</span>
          </div>
          <div class="summary-item">
            <span>31-50 years:</span>
            <span>${data.summary.ageGroups['31-50']}</span>
          </div>
          <div class="summary-item">
            <span>51-70 years:</span>
            <span>${data.summary.ageGroups['51-70']}</span>
          </div>
          <div class="summary-item">
            <span>70+ years:</span>
            <span>${data.summary.ageGroups['70+']}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Applied Filters -->
    <div class="filters-section">
      <h3>Applied Filters</h3>
      <div class="filters-grid">
        <div class="filter-item">
          <strong>Search:</strong> ${data.filters.search}
        </div>
        <div class="filter-item">
          <strong>Gender:</strong> ${data.filters.gender}
        </div>
        <div class="filter-item">
          <strong>Age Range:</strong> ${data.filters.ageRange}
        </div>
        <div class="filter-item">
          <strong>Condition:</strong> ${data.filters.condition}
        </div>
        <div class="filter-item">
          <strong>Doctor:</strong> ${data.filters.doctor}
        </div>
      </div>
    </div>

    <!-- Patients Table -->
    <table class="patients-table">
      <thead>
        <tr>
          <th style="width: 40px;">ID</th>
          <th style="width: 120px;">Patient Details</th>
          <th style="width: 80px;">Date of Birth</th>
          <th style="width: 80px;">Medicare</th>
          <th style="width: 120px;">Referring Doctor</th>
          <th style="width: 80px;">Contact</th>
          <th style="width: 150px;">Conditions & Allergies</th>
        </tr>
      </thead>
      <tbody>
        ${generatePatientRows()}
      </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
      <p>LAL MedReviews - Professional Home Medication Review Management System</p>
      <p>This report contains confidential patient information. Handle in accordance with privacy regulations.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const patientsData = await request.json();
    console.log('Patients PDF generation started for', patientsData.patients?.length, 'patients');

    // Generate HTML content
    const htmlContent = generatePatientsHTML(patientsData);
    console.log('HTML content generated, length:', htmlContent.length);

    // Create PDF using Puppeteer
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    console.log('Browser launched, creating new page...');
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    console.log('Page content set, generating PDF...');

    // Generate PDF buffer with landscape orientation for better table display
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    await browser.close();

    // Return the PDF as a blob response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Patients_Report_${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating patients PDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : 'No details available';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate patients PDF', 
        details: errorMessage,
        stack: errorDetails
      },
      { status: 500 }
    );
  }
} 