# Custom Templates Guide

The HMR Automation system now supports **Custom Templates** that allow you to create your own document formats and automatically fill them with report data.

## Overview

The Custom Templates feature allows you to:
- Upload PDF or DOCX template files with form fields
- Map template fields to your HMR report data
- Generate filled documents with actual patient information
- Maintain consistent branding and formatting

## Supported File Types

- **PDF Files** (.pdf) - Templates with fillable form fields
- **Word Documents** (.docx) - Templates with form fields or placeholder text

## How to Create Templates

### For PDF Templates:
1. Create a PDF with fillable form fields using:
   - Adobe Acrobat Pro
   - LibreOffice Writer (Export as PDF with forms)
   - Microsoft Word (Save as PDF with forms)
2. Name your form fields descriptively (e.g., `patient_name`, `interview_date`)
3. Save and upload to the system

### For DOCX Templates:
1. Create a Word document with placeholder text using:
   - Curly braces: `{patient_name}`, `{interview_date}`
   - Square brackets: `[patient.address]`, `[medications.count]`
   - Content controls (Developer Tab → Controls)
2. Save as `.docx` format and upload

## Available Data Fields

The system provides access to the following report data:

### Patient Information
- `patient.name` - Patient's full name
- `patient.dob` - Date of birth
- `patient.gender` - Gender
- `patient.medicare_number` - Medicare number
- `patient.address` - Full address
- `patient.phone` - Phone number
- `patient.referring_doctor` - Referring doctor's name
- `patient.doctor_email` - Doctor's email address
- `patient.practice_name` - Medical practice name
- `patient.known_allergies` - Known allergies
- `patient.current_conditions` - Current medical conditions

### Interview Information
- `interview.interview_date` - Date of the interview
- `interview.pharmacist_name` - Conducting pharmacist's name
- `interview.medication_understanding` - Patient's medication understanding level
- `interview.medication_administration` - Administration method
- `interview.medication_adherence` - Adherence status
- `interview.fluid_intake` - Fluid intake assessment
- `interview.eating_habits` - Eating habits assessment
- `interview.smoking_status` - Smoking status
- `interview.alcohol_consumption` - Alcohol consumption habits

### Medications Summary
- `medications.count` - Total number of medications
- `medications.list` - Formatted list of all medications
- `medications.compliance_summary` - Compliance overview

### Recommendations Summary
- `recommendations.count` - Total number of recommendations
- `recommendations.high_priority` - Number of high-priority issues
- `recommendations.summary` - Formatted recommendations list

### System Information
- `report.generated_date` - Report generation date
- `report.pharmacist_email` - System pharmacist email

### Legacy Aliases (for backward compatibility)
- `patient_name` → `patient.name`
- `date_of_birth` → `patient.dob`
- `address` → `patient.address`
- `phone` → `patient.phone`
- `interview_date` → `interview.interview_date`
- `pharmacist_name` → `interview.pharmacist_name`
- `medications_list` → `medications.list`
- `recommendations` → `recommendations.summary`

## Using the Custom Templates Feature

### Step 1: Access the Feature
1. Complete your HMR workflow (Patient Info → Medications → Interview → Recommendations)
2. Go to the **Final Review** page
3. Click on the **"Custom Templates"** tab

### Step 2: Upload a Template
1. Click **"Upload Template"** button
2. Select your PDF or DOCX template file
3. The system will automatically detect available fields in your template

### Step 3: Map Fields
1. Click **"Map Fields"** next to your uploaded template
2. For each template field, select the corresponding report data field from the dropdown
3. You don't need to map every field - unmapped fields will remain empty
4. Click **"Save Mapping"** when done

### Step 4: Generate Filled Document
1. Click **"Generate"** next to your template
2. The system will create a filled document and automatically download it
3. The filename will be `[template_name]_filled.[extension]`

## Sample Template

A sample template is provided at `/public/sample-template.html` that demonstrates:
- Proper field naming conventions
- Different placeholder formats
- Comprehensive data mapping examples

To use this sample:
1. Open the HTML file in your browser
2. Save/print as PDF or copy content to Word
3. Convert placeholder text to actual form fields
4. Upload to test the feature

## Best Practices

### Template Design
- Use clear, descriptive field names
- Include field labels for context
- Leave adequate space for variable-length content (like medication lists)
- Test your template with sample data

### Field Mapping
- Map critical fields first (patient name, date, etc.)
- Use the preview feature to verify mappings
- Consider using both dot notation (`patient.name`) and legacy aliases (`patient_name`)

### Document Management
- Keep template files organized
- Use version numbers in template names
- Test templates thoroughly before using in production

## Troubleshooting

### Template Upload Issues
- **Error: "Unsupported file type"**
  - Ensure file is .pdf or .docx format
  - Check file isn't corrupted

- **Error: "Failed to extract template fields"**
  - For PDFs: Ensure form fields are properly created
  - For DOCX: Use proper placeholder syntax (`{field}` or `[field]`)

### Field Mapping Issues
- **Field not appearing in dropdown**
  - Check field name syntax in template
  - Try alternative placeholder formats

- **Data not filling correctly**
  - Verify field mapping is saved
  - Check that source data exists in the report
  - Try remapping the field

### Generation Issues
- **Error: "Failed to generate custom template"**
  - Check file permissions
  - Verify template file isn't corrupted
  - Try simplifying the template

## Support

For additional help with custom templates:
1. Check the sample template for reference
2. Verify your template follows the supported formats
3. Test with simple templates first before creating complex ones
4. Contact support if issues persist

## Version History

- **v1.0** - Initial release with PDF and DOCX support
- Support for form fields and placeholder text
- Comprehensive data mapping
- Automatic field detection 