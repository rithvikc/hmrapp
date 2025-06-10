import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    const { name, email, phone, registration_number, practice_name, practice_address } = requestData;

    // Update the pharmacist record
    const { data: pharmacist, error: updateError } = await supabase
      .from('pharmacists')
      .update({
        name,
        email,
        phone,
        registration_number,
        practice_name,
        practice_address,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating pharmacist:', updateError);
      return NextResponse.json({ error: 'Failed to update pharmacist record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pharmacist updated successfully',
      pharmacist
    });

  } catch (error) {
    console.error('Error in pharmacist update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 