import { NextResponse } from 'next/server';
import { statements } from '@/lib/database';

interface Patient {
  id: number;
  name: string;
  gender: string;
  dob: string;
  medicare_number: string;
  address: string;
  phone: string;
  referring_doctor: string;
  doctor_email: string;
  practice_name: string;
  practice_address: string;
  practice_phone: string;
  known_allergies: string;
  current_conditions: string;
  past_medical_history: string;
  created_at: string;
}

interface Review {
  id: number;
  patient_id: number;
  status: string;
  interview_date: string;
  pharmacist_name: string;
  created_at: string;
  patient_name?: string;
}

export async function GET() {
  try {
    // Fetch all dashboard data efficiently
    const patients = statements.getPatients.all() as Patient[];
    const pendingReviews = statements.getPendingReviews.all() as Review[];
    const recentActivity = statements.getRecentActivity.all() as Review[];
    
    // Calculate statistics
    const totalPatients = patients.length;
    const totalReviews = recentActivity.length;
    const completedReviews = recentActivity.filter((review: Review) => review.status === 'completed').length;
    const draftReviews = recentActivity.filter((review: Review) => review.status === 'draft').length;
    const pendingReviewsCount = pendingReviews.length;
    
    // For each pending review, get the patient name
    const pendingReviewsWithPatients = pendingReviews.map((review: Review) => {
      const patient = patients.find((p: Patient) => p.id === review.patient_id);
      return {
        ...review,
        patient_name: patient?.name || 'Unknown Patient'
      };
    });
    
    // For recent activity, get patient names
    const recentActivityWithPatients = recentActivity.map((review: Review) => {
      const patient = patients.find((p: Patient) => p.id === review.patient_id);
      return {
        ...review,
        patient_name: patient?.name || 'Unknown Patient'
      };
    });
    
    return NextResponse.json({
      patients,
      statistics: {
        totalPatients,
        totalReviews,
        completedReviews,
        draftReviews,
        pendingReviews: pendingReviewsCount
      },
      pendingReviews: pendingReviewsWithPatients,
      recentActivity: recentActivityWithPatients.slice(0, 5) // Limit to 5 most recent
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 