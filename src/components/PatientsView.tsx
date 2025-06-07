'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  Phone, 
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
import PDFGenerationProgress from './PDFGenerationProgress';

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
  
  // Patient selection state
  const [selectedPatients, setSelectedPatients] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

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
    const filtered = patients.filter((patient: Patient) => {
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

  // Patient selection functions
  const handleSelectPatient = (patientId: number) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
    setSelectAll(newSelected.size === filteredPatients.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPatients(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredPatients.map((p: Patient) => p.id!));
      setSelectedPatients(allIds);
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedPatients(new Set());
    setSelectAll(false);
  };

  const getSelectedPatientsData = () => {
    return filteredPatients.filter((p: Patient) => selectedPatients.has(p.id!));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Export functions
  const exportToCSV = (selectedOnly = false) => {
    try {
      const patientsToExport = selectedOnly ? getSelectedPatientsData() : filteredPatients;
      
      if (selectedOnly && patientsToExport.length === 0) {
        alert('Please select patients to export.');
        return;
      }

      // Define CSV headers
      const headers = [
        'ID',
        'Name',
        'Gender',
        'Date of Birth',
        'Age',
        'Medicare Number',
        'Phone',
        'Address',
        'Referring Doctor',
        'Practice Name',
        'Practice Phone',
        'Known Allergies',
        'Current Conditions',
        'Past Medical History',
        'Date Added'
      ];

      // Convert patients to CSV rows
      const csvRows = [
        headers.join(','), // Header row
        ...patientsToExport.map((patient: Patient) => [
          patient.id,
          `"${patient.name}"`,
          patient.gender,
          patient.dob,
          calculateAge(patient.dob),
          patient.medicare_number || '',
          `"${patient.phone || ''}"`,
          `"${patient.address || ''}"`,
          `"${patient.referring_doctor}"`,
          `"${patient.practice_name || ''}"`,
          `"${patient.practice_phone || ''}"`,
          `"${patient.known_allergies || ''}"`,
          `"${patient.current_conditions || ''}"`,
          `"${patient.past_medical_history || ''}"`,
          patient.created_at ? formatDate(patient.created_at) : ''
        ].join(','))
      ];

      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const filename = selectedOnly 
          ? `selected_patients_export_${new Date().toISOString().split('T')[0]}.csv`
          : `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      console.log(`Exported ${patientsToExport.length} patients to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV file. Please try again.');
    }
  };

  const exportToPDF = async (selectedOnly = false) => {
    try {
      setShowProgress(true);
      const patientsToExport = selectedOnly ? getSelectedPatientsData() : filteredPatients;
      
      if (selectedOnly && patientsToExport.length === 0) {
        setShowProgress(false);
        alert('Please select patients to export.');
        return;
      }

      // Create PDF content for patients list
      const pdfData = {
        title: selectedOnly ? 'Selected Patients Report' : 'Patients List Report',
        generated: new Date().toISOString(),
        filters: {
          search: searchTerm || 'None',
          gender: selectedGender === 'all' ? 'All' : selectedGender,
          ageRange: selectedAgeRange === 'all' ? 'All' : selectedAgeRange,
          condition: selectedCondition === 'all' ? 'All' : selectedCondition,
          doctor: selectedDoctor === 'all' ? 'All' : selectedDoctor
        },
        patients: patientsToExport.map((patient: Patient) => ({
          id: patient.id,
          name: patient.name,
          gender: patient.gender,
          dob: patient.dob,
          age: calculateAge(patient.dob),
          medicare_number: patient.medicare_number || '',
          phone: patient.phone || '',
          address: patient.address || '',
          referring_doctor: patient.referring_doctor,
          practice_name: patient.practice_name || '',
          known_allergies: patient.known_allergies || '',
          current_conditions: patient.current_conditions || '',
          past_medical_history: patient.past_medical_history || ''
        })),
        summary: {
          totalPatients: patientsToExport.length,
          genderDistribution: {
            male: patientsToExport.filter((p: Patient) => p.gender?.toLowerCase() === 'male').length,
            female: patientsToExport.filter((p: Patient) => p.gender?.toLowerCase() === 'female').length,
            other: patientsToExport.filter((p: Patient) => p.gender && !['male', 'female'].includes(p.gender.toLowerCase())).length
          },
          ageGroups: {
            '18-30': patientsToExport.filter((p: Patient) => { const age = calculateAge(p.dob); return age >= 18 && age <= 30; }).length,
            '31-50': patientsToExport.filter((p: Patient) => { const age = calculateAge(p.dob); return age >= 31 && age <= 50; }).length,
            '51-70': patientsToExport.filter((p: Patient) => { const age = calculateAge(p.dob); return age >= 51 && age <= 70; }).length,
            '70+': patientsToExport.filter((p: Patient) => calculateAge(p.dob) > 70).length
          }
        }
      };

      // Send to PDF generation API
      const response = await fetch('/api/generate-patients-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        setShowProgress(false);
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = selectedOnly 
        ? `selected_patients_report_${new Date().toISOString().split('T')[0]}.pdf`
        : `patients_report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`Exported ${patientsToExport.length} patients to PDF`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setShowProgress(false);
      alert('Failed to export PDF file. Please try again.');
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
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Patients</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => {
                console.log('[DEBUG] Retrying loadPatients...');
                loadPatients();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={onBack}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
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
                {selectedPatients.size > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selectedPatients.size} selected
                  </span>
                )}
              </p>
            </div>
            
            {/* Selection Controls */}
            {filteredPatients.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="select-all" className="text-sm text-gray-700">
                    Select All ({filteredPatients.length})
                  </label>
                </div>
                {selectedPatients.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            )}
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
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'doctor' | 'created')}
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
              <div key={patient.id} className={`bg-white rounded-lg shadow-sm border transition-all ${
                selectedPatients.has(patient.id!) 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="p-6">
                  {/* Patient Header with Selection */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`patient-${patient.id}`}
                          checked={selectedPatients.has(patient.id!)}
                          onChange={() => handleSelectPatient(patient.id!)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
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
                <button
                  onClick={() => exportToCSV(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Selected Patients</span>
                </button>
                <button
                  onClick={() => exportToCSV()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export All Patients</span>
                </button>
                <button
                  onClick={() => exportToPDF(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Selected Patients PDF</span>
                </button>
                <button
                  onClick={() => exportToPDF()}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export All Patients PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Generation Progress Animation */}
      <PDFGenerationProgress 
        isVisible={showProgress}
        onComplete={() => setShowProgress(false)}
      />
    </div>
  );
};

export default PatientsView; 