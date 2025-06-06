# User Storage Setup Guide

This guide ensures that all users who sign up are properly stored in the Supabase database with corresponding pharmacist records.

## Overview

When users sign up, two things need to happen:
1. A user record is created in Supabase Auth (`auth.users` table)
2. A corresponding pharmacist record is created in the `pharmacists` table

## Setup Steps

### 1. Database Trigger (Recommended)

Run the SQL in `database-trigger.sql` in your Supabase SQL Editor:

```sql
-- This will automatically create pharmacist records when users sign up
-- Copy and paste the contents of database-trigger.sql
```

### 2. API Endpoint Backup

If the database trigger fails, the application will automatically call the API endpoint `/api/auth/create-pharmacist` to create the pharmacist record.

### 3. Verify Setup

Use the verification script to check if users are being stored correctly:

```bash
# Install dependencies if not already installed
npm install @supabase/supabase-js dotenv

# Check if all users have pharmacist records
node scripts/verify-user-storage.js

# Fix any missing pharmacist records
node scripts/verify-user-storage.js --fix

# Or just create missing records
node scripts/verify-user-storage.js create
```

## Required Environment Variables

Make sure you have these in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For the verification script
```

## How It Works

### Signup Flow

1. User fills out signup form with:
   - Email
   - Password
   - Name
   - Registration Number
   - Phone (optional)
   - Practice (optional)
   - Location (optional)

2. `AuthContext.signUp()` calls Supabase Auth with metadata

3. **Automatic Creation (Choose one):**
   - **Database Trigger**: Automatically creates pharmacist record when user is created
   - **API Fallback**: If trigger fails, the app calls `/api/auth/create-pharmacist`

4. User is redirected to `/dashboard?welcome=true`

### Database Schema

The `pharmacists` table stores:
```sql
CREATE TABLE pharmacists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  practice_name VARCHAR(255),
  practice_address TEXT,
  practice_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

### Users Missing Pharmacist Records

If users exist in `auth.users` but not in `pharmacists`:

1. Check if the database trigger is installed:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. Check the trigger function exists:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

3. Run the verification script to create missing records:
   ```bash
   node scripts/verify-user-storage.js --fix
   ```

### API Endpoint Issues

If the API endpoint `/api/auth/create-pharmacist` is failing:

1. Check the server logs for errors
2. Verify Supabase permissions
3. Ensure the `pharmacists` table has the correct RLS policies

### Database Permissions

Make sure these policies exist on the `pharmacists` table:

```sql
-- Allow users to read their own pharmacist data
CREATE POLICY "Pharmacists can view own data" ON pharmacists
  FOR ALL USING (auth.uid() = user_id);

-- Allow the service to insert new pharmacist records
GRANT ALL ON pharmacists TO authenticated;
```

## Testing

To test the complete flow:

1. Create a new user account through the signup form
2. Check if they can access the dashboard
3. Verify the pharmacist record was created:
   ```bash
   node scripts/verify-user-storage.js
   ```

## Manual Pharmacist Creation

If you need to manually create pharmacist records:

```javascript
// In your browser console or Node.js script
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey);

await supabase.from('pharmacists').insert({
  user_id: 'user-uuid-here',
  email: 'user@example.com',
  name: 'Dr. John Smith',
  registration_number: 'MRN1234',
  phone: '0400123456',
  practice_name: 'Smith Pharmacy',
  practice_address: 'Melbourne, VIC'
});
```

## Success Indicators

✅ Database trigger is installed and working  
✅ API endpoint responds correctly  
✅ All auth users have corresponding pharmacist records  
✅ Users can sign up and access the dashboard  
✅ Pharmacist data appears in the dashboard  

Run `node scripts/verify-user-storage.js` to check all indicators. 