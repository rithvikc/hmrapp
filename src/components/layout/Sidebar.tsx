import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  Calendar,
  Pill,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  ClipboardList,
  AlertTriangle,
  Heart,
  Activity,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  currentStep: string;
  onNavigate: (step: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentStep, 
  onNavigate, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { pharmacist, user } = useAuth();

  const navigationSections = [
    {
      title: 'Overview',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard, 
          badge: null,
          description: 'Clinical overview and statistics'
        }
      ]
    },
    {
      title: 'Patient Management',
      items: [
        { 
          id: 'patients-view', 
          label: 'Patients', 
          icon: Users, 
          badge: null,
          description: 'View and manage all patients'
        },
        { 
          id: 'add-patient', 
          label: 'Add Patient', 
          icon: UserPlus, 
          badge: null,
          description: 'Register new patient'
        }
      ]
    },
    {
      title: 'Clinical Workflow',
      items: [
        { 
          id: 'upload', 
          label: 'New Review', 
          icon: FileText, 
          badge: null,
          description: 'Start home medicine review'
        },
        { 
          id: 'scheduled-reviews', 
          label: 'Scheduled Reviews', 
          icon: Calendar, 
          badge: 3,
          description: 'Upcoming and pending reviews'
        },
        { 
          id: 'medications', 
          label: 'Medication Database', 
          icon: Pill, 
          badge: null,
          description: 'Drug interactions and references'
        }
      ]
    },
    {
      title: 'Clinical Support',
      items: [
        { 
          id: 'clinical-guidelines', 
          label: 'Clinical Guidelines', 
          icon: BookOpen, 
          badge: null,
          description: 'Evidence-based protocols'
        },
        { 
          id: 'drug-interactions', 
          label: 'Drug Interactions', 
          icon: AlertTriangle, 
          badge: null,
          description: 'Safety checking tools'
        },
        { 
          id: 'risk-assessment', 
          label: 'Risk Assessment', 
          icon: Heart, 
          badge: null,
          description: 'Patient risk calculators'
        }
      ]
    },
    {
      title: 'Analytics & Reports',
      items: [
        { 
          id: 'analytics', 
          label: 'Analytics', 
          icon: BarChart3, 
          badge: null,
          description: 'Clinical outcomes and trends'
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: ClipboardList, 
          badge: null,
          description: 'Generate and export reports'
        }
      ]
    }
  ];

  const quickActions = [
    { 
      id: 'new-review', 
      label: 'New Review', 
      icon: Plus, 
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
    },
    { 
      id: 'schedule', 
      label: 'Schedule Review', 
      icon: Calendar, 
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    }
  ];

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-72'} 
      bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 
      transition-all duration-300 ease-in-out shadow-lg
      flex flex-col
    `}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LAL MedReviews</h1>
              <p className="text-xs text-gray-500">Clinical Platform</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'ml-0' : ''}`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {pharmacist?.name || user?.user_metadata?.name || 'Healthcare Professional'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {pharmacist?.registration_number ? `MRN: ${pharmacist.registration_number}` : 'Pharmacist'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`
                  w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200 ${action.color}
                `}
              >
                <action.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation - Flex-1 to take remaining space */}
      <div className="flex-1 overflow-y-auto">
        <nav className={`${isCollapsed ? 'p-2' : 'p-4'} space-y-6`}>
          {navigationSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentStep === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`
                        group w-full flex items-center rounded-lg text-sm font-medium
                        transition-all duration-200 relative
                        ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'}
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className={`
                        h-5 w-5 flex-shrink-0
                        ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                      `} />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="
                          absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-all duration-200 z-50 whitespace-nowrap
                        ">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-gray-300">{item.description}</p>
                          </div>
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 
                                        border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Settings - Fixed at bottom */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 flex-shrink-0`}>
        <button
          onClick={() => onNavigate('settings')}
          className={`
            group w-full flex items-center rounded-lg text-sm font-medium
            transition-colors duration-200
            ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'}
            ${currentStep === 'settings' 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings className={`h-5 w-5 ${isCollapsed ? '' : 'text-gray-400 group-hover:text-gray-600'}`} />
          {!isCollapsed && <span className="ml-3">Settings & Profile</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="
              absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 z-50 whitespace-nowrap
            ">
              <div>
                <p className="font-medium">Settings & Profile</p>
                <p className="text-xs text-gray-300">Account preferences and settings</p>
              </div>
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 
                            border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 