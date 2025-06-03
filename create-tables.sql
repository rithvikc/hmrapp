-- Essential Supabase Database Setup for HMR Automation
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pharmacists table
CREATE TABLE IF NOT EXISTS pharmacists (
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
CREATE TABLE IF NOT EXISTS patients (
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
CREATE TABLE IF NOT EXISTS medications (
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
CREATE TABLE IF NOT EXISTS interview_responses (
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
  pharmacist_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinical_recommendations table
CREATE TABLE IF NOT EXISTS clinical_recommendations (
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
CREATE INDEX IF NOT EXISTS idx_pharmacists_user_id ON pharmacists(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_pharmacist_id ON patients(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_patient_id ON interview_responses(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_recommendations_patient_id ON clinical_recommendations(patient_id); 