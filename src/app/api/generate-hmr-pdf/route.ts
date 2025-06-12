import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { createClient } from '@/lib/supabase';

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
  prn_status?: string;
  prescribed_usage?: string;
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

    return data.medications.map((med, index) => `
      <tr${med.compliance_status === 'Poor' || med.compliance_status === 'Non-adherent' ? ' class="non-compliant"' : ''}>
        <td class="medication-name-cell">
          <div class="medication-header">
            <span class="medication-number">${index + 1}.</span>
            <strong class="medication-name">${med.name || 'Medication name not specified'}</strong>
          </div>
          ${med.strength ? `
            <div class="medication-strength">
              <span class="strength-label">Strength:</span> 
              <span class="strength-value">${med.strength}</span>
            </div>
          ` : ''}
          ${med.route ? `
            <div class="medication-route">
              <span class="route-label">Route:</span> 
              <span class="route-value">${med.route}</span>
            </div>
          ` : ''}
        </td>
        <td class="administration-cell">
          ${med.dosage ? `
            <div class="dosage-info">
              <span class="dosage-label">Dose:</span>
              <div class="dosage-value">${med.dosage}</div>
            </div>
          ` : '<div class="not-specified">Not specified</div>'}
          ${med.frequency ? `
            <div class="frequency-info">
              <span class="frequency-label">Frequency:</span>
              <div class="frequency-value">${med.frequency}</div>
            </div>
          ` : '<div class="not-specified">Frequency not specified</div>'}
          ${med.prn_status ? `
            <div class="prn-status">
              <span class="prn-badge ${med.prn_status === 'PRN' ? 'prn-badge-prn' : med.prn_status === 'Regular' ? 'prn-badge-regular' : 'prn-badge-other'}">${med.prn_status}</span>
            </div>
          ` : ''}
        </td>
        <td class="compliance-cell">
          ${med.compliance_status ? `
            <div class="compliance-status">
              <span class="compliance-badge ${med.compliance_status === 'Good' ? 'compliance-good' : med.compliance_status === 'Poor' ? 'compliance-poor' : 'compliance-moderate'}">
                ${med.compliance_status}
              </span>
            </div>
          ` : '<div class="not-assessed">Not assessed</div>'}
          ${med.compliance_comment ? `
            <div class="compliance-comment">
              <span class="comment-icon">💬</span>
              <span class="comment-text">${med.compliance_comment}</span>
            </div>
          ` : ''}
        </td>
        <td class="understanding-cell">
          <div class="understanding-content">
            ${med.actual_usage ? `
              <div class="actual-usage">
                <span class="usage-label">Actual usage:</span>
                <div class="usage-text">${med.actual_usage}</div>
              </div>
            ` : ''}
            ${med.prescribed_usage ? `
              <div class="prescribed-usage">
                <span class="prescribed-label">As prescribed:</span>
                <div class="prescribed-text">${med.prescribed_usage}</div>
              </div>
            ` : ''}
            ${!med.actual_usage && !med.prescribed_usage ? '<div class="not-documented">Patient understanding not documented</div>' : ''}
          </div>
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
    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .hmr-report {
      font-family: 'Source Sans Pro', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding: 18px 24px;
      background: #2c3e50;
      color: white;
      border-left: 4px solid #34495e;
    }

    .logo {
      font-family: 'Roboto', sans-serif;
      font-weight: 700;
      font-size: 20pt;
      color: white;
      letter-spacing: 0.5px;
    }

    .logo-subtitle {
      font-size: 10pt;
      font-weight: 400;
      color: #ecf0f1;
      margin-top: 2px;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .pharmacist-details {
      text-align: right;
      font-size: 9pt;
      font-weight: 400;
      color: #ecf0f1;
      line-height: 1.4;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .title-section {
      text-align: center;
      margin-bottom: 25px;
      padding: 20px;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-top: 4px solid #2c3e50;
    }

    .title-section h1 {
      font-family: 'Roboto', sans-serif;
      font-size: 22pt;
      font-weight: 700;
      margin: 0;
      color: #2c3e50;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .title-section h2 {
      font-size: 13pt;
      font-weight: 500;
      margin: 8px 0 0 0;
      color: #5a6c7d;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .patient-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      border: 1px solid #d1d5db;
    }

    .patient-info-table td {
      border: 1px solid #d1d5db;
      padding: 10px 14px;
      font-size: 10pt;
      background: white;
    }

    .patient-info-table .label {
      background: #f1f3f4;
      font-weight: 600;
      width: 25%;
      color: #374151;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .patient-info-table .value {
      font-weight: 400;
      color: #1f2937;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .section-header {
      background: #34495e;
      color: white;
      padding: 12px 18px;
      margin: 20px 0 6px 0;
      font-size: 12pt;
      font-weight: 600;
      font-family: 'Roboto', sans-serif;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      border-left: 4px solid #2c3e50;
    }

    .subsection {
      background: white;
      border: 1px solid #d1d5db;
      padding: 16px;
      margin-bottom: 12px;
    }

    .subsection h4 {
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #374151;
      font-size: 11pt;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 6px;
      font-family: 'Roboto', sans-serif;
    }

    .subsection h5 {
      font-weight: 600;
      margin: 14px 0 6px 0;
      font-style: normal;
      color: #5a6c7d;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .subsection p {
      margin: 6px 0;
      color: #374151;
      line-height: 1.5;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .recommendations-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      border: 1px solid #d1d5db;
    }

    .recommendations-table th,
    .recommendations-table td {
      border: 1px solid #d1d5db;
      padding: 12px;
      vertical-align: top;
      font-size: 9pt;
      background: white;
    }

    .recommendations-table th {
      background: #34495e;
      color: white;
      font-weight: 600;
      text-align: center;
      font-size: 10pt;
      letter-spacing: 0.2px;
      font-family: 'Roboto', sans-serif;
    }

    .recommendations-table tbody tr:nth-child(even) {
      background: #f8f9fa;
    }

    .issue-cell {
      width: 40%;
    }

    .action-cell {
      width: 30%;
    }

    .management-cell {
      width: 30%;
      background: #fff8e7 !important;
      border-left: 3px solid #f39c12 !important;
    }

    .medication-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .medication-table th,
    .medication-table td {
      border: 1px solid #d1d5db;
      padding: 12px 10px;
      font-size: 9pt;
      vertical-align: top;
      background: white;
      line-height: 1.4;
    }

    .medication-table th {
      background: #2c3e50;
      color: white;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.2px;
      font-family: 'Roboto', sans-serif;
      font-size: 10pt;
      padding: 14px 10px;
    }

    .medication-table tbody tr:nth-child(even) {
      background: #f8f9fa;
    }

    .medication-table tbody tr:hover {
      background: #e8f4f8;
    }

    .medication-table .non-compliant {
      background: #fdf2f2 !important;
      border-left: 4px solid #e74c3c !important;
    }

    /* Medication Name Cell Styles */
    .medication-name-cell {
      width: 28%;
    }

    .medication-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 8px;
    }

    .medication-number {
      background: #34495e;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .medication-name {
      color: #2c3e50;
      font-size: 10pt;
      font-weight: 700;
      line-height: 1.3;
      font-family: 'Roboto', sans-serif;
    }

    .medication-strength,
    .medication-route {
      margin: 4px 0;
      font-size: 8.5pt;
    }

    .strength-label,
    .route-label {
      color: #5a6c7d;
      font-weight: 600;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .strength-value,
    .route-value {
      color: #2c3e50;
      font-weight: 600;
      background: #f1f3f4;
      padding: 2px 4px;
      border-radius: 2px;
      margin-left: 4px;
    }

    /* Administration Cell Styles */
    .administration-cell {
      width: 22%;
    }

    .dosage-info,
    .frequency-info {
      margin: 6px 0;
    }

    .dosage-label,
    .frequency-label {
      color: #5a6c7d;
      font-weight: 600;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: block;
      margin-bottom: 2px;
    }

    .dosage-value {
      color: #2c3e50;
      font-weight: 700;
      font-size: 10pt;
      background: #e8f4f8;
      padding: 3px 6px;
      border-radius: 3px;
      border-left: 3px solid #3498db;
    }

    .frequency-value {
      color: #374151;
      font-weight: 600;
      font-size: 9pt;
      background: #f0f9f4;
      padding: 2px 5px;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }

    .prn-status {
      margin-top: 8px;
    }

    .prn-badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-radius: 12px;
      border: 1px solid;
    }

    .prn-badge-prn {
      background: #fff8e7;
      color: #d68910;
      border-color: #d68910;
    }

    .prn-badge-regular {
      background: #f0f9f4;
      color: #27ae60;
      border-color: #27ae60;
    }

    .prn-badge-other {
      background: #e8f4f8;
      color: #2980b9;
      border-color: #2980b9;
    }

    /* Compliance Cell Styles */
    .compliance-cell {
      width: 25%;
    }

    .compliance-status {
      margin-bottom: 8px;
    }

    .compliance-badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-radius: 4px;
      border: 1px solid;
    }

    .compliance-good {
      background: #f0f9f4;
      color: #27ae60;
      border-color: #27ae60;
    }

    .compliance-poor {
      background: #fdf2f2;
      color: #c0392b;
      border-color: #c0392b;
    }

    .compliance-moderate {
      background: #fff8e7;
      color: #d68910;
      border-color: #d68910;
    }

    .compliance-comment {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      background: #f8f9fa;
      padding: 6px 8px;
      border-radius: 3px;
      border-left: 3px solid #bdc3c7;
    }

    .comment-icon {
      font-size: 8pt;
      flex-shrink: 0;
    }

    .comment-text {
      font-size: 8pt;
      color: #374151;
      line-height: 1.3;
    }

    /* Understanding Cell Styles */
    .understanding-cell {
      width: 25%;
    }

    .understanding-content {
      font-size: 8.5pt;
    }

    .actual-usage,
    .prescribed-usage {
      margin: 6px 0;
      padding: 6px 8px;
      border-radius: 3px;
    }

    .actual-usage {
      background: #e8f4f8;
      border-left: 3px solid #3498db;
    }

    .prescribed-usage {
      background: #f0f9f4;
      border-left: 3px solid #27ae60;
    }

    .usage-label,
    .prescribed-label {
      color: #5a6c7d;
      font-weight: 600;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: block;
      margin-bottom: 2px;
    }

    .usage-text,
    .prescribed-text {
      color: #374151;
      font-size: 8.5pt;
      line-height: 1.3;
    }

    /* General utility styles */
    .not-specified,
    .not-assessed,
    .not-documented {
      color: #7f8c8d;
      font-style: italic;
      font-size: 8pt;
      padding: 4px 6px;
      background: #f8f9fa;
      border-radius: 2px;
      text-align: center;
    }

    /* Medication Summary Footer */
    .medication-summary {
      background: #34495e !important;
      color: white !important;
    }

    .summary-cell {
      padding: 12px 14px !important;
      border-color: #2c3e50 !important;
    }

    .medication-stats {
      font-size: 9pt;
      font-weight: 500;
      text-align: center;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .medication-notes {
      margin-top: 16px;
      background: #f8f9fa;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-left: 4px solid #34495e;
      border-radius: 0 4px 4px 0;
    }

    .medication-notes h5 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 10pt;
      font-weight: 600;
      font-family: 'Roboto', sans-serif;
    }

    .signature-section {
      margin-top: 30px;
      page-break-inside: avoid;
      background: #f8f9fa;
      padding: 16px;
      border: 1px solid #d1d5db;
      border-left: 4px solid #34495e;
    }

    .signature-line {
      border-bottom: 1px solid #34495e;
      width: 200px;
      height: 25px;
      margin-top: 16px;
    }

    .page-break {
      page-break-before: always;
    }

    .allergies-section {
      margin: 16px 0;
      background: #fdf2f2;
      border: 1px solid #e74c3c;
      border-left: 4px solid #c0392b;
      padding: 14px;
    }

    .allergies-section h4 {
      font-weight: 600;
      margin-bottom: 6px;
      color: #c0392b;
      font-size: 11pt;
      font-family: 'Roboto', sans-serif;
    }

    .allergies-section ul {
      margin: 0;
      padding-left: 18px;
      color: #922b21;
    }

    .lifestyle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }

    .lifestyle-card {
      background: #f8f9fa;
      border: 1px solid #d1d5db;
      padding: 14px;
    }

    .lifestyle-card h5 {
      color: #374151;
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 10pt;
      font-family: 'Roboto', sans-serif;
    }

    .closing-section {
      background: #f8f9fa;
      padding: 20px;
      border: 1px solid #d1d5db;
      border-left: 4px solid #34495e;
      margin-top: 16px;
    }

    .closing-section p {
      margin-bottom: 12px;
      line-height: 1.6;
      color: #374151;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .footer-signature {
      margin-top: 25px;
      padding: 16px;
      background: #f1f3f4;
      border: 1px solid #bdc3c7;
    }

    .footer-signature .name {
      font-weight: 700;
      font-size: 12pt;
      color: #2c3e50;
      margin-bottom: 6px;
      font-family: 'Roboto', sans-serif;
    }

    .footer-signature .credentials {
      color: #5a6c7d;
      font-weight: 500;
      line-height: 1.4;
      font-family: 'Source Sans Pro', sans-serif;
    }

    /* Print specific styles */
    @media print {
      .hmr-report {
        margin: 0;
        padding: 12mm;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .header, .title-section, .subsection, .recommendations-table, .medication-table {
        break-inside: avoid;
      }

      .medication-table {
        font-size: 8pt;
      }

      .medication-table th {
        font-size: 9pt;
      }

      .medication-number {
        font-size: 7pt;
      }

      .medication-name {
        font-size: 9pt;
      }

      .prn-badge,
      .compliance-badge {
        font-size: 7pt;
      }

      .dosage-value {
        font-size: 9pt;
      }

      .comment-text,
      .usage-text,
      .prescribed-text {
        font-size: 7.5pt;
      }
    }

    @page {
      margin: 12mm;
      size: A4;
    }

    /* Professional status indicators */
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border: 1px solid;
    }

    .status-high {
      background: #fdf2f2;
      color: #c0392b;
      border-color: #c0392b;
    }

    .status-medium {
      background: #fff8e7;
      color: #d68910;
      border-color: #d68910;
    }

    .status-low {
      background: #f0f9f4;
      color: #27ae60;
      border-color: #27ae60;
    }

    /* Clinical emphasis */
    .clinical-note {
      background: #e8f4f8;
      border-left: 4px solid #2980b9;
      padding: 10px;
      margin: 8px 0;
      font-style: italic;
      color: #2c3e50;
    }

    .dosage-highlight {
      font-weight: 600;
      color: #2c3e50;
      background: #f7f9fc;
      padding: 2px 4px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="hmr-report">
    <!-- Modern Header -->
    <div class="header">
      <div>
        <div class="logo">myHMR</div>
        <div class="logo-subtitle">Accredited Clinical Pharmacy Services</div>
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
        <h4>Current Medication Regimen Assessment</h4>
        <p style="margin-bottom: 12px; color: #5a6c7d; font-style: italic;">Medications with compliance issues are highlighted with red border for immediate attention</p>
        <table class="medication-table">
          <thead>
            <tr>
              <th style="width: 28%;">Medication Details</th>
              <th style="width: 22%;">Dosing & Administration</th>
              <th style="width: 25%;">Compliance Assessment</th>
              <th style="width: 25%;">Patient Understanding & Usage</th>
            </tr>
          </thead>
          <tbody>
            ${generateMedicationRows()}
          </tbody>
          <tfoot>
            <tr class="medication-summary">
              <td colspan="4" class="summary-cell">
                <div class="medication-stats">
                  <strong>Medication Summary:</strong> 
                  ${data.medications ? `Total medications: ${data.medications.length}` : 'No medications documented'} 
                  ${data.medications ? ` | Regular medications: ${data.medications.filter(m => m.prn_status === 'Regular').length}` : ''} 
                  ${data.medications ? ` | PRN medications: ${data.medications.filter(m => m.prn_status === 'PRN' || m.prn_status === 'PRN (as needed)').length}` : ''}
                  ${data.medications ? ` | Non-compliant: ${data.medications.filter(m => m.compliance_status === 'Poor' || m.compliance_status === 'Non-adherent').length}` : ''}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        
        <div class="medication-notes">
          <h5>Clinical Notes:</h5>
          <ul style="margin: 8px 0; padding-left: 20px; color: #374151; font-size: 9pt; line-height: 1.4;">
            <li>All medications were reviewed for appropriateness, effectiveness, and safety</li>
            <li>Patient education was provided regarding proper medication administration and timing</li>
            <li>Compliance assessment was conducted through patient interview and observation</li>
            <li>Drug interactions and contraindications were evaluated</li>
          </ul>
        </div>
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
        <em>myHMR - Professional Clinical Services</em>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the authenticated user with improved error handling
    console.log('PDF Generation: Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('PDF Generation: Authentication error:', authError.message);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: authError.message,
        message: 'Please log in again to continue.' 
      }, { status: 401 });
    }
    
    if (!user) {
      console.error('PDF Generation: No authenticated user found');
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'No authenticated user found',
        message: 'Your session may have expired. Please log in again.' 
      }, { status: 401 });
    }
    
    console.log('PDF Generation: User authenticated successfully:', user.id);

    // Get the pharmacist record
    console.log('PDF Generation: Fetching pharmacist record...');
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('id, name, plan_tier')
      .eq('user_id', user.id)
      .single();

    if (pharmacistError) {
      console.error('PDF Generation: Error fetching pharmacist record:', pharmacistError.message);
      return NextResponse.json({ 
        error: 'Pharmacist record error', 
        details: pharmacistError.message,
        message: 'Unable to retrieve your account information. Please contact support.' 
      }, { status: 404 });
    }

    if (!pharmacist) {
      console.error('PDF Generation: No pharmacist record found for user:', user.id);
      return NextResponse.json({ 
        error: 'Account setup incomplete', 
        details: 'No pharmacist profile found for this user',
        message: 'Your account setup is incomplete. Please complete your profile first.' 
      }, { status: 404 });
    }
    
    console.log('PDF Generation: Pharmacist record found:', pharmacist.id, pharmacist.name);

    // Check HMR limits before generating PDF
    console.log('PDF Generation: Checking usage limits...');
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_hmr_limit', { p_pharmacist_id: pharmacist.id });

    if (limitError) {
      console.error('PDF Generation: Error checking HMR limit:', limitError.message);
      return NextResponse.json({ 
        error: 'Usage limit check failed', 
        details: limitError.message,
        message: 'Unable to verify your account limits. Please try again later or contact support.'
      }, { status: 500 });
    }

    if (!limitCheck.can_create) {
      console.error('PDF Generation: Monthly limit reached for pharmacist:', pharmacist.id);
      return NextResponse.json({ 
        error: 'Monthly report limit reached',
        details: `You have reached your monthly limit of ${limitCheck.limit} reports. Current usage: ${limitCheck.current_usage}/${limitCheck.limit}`,
        message: `Your ${pharmacist.plan_tier || 'current'} plan allows ${limitCheck.limit} reports per month. Please upgrade your plan for additional reports.`,
        usage: limitCheck
      }, { status: 403 });
    }
    
    console.log('PDF Generation: Usage limits verified:', limitCheck);

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

    // Create PDF using Puppeteer with serverless Chromium for Vercel compatibility
    console.log('Launching browser...');
    const isProduction = process.env.NODE_ENV === 'production';
    
    const browser = await puppeteer.launch({
      args: isProduction ? chromium.args : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction 
        ? await chromium.executablePath() 
        : process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      headless: chromium.headless,
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

    // Increment usage tracking after successful PDF generation
    const { error: usageError } = await supabase
      .rpc('increment_hmr_usage', { p_pharmacist_id: pharmacist.id });

    if (usageError) {
      console.error('Error incrementing usage:', usageError);
      // Don't fail the request if usage tracking fails, just log it
    } else {
      console.log('Usage tracking incremented successfully');
    }

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
        message: 'An error occurred while generating your PDF. Please try again or contact support if the issue persists.',
        stack: errorDetails
      },
      { status: 500 }
    );
  }
} 