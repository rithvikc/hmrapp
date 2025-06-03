import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface Patient {
  name?: string;
  gender?: string;
  dob?: string;
  referring_doctor?: string;
  practice_name?: string;
  known_allergies?: string;
  medicare_number?: string;
  address?: string;
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
  pharmacist_name?: string;
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
    if (!data.medications || data.medications.length === 0) {
      return `
        <tr>
          <td colspan="4" style="text-align: center; padding: 20px; color: #6b7280; font-style: italic;">
            No medications documented for this patient.
          </td>
        </tr>
      `;
    }

    return data.medications.map((med) => `
      <tr${med.compliance_status === 'Poor' || med.compliance_status === 'Non-adherent' ? ' class="non-compliant"' : ''}>
        <td>
          <strong>${med.name}</strong><br>
          ${med.strength || ''}
        </td>
        <td>
          ${med.dosage || ''}<br>
          ${med.frequency || ''}
        </td>
        <td>
          ${med.compliance_status || 'Not assessed'}<br>
          ${med.compliance_comment || ''}
        </td>
        <td>
          ${med.dosage || 'Patient understanding not documented'}
        </td>
      </tr>
    `).join('');
  };

  const generateLifestyleAssessment = (category: string) => {
    const habits = interview || {};
    
    switch(category) {
      case 'smoking_status':
        if (habits.smoking_status === 'Non-smoker') {
          return 'Non-smoker - Continue to abstain from tobacco products.';
        } else if (habits.smoking_status === 'Current smoker') {
          const cigarettesDaily = habits.cigarettes_daily || 0;
          return `Current smoker - ${cigarettesDaily} cigarettes per day. Smoking cessation counselling provided with referral to Quitline (13 78 48).`;
        } else if (habits.smoking_status === 'Ex-smoker') {
          return `Ex-smoker - Quit date: ${habits.quit_date || 'Not specified'}. Encourage continued abstinence.`;
        }
        return 'Smoking status not assessed.';
        
      case 'alcohol_consumption':
        if (habits.alcohol_consumption === 'No alcohol consumption') {
          return 'No alcohol consumption - Continue current abstinence.';
        } else if (habits.alcohol_consumption?.includes('Regular') || habits.alcohol_consumption?.includes('Excessive')) {
          const drinksWeekly = habits.alcohol_drinks_weekly || 0;
          return `${habits.alcohol_consumption} - ${drinksWeekly} drinks per week. Counselling provided regarding safe drinking guidelines.`;
        } else if (habits.alcohol_consumption?.includes('Minimal')) {
          return 'Minimal alcohol consumption - Within recommended guidelines.';
        }
        return 'Alcohol consumption status not assessed.';
        
      default:
        return 'Assessment not available.';
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Medication Review Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .hmr-report {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .logo {
      font-weight: 700;
      font-size: 24pt;
      color: white;
      letter-spacing: -0.5px;
    }

    .logo-subtitle {
      font-size: 12pt;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 4px;
    }

    .pharmacist-details {
      text-align: right;
      font-size: 10pt;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.95);
      line-height: 1.4;
    }

    .title-section {
      text-align: center;
      margin-bottom: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .title-section h1 {
      font-size: 28pt;
      font-weight: 700;
      margin: 0;
      color: #1e293b;
      letter-spacing: -0.5px;
    }

    .title-section h2 {
      font-size: 16pt;
      font-weight: 500;
      margin: 8px 0 0 0;
      color: #475569;
    }

    .patient-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .patient-info-table td {
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      font-size: 11pt;
      background: white;
    }

    .patient-info-table .label {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      font-weight: 600;
      width: 25%;
      color: #374151;
    }

    .patient-info-table .value {
      font-weight: 400;
      color: #1f2937;
    }

    .section-header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 16px 20px;
      margin: 25px 0 8px 0;
      font-size: 14pt;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
      letter-spacing: 0.5px;
    }

    .subsection {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .subsection h4 {
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 12pt;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }

    .subsection h5 {
      font-weight: 600;
      margin: 16px 0 8px 0;
      font-style: normal;
      color: #6b7280;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .subsection p {
      margin: 8px 0;
      color: #374151;
      line-height: 1.6;
    }

    .recommendations-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .recommendations-table th,
    .recommendations-table td {
      border: 1px solid #e5e7eb;
      padding: 16px;
      vertical-align: top;
      font-size: 10pt;
      background: white;
    }

    .recommendations-table th {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      font-weight: 600;
      text-align: center;
      font-size: 11pt;
      letter-spacing: 0.3px;
    }

    .recommendations-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .issue-cell {
      width: 40%;
    }

    .action-cell {
      width: 30%;
    }

    .management-cell {
      width: 30%;
      background: #fef7ed !important;
    }

    .medication-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .medication-table th,
    .medication-table td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      font-size: 10pt;
      vertical-align: top;
      background: white;
    }

    .medication-table th {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.3px;
    }

    .medication-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .medication-table .non-compliant {
      font-weight: 700;
      color: #dc2626;
    }

    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .signature-line {
      border-bottom: 2px solid #374151;
      width: 200px;
      height: 30px;
      margin-top: 20px;
    }

    .page-break {
      page-break-before: always;
    }

    .allergies-section {
      margin: 20px 0;
      background: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
    }

    .allergies-section h4 {
      font-weight: 600;
      margin-bottom: 8px;
      color: #dc2626;
      font-size: 12pt;
    }

    .allergies-section ul {
      margin: 0;
      padding-left: 20px;
      color: #7f1d1d;
    }

    .lifestyle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .lifestyle-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }

    .lifestyle-card h5 {
      color: #374151;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 11pt;
    }

    .closing-section {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-top: 20px;
    }

    .closing-section p {
      margin-bottom: 16px;
      line-height: 1.7;
      color: #374151;
    }

    .footer-signature {
      margin-top: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }

    .footer-signature .name {
      font-weight: 700;
      font-size: 14pt;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .footer-signature .credentials {
      color: #475569;
      font-weight: 500;
      line-height: 1.5;
    }

    /* Print specific styles */
    @media print {
      .hmr-report {
        margin: 0;
        padding: 15mm;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .header, .title-section, .subsection, .recommendations-table, .medication-table {
        break-inside: avoid;
      }
    }

    @page {
      margin: 15mm;
      size: A4;
    }

    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-high {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .status-medium {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fed7aa;
    }

    .status-low {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }
  </style>
</head>
<body>
  <div class="hmr-report">
    <!-- Modern Header -->
    <div class="header">
      <div>
        <div class="logo">LAL MedReviews</div>
        <div class="logo-subtitle">Professional Clinical Services</div>
      </div>
      <div class="pharmacist-details">
        <strong>Accredited Pharmacist:</strong><br>
        ${data.interview?.pharmacist_name || 'Avishkar Lal (MRN 8362)'}<br>
        <strong>Email:</strong> avishkarlal01@gmail.com<br>
        <strong>Phone:</strong> 0490 417 047
      </div>
    </div>

    <div class="title-section">
      <h1>Home Medication Review</h1>
      <h2>Clinical Report and Management Plan</h2>
    </div>

    <!-- Enhanced Patient Information Table -->
    <table class="patient-info-table">
      <tr>
        <td class="label">Patient Name</td>
        <td class="value">${patient?.name || '[Patient Name]'}</td>
        <td class="label">Date of Birth</td>
        <td class="value">${formatDate(patient?.dob)}</td>
      </tr>
      <tr>
        <td class="label">Medicare Number</td>
        <td class="value">${patient?.medicare_number || '[Medicare Number]'}</td>
        <td class="label">Gender</td>
        <td class="value">${patient?.gender || '[Gender]'}</td>
      </tr>
      <tr>
        <td class="label">Referring Doctor</td>
        <td class="value">${patient?.referring_doctor || '[Referring Doctor]'}</td>
        <td class="label">Practice</td>
        <td class="value">${patient?.practice_name || '[Practice Name]'}</td>
      </tr>
      <tr>
        <td class="label">Contact Pharmacist</td>
        <td class="value">${data.interview?.pharmacist_name || 'Avishkar Lal'} (Ph: 0490 417 047)</td>
        <td class="label">Interview Date</td>
        <td class="value">${formatDate(interview?.interview_date)}</td>
      </tr>
      <tr>
        <td class="label">Address</td>
        <td class="value">${patient?.address || '[Address]'}</td>
        <td class="label">Next Review Date</td>
        <td class="value">${interview?.next_review_date ? formatDate(interview.next_review_date) : '6 months from interview date'}</td>
      </tr>
    </table>

    <!-- Enhanced General Comments Section -->
    <div class="general-comments-section">
      <h3 class="section-header">Section A: General Comments</h3>
      
      <div class="subsection">
        <h5>Medication Understanding & Management Assessment:</h5>
        <p>${generateMedicationUnderstanding()}</p>
      </div>
      
      <div class="subsection">
        <h5>Current Medication Administration:</h5>
        <p>${generateMedicationAdministration()}</p>
      </div>
      
      <div class="subsection">
        <h5>Adherence & Compliance Assessment:</h5>
        <p>${generateMedicationAdherence()}</p>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- Enhanced Lifestyle Section -->
    <div class="lifestyle-section">
      <h3 class="section-header">Section B: Lifestyle Considerations</h3>
      
      <div class="subsection">
        <p>${generateFluidIntake()}</p>
      </div>
      
      <div class="lifestyle-grid">
        <div class="lifestyle-card">
          <h5>Dietary Habits</h5>
          <p>${generateEatingHabits()}</p>
        </div>
        
        <div class="lifestyle-card">
          <h5>Smoking Status</h5>
          <p>${generateLifestyleAssessment('smoking_status')}</p>
        </div>
        
        <div class="lifestyle-card">
          <h5>Alcohol Consumption</h5>
          <p>${generateLifestyleAssessment('alcohol_consumption')}</p>
        </div>
      </div>
      
      <div class="subsection">
        <h5>Lifestyle Counselling Provided:</h5>
        <p>Comprehensive lifestyle assessment was conducted with appropriate recommendations provided for optimizing health outcomes in conjunction with medication therapy. Patient education materials and resources were provided where applicable.</p>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- Enhanced Recommendations Section -->
    <div class="recommendations-section">
      <h3 class="section-header">Clinical Issues Identified & Recommendations</h3>
      
      ${data.recommendations.length > 0 ? `
        <table class="recommendations-table">
          <thead>
            <tr>
              <th class="issue-cell">Clinical Issues Identified</th>
              <th class="action-cell">Pharmacist Recommendations</th>
              <th class="management-cell">GP Management Plan</th>
            </tr>
          </thead>
          <tbody>
            ${generateRecommendationsRows()}
          </tbody>
        </table>
      ` : `
        <div class="subsection">
          <p><strong>No specific clinical issues were identified during this comprehensive medication review.</strong></p>
          <p>The patient's current medication regimen appears appropriate and well-managed. Continue current therapy as prescribed with routine monitoring as clinically indicated.</p>
        </div>
      `}
    </div>

    <div class="page-break"></div>

    <!-- Enhanced Medication Tables -->
    <div class="medications-section">
      <h3 class="section-header">Current Medication Regimen</h3>
      
      <div class="allergies-section">
        <h4>⚠️ Known Allergies & Adverse Drug Reactions</h4>
        <ul>
          <li><strong>${patient?.known_allergies || 'Nil Known Drug Allergies (NKDA)'}</strong></li>
        </ul>
      </div>
      
      <div class="medication-tables">
        <h4>Current Medications (Non-compliant medications highlighted in red)</h4>
        <table class="medication-table">
          <thead>
            <tr>
              <th style="width: 25%;">Prescribed Medication</th>
              <th style="width: 15%;">Administration</th>
              <th style="width: 30%;">Clinical Comments & Compliance</th>
              <th style="width: 30%;">Therapeutic Purpose (Patient Understanding)</th>
            </tr>
          </thead>
          <tbody>
            ${generateMedicationRows()}
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- Enhanced Closing Section -->
    <div class="closing-section">
      <h3 class="section-header">Clinical Summary & Follow-up Plan</h3>
      
      <p>Please review the recommendations outlined in this report and implement as clinically appropriate. Follow-up medication review recommended in ${interview?.next_review_date ? formatDate(interview.next_review_date) : '6 months from interview date'}. Please complete the attached Medication Management Report and forward a copy to avishkarlal01@gmail.com for MBS billing (item 900).</p>
      
      <p>As the accredited pharmacist responsible for conducting this comprehensive Home Medication Review, I acknowledge that clinical judgment and individual patient factors may influence the implementation of these recommendations. I welcome discussion regarding any suggestions and remain available to provide additional clinical information or clarification.</p>
      
      <p>With your permission, I would be pleased to maintain ongoing contact with ${patient?.name || 'the patient'} to monitor progress and provide continued pharmaceutical care as needed.</p>
    </div>

    <!-- Professional Footer -->
    <div class="footer-signature">
      <p><strong>Clinical Report Prepared By:</strong></p>
      <div class="name">${data.interview?.pharmacist_name || 'Avishkar Lal'}</div>
      <div class="credentials">
        Accredited Pharmacist (MRN 8362)<br>
        Phone: 0490 417 047<br>
        Email: avishkarlal01@gmail.com<br>
        <em>LAL MedReviews - Professional Clinical Services</em>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    console.log('PDF Generation started with data:', JSON.stringify(requestData, null, 2));

    // Handle different data structures
    let reviewData;
    if (requestData.reviewData) {
      // Data from FinalReview component (nested structure)
      reviewData = requestData.reviewData;
      console.log('Using nested reviewData structure');
    } else if (requestData.patient) {
      // Data from Dashboard component (direct structure)
      reviewData = requestData;
      console.log('Using direct data structure');
    } else {
      throw new Error('Invalid data structure: neither reviewData nor patient found');
    }

    console.log('Final reviewData:', JSON.stringify(reviewData, null, 2));

    // Generate HTML content
    const htmlContent = generateHMRHTML(reviewData);
    console.log('HTML content generated, length:', htmlContent.length);

    // Create PDF using Puppeteer with better macOS compatibility
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
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Allow custom Chrome path
    });

    console.log('Browser launched, creating new page...');
    const page = await browser.newPage();
    
    // Set a more reasonable timeout and better error handling
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    console.log('Page content set, generating PDF...');

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

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    await browser.close();

    // Return the PDF as a blob response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="HMR_Report_${reviewData.patient?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : 'No details available';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate PDF', 
        details: errorMessage,
        stack: errorDetails
      },
      { status: 500 }
    );
  }
} 