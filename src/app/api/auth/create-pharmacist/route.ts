import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('API /auth/create-pharmacist: Starting request...');
    
    const { user_id, email, name, registration_number, phone, practice_name, practice_address } = await request.json();
    
    if (!user_id || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, email, name' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Check if pharmacist record already exists
    const { data: existingPharmacist, error: checkError } = await supabase
      .from('pharmacists')
      .select('id')
      .eq('user_id', user_id)
      .single();
    
    if (existingPharmacist) {
      console.log('API /auth/create-pharmacist: Pharmacist record already exists');
      return NextResponse.json(
        { message: 'Pharmacist record already exists', pharmacist_id: existingPharmacist.id },
        { status: 200 }
      );
    }
    
    // Create new pharmacist record
    const { data: pharmacist, error } = await supabase
      .from('pharmacists')
      .insert({
        user_id,
        email,
        name,
        registration_number: registration_number || `TEMP-${user_id.slice(0, 8)}`,
        phone: phone || null,
        practice_name: practice_name || null,
        practice_address: practice_address || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('API /auth/create-pharmacist: Error creating pharmacist:', error);
      return NextResponse.json(
        { error: 'Failed to create pharmacist record', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('API /auth/create-pharmacist: Pharmacist created successfully:', pharmacist.name);
    return NextResponse.json({ 
      message: 'Pharmacist record created successfully', 
      pharmacist 
    });
    
  } catch (error) {
    console.error('API /auth/create-pharmacist: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 