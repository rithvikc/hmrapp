import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hmr.db');

export async function POST(request: NextRequest) {
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
    
    // Check if user already has a subscription
    const existingSubscription = db.prepare(
      'SELECT * FROM user_subscriptions WHERE pharmacist_id = ?'
    ).get(user.id);

    if (existingSubscription) {
      db.close();
      return NextResponse.json(
        { error: 'User already has a subscription' },
        { status: 400 }
      );
    }

    // Create trial subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

    const insertSubscription = db.prepare(`
      INSERT INTO user_subscriptions (
        pharmacist_id, plan_id, status, current_period_start, 
        current_period_end, trial_ends_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertSubscription.run(
      user.id,
      'trial',
      'trialing',
      new Date().toISOString(),
      trialEndDate.toISOString(),
      trialEndDate.toISOString()
    );

    // Create initial usage tracking entry
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const insertUsage = db.prepare(`
      INSERT OR IGNORE INTO usage_tracking (pharmacist_id, month_year, hmr_count)
      VALUES (?, ?, ?)
    `);

    insertUsage.run(user.id, currentMonth, 0);

    // Create onboarding record
    const insertOnboarding = db.prepare(`
      INSERT OR IGNORE INTO user_onboarding (pharmacist_id) VALUES (?)
    `);

    insertOnboarding.run(user.id);

    db.close();

    return NextResponse.json({
      success: true,
      trial_ends_at: trialEndDate.toISOString(),
      message: 'Free trial started successfully'
    });

  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    );
  }
} 