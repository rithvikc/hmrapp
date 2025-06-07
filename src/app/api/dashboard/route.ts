import { NextResponse, NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { statements } from '@/lib/database';
import Database from 'better-sqlite3';
import path from 'path';
import { cookies } from 'next/headers';

const dbPath = path.join(process.cwd(), 'hmr.db');

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

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API: Getting authenticated user...');
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      console.log('Dashboard API: No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Dashboard API: User authenticated:', user.id);
    const db = new Database(dbPath);
    
    try {
      // Fetch user-specific dashboard data
      const patients = statements.getPatientsByPharmacist.all(user.id) as Patient[];
      console.log('Dashboard API: Found', patients.length, 'patients');
      
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
      
      // Get subscription and usage info (with error handling)
      let subscription = null;
      let usage = null;
      let onboarding = null;
      
      try {
        const subscriptionStmt = db.prepare(`
          SELECT s.*, p.name as plan_name, p.hmr_limit, p.price_monthly
          FROM user_subscriptions s
          JOIN subscription_plans p ON s.plan_id = p.id
          WHERE s.pharmacist_id = ?
          ORDER BY s.created_at DESC
          LIMIT 1
        `);
        subscription = subscriptionStmt.get(user.id) as any;
      } catch (subError) {
        console.log('Dashboard API: No subscription data found');
      }
      
      try {
        // Get current month usage
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const usageStmt = db.prepare(`
          SELECT * FROM usage_tracking 
          WHERE pharmacist_id = ? AND month_year = ?
        `);
        usage = usageStmt.get(user.id, currentMonth) as any;
      } catch (usageError) {
        console.log('Dashboard API: No usage data found');
      }
      
      try {
        // Get onboarding status
        const onboardingStmt = db.prepare(`
          SELECT * FROM user_onboarding WHERE pharmacist_id = ?
        `);
        onboarding = onboardingStmt.get(user.id) as any;
      } catch (onboardingError) {
        console.log('Dashboard API: No onboarding data found');
      }
      
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
      
      const responseData = {
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
          current_month: new Date().toISOString().slice(0, 7),
          hmr_count: usage?.hmr_count || 0,
          hmr_limit: subscription?.hmr_limit,
          last_hmr_date: usage?.last_hmr_date
        },
        onboarding
      };
      
      console.log('Dashboard API: Returning data for user:', user.id);
      return NextResponse.json(responseData);
      
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' }, 
      { status: 500 }
    );
  }
} 