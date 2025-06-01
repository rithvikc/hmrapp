import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface Patient {
  name?: string;
  gender?: string;
  dob?: string;
  referring_doctor?: string;
  practice_name?: string;
  known_allergies?: string;
}

interface Medication {
  name: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  compliance_status?: string;
  compliance_comment?: string;
  actual_usage?: string;
  route?: string;
}

interface Interview {
  medication_understanding?: string;
  medication_administration?: string;
  medication_adherence?: string;
  fluid_intake?: string;
  tea_cups_daily?: number;
  coffee_cups_daily?: number;
  eating_habits?: string;
  dietary_concerns?: string;
  smoking_status?: string;
  cigarettes_daily?: number;
  quit_date?: string;
  alcohol_consumption?: string;
  alcohol_drinks_weekly?: number;
  recreational_drug_use?: string;
  drug_type?: string;
  drug_frequency?: string;
  interview_date?: string;
  next_review_date?: string;
}

interface Recommendation {
  category?: string;
  issue_identified: string;
  suggested_action: string;
  patient_counselling?: string;
}

interface HMRData {
  patient: Patient;
  medications: Medication[];
  interview: Interview;
  recommendations: Recommendation[];
}

// HTML template for the HMR report
const generateHMRHTML = (data: HMRData) => {
  const { patient, medications, interview, recommendations } = data;
  
  // Determine pronouns
  const pronoun = patient?.gender?.toLowerCase() === 'female' ? 'She' : 'He';
  const possessive = patient?.gender?.toLowerCase() === 'female' ? 'her' : 'his';
  const objective = patient?.gender?.toLowerCase() === 'female' ? 'her' : 'him';
  
  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '[Date]';
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generate medication understanding content
  const generateMedicationUnderstanding = () => {
    const understanding = interview?.medication_understanding || '';
    if (understanding.includes('Good')) {
      return `${patient?.name} has a good level of understanding of why ${possessive.toLowerCase()} was prescribed ${possessive.toLowerCase()} medications.`;
    } else if (understanding.includes('Moderate')) {
      return `${patient?.name} has a moderate level of understanding of why ${possessive.toLowerCase()} was prescribed ${possessive.toLowerCase()} medications. Some clarification was needed for certain medications.`;
    } else {
      return `${patient?.name} has a poor level of understanding of why ${possessive.toLowerCase()} was prescribed ${possessive.toLowerCase()} medications.`;
    }
  };

  // Generate medication administration content
  const generateMedicationAdministration = () => {
    const administration = interview?.medication_administration || '';
    if (administration.includes('DAA packed by')) {
      return `${pronoun} currently uses a DAA packed by ${possessive.toLowerCase()} local pharmacy.`;
    } else if (administration.includes('own DAA')) {
      return `${pronoun} currently self-administers and uses ${possessive.toLowerCase()} own DAA.`;
    } else {
      return `${pronoun} currently self-administers and does not use a DAA.`;
    }
  };

  // Generate medication adherence content
  const generateMedicationAdherence = () => {
    const adherence = interview?.medication_adherence || '';
    if (adherence.includes('Good compliance')) {
      return 'Good compliance. Medications are taken the same time each day.';
    } else if (adherence.includes('Poor compliance')) {
      return `Poor compliance was suspected due to varying dosing times. Lifestyle factors such as sleeping in, having breakfast at different times also influences the time ${possessive.toLowerCase()} takes ${possessive.toLowerCase()} medications.`;
    } else {
      return `Medications taken at consistent times, but dose discrepancies have been identified.`;
    }
  };

  // Generate fluid intake content
  const generateFluidIntake = () => {
    const fluidIntake = interview?.fluid_intake || '';
    if (fluidIntake.includes('Adequate')) {
      return 'Adequate fluid intake ~approximately 2L / day.';
    } else {
      let content = 'Inadequate fluid intake. Limited water intake (< 2Litre/day).';
      if (interview?.tea_cups_daily || interview?.coffee_cups_daily) {
        const drinks = [];
        if (interview.tea_cups_daily) drinks.push(`tea (${interview.tea_cups_daily} daily)`);
        if (interview.coffee_cups_daily) drinks.push(`coffee (${interview.coffee_cups_daily} daily)`);
        content += ` ${pronoun} also drinks other fluids such as ${drinks.join(' /')} which can act as diuretic agents.`;
      }
      return content;
    }
  };

  // Generate eating habits content
  const generateEatingHabits = () => {
    const eatingHabits = interview?.eating_habits || '';
    if (eatingHabits.includes('Good')) {
      return 'Good eating habits - Regular meals, balanced diet.';
    } else {
      let content = 'Poor eating habits - Irregular meals, dietary concerns identified.';
      if (interview?.dietary_concerns) {
        content += ` Specific concerns: ${interview.dietary_concerns}`;
      }
      return content;
    }
  };

  // Generate substance use content
  const generateSubstanceUse = () => {
    const parts = [];
    
    // Smoking
    if (interview?.smoking_status === 'Non-smoker') {
      parts.push('Non-smoker');
    } else if (interview?.smoking_status === 'Current smoker') {
      parts.push(`Current smoker (${interview.cigarettes_daily || 0} cigarettes per day)`);
    } else if (interview?.smoking_status === 'Ex-smoker') {
      parts.push(`Ex-smoker (quit date: ${interview.quit_date || 'not specified'})`);
    }

    // Alcohol
    if (interview?.alcohol_consumption) {
      if (interview.alcohol_consumption.includes('No alcohol')) {
        parts.push('no alcohol consumption');
      } else if (interview.alcohol_consumption.includes('Regular')) {
        parts.push(`regular alcohol consumption (${interview.alcohol_drinks_weekly || 0} standard drinks per week)`);
      } else {
        parts.push(interview.alcohol_consumption.toLowerCase());
      }
    }

    // Recreational drugs
    if (interview?.recreational_drug_use && !interview.recreational_drug_use.includes('No recreational')) {
      parts.push(`recreational drug use: ${interview.drug_type || 'unspecified'} (${interview.drug_frequency || 'frequency not specified'})`);
    } else {
      parts.push('no recreational drug use');
    }

    return parts.join(', ');
  };

  // Generate recommendations table rows
  const generateRecommendationsRows = () => {
    if (!recommendations || recommendations.length === 0) {
      return '<tr><td class="issue-cell"><strong>No specific issues identified</strong><br>No medication-related problems were identified during this review.</td><td class="action-cell">Continue current management.</td><td class="management-cell">[ ] Agreed- implemented<br>[ ] Other (please specify)<br><br><div class="signature-line">Review</div></td></tr>';
    }

    return recommendations.map((rec: Recommendation) => `
      <tr>
        <td class="issue-cell">
          <strong>${rec.category || 'General Issue'}</strong><br>
          Upon consultation with ${patient?.name}, I found the following:<br>
          • ${rec.issue_identified}
        </td>
        <td class="action-cell">
          ${rec.suggested_action}
        </td>
        <td class="management-cell">
          [ ] Agreed- implemented<br>
          [ ] Other (please specify)<br><br>
          <div class="signature-line">Review</div>
        </td>
      </tr>
      ${rec.patient_counselling ? `
      <tr>
        <td class="issue-cell">
          <strong>Patient Counselling Provided:</strong><br>
          ${rec.patient_counselling}
        </td>
        <td class="action-cell">
          For your information.
        </td>
        <td class="management-cell">
          [ ] Noted<br><br>
          <div class="signature-line">Review</div>
        </td>
      </tr>
      ` : ''}
    `).join('');
  };

  // Generate medication table rows
  const generateMedicationRows = () => {
    if (!medications || medications.length === 0) {
      return '<tr><td colspan="4">No medications documented</td></tr>';
    }

    return medications.map((med: Medication) => {
      const isNonCompliant = med.compliance_status === 'Poor' || med.compliance_status === 'Non-adherent';
      const drugName = isNonCompliant ? `<strong>${med.name}</strong>` : med.name;
      const dosage = med.dosage || 'As directed';
      const route = med.route || 'Oral';
      const compliance = med.compliance_comment || med.actual_usage || 'Taking as prescribed';
      const purpose = `For ${med.name.split(' ')[0].toLowerCase()} management`; // Simplified purpose

      return `
        <tr>
          <td>${drugName} ${med.strength || ''}<br><small>${dosage} ${med.frequency || ''}</small></td>
          <td>${route}</td>
          <td>${compliance}</td>
          <td>${purpose}</td>
        </tr>
      `;
    }).join('');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Medication Review Report</title>
  <style>
    .hmr-report {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      max-width: 210mm;
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
      max-height: 60px;
      font-weight: bold;
      font-size: 14pt;
      color: #4472C4;
    }

    .pharmacist-details {
      text-align: right;
      font-size: 10pt;
    }

    .title-section {
      text-align: center;
      margin-bottom: 20px;
    }

    .title-section h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 0;
      color: #4472C4;
    }

    .title-section h2 {
      font-size: 14pt;
      font-weight: bold;
      margin: 5px 0 0 0;
      color: #4472C4;
    }

    .patient-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .patient-info-table td {
      border: 1px solid #000;
      padding: 8px;
      font-size: 10pt;
    }

    .patient-info-table .label {
      background-color: #f0f0f0;
      font-weight: bold;
      width: 25%;
    }

    .section-header {
      background-color: #FF6B6B;
      color: white;
      padding: 8px;
      margin: 15px 0 5px 0;
      font-size: 12pt;
      font-weight: bold;
    }

    .subsection h4 {
      font-weight: bold;
      margin: 10px 0 5px 0;
      text-decoration: underline;
    }

    .subsection h5 {
      font-weight: bold;
      margin: 8px 0 3px 0;
      font-style: italic;
    }

    .subsection p {
      margin: 5px 0;
    }

    .recommendations-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }

    .recommendations-table th,
    .recommendations-table td {
      border: 1px solid #000;
      padding: 8px;
      vertical-align: top;
      font-size: 10pt;
    }

    .recommendations-table th {
      background-color: #FF6B6B;
      color: white;
      font-weight: bold;
      text-align: center;
    }

    .issue-cell {
      width: 40%;
    }

    .action-cell {
      width: 30%;
    }

    .management-cell {
      width: 30%;
    }

    .medication-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }

    .medication-table th,
    .medication-table td {
      border: 1px solid #000;
      padding: 5px;
      font-size: 10pt;
      vertical-align: top;
    }

    .medication-table th {
      background-color: #FF6B6B;
      color: white;
      font-weight: bold;
      text-align: center;
    }

    .signature-section {
      margin-top: 30px;
      page-break-inside: avoid;
    }

    .signature-line {
      border-bottom: 1px solid #000;
      width: 100px;
      height: 20px;
      margin-top: 10px;
    }

    .page-break {
      page-break-before: always;
    }

    .allergies-section {
      margin: 15px 0;
    }

    .allergies-section h4 {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .allergies-section ul {
      margin: 0;
      padding-left: 20px;
    }

    /* Print specific styles */
    @media print {
      .hmr-report {
        margin: 0;
        padding: 20px;
      }
      
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="hmr-report">
    <!-- Page 1 Header -->
    <div class="header">
      <div class="logo">LAL MedReviews</div>
      <div class="pharmacist-details">
        Accredited Pharmacist: Avishkar Lal (MRN 8362)<br>
        Email: avishkarlal01@gmail.com
      </div>
    </div>

    <div class="title-section">
      <h1>Home Medication Review</h1>
      <h2>Report and Management Plan</h2>
    </div>

    <!-- Patient Information Table -->
    <table class="patient-info-table">
      <tr>
        <td class="label">Patient</td>
        <td class="value">${patient?.name || '[Patient Name]'}</td>
        <td class="label">DOB</td>
        <td class="value">${formatDate(patient?.dob)}</td>
      </tr>
      <tr>
        <td class="label">Doctor</td>
        <td class="value">${patient?.referring_doctor || '[Dr Name]'}</td>
        <td colspan="2"></td>
      </tr>
      <tr>
        <td class="label">Contact Pharmacist</td>
        <td class="value">Avishkar Lal (Ph: 0490 417 047)</td>
        <td class="label">Date of interview</td>
        <td class="value">${formatDate(interview?.interview_date)}</td>
      </tr>
      <tr>
        <td class="label">Community Pharmacy</td>
        <td class="value">${patient?.practice_name || ''}</td>
        <td class="label">Suggested Next review</td>
        <td class="value">${interview?.next_review_date ? formatDate(interview.next_review_date) : '6 months'}</td>
      </tr>
    </table>

    <!-- Page 1: General Comments Section -->
    <div class="general-comments-section">
      <h3 class="section-header">General Comments</h3>
      
      <div class="subsection">
        <h4>Medication Understanding</h4>
        <p>${generateMedicationUnderstanding()}</p>
        
        <h5>Counselling Provided:</h5>
        <p>I have explained to ${objective} the relevant medication indications and outlined any discrepancies (if present) in this report.</p>
      </div>
      
      <div class="subsection">
        <h4>Medication Administration</h4>
        <p>${generateMedicationAdministration()}</p>
        
        <h5>Counselling Provided:</h5>
        <p>I have counselled ${objective} on proper medication administration techniques and the importance of consistency in taking medications.</p>
      </div>
      
      <div class="subsection">
        <h4>Medication Adherence</h4>
        <p>${generateMedicationAdherence()}</p>
        
        <h5>Counselling Provided:</h5>
        <p>I have counselled ${objective} on the importance of taking ${possessive.toLowerCase()} medications at the same time each day for optimal effect.</p>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- Page 2: Lifestyle Considerations -->
    <div class="lifestyle-section">
      <h3 class="section-header">Lifestyle Considerations</h3>
      <p>Please note the following lifestyle factors that have been identified during the interview:</p>
      
      <div class="subsection">
        <h4>Fluid Intake:</h4>
        <p>${generateFluidIntake()}</p>
        
        <h5>Counselling Provided:</h5>
        <p>I have advised ${objective} on the importance of adequate fluid intake and its relationship with medication effectiveness.</p>
      </div>
      
      <div class="subsection">
        <h4>Eating habits</h4>
        <p>${generateEatingHabits()}</p>
        
        <h5>Counselling Provided:</h5>
        <p>I have discussed the importance of regular meal times and their impact on medication timing and absorption.</p>
      </div>
      
      <div class="subsection">
        <h4>Smoking / Alcohol / Drug use:</h4>
        <p>${generateSubstanceUse()}</p>
        
        <h5>Counselling Provided:</h5>
        <p>I have discussed the potential interactions between ${possessive.toLowerCase()} lifestyle choices and ${possessive.toLowerCase()} current medications.</p>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- Page 3: Issues and Recommendations Table -->
    <div class="recommendations-section">
      <h3 class="section-header">Issues and Recommendations</h3>
      
      <table class="recommendations-table">
        <thead>
          <tr>
            <th>Issues and Recommendations</th>
            <th>Suggested Action</th>
            <th>Management Plan<br>(to be completed by GP)</th>
          </tr>
        </thead>
        <tbody>
          ${generateRecommendationsRows()}
        </tbody>
      </table>
    </div>

    <div class="page-break"></div>

    <!-- Page 4: Medication Tables -->
    <div class="medications-section">
      <h3 class="section-header">Current medications and any relevant comments are as follows:</h3>
      
      <div class="allergies-section">
        <h4>Allergies</h4>
        <ul>
          <li>${patient?.known_allergies || 'Nil Known'}</li>
        </ul>
      </div>
      
      <div class="medication-tables">
        <h4>Medications (Those in bold are not being taken in accordance with prescribed instructions)</h4>
        <table class="medication-table">
          <thead>
            <tr>
              <th>Prescribed Drug</th>
              <th>Admin</th>
              <th>Comment/Compliance</th>
              <th>Purpose (according to patient)</th>
            </tr>
          </thead>
          <tbody>
            ${generateMedicationRows()}
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- Page 5: Closing Section -->
    <div class="closing-section">
      <p>As the pharmacist responsible for undertaking this medication management review, I understand that there may be sound clinical reasons why my recommendations may not be considered appropriate for this patient. I would welcome advice on this and how these reports can be made useful to you. I would also be pleased to provide supporting literature or clarification of any issue raised in this report.</p>
      
      <p>Please complete the attached Medication Management Report and forward a copy to <a href="mailto:avishkarlal01@gmail.com">avishkarlal01@gmail.com</a>. MBS item number 900 can then be claimed.</p>
      
      <p>I recommend that a follow up review be considered on ${interview?.next_review_date ? formatDate(interview.next_review_date) : '6 months from today'}.</p>
      
      <p>However, if you have no objections, I will see ${objective} again in a few months to follow up on any ongoing issues.</p>
      
      <div class="signature-section">
        <p>Regards</p>
        <br><br>
        <p>Avishkar Lal<br>
        Accredited Pharmacist MRN 8362<br>
        Mob: 0490 417 047</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const { reviewData } = await request.json();

    // Generate HTML content
    const htmlContent = generateHMRHTML(reviewData);

    // Create PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Create filename
    const patientName = reviewData.patient?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Patient';
    const date = new Date().toLocaleDateString('en-AU').replace(/\//g, '');
    const filename = `HMR_Report_${patientName}_${date}.pdf`;

    // Ensure reports directory exists
    const reportsDir = join(process.cwd(), 'public', 'reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    // Save PDF file
    const filePath = join(reportsDir, filename);
    writeFileSync(filePath, pdfBuffer);

    // Return response with PDF URL
    return NextResponse.json({
      success: true,
      pdfUrl: `/reports/${filename}`,
      filename,
      size: pdfBuffer.length
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 