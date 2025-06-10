import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';

interface Patient {
  name: string;
  dob: string;
  gender: string;
  medicare?: string;
  address?: string;
  phone?: string;
}

interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  prnStatus: string;
  prescribedUsage?: string;
  actualUsage?: string;
  complianceComment?: string;
}

interface Assessment {
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
}

interface Recommendation {
  issueIdentified: string;
  suggestedAction: string;
}

export interface ReportData {
  patient: Patient;
  referringDoctor: string;
  interviewDate: string;
  medications: Medication[];
  assessment: Assessment;
  recommendations: Recommendation[];
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
    // myHMR Header
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('myHMR', this.margin, this.currentY);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Home Medication Review Report', this.margin, this.currentY + 8);
    
    // Add line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY + 15, this.pageWidth - this.margin, this.currentY + 15);
    
    this.currentY += 25;
  }

  private addPatientInformation(patient: Patient, referringDoctor: string, interviewDate: string) {
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

    (this.doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }).autoTable({
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

    this.currentY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  private addGeneralComments(assessment: Assessment) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GENERAL COMMENTS', this.margin, this.currentY);
    this.currentY += 10;

    const comments = [
      ['Medication Understanding:', assessment.medicationUnderstanding || 'Not assessed'],
      ['Medication Administration:', assessment.medicationAdministration || 'Not assessed'],
      ['Medication Adherence:', assessment.medicationAdherence || 'Not assessed']
    ];

    (this.doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }).autoTable({
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

    this.currentY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  private addLifestyleConsiderations(assessment: Assessment) {
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

    (this.doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }).autoTable({
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

    this.currentY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  private addMedicationReview(medications: Medication[]) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MEDICATION REVIEW', this.margin, this.currentY);
    this.currentY += 10;

    if (medications.length === 0) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No medications documented', this.margin, this.currentY);
      this.currentY += 20;
      return;
    }

    const medicationData = medications.map(med => [
      med.name,
      med.dosage || 'As directed',
      med.frequency || 'As prescribed',
      med.prnStatus,
      med.complianceComment || med.actualUsage || 'Taking as prescribed'
    ]);

    (this.doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }).autoTable({
      startY: this.currentY,
      head: [['Medication', 'Dosage', 'Frequency', 'Status', 'Comments']],
      body: medicationData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 107, 107],
        textColor: 255,
        fontStyle: 'bold'
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  private addRecommendations(recommendations: Recommendation[]) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ISSUES AND RECOMMENDATIONS', this.margin, this.currentY);
    this.currentY += 10;

    if (recommendations.length === 0) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No specific issues identified during this review.', this.margin, this.currentY);
      this.currentY += 20;
      return;
    }

    const recommendationData = recommendations.map(rec => [
      rec.issueIdentified,
      rec.suggestedAction,
      '[ ] Agreed - implemented\n[ ] Other (please specify)\n\n_________________\nReview'
    ]);

    (this.doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }).autoTable({
      startY: this.currentY,
      head: [['Issues Identified', 'Suggested Action', 'Management Plan (GP)']],
      body: recommendationData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        valign: 'top'
      },
      headStyles: {
        fillColor: [255, 107, 107],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 50 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  private addManagementPlan() {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MANAGEMENT PLAN FOR GP', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    const managementText = [
      'As the pharmacist responsible for undertaking this medication management review,',
      'I understand that there may be sound clinical reasons why my recommendations',
      'may not be considered appropriate for this patient.',
      '',
      'I would welcome advice on this and how these reports can be made useful to you.',
      'I would also be pleased to provide supporting literature or clarification of any',
      'issue raised in this report.',
      '',
      'Please complete the attached Medication Management Report and forward a copy to',
      'avishkarlal01@gmail.com. MBS item number 900 can then be claimed.',
      '',
      'I recommend that a follow up review be considered in 6 months.',
      '',
      'However, if you have no objections, I will see the patient again in a few months',
      'to follow up on any ongoing issues.'
    ];

    managementText.forEach(line => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addFooter() {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text('Regards,', this.margin, this.currentY);
    this.currentY += 10;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Avishkar Lal', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Accredited Pharmacist MRN 8362', this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text('Phone: 0490 417 047', this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text('Email: avishkarlal01@gmail.com', this.margin, this.currentY);
  }

  async saveReport(data: ReportData, filename: string): Promise<string> {
    const pdfBuffer = await this.generateHMRReport(data);
    const filepath = path.join(process.cwd(), 'public', 'reports', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, pdfBuffer);
    return filepath;
  }
}

export default PDFGenerator; 