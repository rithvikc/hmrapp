'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors, ClinicalRecommendation } from '@/store/hmr-store';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, X, Plus, Trash2, Edit3, Eye, FileText, AlertCircle,
  User, Calendar, Mail, Phone, MapPin, Pill, Activity
} from 'lucide-react';

interface PDFEditScreenProps {
  onSave: (editedData: any) => void;
  onCancel: () => void;
  onPreview: (editedData: any) => void;
}

interface EditablePatient {
  name: string;
  dob: string;
  gender: string;
  medicare_number: string;
  address: string;
  phone: string;
  referring_doctor: string;
  doctor_email: string;
  practice_name: string;
  known_allergies: string;
  current_conditions: string;
  past_medical_history: string;
}

interface EditableMedication {
  id: number;
  name: string;
  strength?: string;
  dosage: string;
  frequency: string;
  route: string;
  prn_status: 'Regular' | 'PRN (as needed)' | 'Limited Duration' | 'Stopped';
  compliance_status: 'Good' | 'Moderate' | 'Poor' | 'Non-adherent';
  compliance_comment?: string;
  actual_usage?: string;
  prescribed_usage?: string;
}

interface EditableInterview {
  interview_date: string;
  pharmacist_name: string;
  medication_understanding: string;
  medication_administration: string;
  medication_adherence: string;
  fluid_intake: string;
  tea_cups_daily?: number;
  coffee_cups_daily?: number;
  eating_habits: string;
  dietary_concerns?: string;
  smoking_status: string;
  cigarettes_daily?: number;
  quit_date?: string;
  alcohol_consumption: string;
  alcohol_drinks_weekly?: number;
  recreational_drug_use: string;
  drug_type?: string;
  drug_frequency?: string;
  next_review_date?: string;
}

interface EditableRecommendation {
  id: number;
  category: string;
  issue_identified: string;
  suggested_action: string;
  patient_counselling?: string;
  priority_level: 'High' | 'Medium' | 'Low';
}

export default function PDFEditScreen({ onSave, onCancel, onPreview }: PDFEditScreenProps) {
  const {
    currentPatient,
    currentMedications,
    currentInterviewResponse,
    currentClinicalRecommendations
  } = useHMRSelectors();

  const { user, pharmacist } = useAuth();

  const [editedPatient, setEditedPatient] = useState<EditablePatient>({
    name: '',
    dob: '',
    gender: '',
    medicare_number: '',
    address: '',
    phone: '',
    referring_doctor: '',
    doctor_email: '',
    practice_name: '',
    known_allergies: '',
    current_conditions: '',
    past_medical_history: ''
  });

  const [editedMedications, setEditedMedications] = useState<EditableMedication[]>([]);
  const [editedInterview, setEditedInterview] = useState<EditableInterview>({
    interview_date: '',
    pharmacist_name: '',
    medication_understanding: '',
    medication_administration: '',
    medication_adherence: '',
    fluid_intake: '',
    eating_habits: '',
    smoking_status: '',
    alcohol_consumption: '',
    recreational_drug_use: ''
  });
  const [editedRecommendations, setEditedRecommendations] = useState<EditableRecommendation[]>([]);

  const [activeSection, setActiveSection] = useState<'patient' | 'medications' | 'interview' | 'recommendations'>('patient');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize data from store
  useEffect(() => {
    if (currentPatient) {
      setEditedPatient({
        name: currentPatient.name || '',
        dob: currentPatient.dob || '',
        gender: currentPatient.gender || '',
        medicare_number: currentPatient.medicare_number || '',
        address: currentPatient.address || '',
        phone: currentPatient.phone || '',
        referring_doctor: currentPatient.referring_doctor || '',
        doctor_email: currentPatient.doctor_email || '',
        practice_name: currentPatient.practice_name || '',
        known_allergies: currentPatient.known_allergies || '',
        current_conditions: currentPatient.current_conditions || '',
        past_medical_history: currentPatient.past_medical_history || ''
      });
    }

    if (currentMedications) {
      setEditedMedications(currentMedications.map((med, index) => ({
        id: med.id || index + 1,
        name: med.name || '',
        strength: med.strength || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        route: med.route || 'Oral',
        prn_status: med.prn_status || 'Regular',
        compliance_status: med.compliance_status || 'Good',
        compliance_comment: med.compliance_comment || '',
        actual_usage: med.actual_usage || '',
        prescribed_usage: med.prescribed_usage || ''
      })));
    }

    if (currentInterviewResponse) {
      // Auto-populate pharmacist name if not set
      const pharmacistName = currentInterviewResponse.pharmacist_name || 
        (pharmacist?.name ? 
          (pharmacist.registration_number ? `${pharmacist.name} (MRN ${pharmacist.registration_number})` : pharmacist.name) : 
          user?.user_metadata?.name || '');

      setEditedInterview({
        interview_date: currentInterviewResponse.interview_date || new Date().toISOString().split('T')[0],
        pharmacist_name: pharmacistName,
        medication_understanding: currentInterviewResponse.medication_understanding || '',
        medication_administration: currentInterviewResponse.medication_administration || '',
        medication_adherence: currentInterviewResponse.medication_adherence || '',
        fluid_intake: currentInterviewResponse.fluid_intake || '',
        tea_cups_daily: currentInterviewResponse.tea_cups_daily || 0,
        coffee_cups_daily: currentInterviewResponse.coffee_cups_daily || 0,
        eating_habits: currentInterviewResponse.eating_habits || '',
        dietary_concerns: currentInterviewResponse.dietary_concerns || '',
        smoking_status: currentInterviewResponse.smoking_status || '',
        cigarettes_daily: currentInterviewResponse.cigarettes_daily || 0,
        quit_date: currentInterviewResponse.quit_date || '',
        alcohol_consumption: currentInterviewResponse.alcohol_consumption || '',
        alcohol_drinks_weekly: currentInterviewResponse.alcohol_drinks_weekly || 0,
        recreational_drug_use: currentInterviewResponse.recreational_drug_use || '',
        drug_type: currentInterviewResponse.drug_type || '',
        drug_frequency: currentInterviewResponse.drug_frequency || '',
        next_review_date: currentInterviewResponse.next_review_date || ''
      });
    }

    if (currentClinicalRecommendations) {
      setEditedRecommendations(currentClinicalRecommendations.map((rec, index) => ({
        id: rec.id || index + 1,
        category: rec.category || 'General Issue',
        issue_identified: rec.issue_identified || '',
        suggested_action: rec.suggested_action || '',
        patient_counselling: rec.patient_counselling || '',
        priority_level: rec.priority_level || 'Medium'
      })));
    }
  }, [currentPatient, currentMedications, currentInterviewResponse, currentClinicalRecommendations, pharmacist, user]);

  const handleSave = () => {
    const editedData = {
      patient: editedPatient,
      medications: editedMedications,
      interview: editedInterview,
      recommendations: editedRecommendations
    };
    onSave(editedData);
  };

  const handlePreview = () => {
    const editedData = {
      patient: editedPatient,
      medications: editedMedications,
      interview: editedInterview,
      recommendations: editedRecommendations
    };
    onPreview(editedData);
  };

  const addMedication = () => {
    const newMed: EditableMedication = {
      id: editedMedications.length + 1,
      name: '',
      dosage: '',
      frequency: '',
      route: 'Oral',
      prn_status: 'Regular',
      compliance_status: 'Good'
    };
    setEditedMedications([...editedMedications, newMed]);
    setHasChanges(true);
  };

  const removeMedication = (id: number) => {
    setEditedMedications(editedMedications.filter(med => med.id !== id));
    setHasChanges(true);
  };

  const addRecommendation = () => {
    const newRec: EditableRecommendation = {
      id: editedRecommendations.length + 1,
      category: 'General Issue',
      issue_identified: '',
      suggested_action: '',
      priority_level: 'Medium'
    };
    setEditedRecommendations([...editedRecommendations, newRec]);
    setHasChanges(true);
  };

  const removeRecommendation = (id: number) => {
    setEditedRecommendations(editedRecommendations.filter(rec => rec.id !== id));
    setHasChanges(true);
  };

  const renderPatientSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Patient Name
          </label>
          <input
            type="text"
            value={editedPatient.name}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, name: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date of Birth
          </label>
          <input
            type="date"
            value={editedPatient.dob}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, dob: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={editedPatient.gender}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, gender: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medicare Number</label>
          <input
            type="text"
            value={editedPatient.medicare_number}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, medicare_number: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Address
          </label>
          <textarea
            value={editedPatient.address}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, address: e.target.value });
              setHasChanges(true);
            }}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="text"
            value={editedPatient.phone}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, phone: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Referring Doctor</label>
          <input
            type="text"
            value={editedPatient.referring_doctor}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, referring_doctor: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Doctor Email
          </label>
          <input
            type="email"
            value={editedPatient.doctor_email}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, doctor_email: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name</label>
          <input
            type="text"
            value={editedPatient.practice_name}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, practice_name: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Known Allergies
          </label>
          <textarea
            value={editedPatient.known_allergies}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, known_allergies: e.target.value });
              setHasChanges(true);
            }}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Penicillin, Shellfish, or 'None known'"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Conditions</label>
          <textarea
            value={editedPatient.current_conditions}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, current_conditions: e.target.value });
              setHasChanges(true);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Past Medical History</label>
          <textarea
            value={editedPatient.past_medical_history}
            onChange={(e) => {
              setEditedPatient({ ...editedPatient, past_medical_history: e.target.value });
              setHasChanges(true);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderMedicationsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Medications List</h3>
        <button
          onClick={addMedication}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      <div className="space-y-4">
        {editedMedications.map((med, index) => (
          <div key={med.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                <Pill className="w-4 h-4 inline mr-2" />
                Medication {index + 1}
              </h4>
              <button
                onClick={() => removeMedication(med.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, name: e.target.value } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                <input
                  type="text"
                  value={med.strength || ''}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, strength: e.target.value } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={med.dosage}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, dosage: e.target.value } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <input
                  type="text"
                  value={med.frequency}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, frequency: e.target.value } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select
                  value={med.route}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, route: e.target.value } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Oral">Oral</option>
                  <option value="Topical">Topical</option>
                  <option value="Injection">Injection</option>
                  <option value="Inhaled">Inhaled</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={med.prn_status}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, prn_status: e.target.value as any } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="PRN (as needed)">PRN (as needed)</option>
                  <option value="Limited Duration">Limited Duration</option>
                  <option value="Stopped">Stopped</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
                <select
                  value={med.compliance_status}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, compliance_status: e.target.value as any } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Poor">Poor</option>
                  <option value="Non-adherent">Non-adherent</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Comment</label>
                <textarea
                  value={med.compliance_comment || ''}
                  onChange={(e) => {
                    const updated = editedMedications.map(m => 
                      m.id === med.id ? { ...m, compliance_comment: e.target.value } : m
                    );
                    setEditedMedications(updated);
                    setHasChanges(true);
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes about patient's compliance with this medication"
                />
              </div>
            </div>
          </div>
        ))}

        {editedMedications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No medications added yet. Click "Add Medication" to start.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInterviewSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interview Date</label>
          <input
            type="date"
            value={editedInterview.interview_date}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, interview_date: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacist Name</label>
          <input
            type="text"
            value={editedInterview.pharmacist_name}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, pharmacist_name: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., John Smith (MRN 1234)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Medication Understanding</label>
          <textarea
            value={editedInterview.medication_understanding}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, medication_understanding: e.target.value });
              setHasChanges(true);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patient's understanding of their medications and why they were prescribed"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Medication Administration</label>
          <textarea
            value={editedInterview.medication_administration}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, medication_administration: e.target.value });
              setHasChanges(true);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How the patient currently administers their medications (DAA, self-administration, etc.)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Medication Adherence</label>
          <textarea
            value={editedInterview.medication_adherence}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, medication_adherence: e.target.value });
              setHasChanges(true);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Assessment of patient's adherence to medication regimen"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fluid Intake</label>
          <textarea
            value={editedInterview.fluid_intake}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, fluid_intake: e.target.value });
              setHasChanges(true);
            }}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patient's daily fluid intake assessment"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Eating Habits</label>
          <textarea
            value={editedInterview.eating_habits}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, eating_habits: e.target.value });
              setHasChanges(true);
            }}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patient's eating patterns and dietary habits"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
          <select
            value={editedInterview.smoking_status}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, smoking_status: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Status</option>
            <option value="Non-smoker">Non-smoker</option>
            <option value="Current smoker">Current smoker</option>
            <option value="Ex-smoker">Ex-smoker</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol Consumption</label>
          <select
            value={editedInterview.alcohol_consumption}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, alcohol_consumption: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Status</option>
            <option value="No alcohol consumption">No alcohol consumption</option>
            <option value="Minimal alcohol consumption">Minimal alcohol consumption</option>
            <option value="Regular alcohol consumption">Regular alcohol consumption</option>
            <option value="Excessive alcohol consumption">Excessive alcohol consumption</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Next Review Date</label>
          <input
            type="date"
            value={editedInterview.next_review_date || ''}
            onChange={(e) => {
              setEditedInterview({ ...editedInterview, next_review_date: e.target.value });
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderRecommendationsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Clinical Recommendations</h3>
        <button
          onClick={addRecommendation}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recommendation</span>
        </button>
      </div>

      <div className="space-y-4">
        {editedRecommendations.map((rec, index) => (
          <div key={rec.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                <Activity className="w-4 h-4 inline mr-2" />
                Recommendation {index + 1}
              </h4>
              <div className="flex items-center space-x-2">
                <select
                  value={rec.priority_level}
                  onChange={(e) => {
                    const updated = editedRecommendations.map(r => 
                      r.id === rec.id ? { ...r, priority_level: e.target.value as any } : r
                    );
                    setEditedRecommendations(updated);
                    setHasChanges(true);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <button
                  onClick={() => removeRecommendation(rec.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={rec.category}
                  onChange={(e) => {
                    const updated = editedRecommendations.map(r => 
                      r.id === rec.id ? { ...r, category: e.target.value } : r
                    );
                    setEditedRecommendations(updated);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Drug Interaction, Dosage Adjustment, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Identified</label>
                <textarea
                  value={rec.issue_identified}
                  onChange={(e) => {
                    const updated = editedRecommendations.map(r => 
                      r.id === rec.id ? { ...r, issue_identified: e.target.value } : r
                    );
                    setEditedRecommendations(updated);
                    setHasChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the clinical issue that was identified..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Action</label>
                <textarea
                  value={rec.suggested_action}
                  onChange={(e) => {
                    const updated = editedRecommendations.map(r => 
                      r.id === rec.id ? { ...r, suggested_action: e.target.value } : r
                    );
                    setEditedRecommendations(updated);
                    setHasChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the recommended action or intervention..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Counselling</label>
                <textarea
                  value={rec.patient_counselling || ''}
                  onChange={(e) => {
                    const updated = editedRecommendations.map(r => 
                      r.id === rec.id ? { ...r, patient_counselling: e.target.value } : r
                    );
                    setEditedRecommendations(updated);
                    setHasChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe any patient counselling provided..."
                />
              </div>
            </div>
          </div>
        ))}

        {editedRecommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recommendations added yet. Click "Add Recommendation" to start.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Edit3 className="w-8 h-8 mr-3 text-blue-600" />
              Edit PDF Content
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview PDF</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                disabled={!hasChanges}
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Review and edit all content that will appear in the PDF report. Changes will be saved and used for PDF generation.
          </p>
          {hasChanges && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                You have unsaved changes. Don't forget to save before leaving this page.
              </p>
            </div>
          )}
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          {[
            { key: 'patient', label: 'Patient Information', icon: User },
            { key: 'medications', label: 'Medications', icon: Pill },
            { key: 'interview', label: 'Interview', icon: Activity },
            { key: 'recommendations', label: 'Recommendations', icon: FileText }
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeSection === section.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeSection === 'patient' && renderPatientSection()}
          {activeSection === 'medications' && renderMedicationsSection()}
          {activeSection === 'interview' && renderInterviewSection()}
          {activeSection === 'recommendations' && renderRecommendationsSection()}
        </div>
      </div>
    </div>
  );
} 