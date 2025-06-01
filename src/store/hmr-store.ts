import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Patient {
  id?: number;
  name: string;
  dob: string;
  gender: string;
  medicare_number?: string;
  address?: string;
  phone?: string;
  referring_doctor: string;
  doctor_email?: string;
  practice_name?: string;
  practice_address?: string;
  practice_phone?: string;
  known_allergies?: string;
  current_conditions?: string;
  past_medical_history?: string;
  created_at?: string;
}

export interface Medication {
  id?: number;
  patient_id?: number;
  name: string;
  strength?: string;
  form?: 'Tablet' | 'Capsule' | 'Liquid' | 'Cream' | 'Gel' | 'Injection' | 'Inhaler' | 'Spray' | 'Drops' | 'Patch' | 'Other';
  dosage?: string;
  frequency?: string;
  route?: 'Oral' | 'Topical' | 'Inhalation' | 'Injection' | 'Sublingual' | 'Rectal' | 'Vaginal' | 'Other';
  prn_status: 'Regular' | 'PRN (as needed)' | 'Limited Duration' | 'Stopped';
  prescriber?: string;
  prescribed_usage?: string;
  actual_usage?: 'As prescribed' | 'Not taking this medication' | 'Taking different dose than prescribed' | 'Taking at different times than prescribed' | 'Taking more frequently than prescribed' | 'Taking less frequently than prescribed' | 'Only taking when symptoms occur (PRN use of regular medication)';
  compliance_status?: 'Good' | 'Poor' | 'Non-adherent';
  compliance_comment?: string;
}

export interface InterviewResponse {
  id?: number;
  patient_id?: number;
  interview_date: string;
  pharmacist_name: string;
  
  // Section A: General Comments
  medication_understanding?: 'Good - Patient demonstrates clear understanding of medication purposes' | 'Moderate - Patient has some understanding but needs clarification on some medications' | 'Poor - Patient has limited understanding of medication purposes';
  medication_administration?: 'Uses a Dose Administration Aid (DAA) packed by their local pharmacy' | 'Self-administers medications using their own DAA (Webster pack/pill organizer)' | 'Self-administers medications without using any DAA';
  medication_adherence?: 'Good compliance - Medications are taken at the same time each day' | 'Poor compliance suspected due to varying dosing times and lifestyle factors' | 'Medications taken at consistent times, but dose discrepancies have been identified';
  adherence_comments?: string;
  
  // Section B: Lifestyle Considerations
  fluid_intake?: 'Adequate fluid intake (~approximately 2 litres per day)' | 'Inadequate fluid intake - Limited water intake (less than 2 litres per day)';
  tea_cups_daily?: number;
  coffee_cups_daily?: number;
  other_fluids?: string;
  eating_habits?: 'Good eating habits - Regular meals, balanced diet' | 'Poor eating habits - Irregular meals, dietary concerns identified';
  dietary_concerns?: string;
  smoking_status?: 'Non-smoker' | 'Current smoker' | 'Ex-smoker';
  cigarettes_daily?: number;
  quit_date?: string;
  alcohol_consumption?: 'No alcohol consumption' | 'Minimal alcohol consumption (occasional social drinking)' | 'Regular alcohol consumption' | 'Excessive alcohol consumption requiring intervention';
  alcohol_drinks_weekly?: number;
  recreational_drug_use?: 'No recreational drug use' | 'Occasional recreational drug use' | 'Regular recreational drug use';
  drug_type?: string;
  drug_frequency?: string;
  
  // Section C: Medication Compliance Review
  unlisted_medications?: UnlistedMedication[];
  discontinued_medications?: string[];
  discontinuation_reasons?: { [medication: string]: string };
  
  // Section D: Clinical Recommendations
  counselling_provided?: string[];
  next_review_date?: string;
  follow_up_type?: 'Phone call' | 'Home visit' | 'GP consultation' | 'No follow-up needed';
  follow_up_notes?: string;
  
  status: 'draft' | 'completed' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface UnlistedMedication {
  name: string;
  strength: string;
  how_obtained: 'Over-counter' | 'Previous prescription' | 'Online' | 'Other';
  reason: string;
}

export interface MedicationCompliance {
  id?: number;
  patient_id?: number;
  interview_id?: number;
  medication_id?: number;
  prescribed_dosing: string;
  actual_usage: string;
  compliance_status: 'Good' | 'Poor' | 'Non-adherent';
  comments?: string;
}

export interface ClinicalRecommendation {
  id?: number;
  patient_id?: number;
  interview_id?: number;
  issue_identified: string;
  suggested_action: string;
  priority_level: 'High' | 'Medium' | 'Low';
  category: 'Medication Adherence Issues' | 'Drug Interactions' | 'Inappropriate Dosing' | 'Side Effects/Adverse Reactions' | 'Therapeutic Duplication' | 'Contraindications' | 'Drug-Disease Interactions' | 'Monitoring Requirements' | 'Cost/Access Issues' | 'Administration Problems' | 'Medication Storage Issues' | 'Polypharmacy Concerns' | 'Other Clinical Issue';
  order_number: number;
}

// Legacy interfaces for backward compatibility
export interface Review {
  id?: number;
  patient_id?: number;
  interview_date: string;
  medication_understanding: string;
  medication_administration: string;
  medication_adherence: string;
  fluid_intake: string;
  tea_consumption?: number;
  coffee_consumption?: number;
  eating_habits: string;
  smoking_status: string;
  cigarettes_per_day?: number;
  alcohol_use: string;
  drug_use: string;
  status: 'pending' | 'completed' | 'draft';
}

export interface Recommendation {
  id?: number;
  review_id?: number;
  issue_identified: string;
  suggested_action: string;
}

export interface HMRWorkflowState {
  // Current workflow step
  currentStep: 'dashboard' | 'upload' | 'patient-info' | 'medications-review' | 'interview' | 'recommendations' | 'review' | 'email';
  
  // Current data being worked on
  currentPatient: Patient | null;
  currentMedications: Medication[];
  currentInterviewResponse: InterviewResponse | null;
  currentMedicationCompliance: MedicationCompliance[];
  currentClinicalRecommendations: ClinicalRecommendation[];
  
  // Legacy data for backward compatibility
  currentReview: Review | null;
  currentRecommendations: Recommendation[];
  
  // All data
  patients: Patient[];
  interviewResponses: InterviewResponse[];
  reviews: Review[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Form section state
  currentSection: 'patient-info' | 'medications' | 'interview-a' | 'interview-b' | 'interview-c' | 'interview-d';
  
  // File handling
  uploadedFile: File | null;
  extractedData: any;
  
  // Actions
  setCurrentStep: (step: HMRWorkflowState['currentStep']) => void;
  setCurrentSection: (section: HMRWorkflowState['currentSection']) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  setCurrentMedications: (medications: Medication[]) => void;
  setCurrentInterviewResponse: (response: InterviewResponse | null) => void;
  setCurrentMedicationCompliance: (compliance: MedicationCompliance[]) => void;
  setCurrentClinicalRecommendations: (recommendations: ClinicalRecommendation[]) => void;
  
  // Legacy setters
  setCurrentReview: (review: Review | null) => void;
  setCurrentRecommendations: (recommendations: Recommendation[]) => void;
  
  // Medication operations
  addMedication: (medication: Medication) => void;
  updateMedication: (index: number, medication: Medication) => void;
  removeMedication: (index: number) => void;
  
  // Clinical recommendation operations
  addClinicalRecommendation: (recommendation: ClinicalRecommendation) => void;
  updateClinicalRecommendation: (index: number, recommendation: ClinicalRecommendation) => void;
  removeClinicalRecommendation: (index: number) => void;
  
  // Legacy recommendation operations
  addRecommendation: (recommendation: Recommendation) => void;
  updateRecommendation: (index: number, recommendation: Recommendation) => void;
  removeRecommendation: (index: number) => void;
  
  // File operations
  setUploadedFile: (file: File | null) => void;
  setExtractedData: (data: any) => void;
  
  // UI operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Workflow operations
  resetWorkflow: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
  completeReview: () => void;
  
  // Computed properties
  hasUnsavedWork: boolean;
}

const initialState = {
  currentStep: 'dashboard' as const,
  currentSection: 'patient-info' as const,
  currentPatient: null,
  currentMedications: [],
  currentInterviewResponse: null,
  currentMedicationCompliance: [],
  currentClinicalRecommendations: [],
  currentReview: null,
  currentRecommendations: [],
  patients: [],
  interviewResponses: [],
  reviews: [],
  isLoading: false,
  error: null,
  uploadedFile: null,
  extractedData: null,
};

export const useHMRStore = create<HMRWorkflowState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setCurrentStep: (step) => set({ currentStep: step }),
        
        setCurrentSection: (section) => set({ currentSection: section }),
        
        setCurrentPatient: (patient) => set({ currentPatient: patient }),
        
        setCurrentMedications: (medications) => set({ currentMedications: medications }),
        
        setCurrentInterviewResponse: (response) => set({ currentInterviewResponse: response }),
        
        setCurrentMedicationCompliance: (compliance) => set({ currentMedicationCompliance: compliance }),
        
        setCurrentClinicalRecommendations: (recommendations) => set({ currentClinicalRecommendations: recommendations }),
        
        // Legacy setters
        setCurrentReview: (review) => set({ currentReview: review }),
        
        setCurrentRecommendations: (recommendations) => set({ currentRecommendations: recommendations }),
        
        // Medication operations
        addMedication: (medication) => set((state) => ({
          currentMedications: [...state.currentMedications, medication]
        })),
        
        updateMedication: (index, medication) => set((state) => {
          const newMedications = [...state.currentMedications];
          newMedications[index] = medication;
          return { currentMedications: newMedications };
        }),
        
        removeMedication: (index) => set((state) => ({
          currentMedications: state.currentMedications.filter((_, i) => i !== index)
        })),
        
        // Clinical recommendation operations
        addClinicalRecommendation: (recommendation) => set((state) => ({
          currentClinicalRecommendations: [...state.currentClinicalRecommendations, {
            ...recommendation,
            order_number: state.currentClinicalRecommendations.length + 1
          }]
        })),
        
        updateClinicalRecommendation: (index, recommendation) => set((state) => {
          const newRecommendations = [...state.currentClinicalRecommendations];
          newRecommendations[index] = recommendation;
          return { currentClinicalRecommendations: newRecommendations };
        }),
        
        removeClinicalRecommendation: (index) => set((state) => ({
          currentClinicalRecommendations: state.currentClinicalRecommendations.filter((_, i) => i !== index)
        })),
        
        // Legacy recommendation operations
        addRecommendation: (recommendation) => set((state) => ({
          currentRecommendations: [...state.currentRecommendations, recommendation]
        })),
        
        updateRecommendation: (index, recommendation) => set((state) => {
          const newRecommendations = [...state.currentRecommendations];
          newRecommendations[index] = recommendation;
          return { currentRecommendations: newRecommendations };
        }),
        
        removeRecommendation: (index) => set((state) => ({
          currentRecommendations: state.currentRecommendations.filter((_, i) => i !== index)
        })),
        
        setUploadedFile: (file) => set({ uploadedFile: file }),
        
        setExtractedData: (data) => set({ extractedData: data }),
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        setError: (error) => set({ error }),
        
        resetWorkflow: () => set({
          ...initialState,
          patients: get().patients,
          interviewResponses: get().interviewResponses,
          reviews: get().reviews,
        }),
        
        saveDraft: () => {
          const state = get();
          const draft = {
            currentPatient: state.currentPatient,
            currentMedications: state.currentMedications,
            currentInterviewResponse: state.currentInterviewResponse,
            currentMedicationCompliance: state.currentMedicationCompliance,
            currentClinicalRecommendations: state.currentClinicalRecommendations,
            currentStep: state.currentStep,
            currentSection: state.currentSection,
            timestamp: new Date().toISOString(),
          };
          
          localStorage.setItem('hmr-draft', JSON.stringify(draft));
          
          if (state.currentInterviewResponse) {
            set((state) => ({
              currentInterviewResponse: state.currentInterviewResponse ? {
                ...state.currentInterviewResponse,
                status: 'draft' as const
              } : null
            }));
          }
        },
        
        loadDraft: () => {
          try {
            const saved = localStorage.getItem('hmr-draft');
            if (saved) {
              const draft = JSON.parse(saved);
              set({
                currentPatient: draft.currentPatient || null,
                currentMedications: draft.currentMedications || [],
                currentInterviewResponse: draft.currentInterviewResponse || null,
                currentMedicationCompliance: draft.currentMedicationCompliance || [],
                currentClinicalRecommendations: draft.currentClinicalRecommendations || [],
                currentStep: draft.currentStep || 'dashboard',
                currentSection: draft.currentSection || 'patient-info',
              });
            }
          } catch (error) {
            console.error('Failed to load draft:', error);
          }
        },
        
        completeReview: () => {
          const state = get();
          if (state.currentInterviewResponse) {
            set((state) => ({
              currentInterviewResponse: state.currentInterviewResponse ? {
                ...state.currentInterviewResponse,
                status: 'completed' as const
              } : null
            }));
          }
          localStorage.removeItem('hmr-draft');
        },
        
        // Computed property
        get hasUnsavedWork() {
          const state = get();
          return !!(
            state.currentPatient || 
            state.currentMedications.length > 0 || 
            state.currentInterviewResponse ||
            state.currentClinicalRecommendations.length > 0
          );
        },
      }),
      {
        name: 'hmr-store',
        partialize: (state) => ({
          patients: state.patients,
          interviewResponses: state.interviewResponses,
          reviews: state.reviews,
        }),
      }
    )
  )
);

// Selectors for computed values
export const useHMRSelectors = () => {
  const store = useHMRStore();
  
  return {
    ...store,
    
    // Get pending reviews
    pendingReviews: store.reviews.filter(r => r.status === 'pending'),
    
    // Get completed reviews
    completedReviews: store.reviews.filter(r => r.status === 'completed'),
    
    // Get draft reviews
    draftReviews: store.reviews.filter(r => r.status === 'draft'),
    
    // Check if current workflow is complete
    isWorkflowComplete: store.currentPatient && 
                       store.currentMedications.length > 0 && 
                       store.currentReview && 
                       store.currentRecommendations.length > 0,
    
    // Get current patient's medications
    currentPatientMedications: store.currentPatient?.id ? 
      store.currentMedications.filter(m => m.patient_id === store.currentPatient?.id) :
      store.currentMedications,
    
    // Get current review's recommendations
    currentReviewRecommendations: store.currentReview?.id ?
      store.currentRecommendations.filter(r => r.review_id === store.currentReview?.id) :
      store.currentRecommendations,
  };
};

export default useHMRStore; 