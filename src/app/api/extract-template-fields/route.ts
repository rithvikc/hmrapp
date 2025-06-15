import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const mimeType = file.type;
    let fields: string[] = [];

    if (mimeType === 'application/pdf') {
      // Extract PDF form fields
      fields = await extractPDFFields(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Extract DOCX form fields
      fields = await extractDOCXFields(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('Error extracting template fields:', error);
    return NextResponse.json(
      { error: 'Failed to extract template fields' },
      { status: 500 }
    );
  }
}

async function extractPDFFields(buffer: ArrayBuffer): Promise<string[]> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    return fields.map((field: any) => field.getName());
  } catch (error) {
    console.error('Error extracting PDF fields:', error);
    // Return generic field names if extraction fails
    return ['patient_name', 'date_of_birth', 'address', 'phone', 'medications', 'recommendations'];
  }
}

async function extractDOCXFields(buffer: ArrayBuffer): Promise<string[]> {
  try {
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(buffer);
    
    // Get the main document
    const documentXml = await zipFile.file('word/document.xml')?.async('text');
    if (!documentXml) {
      throw new Error('Could not read document.xml');
    }

    // Extract form fields and content controls
    const fields: string[] = [];
    
    // Look for form fields (legacy form fields)
    const formFieldMatches = documentXml.match(/<w:ffData>[\s\S]*?<w:name w:val="([^"]*)"[\s\S]*?<\/w:ffData>/g);
    if (formFieldMatches) {
      formFieldMatches.forEach((match: string) => {
        const nameMatch = match.match(/<w:name w:val="([^"]*)"/);
        if (nameMatch) {
          fields.push(nameMatch[1]);
        }
      });
    }

    // Look for content controls (modern form fields)
    const contentControlMatches = documentXml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/g);
    if (contentControlMatches) {
      contentControlMatches.forEach((match: string) => {
        // Look for tag or title
        const tagMatch = match.match(/<w:tag w:val="([^"]*)"/);
        const titleMatch = match.match(/<w:title w:val="([^"]*)"/);
        
        if (tagMatch) {
          fields.push(tagMatch[1]);
        } else if (titleMatch) {
          fields.push(titleMatch[1]);
        }
      });
    }

    // Look for placeholder text patterns
    const placeholderMatches = documentXml.match(/\{[^}]+\}/g);
    if (placeholderMatches) {
      placeholderMatches.forEach((match: string) => {
        const fieldName = match.replace(/[{}]/g, '').trim();
        if (fieldName && !fields.includes(fieldName)) {
          fields.push(fieldName);
        }
      });
    }

    // Look for bracket patterns like [field_name]
    const bracketMatches = documentXml.match(/\[[^\]]+\]/g);
    if (bracketMatches) {
      bracketMatches.forEach((match: string) => {
        const fieldName = match.replace(/[\[\]]/g, '').trim();
        if (fieldName && !fields.includes(fieldName)) {
          fields.push(fieldName);
        }
      });
    }

    // If no fields found, return common template fields
    if (fields.length === 0) {
      return [
        'patient_name', 'date_of_birth', 'address', 'phone', 'email',
        'referring_doctor', 'interview_date', 'pharmacist_name',
        'medications_list', 'recommendations', 'next_review_date'
      ];
    }

    return [...new Set(fields)]; // Remove duplicates
  } catch (error) {
    console.error('Error extracting DOCX fields:', error);
    // Return generic field names if extraction fails
    return [
      'patient_name', 'date_of_birth', 'address', 'phone', 'email',
      'referring_doctor', 'interview_date', 'pharmacist_name',
      'medications_list', 'recommendations', 'next_review_date'
    ];
  }
} 