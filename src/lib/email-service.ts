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
          <title>HMR Report</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 15px; margin-top: 20px; border-top: 1px solid #dee2e6; }
              .highlight { color: #007bff; font-weight: bold; }
              .contact-info { margin-top: 10px; font-size: 0.9em; }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>LAL MedReviews - Home Medication Review Report</h2>
          </div>
          
          <div class="content">
              <p>Dear Doctor,</p>
              
              <p>Please find attached the completed <span class="highlight">Home Medication Review (HMR) report</span> 
              for your patient <strong>${emailData.patientName}</strong>.</p>
              
              <p>This comprehensive review has been conducted by <strong>Avishkar Lal</strong> (MRN: 8362), 
              a qualified pharmacist specializing in medication management and optimization.</p>
              
              <h3>Report Highlights:</h3>
              <ul>
                  <li>Complete medication reconciliation</li>
                  <li>Assessment of medication understanding and adherence</li>
                  <li>Lifestyle factors affecting medication management</li>
                  <li>Clinical recommendations for optimization</li>
                  <li>Patient education outcomes</li>
              </ul>
              
              ${emailData.additionalNotes ? `
              <h3>Additional Notes:</h3>
              <p>${emailData.additionalNotes}</p>
              ` : ''}
              
              <p>Please review the attached report and implement the recommendations as clinically appropriate. 
              If you have any questions or require clarification on any aspect of this review, please don't 
              hesitate to contact me.</p>
              
              <p>Thank you for the referral and your ongoing commitment to your patient's medication safety.</p>
              
              <p>Kind regards,</p>
              <p><strong>Avishkar Lal</strong><br>
              Pharmacist<br>
              MRN: 8362</p>
          </div>
          
          <div class="footer">
              <div class="contact-info">
                  <strong>LAL MedReviews</strong><br>
                  Phone: 0490 417 047<br>
                  Email: ${this.config.user}<br>
                  <em>Professional Medication Review Services</em>
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