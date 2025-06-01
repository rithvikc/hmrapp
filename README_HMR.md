# LAL MedReviews - Home Medication Review Automation System

A comprehensive web application for automating the Home Medication Review (HMR) process for pharmacist Avishkar Lal. This system streamlines the entire workflow from PDF referral processing to final report generation and email delivery.

## Features

### 🎯 Core Functionality
- **PDF Upload & OCR Processing**: Intelligent extraction of patient information and medications from referral documents
- **Patient Interview Forms**: Comprehensive assessment including lifestyle factors and medication adherence
- **Clinical Recommendations**: Professional recommendation system with issue identification and suggested actions
- **Report Generation**: Professional PDF reports matching exact template format with LAL MedReviews branding
- **Email Integration**: Automated email delivery to referring doctors with PDF attachments

### 🔧 Technical Features
- **Next.js 15** with TypeScript and Tailwind CSS
- **SQLite Database** for local data storage
- **OCR Processing** with Tesseract.js and pdf-parse
- **PDF Generation** with jsPDF and professional formatting
- **Email Service** with Nodemailer
- **State Management** with Zustand
- **Responsive Design** optimized for tablet use during interviews

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd hmr-automation
npm install
```

2. **Environment Setup**
Create a `.env.local` file with your email configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

3. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage Guide

### 1. Dashboard Overview
- View pending and completed reviews
- Track recent activity
- Quick access to start new HMR workflows

### 2. PDF Upload & Processing
- Drag & drop PDF referral documents
- Automatic OCR extraction of patient information
- Smart medication classification (Regular/PRN/Limited Duration)
- Manual editing and verification of extracted data

### 3. Patient Interview
- Comprehensive assessment forms including:
  - Medication understanding and adherence
  - Lifestyle factors (fluid intake, diet, smoking)
  - Tea/coffee consumption tracking
  - Drug and alcohol use assessment

### 4. Clinical Recommendations
- Dynamic issue/recommendation pairs
- Professional template suggestions
- Structured clinical documentation

### 5. Report Generation
- Professional PDF reports with LAL MedReviews branding
- Exact template format matching
- Patient information and assessment summary
- Clinical recommendations and management plan

### 6. Email Delivery
- Professional email composition
- Automatic PDF attachment
- Delivery confirmation and tracking

## Project Structure

```
hmr-automation/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   └── process-pdf/    # PDF processing endpoint
│   │   └── page.tsx            # Main application page
│   ├── components/             # React components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   └── PDFUpload.tsx       # File upload component
│   ├── lib/                    # Utility libraries
│   │   ├── database.ts         # SQLite database setup
│   │   ├── ocr-processor.ts    # PDF/OCR processing
│   │   ├── pdf-generator.ts    # Report generation
│   │   └── email-service.ts    # Email functionality
│   └── store/                  # State management
│       └── hmr-store.ts        # Zustand store
├── uploads/                    # PDF upload storage
├── reports/                    # Generated report storage
└── hmr.db                      # SQLite database (auto-created)
```

## Database Schema

The application uses SQLite with the following tables:

- **patients**: Patient information and referring doctor details
- **medications**: Medication lists with dosage and frequency
- **reviews**: Interview data and assessment results
- **recommendations**: Clinical recommendations and actions

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account > Security > App passwords
3. Use the App Password in your `.env.local` file

### Other SMTP Providers
Update the SMTP settings in your environment file:
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Customization

### Pharmacist Information
The pharmacist details are configured in the system:
- **Name**: Avishkar Lal
- **MRN**: 8362
- **Phone**: 0490 417 047

To update these details, modify the constants in:
- `src/lib/pdf-generator.ts`
- `src/lib/email-service.ts`
- `src/components/Dashboard.tsx`

### Report Template
The PDF report template matches the professional HMR format. To customize:
1. Edit `src/lib/pdf-generator.ts`
2. Modify header, sections, and styling
3. Update branding and contact information

## Development

### Key Technologies
- **Frontend**: React 18, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: SQLite with better-sqlite3
- **OCR**: Tesseract.js, pdf-parse
- **PDF**: jsPDF, jsPDF-autotable
- **Email**: Nodemailer
- **State**: Zustand with persistence
- **UI**: Lucide React icons

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **API Routes**: Add to `src/app/api/`
3. **Database Changes**: Update `src/lib/database.ts`
4. **State Management**: Extend `src/store/hmr-store.ts`

## Deployment

### Local Production Build
```bash
npm run build
npm start
```

### Environment Variables
Set all required environment variables for production:
- Email SMTP configuration
- Security settings
- Application configuration

## Security Considerations

- Input validation on all forms
- File type validation for uploads
- SQL injection prevention with prepared statements
- Secure email transmission
- Patient data encryption at rest

## Support & Maintenance

### Backup
- Regular database backups of `hmr.db`
- Export/import functionality for patient data
- Report archive management

### Monitoring
- Error logging and tracking
- Email delivery confirmation
- Performance monitoring

## License

Private software for LAL MedReviews professional use.

## Contact

For technical support or feature requests, contact the development team. 