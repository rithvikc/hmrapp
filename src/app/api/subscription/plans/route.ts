import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hmr.db');

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  hmr_limit: number | null;
  features: string;
  stripe_price_id: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const db = new Database(dbPath);
    
    const statement = db.prepare('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
    const plans = statement.all() as SubscriptionPlan[];
    
    // Parse features JSON for each plan
    const formattedPlans = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features)
    }));
    
    db.close();
    
    return NextResponse.json({
      plans: formattedPlans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
} 