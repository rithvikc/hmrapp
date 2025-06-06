import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { statements } from '@/lib/database';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hmr.db');

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
  interview_date: string;
  status: string;
  patient_name: string;
  created_at: string;
}

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

    const db = new Database(dbPath);
    
    // Fetch user-specific dashboard data
    const patients = statements.getPatientsByPharmacist.all(user.id) as Patient[];
    
    // Get pending reviews for this pharmacist
    const pendingReviewsStmt = db.prepare(`
      SELECT r.*, p.name as patient_name 
      FROM interview_responses r 
      JOIN patients p ON r.patient_id = p.id 
      WHERE r.status = 'draft' AND r.pharmacist_id = ?
      ORDER BY r.interview_date ASC
    `);
    const pendingReviews = pendingReviewsStmt.all(user.id) as Review[];
    
    // Get recent activity for this pharmacist
    const recentActivityStmt = db.prepare(`
      SELECT r.*, p.name as patient_name 
      FROM interview_responses r 
      JOIN patients p ON r.patient_id = p.id 
      WHERE r.pharmacist_id = ?
      ORDER BY r.created_at DESC 
      LIMIT 10
    `);
    const recentActivity = recentActivityStmt.all(user.id) as Review[];
    
    // Get subscription and usage info
    const subscriptionStmt = db.prepare(`
      SELECT s.*, p.name as plan_name, p.hmr_limit, p.price_monthly
      FROM user_subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.pharmacist_id = ?
      ORDER BY s.created_at DESC
      LIMIT 1
    `);
    const subscription = subscriptionStmt.get(user.id) as any;
    
    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const usageStmt = db.prepare(`
      SELECT * FROM usage_tracking 
      WHERE pharmacist_id = ? AND month_year = ?
    `);
    const usage = usageStmt.get(user.id, currentMonth) as any;
    
    // Get onboarding status
    const onboardingStmt = db.prepare(`
      SELECT * FROM user_onboarding WHERE pharmacist_id = ?
    `);
    const onboarding = onboardingStmt.get(user.id) as any;
    
    db.close();
    
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
      recentActivity: recentActivityWithPatients.slice(0, 5), // Limit to 5 most recent
      subscription,
      usage: {
        current_month: currentMonth,
        hmr_count: usage?.hmr_count || 0,
        hmr_limit: subscription?.hmr_limit,
        last_hmr_date: usage?.last_hmr_date
      },
      onboarding
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 