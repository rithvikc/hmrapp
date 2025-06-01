'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  FileText,
  Plus,
  Edit3,
  Eye,
  ChevronDown,
  X,
  ArrowLeft,
  Download,
  User
} from 'lucide-react';
import { useHMRSelectors, Patient } from '@/store/hmr-store';
import { format } from 'date-fns';

interface PatientsViewProps {
  onBack: () => void;
  onNewPatient: () => void;
  onEditPatient: (patientId: number) => void;
  onViewPatient: (patientId: number) => void;
  onStartReview: (patientId: number) => void;
}

const PatientsView: React.FC<PatientsViewProps> = ({
  onBack,
  onNewPatient,
  onEditPatient,
  onViewPatient,
  onStartReview
}) => {
  const { patients, isLoading, error, loadPatients } = useHMRSelectors();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'doctor' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get unique values for filters
  const uniqueGenders = useMemo(() => {
    const genders = patients.map(p => p.gender).filter(Boolean);
    return [...new Set(genders)];
  }, [patients]);

  const uniqueDoctors = useMemo(() => {
    const doctors = patients.map(p => p.referring_doctor).filter(Boolean);
    return [...new Set(doctors)];
  }, [patients]);

  const uniqueConditions = useMemo(() => {
    const conditions = patients
      .map(p => p.current_conditions)
      .filter(Boolean)
      .flatMap(conditions => conditions?.split(',').map(c => c.trim()) || []);
    return [...new Set(conditions)];
  }, [patients]);

  // Filter and search patients
  const filteredPatients = useMemo(() => {
    let filtered = patients.filter((patient: Patient) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.referring_doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.medicare_number || '').includes(searchTerm) ||
        (patient.phone || '').includes(searchTerm) ||
        (patient.current_conditions || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.practice_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Gender filter
      const matchesGender = selectedGender === 'all' || patient.gender === selectedGender;

      // Age range filter
      let matchesAge = true;
      if (selectedAgeRange !== 'all') {
        const age = calculateAge(patient.dob);
        switch (selectedAgeRange) {
          case '18-30':
            matchesAge = age >= 18 && age <= 30;
            break;
          case '31-50':
            matchesAge = age >= 31 && age <= 50;
            break;
          case '51-70':
            matchesAge = age >= 51 && age <= 70;
            break;
          case '70+':
            matchesAge = age > 70;
            break;
        }
      }

      // Condition filter
      const matchesCondition = selectedCondition === 'all' || 
        (patient.current_conditions || '').toLowerCase().includes(selectedCondition.toLowerCase());

      // Doctor filter
      const matchesDoctor = selectedDoctor === 'all' || patient.referring_doctor === selectedDoctor;

      return matchesSearch && matchesGender && matchesAge && matchesCondition && matchesDoctor;
    });

    // Sort patients
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          comparison = calculateAge(a.dob) - calculateAge(b.dob);
          break;
        case 'doctor':
          comparison = a.referring_doctor.localeCompare(b.referring_doctor);
          break;
        case 'created':
          comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [patients, searchTerm, selectedGender, selectedAgeRange, selectedCondition, selectedDoctor, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGender('all');
    setSelectedAgeRange('all');
    setSelectedCondition('all');
    setSelectedDoctor('all');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
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
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Patients</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPatients}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <button
              onClick={onNewPatient}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Patient</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                All Patients
              </h1>
              <p className="text-gray-600">
                Manage and view all patients in the system ({filteredPatients.length} of {patients.length} patients)
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, doctor, medicare number, phone, conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Genders</option>
                      {uniqueGenders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  {/* Age Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                    <select
                      value={selectedAgeRange}
                      onChange={(e) => setSelectedAgeRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Ages</option>
                      <option value="18-30">18-30 years</option>
                      <option value="31-50">31-50 years</option>
                      <option value="51-70">51-70 years</option>
                      <option value="70+">70+ years</option>
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Conditions</option>
                      {uniqueConditions.slice(0, 10).map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referring Doctor</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Doctors</option>
                      {uniqueDoctors.map(doctor => (
                        <option key={doctor} value={doctor}>{doctor}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Name</option>
                        <option value="age">Age</option>
                        <option value="doctor">Doctor</option>
                        <option value="created">Date Added</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear All Filters</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    Showing {filteredPatients.length} of {patients.length} patients
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedGender !== 'all' || selectedAgeRange !== 'all' || selectedCondition !== 'all' || selectedDoctor !== 'all'
                ? 'No patients match your current search and filter criteria.'
                : 'No patients have been added to the system yet.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient: Patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Patient Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">
                          {patient.gender}, {calculateAge(patient.dob)} years old
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      ID: {patient.id}
                    </span>
                  </div>

                  {/* Patient Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>DOB: {formatDate(patient.dob)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{patient.referring_doctor}</span>
                    </div>
                    {patient.current_conditions && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{patient.current_conditions}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewPatient(patient.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onEditPatient(patient.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onStartReview(patient.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Options */}
        {filteredPatients.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
                <p className="text-gray-600">Export patient data for reporting and analysis</p>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Export CSV</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsView; 