# HMR Automation System

A comprehensive **Home Medication Review (HMR) automation system** built with Next.js, designed to streamline the process of conducting medication reviews, generating professional reports, and managing patient communications.

## 🚀 Features

### Complete HMR Workflow
- **PDF Upload & OCR Processing**: Automatically extract patient and medication data from referral documents
- **Patient Information Review**: Comprehensive patient data management with validation
- **Medications Review**: Interactive medication list with compliance tracking and categorization
- **Patient Interview**: Structured interview sections covering medication understanding, lifestyle factors, and adherence
- **Clinical Recommendations**: Professional recommendation system with templates and priority levels
- **Report Generation**: Professional PDF reports matching standard HMR templates
- **Email Integration**: Automated email sending to referring GPs with attachments

### Advanced Features
- **Smart OCR**: Extracts patient details, medications, and medical conditions from PDFs
- **Template Library**: Pre-built clinical recommendation templates for common scenarios
- **Auto-Suggestions**: System-generated recommendations based on patient data
- **Professional PDF Generation**: Exact replica of standard HMR report templates
- **Email Templates**: Context-aware email composition with urgent/standard options
- **Real-time Validation**: Comprehensive data validation before report generation
- **Draft Management**: Save and resume workflow progress

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **State Management**: Zustand with persistence
- **PDF Generation**: Puppeteer for professional report creation
- **OCR Processing**: Tesseract.js for document text extraction
- **Email Service**: Nodemailer with multi-provider support
- **Database**: SQLite with prepared statements
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Gmail account with app password (for email functionality)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/rithvikc/hmrapp.git
cd hmrapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the project root:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Optional: Custom SMTP settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Gmail Setup Instructions:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → 2-Step Verification → App passwords
3. Create a new app password for "Mail"
4. Use this password as `EMAIL_PASSWORD`

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 📖 Usage Guide

### 1. **Dashboard**
- Start new HMR reviews
- Continue draft reviews
- View completed reports

### 2. **PDF Upload**
- Upload GP referral documents
- Automatic OCR extraction of patient data and medications
- Review and edit extracted information

### 3. **Patient Information Review**
- Complete patient demographics
- Add referring doctor details
- Document medical history and allergies

### 4. **Medications Review**
- Review extracted medications
- Add/edit medication details (strength, form, dosage, frequency)
- Set compliance status and comments
- Categorize as Regular, PRN, or Limited Duration

### 5. **Patient Interview**
- **Section A**: Medication understanding, administration, and adherence
- **Section B**: Lifestyle factors (fluid intake, diet, substance use)

### 6. **Clinical Recommendations**
- Document medication-related issues
- Use template library for common scenarios
- Set priority levels (High, Medium, Low)
- Add patient counselling notes

### 7. **Final Review & Export**
- **Review Summary**: Validate all collected data
- **PDF Preview**: Generate and preview professional reports
- **Email Setup**: Compose emails with auto-generated templates
- **Send Report**: Send to referring GP with attachments

## 📧 Email Configuration

The system supports multiple email providers:

### Gmail (Recommended)
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Outlook/Hotmail
```env
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Custom SMTP
```env
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_password
SMTP_HOST=mail.domain.com
SMTP_PORT=587
```

## 🗂 Project Structure

```
hmr-automation/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API endpoints
│   │   │   ├── generate-hmr-pdf/    # PDF generation
│   │   │   ├── send-hmr-report/     # Email sending
│   │   │   ├── patients/            # Patient CRUD
│   │   │   ├── medications/         # Medication CRUD
│   │   │   └── interviews/          # Interview CRUD
│   │   └── page.tsx           # Main application page
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── PDFUpload.tsx      # PDF upload & OCR
│   │   ├── PatientInfoReview.tsx     # Patient information
│   │   ├── MedicationsReview.tsx     # Medications management
│   │   ├── PatientInterview.tsx      # Interview forms
│   │   ├── ClinicalRecommendations.tsx   # Recommendations
│   │   └── FinalReview.tsx    # Report generation & sending
│   ├── lib/                   # Utilities
│   │   ├── database.ts        # Database operations
│   │   ├── ocr-processor.ts   # OCR functionality
│   │   └── email-service.ts   # Email utilities
│   └── store/                 # State management
│       └── hmr-store.ts       # Zustand store
├── public/
│   ├── reports/               # Generated PDF reports
│   └── templates/             # Email attachments
└── EMAIL_SETUP.md            # Email configuration guide
```

## 🔧 API Endpoints

### PDF Generation
- `POST /api/generate-hmr-pdf` - Generate professional HMR reports

### Email Service
- `POST /api/send-hmr-report` - Send reports to GPs
- `GET /api/send-hmr-report` - Check email service status

### Data Management
- `GET/POST/PUT/DELETE /api/patients` - Patient management
- `GET/POST/PUT/DELETE /api/medications` - Medication management
- `GET/POST/PUT/DELETE /api/interviews` - Interview management

## 🎯 Key Features in Detail

### Professional PDF Reports
- Exact replica of standard HMR templates
- Dynamic content generation based on collected data
- Gender-aware pronoun usage throughout
- Professional formatting with proper page breaks
- Compliance highlighting for non-adherent medications

### Smart Clinical Recommendations
- Template library for common medication issues
- Auto-suggestions based on patient data (age, medication count, specific drugs)
- Priority-based categorization
- Evidence-based recommendation templates

### Email Automation
- Context-aware email generation
- Urgent vs. standard templates
- Professional email formatting
- Attachment management
- Delivery confirmation tracking

## 🔒 Security & Privacy

- No patient data stored in plain text
- Email credentials secured with environment variables
- PDF files automatically organized by date
- Email confirmation tracking for audit trails

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Self-Hosted
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (nginx/Apache)

## 🛠 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes
3. Test thoroughly
4. Submit pull request

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: avishkarlal01@gmail.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Developed by Avishkar Lal - LAL MedReviews**  
Accredited Pharmacist MRN 8362  
📧 avishkarlal01@gmail.com  
📱 0490 417 047
