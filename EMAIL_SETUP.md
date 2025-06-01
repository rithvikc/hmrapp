# Email Configuration Setup for HMR Report System

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Email Configuration for HMR Report System
EMAIL_USER=avishkarlal01@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Alternative SMTP Configuration (if not using Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password as `EMAIL_PASSWORD`

## Alternative Email Providers

### Outlook/Hotmail
```env
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail
```env
EMAIL_USER=your_email@yahoo.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP
```env
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_password
SMTP_HOST=mail.domain.com
SMTP_PORT=587
```

## Testing Email Configuration

1. Start your development server: `npm run dev`
2. Navigate to `/api/send-hmr-report` (GET request) to test configuration
3. Check the response for email service status

## Troubleshooting

- **Authentication Failed**: Verify app password is correct
- **Connection Refused**: Check SMTP host and port settings
- **Timeout**: Verify network connectivity and firewall settings

## Security Notes

- Never commit `.env.local` to version control
- Use app passwords instead of account passwords
- Consider using environment-specific configurations for production 