'use client';

import React from 'react';
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

interface DashboardProps {
  onNewReview: () => void;
  onContinueDraft: (reviewId: number) => void;
  onViewReport: (reviewId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNewReview,
  onContinueDraft,
  onViewReport
}) => {
  const {
    pendingReviews,
    completedReviews,
    draftReviews,
    reviews,
    patients
  } = useHMRSelectors();

  const recentActivity = reviews
    .sort((a, b) => new Date(b.interview_date).getTime() - new Date(a.interview_date).getTime())
    .slice(0, 5);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                LAL MedReviews Dashboard
              </h1>
              <p className="text-gray-600">
                Professional Home Medication Review Management System
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pharmacist</p>
              <p className="font-semibold text-gray-900">Avishkar Lal</p>
              <p className="text-sm text-gray-500">MRN: 8362</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onNewReview}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold">Start New HMR</span>
            </button>
            
            <button
              onClick={() => {/* Handle view all patients */}}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <User className="w-6 h-6" />
              <span className="font-semibold">View All Patients</span>
            </button>
            
            <button
              onClick={() => {/* Handle reports */}}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3"
            >
              <FileText className="w-6 h-6" />
              <span className="font-semibold">Generate Reports</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed Reviews</p>
                <p className="text-2xl font-bold text-green-600">{completedReviews.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
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
          {/* Pending Reviews */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                Pending Reviews
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
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {patient?.name || 'Unknown Patient'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(review.interview_date), 'MMM dd, yyyy')}
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
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
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
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(review.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {patient?.name || 'Unknown Patient'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(review.interview_date), 'MMM dd, yyyy')}
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

        {/* Draft Reviews Section */}
        {draftReviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-yellow-500" />
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
                      className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {patient?.name || 'Unknown Patient'}
                        </h4>
                        <Clock className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Started: {format(new Date(review.interview_date), 'MMM dd')}
                      </p>
                      <button
                        onClick={() => onContinueDraft(review.id!)}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
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
      </div>
    </div>
  );
};

export default Dashboard; 