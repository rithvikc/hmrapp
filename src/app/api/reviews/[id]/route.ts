import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/database';

interface Patient {
  id: number;
  name: string;
  gender: string;
  dob: string;
  referring_doctor: string;
  practice_name: string;
  known_allergies: string;
  current_conditions: string;
  past_medical_history: string;
  address: string;
  phone: string;
  medicare_number: string;
  doctor_email: string;
  practice_address: string;
  practice_phone: string;
}

interface Interview {
  id: number;
  patient_id: number;
  interview_date: string;
  pharmacist_name: string;
  medication_understanding: string;
  medication_administration: string;
  medication_adherence: string;
  adherence_comments: string;
  fluid_intake: string;
  tea_cups_daily: number;
  coffee_cups_daily: number;
  eating_habits: string;
  dietary_concerns: string;
  smoking_status: string;
  cigarettes_daily: number;
  quit_date: string;
  alcohol_consumption: string;
  alcohol_drinks_weekly: number;
  recreational_drug_use: string;
  drug_type: string;
  drug_frequency: string;
  next_review_date: string;
  follow_up_type: string;
  follow_up_notes: string;
}

interface Medication {
  id: number;
  patient_id: number;
  name: string;
  strength: string;
  form: string;
  dosage: string;
  frequency: string;
  route: string;
  prn_status: string;
  prescriber: string;
  prescribed_usage: string;
  actual_usage: string;
  compliance_status: string;
  compliance_comment: string;
}

interface Recommendation {
  id: number;
  patient_id: number;
  interview_id: number;
  category: string;
  issue_identified: string;
  suggested_action: string;
  priority_level: string;
  order_number: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = parseInt(params.id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    // Get the interview response
    const interview = statements.getInterviewResponse.get(reviewId) as Interview;
    if (!interview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Get the patient
    const patient = statements.getPatient.get(interview.patient_id) as Patient;
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get medications for this patient
    const medications = statements.getMedicationsByPatient.all(interview.patient_id) as Medication[];

    // Get clinical recommendations for this interview
    const recommendations = statements.getClinicalRecommendationsByInterview.all(reviewId) as Recommendation[];

    // Format the data for the PDF generator
    const reviewData = {
      patient: {
        name: patient.name,
        gender: patient.gender,
        dob: patient.dob,
        referring_doctor: patient.referring_doctor,
        practice_name: patient.practice_name,
        known_allergies: patient.known_allergies,
        current_conditions: patient.current_conditions,
        past_medical_history: patient.past_medical_history,
        address: patient.address,
        phone: patient.phone,
        medicare_number: patient.medicare_number,
        doctor_email: patient.doctor_email,
        practice_address: patient.practice_address,
        practice_phone: patient.practice_phone
      },
      interview: {
        interview_date: interview.interview_date,
        pharmacist_name: interview.pharmacist_name,
        medication_understanding: interview.medication_understanding,
        medication_administration: interview.medication_administration,
        medication_adherence: interview.medication_adherence,
        adherence_comments: interview.adherence_comments,
        fluid_intake: interview.fluid_intake,
        tea_cups_daily: interview.tea_cups_daily,
        coffee_cups_daily: interview.coffee_cups_daily,
        eating_habits: interview.eating_habits,
        dietary_concerns: interview.dietary_concerns,
        smoking_status: interview.smoking_status,
        cigarettes_daily: interview.cigarettes_daily,
        quit_date: interview.quit_date,
        alcohol_consumption: interview.alcohol_consumption,
        alcohol_drinks_weekly: interview.alcohol_drinks_weekly,
        recreational_drug_use: interview.recreational_drug_use,
        drug_type: interview.drug_type,
        drug_frequency: interview.drug_frequency,
        next_review_date: interview.next_review_date,
        follow_up_type: interview.follow_up_type,
        follow_up_notes: interview.follow_up_notes
      },
      medications: medications.map(med => ({
        name: med.name,
        strength: med.strength,
        form: med.form,
        dosage: med.dosage,
        frequency: med.frequency,
        route: med.route,
        prn_status: med.prn_status,
        prescriber: med.prescriber,
        prescribed_usage: med.prescribed_usage,
        actual_usage: med.actual_usage,
        compliance_status: med.compliance_status,
        compliance_comment: med.compliance_comment
      })),
      recommendations: recommendations.map(rec => ({
        category: rec.category,
        issue_identified: rec.issue_identified,
        suggested_action: rec.suggested_action,
        priority_level: rec.priority_level,
        order_number: rec.order_number
      }))
    };

    return NextResponse.json(reviewData);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
} 