'use client';

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  User,
  Download,
  Crown,
  TrendingUp
} from 'lucide-react';
import { useHMRSelectors } from '@/store/hmr-store';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { FaRegFile, FaClipboardList } from 'react-icons/fa';

interface DashboardProps {
  onNewReview: () => void;
  onContinueDraft: (reviewId: number) => void;
  onViewReport: (reviewId: number) => void;
  onViewAllPatients: () => void;
  onGenerateReports: () => void;
}

interface SubscriptionData {
  subscription: {
    status: string;
    plan_name: string;
    current_period_end: string;
    subscription_plans: {
      name: string;
      hmr_limit: number;
    };
  };
  usage: {
    current_month: string;
    hmr_count: number;
    limit: number;
    can_create: boolean;
  };
}

const Dashboard: React.FC<DashboardProps> = ({
  onNewReview,
  onContinueDraft,
  onViewReport,
  onViewAllPatients,
  onGenerateReports
}) => {
  console.log('[DEBUG] Dashboard: Rendering component');
  const [mounted, setMounted] = useState(false);
  
  const {
    pendingReviews,
    completedReviews,
    draftReviews,
    reviews,
    patients,
    isLoading,
    error,
    loadDashboardData
  } = useHMRSelectors();

  const { 
    subscriptionData, 
    hasActiveSubscription, 
    canCreateHMR, 
    loading: subscriptionLoading 
  } = useSubscription();

  // Force render after 3 seconds even if isLoading is still true
  const [forceRender, setForceRender] = useState(false);
  
  useEffect(() => {
    console.log('[DEBUG] Dashboard: In useEffect, setting mounted = true');
    setMounted(true);
    console.log('[DEBUG] Dashboard: Calling loadDashboardData()');
    loadDashboardData();
    console.log('[DEBUG] Dashboard: After loadDashboardData()');
    
    // Force render after 3 seconds to prevent infinite loading
    const timer = setTimeout(() => {
      console.log('[DEBUG] Dashboard: Force rendering after timeout');
      setForceRender(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  if (isLoading && !forceRender) {
    console.log('[DEBUG] Dashboard: isLoading is true, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2 font-serif">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
                myHMR Dashboard
              </h1>
              <p className="text-gray-600">
                Professional Home Medication Review Management System
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pharmacist</p>
              <p className="font-semibold text-gray-900 font-serif">Admin User</p>
              <p className="text-sm text-gray-500">MRN: MRN-ADMIN-001</p>
              
              {/* Subscription Status */}
              {subscriptionData && (
                <div className="mt-2 flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(subscriptionData.subscription.status)}`}>
                    {subscriptionData.subscription.plan_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Usage Card */}
        {subscriptionData && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 font-serif">Monthly Usage</h2>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reports Generated</p>
                  <p className={`text-2xl font-bold ${getUsageColor(subscriptionData.usage.hmr_count, subscriptionData.usage.limit)}`}>
                    {subscriptionData.usage.hmr_count}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Limit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscriptionData.usage.limit}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.max(0, subscriptionData.usage.limit - subscriptionData.usage.hmr_count)}
                  </p>
                </div>
              </div>
              
              {/* Usage Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Usage Progress</span>
                  <span>{Math.round((subscriptionData.usage.hmr_count / subscriptionData.usage.limit) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      subscriptionData.usage.hmr_count / subscriptionData.usage.limit >= 0.9 
                        ? 'bg-red-500' 
                        : subscriptionData.usage.hmr_count / subscriptionData.usage.limit >= 0.75 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (subscriptionData.usage.hmr_count / subscriptionData.usage.limit) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {!subscriptionData.usage.can_create && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">
                      You've reached your monthly limit. Upgrade your plan to generate more reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 font-serif">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onNewReview}
              disabled={!hasActiveSubscription || !canCreateHMR}
              className={`p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3 ${
                hasActiveSubscription && canCreateHMR
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!hasActiveSubscription ? 'Subscription required' : !canCreateHMR ? 'Usage limit reached' : ''}
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold">Start New HMR</span>
              {(!hasActiveSubscription || !canCreateHMR) && (
                <span className="text-sm">🔒</span>
              )}
            </button>
            
            <button
              onClick={onViewAllPatients}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <User className="w-6 h-6" />
              <span className="font-semibold">View All Patients</span>
            </button>
            
            <button
              onClick={onGenerateReports}
              disabled={!hasActiveSubscription}
              className={`p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3 ${
                hasActiveSubscription
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={!hasActiveSubscription ? 'Subscription required' : ''}
            >
              <FileText className="w-6 h-6" />
              <span className="font-semibold">Generate Reports</span>
              {!hasActiveSubscription && (
                <span className="text-sm">🔒</span>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed Reviews</p>
                <p className="text-2xl font-bold text-green-600">{completedReviews.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Draft Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{draftReviews.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Draft Reviews */}
          {draftReviews.length > 0 && (
            <div className="col-span-full lg:col-span-1 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center font-serif">
                  {getStatusIcon('draft')}
                  Draft Reviews ({draftReviews.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftReviews.map((review) => {
                    const patient = patients.find(p => p.id === review.patient_id);
                    return (
                      <div
                        key={review.id}
                        className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {patient?.name || 'Unknown Patient'}
                          </h4>
                          {getStatusIcon(review.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Started: {formatDate(review.interview_date)}
                        </p>
                        <button
                          onClick={() => onContinueDraft(review.id!)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                          Continue Draft
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pending Reviews */}
          <div className="col-span-full lg:col-span-1 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center font-serif">
                {getStatusIcon('pending')}
                Pending Reviews ({pendingReviews.length})
              </h3>
            </div>
            <div className="p-6">
              {pendingReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending reviews</p>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.slice(0, 5).map((review) => {
                    const patient = patients.find(p => p.id === review.patient_id);
                    return (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {patient?.name || 'Unknown Patient'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center">
                              {getStatusIcon(review.status)}
                              {formatDate(review.interview_date)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(review.status)}`}>
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onContinueDraft(review.id!)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-full lg:col-span-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center font-serif">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => {
                    const patient = patients.find(p => p.id === review.patient_id);
                    return (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(review.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {patient?.name || 'Unknown Patient'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(review.interview_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {review.status === 'completed' && (
                            <button
                              onClick={() => onViewReport(review.id!)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              View Report
                            </button>
                          )}
                          {review.status === 'draft' && (
                            <button
                              onClick={() => onContinueDraft(review.id!)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Continue
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 