# Google Document AI Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or use existing project
3. Note your Project ID (you'll need this)

## Step 2: Enable Document AI API

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Document AI API"
3. Click "Enable"

## Step 3: Create Service Account (Not API Key!)

**Important:** Document AI requires service account authentication, not API keys.

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter service account name (e.g., "document-ai-service")
4. Grant "Document AI API User" role
5. Click "Done"

## Step 4: Generate Service Account Key

1. Click on your newly created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON key file
6. **Keep this file secure and never commit to version control**

## Step 5: Create Document Processor

1. Go to Document AI in Google Cloud Console
2. Click "Create Processor"
3. Choose "Document OCR" processor type
4. Select region (us or eu)
5. Copy the Processor ID from the processor details

## Step 6: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google Document AI Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id-here
```

**Alternative:** You can also set the service account key as a JSON string:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id-here
```

## Step 7: Install Google Cloud Client Library

```bash
npm install @google-cloud/documentai
```

## Cost Information

- Free tier: 1,000 pages per month
- After free tier: $1.50 per 1,000 pages
- Perfect for development and small-scale production

## Security Notes

- **Never commit service account keys to version control**
- Use `.env.local` for local development
- Use environment variables for production deployment
- Consider using Google Cloud Run or GKE for automatic authentication

## Testing

Once configured, run:
```bash
node test-google-ai.js
``` 