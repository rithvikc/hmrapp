import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/database';

export async function GET() {
  try {
    const patients = statements.getPatients.all();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = statements.insertPatient.run(
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
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
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