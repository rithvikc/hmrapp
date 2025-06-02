export interface Database {
  public: {
    Tables: {
      pharmacists: {
        Row: {
          id: string
          user_id: string
          name: string
          registration_number: string
          phone: string | null
          email: string
          practice_name: string | null
          practice_address: string | null
          practice_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          registration_number: string
          phone?: string | null
          email: string
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          registration_number?: string
          phone?: string | null
          email?: string
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          pharmacist_id: string
          name: string
          dob: string | null
          gender: string | null
          medicare_number: string | null
          address: string | null
          phone: string | null
          referring_doctor: string | null
          doctor_email: string | null
          practice_name: string | null
          practice_address: string | null
          practice_phone: string | null
          known_allergies: string | null
          current_conditions: string | null
          past_medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacist_id: string
          name: string
          dob?: string | null
          gender?: string | null
          medicare_number?: string | null
          address?: string | null
          phone?: string | null
          referring_doctor?: string | null
          doctor_email?: string | null
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          known_allergies?: string | null
          current_conditions?: string | null
          past_medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacist_id?: string
          name?: string
          dob?: string | null
          gender?: string | null
          medicare_number?: string | null
          address?: string | null
          phone?: string | null
          referring_doctor?: string | null
          doctor_email?: string | null
          practice_name?: string | null
          practice_address?: string | null
          practice_phone?: string | null
          known_allergies?: string | null
          current_conditions?: string | null
          past_medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          patient_id: string
          name: string
          strength: string | null
          form: string | null
          dosage: string | null
          frequency: string | null
          route: string | null
          prn_status: string | null
          prescriber: string | null
          prescribed_usage: string | null
          actual_usage: string | null
          compliance_status: string | null
          compliance_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          strength?: string | null
          form?: string | null
          dosage?: string | null
          frequency?: string | null
          route?: string | null
          prn_status?: string | null
          prescriber?: string | null
          prescribed_usage?: string | null
          actual_usage?: string | null
          compliance_status?: string | null
          compliance_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          strength?: string | null
          form?: string | null
          dosage?: string | null
          frequency?: string | null
          route?: string | null
          prn_status?: string | null
          prescriber?: string | null
          prescribed_usage?: string | null
          actual_usage?: string | null
          compliance_status?: string | null
          compliance_comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interview_responses: {
        Row: {
          id: string
          patient_id: string
          pharmacist_id: string
          interview_date: string
          medication_understanding: string | null
          medication_administration: boolean | null
          medication_adherence: string | null
          adherence_comments: string | null
          fluid_intake: string | null
          tea_cups_daily: number | null
          coffee_cups_daily: number | null
          eating_habits: string | null
          smoking_status: string | null
          cigarettes_daily: number | null
          quit_date: string | null
          alcohol_consumption: string | null
          recreational_drug_use: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          pharmacist_id: string
          interview_date: string
          medication_understanding?: string | null
          medication_administration?: boolean | null
          medication_adherence?: string | null
          adherence_comments?: string | null
          fluid_intake?: string | null
          tea_cups_daily?: number | null
          coffee_cups_daily?: number | null
          eating_habits?: string | null
          smoking_status?: string | null
          cigarettes_daily?: number | null
          quit_date?: string | null
          alcohol_consumption?: string | null
          recreational_drug_use?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          pharmacist_id?: string
          interview_date?: string
          medication_understanding?: string | null
          medication_administration?: boolean | null
          medication_adherence?: string | null
          adherence_comments?: string | null
          fluid_intake?: string | null
          tea_cups_daily?: number | null
          coffee_cups_daily?: number | null
          eating_habits?: string | null
          smoking_status?: string | null
          cigarettes_daily?: number | null
          quit_date?: string | null
          alcohol_consumption?: string | null
          recreational_drug_use?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinical_recommendations: {
        Row: {
          id: string
          patient_id: string
          interview_id: string
          issue_identified: string
          suggested_action: string
          priority_level: string
          category: string | null
          order_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          interview_id: string
          issue_identified: string
          suggested_action: string
          priority_level: string
          category?: string | null
          order_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          interview_id?: string
          issue_identified?: string
          suggested_action?: string
          priority_level?: string
          category?: string | null
          order_number?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 