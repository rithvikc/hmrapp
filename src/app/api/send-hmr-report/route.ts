import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Create email transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    // Gmail configuration (update with your preferred service)
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'avishkarlal01@gmail.com',
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Alternative configuration for other email services
const createCustomTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    const { patientId, emailData, sendOptions, pdfUrl } = await request.json();

    // Validate required fields
    if (!emailData?.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'PDF file not generated' },
        { status: 400 }
      );
    }

    // Create email transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Get PDF file path
    const pdfFileName = pdfUrl.replace('/reports/', '');
    const pdfFilePath = join(process.cwd(), 'public', 'reports', pdfFileName);

    // Check if PDF file exists
    if (!existsSync(pdfFilePath)) {
      return NextResponse.json(
        { success: false, error: 'PDF file not found' },
        { status: 404 }
      );
    }

    // Prepare attachments
    const attachments = [
      {
        filename: pdfFileName,
        content: readFileSync(pdfFilePath),
        contentType: 'application/pdf'
      }
    ];

    // Add additional attachments if specified
    if (sendOptions?.includeEducationSheet) {
      const educationSheetPath = join(process.cwd(), 'public', 'templates', 'Patient_Education_Sheet.pdf');
      if (existsSync(educationSheetPath)) {
        attachments.push({
          filename: 'Patient_Education_Sheet.pdf',
          content: readFileSync(educationSheetPath),
          contentType: 'application/pdf'
        });
      }
    }

    if (sendOptions?.includeMedicationList) {
      const medicationListPath = join(process.cwd(), 'public', 'templates', 'Medication_List_Summary.pdf');
      if (existsSync(medicationListPath)) {
        attachments.push({
          filename: 'Medication_List_Summary.pdf',
          content: readFileSync(medicationListPath),
          contentType: 'application/pdf'
        });
      }
    }

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Avishkar Lal - LAL MedReviews',
        address: process.env.EMAIL_USER || 'avishkarlal01@gmail.com'
      },
      to: emailData.to,
      cc: emailData.cc || undefined,
      bcc: emailData.bcc || 'avishkarlal01@gmail.com',
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.body.replace(/\n/g, '<br>'),
      attachments: attachments,
      // Email headers for professional communication
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    // Send email
    let emailResult;
    if (sendOptions?.immediate !== false) {
      emailResult = await transporter.sendMail(mailOptions);
    } else {
      // For scheduled sending, you would implement a queue system here
      // For now, we'll just save the email for later processing
      console.log('Email scheduled for later sending:', emailData.subject);
      emailResult = { messageId: 'scheduled-' + Date.now() };
    }

    // Log successful send
    console.log('Email sent successfully:', {
      messageId: emailResult.messageId,
      to: emailData.to,
      subject: emailData.subject,
      attachments: attachments.length
    });

    // Save email confirmation record
    const emailConfirmation = {
      messageId: emailResult.messageId,
      sentAt: new Date().toISOString(),
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject,
      attachments: attachments.map(att => att.filename),
      patientId: patientId
    };

    // Save confirmation to file (in production, save to database)
    const confirmationPath = join(process.cwd(), 'public', 'reports', `Email_Confirmation_${Date.now()}.json`);
    try {
      const fs = require('fs');
      fs.writeFileSync(confirmationPath, JSON.stringify(emailConfirmation, null, 2));
    } catch (error) {
      console.warn('Failed to save email confirmation:', error);
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      sentAt: new Date().toISOString(),
      attachmentCount: attachments.length,
      confirmationFile: confirmationPath
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        errorMessage = 'Email authentication failed. Please check email credentials.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Email sending timed out. Please try again.';
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check email service status
export async function GET() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      status: 'Email service is configured and ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'Email service configuration error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 