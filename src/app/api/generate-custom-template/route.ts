import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';
import JSZip from 'jszip';

interface ReportData {
  patient: {
    name?: string;
    dob?: string;
    gender?: string;
    medicare_number?: string;
    address?: string;
    phone?: string;
    referring_doctor?: string;
    doctor_email?: string;
    practice_name?: string;
    known_allergies?: string;
    current_conditions?: string;
  };
  medications: Array<{
    name: string;
    strength?: string;
    dosage?: string;
    frequency?: string;
    compliance_status?: string;
    compliance_comment?: string;
  }>;
  interview: {
    interview_date?: string;
    pharmacist_name?: string;
    medication_understanding?: string;
    medication_administration?: string;
    medication_adherence?: string;
    fluid_intake?: string;
    eating_habits?: string;
    smoking_status?: string;
    alcohol_consumption?: string;
  };
  recommendations: Array<{
    issue_identified: string;
    suggested_action: string;
    priority_level: string;
    category?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const templateFile = formData.get('template') as File;
    const reportDataStr = formData.get('reportData') as string;
    const mappingStr = formData.get('mapping') as string;
    const templateType = formData.get('templateType') as string;

    if (!templateFile || !reportDataStr || !mappingStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reportData: ReportData = JSON.parse(reportDataStr);
    const mapping: Record<string, string> = JSON.parse(mappingStr);

    const templateBuffer = await templateFile.arrayBuffer();
    let filledDocument: Uint8Array | ArrayBuffer;

    if (templateType === 'pdf') {
      filledDocument = await fillPDFTemplate(templateBuffer, reportData, mapping);
    } else if (templateType === 'docx') {
      filledDocument = await fillDOCXTemplate(templateBuffer, reportData, mapping);
    } else {
      return NextResponse.json({ error: 'Unsupported template type' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Content-Type', templateType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', `attachment; filename="filled_template.${templateType}"`);

    return new NextResponse(filledDocument, { headers });
  } catch (error) {
    console.error('Error generating custom template:', error);
    return NextResponse.json(
      { error: 'Failed to generate custom template' },
      { status: 500 }
    );
  }
}

async function fillPDFTemplate(
  templateBuffer: ArrayBuffer,
  reportData: ReportData,
  mapping: Record<string, string>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const form = pdfDoc.getForm();

  // Get data values from report
  const dataValues = getDataValues(reportData);

  // Fill form fields
  Object.entries(mapping).forEach(([templateField, reportField]) => {
    try {
      const field = form.getField(templateField);
      const value = dataValues[reportField] || '';

      if (field instanceof PDFTextField) {
        field.setText(String(value));
      } else if (field instanceof PDFCheckBox) {
        // For checkboxes, check if value is truthy
        if (value && value !== 'false' && value !== '0') {
          field.check();
        } else {
          field.uncheck();
        }
      }
    } catch (error) {
      console.warn(`Could not fill field ${templateField}:`, error);
    }
  });

  return await pdfDoc.save();
}

async function fillDOCXTemplate(
  templateBuffer: ArrayBuffer,
  reportData: ReportData,
  mapping: Record<string, string>
): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const zipFile = await zip.loadAsync(templateBuffer);

  // Get data values from report
  const dataValues = getDataValues(reportData);

  // Get the main document
  const documentXml = await zipFile.file('word/document.xml')?.async('text');
  if (!documentXml) {
    throw new Error('Could not read document.xml');
  }

  let updatedXml = documentXml;

  // Replace field values
  Object.entries(mapping).forEach(([templateField, reportField]) => {
    const value = dataValues[reportField] || '';
    
    // Replace various patterns
    const patterns = [
      new RegExp(`\\{${escapeRegex(templateField)}\\}`, 'g'),
      new RegExp(`\\[${escapeRegex(templateField)}\\]`, 'g'),
      new RegExp(`{{${escapeRegex(templateField)}}}`, 'g'),
    ];

    patterns.forEach(pattern => {
      updatedXml = updatedXml.replace(pattern, String(value));
    });

    // Handle content controls
    const contentControlPattern = new RegExp(
      `(<w:sdt[^>]*>.*?<w:tag w:val="${escapeRegex(templateField)}".*?<w:t[^>]*>)[^<]*(</w:t>.*?</w:sdt>)`,
      'gs'
    );
    updatedXml = updatedXml.replace(contentControlPattern, `$1${value}$2`);
  });

  // Update the document.xml in the zip
  zipFile.file('word/document.xml', updatedXml);

  return await zipFile.generateAsync({ type: 'arraybuffer' });
}

function getDataValues(reportData: ReportData): Record<string, any> {
  const { patient, medications, interview, recommendations } = reportData;

  // Format medications list
  const medicationsList = medications.map(med => 
    `${med.name}${med.strength ? ` ${med.strength}` : ''}${med.dosage ? ` - ${med.dosage}` : ''}${med.frequency ? ` ${med.frequency}` : ''}`
  ).join('\n');

  // Format recommendations summary
  const recommendationsSummary = recommendations.map((rec, index) => 
    `${index + 1}. ${rec.issue_identified}\nAction: ${rec.suggested_action}`
  ).join('\n\n');

  const highPriorityRecommendations = recommendations.filter(rec => rec.priority_level === 'High');

  return {
    // Patient fields
    'patient.name': patient?.name || '',
    'patient.dob': patient?.dob || '',
    'patient.gender': patient?.gender || '',
    'patient.medicare_number': patient?.medicare_number || '',
    'patient.address': patient?.address || '',
    'patient.phone': patient?.phone || '',
    'patient.referring_doctor': patient?.referring_doctor || '',
    'patient.doctor_email': patient?.doctor_email || '',
    'patient.practice_name': patient?.practice_name || '',
    'patient.known_allergies': patient?.known_allergies || '',
    'patient.current_conditions': patient?.current_conditions || '',

    // Interview fields
    'interview.interview_date': interview?.interview_date || '',
    'interview.pharmacist_name': interview?.pharmacist_name || '',
    'interview.medication_understanding': interview?.medication_understanding || '',
    'interview.medication_administration': interview?.medication_administration || '',
    'interview.medication_adherence': interview?.medication_adherence || '',
    'interview.fluid_intake': interview?.fluid_intake || '',
    'interview.eating_habits': interview?.eating_habits || '',
    'interview.smoking_status': interview?.smoking_status || '',
    'interview.alcohol_consumption': interview?.alcohol_consumption || '',

    // Medications summary
    'medications.count': medications.length.toString(),
    'medications.list': medicationsList,
    'medications.compliance_summary': medications.filter(med => med.compliance_status === 'Good').length + ' compliant, ' +
                                     medications.filter(med => med.compliance_status === 'Poor').length + ' non-compliant',

    // Recommendations summary
    'recommendations.count': recommendations.length.toString(),
    'recommendations.high_priority': highPriorityRecommendations.length.toString(),
    'recommendations.summary': recommendationsSummary,

    // System fields
    'report.generated_date': new Date().toLocaleDateString('en-AU'),
    'report.pharmacist_email': 'avishkarlal01@gmail.com', // This would come from user context

    // Common aliases for backward compatibility
    'patient_name': patient?.name || '',
    'date_of_birth': patient?.dob || '',
    'address': patient?.address || '',
    'phone': patient?.phone || '',
    'email': patient?.doctor_email || '',
    'referring_doctor': patient?.referring_doctor || '',
    'interview_date': interview?.interview_date || '',
    'pharmacist_name': interview?.pharmacist_name || '',
    'medications_list': medicationsList,
    'recommendations': recommendationsSummary,
    'next_review_date': '', // This would need to be calculated
  };
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 