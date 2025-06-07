import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { statements } from '@/lib/database';
import { cookies } from 'next/headers';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Try to get user from cookies first
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user && !error) {
      return user;
    }

    // If cookie auth fails, try authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      const { data: { user: headerUser }, error: headerError } = await supabase.auth.getUser(token);
      
      if (headerUser && !headerError) {
        return headerUser;
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Patients API: Getting authenticated user...');
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      console.log('Patients API: No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Patients API: User authenticated:', user.id);
    const patients = statements.getPatientsByPharmacist.all(user.id);
    console.log('Patients API: Found', patients.length, 'patients');
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Patients API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Patients API: Creating new patient...');
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      console.log('Patients API: No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Patients API: User authenticated for patient creation:', user.id);
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
    
    const patient = statements.getPatient.get(result.lastInsertRowid) as any;
    console.log('Patients API: Created patient:', patient?.name);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patients API Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Patients API: Updating patient...');
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      console.log('Patients API: No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Patients API: User authenticated for patient update:', user.id);
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
    
    const patient = statements.getPatient.get(data.id) as any;
    console.log('Patients API: Updated patient:', patient?.name);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patients API Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
} 