import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Heart,
  Pill,
  FileText,
  Eye,
  Download,
  Plus,
  ArrowRight,
  BarChart3,
  Stethoscope
} from 'lucide-react';
import { useHMRSelectors, Patient } from '@/store/hmr-store';
import { format } from 'date-fns';

interface EnhancedDashboardProps {
  onNewReview: () => void;
  onViewAllPatients: () => void;
  onViewPatient: (patientId: number) => void;
  onStartReview: (patientId: number) => void;
  onViewReport: (reviewId: number) => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  onNewReview,
  onViewAllPatients,
  onViewPatient,
  onStartReview,
  onViewReport
}) => {
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

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, [loadDashboardData]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate metrics
  const totalPatients = patients.length;
  const reviewsThisMonth = reviews.filter(r => {
    const reviewDate = new Date(r.interview_date || '');
    const now = new Date();
    return reviewDate.getMonth() === now.getMonth() && reviewDate.getFullYear() === now.getFullYear();
  }).length;

  const highRiskPatients = patients.filter(p => {
    // Mock risk calculation based on age and conditions
    const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 0;
    const hasMultipleConditions = (p.current_conditions || '').split(',').length > 2;
    return age > 70 || hasMultipleConditions;
  }).length;

  const upcomingReviews = pendingReviews.slice(0, 5);
  const recentCompletedReviews = completedReviews.slice(0, 3);

  // Clinical metrics cards
  const clinicalMetrics = [
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      change: '+12 this month',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-600'
    },
    {
      title: 'Reviews This Month',
      value: reviewsThisMonth.toString(),
      change: '+8% vs last month',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-600'
    },
    {
      title: 'High-Risk Patients',
      value: highRiskPatients.toString(),
      change: 'Requires attention',
      changeType: 'warning',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      bgColor: 'bg-amber-600'
    },
    {
      title: 'Pending Reviews',
      value: pendingReviews.length.toString(),
      change: `${draftReviews.length} drafts`,
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-600'
    }
  ];

  // Mock drug interaction alerts
  const drugAlerts = [
    {
      patientName: 'Margaret Johnson',
      interaction: 'Warfarin + Aspirin',
      severity: 'High',
      recommendation: 'Consider alternative antiplatelet therapy'
    },
    {
      patientName: 'Robert Chen',
      interaction: 'Metformin + Contrast',
      severity: 'Medium',
      recommendation: 'Hold metformin 48h post-procedure'
    }
  ];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Clinical Dashboard
              </h1>
              <p className="text-gray-600">
                Home Medicine Review Management • {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onNewReview}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>New HMR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {clinicalMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{metric.title}</h3>
                  <p className={`text-sm ${
                    metric.changeType === 'positive' ? 'text-green-600' :
                    metric.changeType === 'warning' ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Reviews */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Reviews</h2>
                </div>
                <button 
                  onClick={onViewAllPatients}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {upcomingReviews.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReviews.map((review) => {
                    const patient = patients.find(p => p.id === review.patient_id);
                    if (!patient) return null;
                    
                    return (
                      <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(review.interview_date || '')} • Dr. {patient.referring_doctor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => patient.id && onViewPatient(patient.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View patient"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => patient.id && onStartReview(patient.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Start Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming reviews scheduled</p>
                  <button
                    onClick={onNewReview}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Schedule a new review
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Completed Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Completed Reviews</h2>
              </div>
            </div>
            <div className="p-6">
              {recentCompletedReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentCompletedReviews.map((review) => {
                    const patient = patients.find(p => p.id === review.patient_id);
                    if (!patient) return null;
                    
                    return (
                      <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-600">
                              Completed {formatDate(review.interview_date || '')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => review.id && onViewReport(review.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clinical Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Clinical Performance</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Review Completion Rate</span>
                    <span className="text-sm text-gray-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Patient Satisfaction</span>
                    <span className="text-sm text-gray-600">4.8/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Medication Optimization</span>
                    <span className="text-sm text-gray-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View detailed analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard; 