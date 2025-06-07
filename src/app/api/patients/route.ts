import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthenticatedSupabaseClient } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    console.log('API /patients: Starting request...');
    
    // Get authenticated user using the robust helper
    const authResult = await getAuthenticatedUser();
    
    if (!authResult.user || authResult.error) {
      console.log('API /patients: Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: 'Authentication required', details: authResult.error },
        { status: 401 }
      );
    }
    
    const user = authResult.user;
    console.log('API /patients: User authenticated:', user.id);
    
    // Create authenticated Supabase client
    const supabase = createAuthenticatedSupabaseClient();
    
    // Get user's pharmacist profile
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (pharmacistError || !pharmacist) {
      console.error('API /patients: Pharmacist profile not found:', pharmacistError);
      return NextResponse.json(
        { error: 'Pharmacist profile not found' },
        { status: 404 }
      );
    }
    
    console.log('API /patients: Pharmacist found:', pharmacist.id);
    
    // Fetch patients with HMR counts
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select(`
        *,
        hmr_reports (
          id,
          status,
          created_at
        )
      `)
      .eq('pharmacist_id', pharmacist.id)
      .order('created_at', { ascending: false });
    
    if (patientsError) {
      console.error('API /patients: Error fetching patients:', patientsError);
      return NextResponse.json(
        { error: 'Failed to fetch patients', details: patientsError.message },
        { status: 500 }
      );
    }
    
    console.log('API /patients: Successfully fetched', patients?.length || 0, 'patients');
    
    // Process patients data to group HMR reports by patient
    const processedPatients = patients?.map(patient => ({
      ...patient,
      hmr_count: patient.hmr_reports?.length || 0,
      latest_hmr: patient.hmr_reports?.[0]?.created_at || null,
      hmr_reports: patient.hmr_reports || []
    })) || [];
    
    return NextResponse.json({
      patients: processedPatients,
      total: processedPatients.length
    });
    
  } catch (error) {
    console.error('API /patients: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API /patients: Creating new patient...');
    
    // Get authenticated user using the robust helper
    const authResult = await getAuthenticatedUser();
    
    if (!authResult.user || authResult.error) {
      console.log('API /patients: Authentication failed for POST:', authResult.error);
      return NextResponse.json(
        { error: 'Authentication required', details: authResult.error },
        { status: 401 }
      );
    }
    
    const user = authResult.user;
    console.log('API /patients: User authenticated for patient creation:', user.id);
    
    // Create authenticated Supabase client
    const supabase = createAuthenticatedSupabaseClient();
    
    // Get user's pharmacist profile
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (pharmacistError || !pharmacist) {
      console.error('API /patients: Pharmacist profile not found for POST:', pharmacistError);
      return NextResponse.json(
        { error: 'Pharmacist profile not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Insert new patient
    const { data: patient, error: insertError } = await supabase
      .from('patients')
      .insert({
        pharmacist_id: pharmacist.id,
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        medicare_number: data.medicare_number || null,
        address: data.address || null,
        phone: data.phone || null,
        referring_doctor: data.referring_doctor,
        doctor_email: data.doctor_email || null,
        practice_name: data.practice_name || null,
        practice_address: data.practice_address || null,
        practice_phone: data.practice_phone || null,
        known_allergies: data.known_allergies || null,
        current_conditions: data.current_conditions || null,
        past_medical_history: data.past_medical_history || null
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('API /patients: Error creating patient:', insertError);
      return NextResponse.json(
        { error: 'Failed to create patient', details: insertError.message },
        { status: 500 }
      );
    }
    
    console.log('API /patients: Created patient:', patient?.name);
    return NextResponse.json(patient);
    
  } catch (error) {
    console.error('API /patients: Unexpected error in POST:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 