import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuthenticatedSupabaseClient } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    console.log('API /dashboard: Starting request...');
    
    // Get authenticated user using the robust helper
    const authResult = await getAuthenticatedUser();
    
    if (!authResult.user || authResult.error) {
      console.log('API /dashboard: Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: 'Authentication required', details: authResult.error },
        { status: 401 }
      );
    }
    
    const user = authResult.user;
    console.log('API /dashboard: User authenticated:', user.id);
    
    // Create authenticated Supabase client
    const supabase = createAuthenticatedSupabaseClient();
    
    // Get user's pharmacist profile with additional data
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select(`
        *,
        subscription_status (
          *
        ),
        usage_tracking (
          *
        ),
        onboarding_progress (
          *
        )
      `)
      .eq('user_id', user.id)
      .single();
    
    if (pharmacistError || !pharmacist) {
      console.error('API /dashboard: Pharmacist profile not found:', pharmacistError);
      return NextResponse.json(
        { error: 'Pharmacist profile not found' },
        { status: 404 }
      );
    }
    
    console.log('API /dashboard: Pharmacist found:', pharmacist.id);
    
    // Get patients count
    const { count: patientsCount, error: patientsCountError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('pharmacist_id', pharmacist.id);
    
    if (patientsCountError) {
      console.error('API /dashboard: Error counting patients:', patientsCountError);
    }
    
    // Get HMR reports statistics
    const { data: hmrReports, error: hmrError } = await supabase
      .from('hmr_reports')
      .select('id, status, created_at')
      .eq('pharmacist_id', pharmacist.id);
    
    if (hmrError) {
      console.error('API /dashboard: Error fetching HMR reports:', hmrError);
    }
    
    // Get recent activity (last 10 HMR reports)
    const { data: recentActivity, error: activityError } = await supabase
      .from('hmr_reports')
      .select(`
        *,
        patients (
          name
        )
      `)
      .eq('pharmacist_id', pharmacist.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activityError) {
      console.error('API /dashboard: Error fetching recent activity:', activityError);
    }
    
    // Get pending reviews (draft or pending status)
    const { data: pendingReviews, error: pendingError } = await supabase
      .from('hmr_reports')
      .select(`
        *,
        patients (
          name
        )
      `)
      .eq('pharmacist_id', pharmacist.id)
      .in('status', ['draft', 'pending'])
      .order('created_at', { ascending: false });
    
    if (pendingError) {
      console.error('API /dashboard: Error fetching pending reviews:', pendingError);
    }
    
    // Calculate statistics
    const totalReviews = hmrReports?.length || 0;
    const completedReviews = hmrReports?.filter(r => r.status === 'completed').length || 0;
    const draftReviews = hmrReports?.filter(r => r.status === 'draft').length || 0;
    const pendingReviewsCount = hmrReports?.filter(r => r.status === 'pending').length || 0;
    
    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthReports = hmrReports?.filter(r => 
      r.created_at.startsWith(currentMonth)
    ) || [];
    
    // Return dashboard data
    const dashboardData = {
      pharmacist: {
        id: pharmacist.id,
        name: pharmacist.name,
        email: pharmacist.email,
        phone: pharmacist.phone,
        registration_number: pharmacist.registration_number,
        created_at: pharmacist.created_at
      },
      statistics: {
        totalPatients: patientsCount || 0,
        totalReviews: totalReviews,
        completedReviews: completedReviews,
        draftReviews: draftReviews,
        pendingReviews: pendingReviewsCount
      },
      pendingReviews: pendingReviews || [],
      recentActivity: recentActivity || [],
      subscription: pharmacist.subscription_status?.[0] || null,
      usage: {
        current_month: currentMonth,
        hmr_count: currentMonthReports.length,
        hmr_limit: pharmacist.subscription_status?.[0]?.hmr_limit || null,
        last_hmr_date: hmrReports?.[0]?.created_at || null
      },
      onboarding: pharmacist.onboarding_progress?.[0] || null
    };
    
    console.log('API /dashboard: Successfully compiled dashboard data');
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('API /dashboard: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 