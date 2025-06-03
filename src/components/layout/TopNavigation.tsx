import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  Plus, 
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Pill,
  User,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHMRSelectors, Patient } from '@/store/hmr-store';

interface TopNavigationProps {
  sidebarCollapsed: boolean;
  currentPatient?: Patient | null;
  onNewReview: () => void;
  onScheduleReview: () => void;
  onGenerateReport: () => void;
  onSearch: (query: string) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  sidebarCollapsed,
  currentPatient,
  onNewReview,
  onScheduleReview,
  onGenerateReport,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const { pharmacist, user, signOut } = useAuth();
  const { pendingReviews, patients } = useHMRSelectors();

  // Mock notifications for demonstration
  const notifications = [
    {
      id: 1,
      type: 'safety',
      icon: AlertTriangle,
      title: 'CRITICAL: Drug Interaction Alert',
      message: 'Patient M. Johnson: Warfarin + Aspirin interaction detected - Immediate review required',
      time: '2 minutes ago',
      severity: 'high',
      color: 'bg-red-50 border-l-4 border-l-red-500',
      urgent: true
    },
    {
      id: 2,
      type: 'safety',
      icon: AlertTriangle,
      title: 'HIGH PRIORITY: Patient Safety Warning',
      message: 'Patient R. Chen: Metformin contraindication detected - Hold medication before procedure',
      time: '5 minutes ago',
      severity: 'high',
      color: 'bg-red-50 border-l-4 border-l-red-500',
      urgent: true
    },
    {
      id: 3,
      type: 'review',
      icon: Clock,
      title: 'Review Due Today',
      message: 'Home Medicine Review for S. Williams scheduled for 2:00 PM',
      time: '1 hour ago',
      severity: 'medium',
      color: 'bg-amber-50 border-l-4 border-l-amber-500',
      urgent: false
    },
    {
      id: 4,
      type: 'completion',
      icon: CheckCircle,
      title: 'Review Completed',
      message: 'HMR report for A. Thompson has been generated',
      time: '3 hours ago',
      severity: 'low',
      color: 'bg-green-50 border-l-4 border-l-green-500',
      urgent: false
    }
  ];

  const criticalAlerts = notifications.filter(n => n.severity === 'high').length;
  const urgentNotifications = notifications.filter(n => n.urgent);
  const regularNotifications = notifications.filter(n => !n.urgent);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const formatPatientContext = (patient: Patient) => {
    const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Unknown';
    return `${patient.name} • ${patient.gender} • ${age}y • MRN: ${patient.medicare_number || 'N/A'}`;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to login page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={`
      fixed top-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm
      transition-all duration-300 ease-in-out
      ${sidebarCollapsed ? 'left-16' : 'left-72'}
    `}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Patient Context & Search */}
          <div className="flex items-center space-x-6 flex-1">
            {/* Current Patient Context */}
            {currentPatient && (
              <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Current Patient
                  </p>
                  <p className="text-xs text-blue-700">
                    {formatPatientContext(currentPatient)}
                  </p>
                </div>
              </div>
            )}

            {/* Global Search */}
            <div className="relative flex-1 max-w-md">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients, medications, reviews..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-sm placeholder-gray-500"
                  />
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Patients</div>
                    {patients.slice(0, 3).map((patient) => (
                      <button
                        key={patient.id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.referring_doctor}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Actions & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onNewReview}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>New Review</span>
              </button>
              
              <button
                onClick={onScheduleReview}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                         hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </button>
              
              <button
                onClick={onGenerateReport}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                         hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Filter options"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative border-l border-gray-200 pl-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {criticalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {criticalAlerts}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Clinical Notifications</h3>
                      <span className="text-xs text-gray-500">{notifications.length} unread</span>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {/* Urgent Notifications First */}
                    {urgentNotifications.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-red-100 border-b border-red-200">
                          <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">
                            🚨 Critical Safety Alerts ({urgentNotifications.length})
                          </p>
                        </div>
                        {urgentNotifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-red-50 cursor-pointer ${notification.color}`}
                            >
                              <div className="flex items-start space-x-3">
                                <Icon className="h-5 w-5 mt-0.5 text-red-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-red-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-red-800 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-red-600 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <button className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                                    Review
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Regular Notifications */}
                    {regularNotifications.length > 0 && (
                      <>
                        {urgentNotifications.length > 0 && (
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Other Notifications
                            </p>
                          </div>
                        )}
                        {regularNotifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.color}`}
                            >
                              <div className="flex items-start space-x-3">
                                <Icon className="h-5 w-5 mt-0.5 text-gray-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {pharmacist?.name || user?.user_metadata?.name || 'Healthcare Professional'}
                </p>
                <p className="text-xs text-gray-500">
                  {pharmacist?.registration_number ? `MRN: ${pharmacist.registration_number}` : 'Pharmacist'}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation; 