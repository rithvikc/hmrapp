import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';

export interface ReportData {
  patient: {
    name: string;
    dob: string;
    gender: string;
    medicare?: string;
    address?: string;
    phone?: string;
  };
  referringDoctor: string;
  interviewDate: string;
  medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    prnStatus: string;
    prescribedUsage?: string;
    actualUsage?: string;
    complianceComment?: string;
  }>;
  assessment: {
    medicationUnderstanding: string;
    medicationAdministration: string;
    medicationAdherence: string;
    fluidIntake: string;
    teaConsumption?: number;
    coffeeConsumption?: number;
    eatingHabits: string;
    smokingStatus: string;
    cigarettesPerDay?: number;
    alcoholUse: string;
    drugUse: string;
  };
  recommendations: Array<{
    issueIdentified: string;
    suggestedAction: string;
  }>;
  additionalNotes?: string;
}

class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generateHMRReport(data: ReportData): Promise<Buffer> {
    // Header
    this.addHeader();
    
    // Patient Information
    this.addPatientInformation(data.patient, data.referringDoctor, data.interviewDate);
    
    // General Comments Section
    this.addGeneralComments(data.assessment);
    
    // Lifestyle Considerations
    this.addLifestyleConsiderations(data.assessment);
    
    // Medication Review Table
    this.addMedicationReview(data.medications);
    
    // Issues and Recommendations
    this.addRecommendations(data.recommendations);
    
    // Management Plan for GP
    this.addManagementPlan();
    
    // Footer
    this.addFooter();
    
    // Return PDF as buffer
    return Buffer.from(this.doc.output('arraybuffer'));
  }

  private addHeader() {
    // LAL MedReviews Header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 100, 200); // Blue color
    this.doc.text('LAL MedReviews', this.margin, this.currentY);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Home Medication Review Report', this.margin, this.currentY + 8);
    
    // Add line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY + 15, this.pageWidth - this.margin, this.currentY + 15);
    
    this.currentY += 25;
  }

  private addPatientInformation(patient: any, referringDoctor: string, interviewDate: string) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PATIENT INFORMATION', this.margin, this.currentY);
    this.currentY += 10;

    // Create patient info table
    const patientData = [
      ['Patient Name:', patient.name || 'N/A'],
      ['Date of Birth:', patient.dob ? format(new Date(patient.dob), 'dd/MM/yyyy') : 'N/A'],
      ['Gender:', patient.gender || 'N/A'],
      ['Medicare Number:', patient.medicare || 'N/A'],
      ['Address:', patient.address || 'N/A'],
      ['Phone:', patient.phone || 'N/A'],
      ['Referring Doctor:', referringDoctor || 'N/A'],
      ['Interview Date:', format(new Date(interviewDate), 'dd/MM/yyyy')],
      ['Pharmacist:', 'Avishkar Lal (MRN: 8362)'],
      ['Contact:', '0490 417 047']
    ];

    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [],
      body: patientData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addGeneralComments(assessment: any) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GENERAL COMMENTS', this.margin, this.currentY);
    this.currentY += 10;

    const comments = [
      ['Medication Understanding:', assessment.medicationUnderstanding || 'Not assessed'],
      ['Medication Administration:', assessment.medicationAdministration || 'Not assessed'],
      ['Medication Adherence:', assessment.medicationAdherence || 'Not assessed']
    ];

    (this.doc as any).autoTable({
      startY: this.currentY,
      body: comments,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addLifestyleConsiderations(assessment: any) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LIFESTYLE CONSIDERATIONS', this.margin, this.currentY);
    this.currentY += 10;

    const lifestyle = [
      ['Fluid Intake:', assessment.fluidIntake || 'Not assessed'],
      ['Tea Consumption:', assessment.teaConsumption ? `${assessment.teaConsumption} cups/day` : 'Not assessed'],
      ['Coffee Consumption:', assessment.coffeeConsumption ? `${assessment.coffeeConsumption} cups/day` : 'Not assessed'],
      ['Eating Habits:', assessment.eatingHabits || 'Not assessed'],
      ['Smoking Status:', assessment.smokingStatus || 'Not assessed'],
      ['Cigarettes/Day:', assessment.cigarettesPerDay ? `${assessment.cigarettesPerDay}` : 'N/A'],
      ['Alcohol Use:', assessment.alcoholUse || 'Not assessed'],
      ['Drug Use:', assessment.drugUse || 'Not assessed']
    ];

    (this.doc as any).autoTable({
      startY: this.currentY,
      body: lifestyle,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addMedicationReview(medications: any[]) {
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MEDICATION REVIEW', this.margin, this.currentY);
    this.currentY += 10;

    if (medications.length === 0) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No medications documented.', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    const headers = ['Medication', 'Dosage', 'Frequency', 'Type', 'Prescribed Usage', 'Actual Usage', 'Compliance'];
    const rows = medications.map(med => [
      med.name || '',
      med.dosage || '',
      med.frequency || '',
      med.prnStatus || 'Regular',
      med.prescribedUsage || '',
      med.actualUsage || '',
      med.complianceComment || ''
    ]);

    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [70, 130, 180],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 35 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addRecommendations(recommendations: any[]) {
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ISSUES IDENTIFIED AND RECOMMENDATIONS', this.margin, this.currentY);
    this.currentY += 10;

    if (recommendations.length === 0) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No specific issues identified during this review.', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    const headers = ['Issue Identified', 'Recommended Action'];
    const rows = recommendations.map(rec => [
      rec.issueIdentified || '',
      rec.suggestedAction || ''
    ]);

    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [200, 50, 50],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 90 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addManagementPlan() {
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MANAGEMENT PLAN FOR GP COMPLETION', this.margin, this.currentY);
    this.currentY += 10;

    const planHeaders = ['Action Item', 'Priority', 'Target Date', 'Notes'];
    const planRows = [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']
    ];

    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [planHeaders],
      body: planRows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 8,
        minCellHeight: 15
      },
      headStyles: {
        fillColor: [100, 150, 100],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 60 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Add signature section
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text('GP Signature: _________________________________  Date: ___________', this.margin, this.currentY + 10);
  }

  private addFooter() {
    // Add footer at bottom of page
    const footerY = this.pageHeight - 30;
    
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LAL MedReviews', this.margin, footerY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Professional Medication Review Services', this.margin, footerY + 5);
    this.doc.text('Phone: 0490 417 047 | Pharmacist: Avishkar Lal (MRN: 8362)', this.margin, footerY + 10);
    
    // Page number
    const pageCount = this.doc.getNumberOfPages();
    this.doc.text(`Page ${pageCount}`, this.pageWidth - this.margin - 20, footerY);
  }

  async saveReport(data: ReportData, filename: string): Promise<string> {
    const buffer = await this.generateHMRReport(data);
    const reportsDir = path.join(process.cwd(), 'reports');
    
    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  }
}

export default PDFGenerator; 