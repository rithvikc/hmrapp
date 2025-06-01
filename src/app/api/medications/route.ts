import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    if (patientId) {
      const medications = statements.getMedicationsByPatient.all(patientId);
      return NextResponse.json(medications);
    }
    
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = statements.insertMedication.run(
      data.patient_id,
      data.name,
      data.strength || null,
      data.form || null,
      data.dosage || null,
      data.frequency || null,
      data.route || null,
      data.prn_status,
      data.prescriber || null,
      data.prescribed_usage || null,
      data.actual_usage || null,
      data.compliance_status || null,
      data.compliance_comment || null
    );
    
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Medication ID is required' }, { status: 400 });
    }
    
    statements.updateMedication.run(
      data.name,
      data.strength || null,
      data.form || null,
      data.dosage || null,
      data.frequency || null,
      data.route || null,
      data.prn_status,
      data.prescriber || null,
      data.prescribed_usage || null,
      data.actual_usage || null,
      data.compliance_status || null,
      data.compliance_comment || null,
      data.id
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Medication ID is required' }, { status: 400 });
    }
    
    statements.deleteMedication.run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
  }
} 