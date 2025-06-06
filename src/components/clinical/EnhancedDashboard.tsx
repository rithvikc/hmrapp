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
  Stethoscope,
  ChevronLeft,
  ChevronRight
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
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const {
    pendingReviews,
    completedReviews,
    draftReviews,
    reviews,
    patients,
    isLoading,
    error,
    loadDashboardData,
    currentPatient
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

  const upcomingReviews = pendingReviews.slice(0, 5);
  const recentCompletedReviews = completedReviews.slice(0, 3);

  // Clinical metrics cards (removed high-risk patients)
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
      title: 'Pending Reviews',
      value: pendingReviews.length.toString(),
      change: `${draftReviews.length} drafts`,
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-600'
    }
  ];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Calendar functionality
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (direction === 'prev') {
        return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      } else {
        return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      }
    });
  };

  const isToday = (date: Date, day: number) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const hasReviewOnDay = (day: number) => {
    return upcomingReviews.some(review => {
      if (!review.interview_date) return false;
      const reviewDate = new Date(review.interview_date);
      return reviewDate.getFullYear() === currentDate.getFullYear() &&
             reviewDate.getMonth() === currentDate.getMonth() &&
             reviewDate.getDate() === day;
    });
  };

  const getReviewsForDay = (day: number) => {
    return upcomingReviews.filter(review => {
      if (!review.interview_date) return false;
      const reviewDate = new Date(review.interview_date);
      return reviewDate.getFullYear() === currentDate.getFullYear() &&
             reviewDate.getMonth() === currentDate.getMonth() &&
             reviewDate.getDate() === day;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const reviewsOnDay = getReviewsForDay(day);
      const hasReviews = reviewsOnDay.length > 0;
      const todayClass = isToday(currentDate, day) ? 'bg-blue-100 border-blue-500' : '';
      
      days.push(
        <div
          key={day}
          className={`h-20 border border-gray-200 p-1 ${todayClass} ${hasReviews ? 'bg-green-50' : ''} relative group hover:bg-gray-50 transition-colors cursor-pointer`}
        >
          <div className="text-sm font-medium text-gray-900">{day}</div>
          {hasReviews && (
            <div className="mt-1">
              {reviewsOnDay.slice(0, 2).map((review, index) => {
                const patient = patients.find(p => p.id === review.patient_id);
                return (
                  <div
                    key={index}
                    className="text-xs bg-green-600 text-white px-1 py-0.5 rounded truncate mb-0.5"
                    title={patient?.name || 'Unknown Patient'}
                  >
                    {patient?.name || 'Review'}
                  </div>
                );
              })}
              {reviewsOnDay.length > 2 && (
                <div className="text-xs text-green-600 font-medium">
                  +{reviewsOnDay.length - 2} more
                </div>
              )}
            </div>
          )}
          
          {/* Tooltip for day details */}
          {hasReviews && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max">
              <div className="font-medium mb-1">{format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), 'MMM dd, yyyy')}</div>
              {reviewsOnDay.map((review, index) => {
                const patient = patients.find(p => p.id === review.patient_id);
                return (
                  <div key={index} className="mb-1">
                    • {patient?.name || 'Unknown Patient'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return days;
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

        {/* Current Patient Section - Only show if there's an actual current patient */}
        {currentPatient && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Current Patient</h3>
                  <p className="text-blue-800 font-medium">{currentPatient.name}</p>
                  <p className="text-blue-700 text-sm">DOB: {currentPatient.dob} • Dr. {currentPatient.referring_doctor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => currentPatient.id && onViewPatient(currentPatient.id)}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => currentPatient.id && onStartReview(currentPatient.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          {/* Calendar View for Upcoming Reviews */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Reviews Calendar</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                      {format(currentDate, 'MMMM yyyy')}
                    </h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
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
            </div>
            <div className="p-6">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
              
              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
                    <span className="text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-50 border border-gray-200 rounded"></div>
                    <span className="text-gray-600">Has Reviews</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-2 bg-green-600 rounded"></div>
                    <span className="text-gray-600">Scheduled Review</span>
                  </div>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default EnhancedDashboard; 