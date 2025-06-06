import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { statements } from '@/lib/database';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const patients = statements.getPatientsByPharmacist.all(user.id);
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const result = statements.insertPatientWithPharmacist.run(
      user.id,
      data.name,
      data.dob,
      data.gender,
      data.medicare_number || null,
      data.address || null,
      data.phone || null,
      data.referring_doctor,
      data.doctor_email || null,
      data.practice_name || null,
      data.practice_address || null,
      data.practice_phone || null,
      data.known_allergies || null,
      data.current_conditions || null,
      data.past_medical_history || null
    );
    
    const patient = statements.getPatient.get(result.lastInsertRowid);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }
    
    // Verify patient belongs to current user
    const existingPatient = statements.getPatientByIdAndPharmacist.get(data.id, user.id);
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }
    
    statements.updatePatient.run(
      data.name,
      data.dob,
      data.gender,
      data.medicare_number || null,
      data.address || null,
      data.phone || null,
      data.referring_doctor,
      data.doctor_email || null,
      data.practice_name || null,
      data.practice_address || null,
      data.practice_phone || null,
      data.known_allergies || null,
      data.current_conditions || null,
      data.past_medical_history || null,
      data.id
    );
    
    const patient = statements.getPatient.get(data.id);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
} 