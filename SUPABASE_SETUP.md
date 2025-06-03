# Supabase Setup and Authentication Implementation

## Overview
This guide will help you set up Supabase as your database backend, implement email/password authentication, and ensure pharmacist details are dynamically populated based on the logged-in user.

## Phase 1: Supabase Project Setup

### Step 1.1: Create Supabase Project
1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `hmr-automation`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

### Step 1.2: Get Project Credentials
1. Go to Project Settings → API
2. Copy and save:
   - **Project URL** (anon key URL)
   - **Project API Keys** → `anon` `public` key
   - **Project API Keys** → `service_role` `secret` key

### Step 1.3: Configure Environment Variables
Create/update `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URL for migrations (if needed)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

GEMINI_API_KEY=your_gemini_api_key_here
```

## Phase 2: Database Schema Migration

### Step 2.1: Create Supabase Tables
Go to Supabase Dashboard → SQL Editor and run this schema:

```sql
-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;

-- Create pharmacists table
CREATE TABLE pharmacists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_id UUID REFERENCES pharmacists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dob DATE,
  gender VARCHAR(20),
  medicare_number VARCHAR(50),
  address TEXT,
  phone VARCHAR(20),
  referring_doctor VARCHAR(255),
  doctor_email VARCHAR(255),
  practice_name VARCHAR(255),
  practice_address TEXT,
  practice_phone VARCHAR(20),
  known_allergies TEXT,
  current_conditions TEXT,
  past_medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  strength VARCHAR(100),
  form VARCHAR(100),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  route VARCHAR(100),
  prn_status VARCHAR(50) DEFAULT 'Regular',
  prescriber VARCHAR(255),
  prescribed_usage TEXT,
  actual_usage TEXT,
  compliance_status VARCHAR(50),
  compliance_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_responses table
CREATE TABLE interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  pharmacist_id UUID REFERENCES pharmacists(id) ON DELETE CASCADE,
  interview_date DATE NOT NULL,
  medication_understanding VARCHAR(255),
  medication_administration BOOLEAN,
  medication_adherence VARCHAR(255),
  adherence_comments TEXT,
  fluid_intake VARCHAR(255),
  tea_cups_daily INTEGER,
  coffee_cups_daily INTEGER,
  eating_habits VARCHAR(255),
  smoking_status VARCHAR(100),
  cigarettes_daily INTEGER,
  quit_date DATE,
  alcohol_consumption VARCHAR(255),
  recreational_drug_use VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinical_recommendations table
CREATE TABLE clinical_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  interview_id UUID REFERENCES interview_responses(id) ON DELETE CASCADE,
  issue_identified TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  priority_level VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  order_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE pharmacists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Pharmacists can only see their own data
CREATE POLICY "Pharmacists can view own data" ON pharmacists
  FOR ALL USING (auth.uid() = user_id);

-- Patients: pharmacists can only see their own patients
CREATE POLICY "Pharmacists can view own patients" ON patients
  FOR ALL USING (pharmacist_id IN (
    SELECT id FROM pharmacists WHERE user_id = auth.uid()
  ));

-- Medications: through patient ownership
CREATE POLICY "Pharmacists can view own patient medications" ON medications
  FOR ALL USING (patient_id IN (
    SELECT p.id FROM patients p 
    JOIN pharmacists ph ON p.pharmacist_id = ph.id 
    WHERE ph.user_id = auth.uid()
  ));

-- Interview responses: through patient ownership
CREATE POLICY "Pharmacists can view own patient interviews" ON interview_responses
  FOR ALL USING (patient_id IN (
    SELECT p.id FROM patients p 
    JOIN pharmacists ph ON p.pharmacist_id = ph.id 
    WHERE ph.user_id = auth.uid()
  ));

-- Clinical recommendations: through patient ownership
CREATE POLICY "Pharmacists can view own patient recommendations" ON clinical_recommendations
  FOR ALL USING (patient_id IN (
    SELECT p.id FROM patients p 
    JOIN pharmacists ph ON p.pharmacist_id = ph.id 
    WHERE ph.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_pharmacists_user_id ON pharmacists(user_id);
CREATE INDEX idx_patients_pharmacist_id ON patients(pharmacist_id);
CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_interview_responses_patient_id ON interview_responses(patient_id);
CREATE INDEX idx_clinical_recommendations_patient_id ON clinical_recommendations(patient_id);
```

### Step 2.2: Create Database Functions
```sql
-- Function to automatically create pharmacist profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.pharmacists (user_id, email, name, registration_number)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New Pharmacist'),
    COALESCE(new.raw_user_meta_data->>'registration_number', 'TEMP-' || substr(new.id::text, 1, 8))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Phase 3: Install and Configure Supabase Client

### Step 3.1: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared
```

### Step 3.2: Create Supabase Client
Create `src/lib/supabase.ts`:

```typescript
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// Client-side Supabase client
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
```

### Step 3.3: Create Database Types
Create `src/types/database.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      pharmacists: {
        Row: {
          id: string
          user_id: string
          name: string
          registration_number: string
          phone: string | null
          email: string
          practice_name: string | null
          practice_address: string | null
          practice_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          registration_number: string
          phone?: string | null
          email: string
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          registration_number?: string
          phone?: string | null
          email?: string
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          pharmacist_id: string
          name: string
          dob: string | null
          gender: string | null
          medicare_number: string | null
          address: string | null
          phone: string | null
          referring_doctor: string | null
          doctor_email: string | null
          practice_name: string | null
          practice_address: string | null
          practice_phone: string | null
          known_allergies: string | null
          current_conditions: string | null
          past_medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacist_id: string
          name: string
          dob?: string | null
          gender?: string | null
          medicare_number?: string | null
          address?: string | null
          phone?: string | null
          referring_doctor?: string | null
          doctor_email?: string | null
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          known_allergies?: string | null
          current_conditions?: string | null
          past_medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacist_id?: string
          name?: string
          dob?: string | null
          gender?: string | null
          medicare_number?: string | null
          address?: string | null
          phone?: string | null
          referring_doctor?: string | null
          doctor_email?: string | null
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          known_allergies?: string | null
          current_conditions?: string | null
          past_medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed...
    }
  }
}
```

## Phase 4: Authentication Implementation

### Step 4.1: Create Authentication Context
Create `src/contexts/AuthContext.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  pharmacist: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata: any) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pharmacist, setPharmacist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchPharmacist(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchPharmacist(session.user.id)
        } else {
          setPharmacist(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchPharmacist = async (userId: string) => {
    const { data, error } = await supabase
      .from('pharmacists')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!error && data) {
      setPharmacist(data)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      pharmacist,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Step 4.2: Create Login Component
Create `src/components/auth/LoginForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-serif">
            Sign in to LAL MedReviews
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Home Medication Review Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <a href="/auth/signup" className="text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### Step 4.3: Create Signup Component
Create `src/components/auth/SignupForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    registrationNumber: '',
    phone: '',
    practiceName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, {
      name: formData.name,
      registration_number: formData.registrationNumber,
      phone: formData.phone,
      practice_name: formData.practiceName
    })
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/auth/verify-email')
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-serif">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join LAL MedReviews Platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
            
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            
            <input
              name="registrationNumber"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Pharmacist Registration Number"
              value={formData.registrationNumber}
              onChange={handleChange}
            />
            
            <input
              name="phone"
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={handleChange}
            />
            
            <input
              name="practiceName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Practice Name (optional)"
              value={formData.practiceName}
              onChange={handleChange}
            />
            
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center">
            <a href="/auth/signin" className="text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
```

## Phase 5: Update Application Structure

### Step 5.1: Update Layout with Auth Provider
Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

const lora = Lora({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: "LAL MedReviews - Home Medication Review System",
  description: "Professional Home Medication Review automation system for pharmacist Avishkar Lal",
  keywords: ["medication review", "pharmacy", "HMR", "patient care", "medication management"],
  authors: [{ name: "LAL MedReviews" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable} ${lora.variable} antialiased bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <div id="root" className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 5.2: Create Protected Route Component
Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

### Step 5.3: Update Dashboard with Auth
Update `src/components/Dashboard.tsx` to use authenticated pharmacist data:

```typescript
// Add to imports
import { useAuth } from '@/contexts/AuthContext'

// In the Dashboard component, replace the hardcoded pharmacist info:
const Dashboard: React.FC<DashboardProps> = ({
  onNewReview,
  onContinueDraft,
  onViewReport,
  onViewAllPatients,
  onGenerateReports
}) => {
  const { pharmacist } = useAuth() // Add this line
  
  // ... existing code ...

  // Replace the hardcoded pharmacist section with:
  <div className="text-right">
    <p className="text-sm text-gray-500">Pharmacist</p>
    <p className="font-semibold text-gray-900 font-serif">
      {pharmacist?.name || 'Loading...'}
    </p>
    <p className="text-sm text-gray-500">
      MRN: {pharmacist?.registration_number || 'Loading...'}
    </p>
  </div>
```

## Phase 6: Create Auth Pages

### Step 6.1: Create Sign In Page
Create `src/app/auth/signin/page.tsx`:

```typescript
import LoginForm from '@/components/auth/LoginForm'

export default function SignInPage() {
  return <LoginForm />
}
```

### Step 6.2: Create Sign Up Page
Create `src/app/auth/signup/page.tsx`:

```typescript
import SignupForm from '@/components/auth/SignupForm'

export default function SignUpPage() {
  return <SignupForm />
}
```

### Step 6.3: Create Protected Dashboard Page
Update `src/app/page.tsx`:

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainApp from '@/components/MainApp' // Your existing main app component

export default function HomePage() {
  return (
    <ProtectedRoute>
      <MainApp />
    </ProtectedRoute>
  )
}
```

## Phase 7: Update Data Layer

### Step 7.1: Create Supabase Service
Create `src/lib/supabase-service.ts`:

```typescript
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

export class SupabaseService {
  private supabase = createClient()

  // Get current pharmacist
  async getCurrentPharmacist() {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await this.supabase
      .from('pharmacists')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  }

  // Get patients for current pharmacist
  async getPatients() {
    const pharmacist = await this.getCurrentPharmacist()
    
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .eq('pharmacist_id', pharmacist.id)

    if (error) throw error
    return data
  }

  // Get interviews for current pharmacist
  async getInterviews() {
    const pharmacist = await this.getCurrentPharmacist()
    
    const { data, error } = await this.supabase
      .from('interview_responses')
      .select(`
        *,
        patients (*)
      `)
      .eq('pharmacist_id', pharmacist.id)

    if (error) throw error
    return data
  }

  // Add more methods as needed...
}

export const supabaseService = new SupabaseService()
```

### Step 7.2: Update Store to Use Supabase
Update `src/store/hmr-store.ts` to use Supabase instead of local data.

## Phase 8: Data Migration

### Step 8.1: Create Migration Script
Create `migrate-to-supabase.js`:

```javascript
// Script to migrate existing SQLite data to Supabase
// This will be filled out once we have the exact data structure needed
```

## Next Steps Checklist

- [ ] **Phase 1**: Create Supabase project and get credentials
- [ ] **Phase 2**: Run database schema in Supabase SQL editor
- [ ] **Phase 3**: Install dependencies and configure Supabase client
- [ ] **Phase 4**: Implement authentication components
- [ ] **Phase 5**: Update application structure with auth
- [ ] **Phase 6**: Create auth pages
- [ ] **Phase 7**: Update data layer to use Supabase
- [ ] **Phase 8**: Migrate existing data

## Testing Checklist

After implementation:
- [ ] User can sign up with email/password
- [ ] User receives verification email
- [ ] User can sign in after verification
- [ ] Dashboard shows correct pharmacist details
- [ ] All data is properly filtered by logged-in pharmacist
- [ ] Row Level Security is working correctly
- [ ] Data persists correctly in Supabase

## Troubleshooting

### Common Issues:
1. **RLS Policies**: Make sure Row Level Security policies are correct
2. **Environment Variables**: Double-check all environment variables are set
3. **Authentication**: Ensure email verification is working
4. **CORS**: Make sure your domain is added to Supabase allowed origins

### Debug Commands:
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
npx supabase status --local
```

---

This setup provides a complete authentication system with proper data isolation between pharmacists, ensuring each pharmacist only sees their own patients and data. 