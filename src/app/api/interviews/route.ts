import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const interviewId = searchParams.get('id');
    
    if (interviewId) {
      const interview = statements.getInterviewResponse.get(interviewId);
      return NextResponse.json(interview);
    }
    
    if (patientId) {
      const interviews = statements.getInterviewResponsesByPatient.all(patientId);
      return NextResponse.json(interviews);
    }
    
    return NextResponse.json({ error: 'Patient ID or Interview ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = statements.insertInterviewResponse.run(
      data.patient_id,
      data.interview_date,
      data.pharmacist_name || 'Avishkar Lal (MRN 8362)',
      data.medication_understanding || null,
      data.medication_administration || null,
      data.medication_adherence || null,
      data.adherence_comments || null,
      data.fluid_intake || null,
      data.tea_cups_daily || null,
      data.coffee_cups_daily || null,
      data.other_fluids || null,
      data.eating_habits || null,
      data.dietary_concerns || null,
      data.smoking_status || null,
      data.cigarettes_daily || null,
      data.quit_date || null,
      data.alcohol_consumption || null,
      data.alcohol_drinks_weekly || null,
      data.recreational_drug_use || null,
      data.drug_type || null,
      data.drug_frequency || null,
      JSON.stringify(data.unlisted_medications || []),
      JSON.stringify(data.unlisted_reasons || {}),
      JSON.stringify(data.discontinued_medications || []),
      JSON.stringify(data.discontinuation_reasons || {}),
      JSON.stringify(data.counselling_provided || []),
      data.next_review_date || null,
      data.follow_up_type || null,
      data.follow_up_notes || null,
      data.status || 'draft'
    );
    
    const interview = statements.getInterviewResponse.get(result.lastInsertRowid);
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json({ error: 'Failed to create interview' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }
    
    statements.updateInterviewResponse.run(
      data.medication_understanding || null,
      data.medication_administration || null,
      data.medication_adherence || null,
      data.adherence_comments || null,
      data.fluid_intake || null,
      data.tea_cups_daily || null,
      data.coffee_cups_daily || null,
      data.other_fluids || null,
      data.eating_habits || null,
      data.dietary_concerns || null,
      data.smoking_status || null,
      data.cigarettes_daily || null,
      data.quit_date || null,
      data.alcohol_consumption || null,
      data.alcohol_drinks_weekly || null,
      data.recreational_drug_use || null,
      data.drug_type || null,
      data.drug_frequency || null,
      JSON.stringify(data.unlisted_medications || []),
      JSON.stringify(data.unlisted_reasons || {}),
      JSON.stringify(data.discontinued_medications || []),
      JSON.stringify(data.discontinuation_reasons || {}),
      JSON.stringify(data.counselling_provided || []),
      data.next_review_date || null,
      data.follow_up_type || null,
      data.follow_up_notes || null,
      data.status || 'draft',
      data.id
    );
    
    const interview = statements.getInterviewResponse.get(data.id);
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
} 