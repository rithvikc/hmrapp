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
  Download
} from 'lucide-react';
import { useHMRSelectors } from '@/store/hmr-store';
import { format } from 'date-fns';
import { FaRegFile, FaClipboardList } from 'react-icons/fa';

interface DashboardProps {
  onNewReview: () => void;
  onContinueDraft: (reviewId: number) => void;
  onViewReport: (reviewId: number) => void;
  onViewAllPatients: () => void;
  onGenerateReports: () => void;
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

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    console.log('[DEBUG] Dashboard: Not mounted, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('[DEBUG] Dashboard: Mounted, checking isLoading =', isLoading, 'forceRender =', forceRender);

  const recentActivity = reviews
    .sort((a, b) => {
      const dateA = new Date(a.interview_date || '').getTime();
      const dateB = new Date(b.interview_date || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
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
                LAL MedReviews Dashboard
              </h1>
              <p className="text-gray-600">
                Professional Home Medication Review Management System
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pharmacist</p>
              <p className="font-semibold text-gray-900 font-serif">Avishkar Lal</p>
              <p className="text-sm text-gray-500">MRN: 8362</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 font-serif">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onNewReview}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold">Start New HMR</span>
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
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <FileText className="w-6 h-6" />
              <span className="font-semibold">Generate Reports</span>
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
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((review) => {
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