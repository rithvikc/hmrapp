import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hmr.db');

// Get onboarding status
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
    
    const onboardingStmt = db.prepare(`
      SELECT * FROM user_onboarding WHERE pharmacist_id = ?
    `);
    const onboarding = onboardingStmt.get(user.id);
    
    db.close();
    
    return NextResponse.json({
      onboarding: onboarding || {
        pharmacist_id: user.id,
        completed_welcome: false,
        completed_tutorial: false,
        completed_first_patient: false,
        completed_first_hmr: false,
        onboarding_completed_at: null
      }
    });

  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}

// Update onboarding status
export async function PUT(request: NextRequest) {
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

    const { step } = await request.json();
    
    if (!step) {
      return NextResponse.json(
        { error: 'Step parameter is required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Create onboarding record if it doesn't exist
    const insertOnboarding = db.prepare(`
      INSERT OR IGNORE INTO user_onboarding (pharmacist_id) VALUES (?)
    `);
    insertOnboarding.run(user.id);
    
    // Update the specific step
    let updateQuery = '';
    switch (step) {
      case 'welcome':
        updateQuery = 'UPDATE user_onboarding SET completed_welcome = TRUE WHERE pharmacist_id = ?';
        break;
      case 'tutorial':
        updateQuery = 'UPDATE user_onboarding SET completed_tutorial = TRUE WHERE pharmacist_id = ?';
        break;
      case 'first_patient':
        updateQuery = 'UPDATE user_onboarding SET completed_first_patient = TRUE WHERE pharmacist_id = ?';
        break;
      case 'first_hmr':
        updateQuery = 'UPDATE user_onboarding SET completed_first_hmr = TRUE WHERE pharmacist_id = ?';
        break;
      case 'complete':
        updateQuery = 'UPDATE user_onboarding SET onboarding_completed_at = CURRENT_TIMESTAMP WHERE pharmacist_id = ?';
        break;
      default:
        db.close();
        return NextResponse.json(
          { error: 'Invalid step parameter' },
          { status: 400 }
        );
    }
    
    const updateStmt = db.prepare(updateQuery);
    updateStmt.run(user.id);
    
    // Get updated onboarding status
    const onboardingStmt = db.prepare(`
      SELECT * FROM user_onboarding WHERE pharmacist_id = ?
    `);
    const onboarding = onboardingStmt.get(user.id);
    
    db.close();
    
    return NextResponse.json({
      success: true,
      onboarding
    });

  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
} 