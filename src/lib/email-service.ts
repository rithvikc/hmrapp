import nodemailer from 'nodemailer';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  user: string;
  pass: string;
}

export interface EmailData {
  to: string;
  cc?: string;
  patientName: string;
  reportPath: string;
  additionalNotes?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
      tls: {
        rejectUnauthorized: false // For development/testing
      }
    });
  }

  async sendHMRReport(emailData: EmailData): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const mailOptions = {
        from: `"LAL MedReviews" <${this.config.user}>`,
        to: emailData.to,
        cc: emailData.cc,
        subject: `Home Medication Review Report - ${emailData.patientName}`,
        html: this.generateEmailHTML(emailData),
        attachments: [
          {
            filename: `HMR_Report_${emailData.patientName.replace(/\s+/g, '_')}.pdf`,
            path: emailData.reportPath,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  private generateEmailHTML(emailData: EmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Clinical Report - Home Medication Review</title>
          <style>
              body { 
                font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #1a1a1a; 
                margin: 0;
                padding: 0;
                background: #f8f9fa;
              }
              .container {
                max-width: 650px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #d1d5db;
              }
              .header { 
                background: #2c3e50; 
                color: white;
                padding: 20px; 
                border-left: 4px solid #34495e; 
              }
              .header h2 {
                margin: 0;
                font-size: 18pt;
                font-weight: 600;
                letter-spacing: 0.3px;
              }
              .header .subtitle {
                font-size: 10pt;
                color: #ecf0f1;
                margin-top: 4px;
              }
              .content { 
                padding: 25px; 
                background: white;
              }
              .footer { 
                background: #f1f3f4; 
                padding: 18px; 
                border-top: 1px solid #d1d5db;
                border-left: 4px solid #34495e;
              }
              .highlight { 
                color: #2c3e50; 
                font-weight: 600; 
              }
              .contact-info { 
                font-size: 9pt; 
                color: #5a6c7d;
                line-height: 1.4;
              }
              .contact-info strong {
                color: #2c3e50;
                font-size: 10pt;
              }
              .clinical-section {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-left: 4px solid #2980b9;
                padding: 15px;
                margin: 15px 0;
              }
              .clinical-section h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 12pt;
              }
              .clinical-section ul {
                margin: 0;
                padding-left: 18px;
              }
              .clinical-section li {
                margin: 4px 0;
                color: #374151;
              }
              .credentials {
                background: #e8f4f8;
                border: 1px solid #b8dce8;
                padding: 12px;
                margin: 15px 0;
                color: #2c3e50;
                font-size: 9pt;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>LAL MedReviews</h2>
                  <div class="subtitle">Accredited Clinical Pharmacy Services</div>
              </div>
              
              <div class="content">
                  <p>Dear Colleague,</p>
                  
                  <p>Please find attached the completed <span class="highlight">Home Medication Review (HMR) clinical report</span> 
                  for your patient <strong>${emailData.patientName}</strong>.</p>
                  
                  <div class="credentials">
                      <strong>Clinical Review Conducted By:</strong><br>
                      Avishkar Lal, Accredited Pharmacist (MRN: 8362)<br>
                      Specializing in medication management and clinical optimization
                  </div>
                  
                  <div class="clinical-section">
                      <h3>Clinical Assessment Summary</h3>
                      <ul>
                          <li>Comprehensive medication reconciliation and review</li>
                          <li>Assessment of patient understanding and medication adherence</li>
                          <li>Evaluation of lifestyle factors affecting therapeutic outcomes</li>
                          <li>Evidence-based clinical recommendations for optimization</li>
                          <li>Patient counselling and education outcomes documented</li>
                          <li>Follow-up recommendations and monitoring parameters</li>
                      </ul>
                  </div>
                  
                  ${emailData.additionalNotes ? `
                  <div class="clinical-section">
                      <h3>Additional Clinical Notes</h3>
                      <p>${emailData.additionalNotes}</p>
                  </div>
                  ` : ''}
                  
                  <p>Please review the attached clinical report and implement the recommendations as clinically appropriate 
                  for this patient. All recommendations are evidence-based and consider current therapeutic guidelines.</p>
                  
                  <p><strong>MBS Item 900</strong> can be claimed upon completion of the attached Medication Management Report form. 
                  Please forward a copy to avishkarlal01@gmail.com for our records.</p>
                  
                  <p>Should you require clarification on any clinical recommendations or additional pharmaceutical consultation, 
                  please don't hesitate to contact me directly.</p>
                  
                  <p>Thank you for the professional referral and your continued commitment to optimal patient care.</p>
                  
                  <p>Professional regards,</p>
                  <p><strong>Avishkar Lal</strong><br>
                  Accredited Pharmacist (MRN: 8362)<br>
                  Clinical Pharmacy Specialist</p>
              </div>
              
              <div class="footer">
                  <div class="contact-info">
                      <strong>LAL MedReviews - Professional Clinical Services</strong><br>
                      Direct Line: 0490 417 047<br>
                      Clinical Email: ${this.config.user}<br>
                      <em>Providing evidence-based medication review and clinical pharmacy services</em>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  async sendTestEmail(testEmailAddress: string): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const mailOptions = {
        from: `"LAL MedReviews" <${this.config.user}>`,
        to: testEmailAddress,
        subject: 'Test Email - LAL MedReviews System',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email from the LAL MedReviews system.</p>
          <p>If you receive this email, your email configuration is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Test email failed:', error);
      return false;
    }
  }

  // Template for different types of email communications
  async sendFollowUpEmail(emailData: {
    to: string;
    patientName: string;
    followUpDate: string;
    notes?: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const mailOptions = {
        from: `"LAL MedReviews" <${this.config.user}>`,
        to: emailData.to,
        subject: `Follow-up Required - ${emailData.patientName} HMR`,
        html: `
          <h2>HMR Follow-up Reminder</h2>
          <p>Dear Doctor,</p>
          <p>This is a reminder regarding the Home Medication Review for <strong>${emailData.patientName}</strong>.</p>
          <p>Follow-up recommended by: <strong>${emailData.followUpDate}</strong></p>
          ${emailData.notes ? `<p>Notes: ${emailData.notes}</p>` : ''}
          <p>Please contact us if you need any additional information.</p>
          <p>Best regards,<br>Avishkar Lal<br>LAL MedReviews</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Follow-up email failed:', error);
      return false;
    }
  }

  // Get default email configuration from environment
  static getDefaultConfig(): EmailConfig {
    return {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    };
  }
}

export default EmailService; 