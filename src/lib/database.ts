import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hmr.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  PRAGMA foreign_keys = ON;
  
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    medicare_number TEXT,
    address TEXT,
    phone TEXT,
    referring_doctor TEXT,
    doctor_email TEXT,
    practice_name TEXT,
    practice_address TEXT,
    practice_phone TEXT,
    known_allergies TEXT,
    current_conditions TEXT,
    past_medical_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    name TEXT NOT NULL,
    strength TEXT,
    form TEXT,
    dosage TEXT,
    frequency TEXT,
    route TEXT,
    prn_status TEXT,
    prescriber TEXT,
    prescribed_usage TEXT,
    actual_usage TEXT,
    compliance_status TEXT,
    compliance_comment TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients (id)
  );

  CREATE TABLE IF NOT EXISTS interview_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    interview_date DATE,
    pharmacist_name TEXT DEFAULT 'Avishkar Lal (MRN 8362)',
    
    -- Section A: General Comments
    medication_understanding TEXT,
    medication_administration TEXT,
    medication_adherence TEXT,
    adherence_comments TEXT,
    
    -- Section B: Lifestyle Considerations
    fluid_intake TEXT,
    tea_cups_daily INTEGER,
    coffee_cups_daily INTEGER,
    other_fluids TEXT,
    eating_habits TEXT,
    dietary_concerns TEXT,
    smoking_status TEXT,
    cigarettes_daily INTEGER,
    quit_date DATE,
    alcohol_consumption TEXT,
    alcohol_drinks_weekly INTEGER,
    recreational_drug_use TEXT,
    drug_type TEXT,
    drug_frequency TEXT,
    
    -- Section C: Medication Compliance Review
    unlisted_medications TEXT, -- JSON array of additional medications
    unlisted_reasons TEXT, -- JSON array of reasons for unlisted meds
    discontinued_medications TEXT, -- JSON array of discontinued meds
    discontinuation_reasons TEXT, -- JSON array of discontinuation reasons
    
    -- Section D: Clinical Recommendations
    counselling_provided TEXT, -- JSON array of counselling topics
    next_review_date DATE,
    follow_up_type TEXT,
    follow_up_notes TEXT,
    
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients (id)
  );

  CREATE TABLE IF NOT EXISTS medication_compliance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    interview_id INTEGER,
    medication_id INTEGER,
    prescribed_dosing TEXT,
    actual_usage TEXT,
    compliance_status TEXT,
    comments TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients (id),
    FOREIGN KEY (interview_id) REFERENCES interview_responses (id),
    FOREIGN KEY (medication_id) REFERENCES medications (id)
  );

  CREATE TABLE IF NOT EXISTS clinical_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    interview_id INTEGER,
    issue_identified TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    priority_level TEXT DEFAULT 'Medium',
    category TEXT,
    order_number INTEGER DEFAULT 1,
    FOREIGN KEY (patient_id) REFERENCES patients (id),
    FOREIGN KEY (interview_id) REFERENCES interview_responses (id)
  );

  -- Legacy reviews table for backward compatibility
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    interview_date DATE,
    medication_understanding TEXT,
    medication_administration TEXT,
    medication_adherence TEXT,
    fluid_intake TEXT,
    tea_consumption INTEGER,
    coffee_consumption INTEGER,
    eating_habits TEXT,
    smoking_status TEXT,
    cigarettes_per_day INTEGER,
    alcohol_use TEXT,
    drug_use TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (patient_id) REFERENCES patients (id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER,
    issue_identified TEXT,
    suggested_action TEXT,
    FOREIGN KEY (review_id) REFERENCES reviews (id)
  );
`);

// Prepared statements for common operations
export const statements = {
  // Patient operations
  insertPatient: db.prepare(`
    INSERT INTO patients (name, dob, gender, medicare_number, address, phone, referring_doctor, doctor_email, 
                         practice_name, practice_address, practice_phone, known_allergies, current_conditions, past_medical_history)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  insertPatientWithPharmacist: db.prepare(`
    INSERT INTO patients (pharmacist_id, name, dob, gender, medicare_number, address, phone, referring_doctor, doctor_email, 
                         practice_name, practice_address, practice_phone, known_allergies, current_conditions, past_medical_history)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updatePatient: db.prepare(`
    UPDATE patients 
    SET name = ?, dob = ?, gender = ?, medicare_number = ?, address = ?, phone = ?, 
        referring_doctor = ?, doctor_email = ?, practice_name = ?, practice_address = ?, 
        practice_phone = ?, known_allergies = ?, current_conditions = ?, past_medical_history = ?
    WHERE id = ?
  `),
  getPatients: db.prepare('SELECT * FROM patients ORDER BY created_at DESC'),
  getPatientsByPharmacist: db.prepare('SELECT * FROM patients WHERE pharmacist_id = ? ORDER BY created_at DESC'),
  getPatient: db.prepare('SELECT * FROM patients WHERE id = ?'),
  getPatientByIdAndPharmacist: db.prepare('SELECT * FROM patients WHERE id = ? AND pharmacist_id = ?'),
  
  // Medication operations
  insertMedication: db.prepare(`
    INSERT INTO medications (patient_id, name, strength, form, dosage, frequency, route, prn_status, prescriber, prescribed_usage, actual_usage, compliance_status, compliance_comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateMedication: db.prepare(`
    UPDATE medications 
    SET name = ?, strength = ?, form = ?, dosage = ?, frequency = ?, route = ?, prn_status = ?, prescriber = ?, prescribed_usage = ?, actual_usage = ?, compliance_status = ?, compliance_comment = ?
    WHERE id = ?
  `),
  deleteMedication: db.prepare('DELETE FROM medications WHERE id = ?'),
  getMedicationsByPatient: db.prepare('SELECT * FROM medications WHERE patient_id = ?'),
  
  // Interview operations
  insertInterviewResponse: db.prepare(`
    INSERT INTO interview_responses (
      patient_id, interview_date, pharmacist_name, medication_understanding, medication_administration, 
      medication_adherence, adherence_comments, fluid_intake, tea_cups_daily, coffee_cups_daily, 
      other_fluids, eating_habits, dietary_concerns, smoking_status, cigarettes_daily, quit_date,
      alcohol_consumption, alcohol_drinks_weekly, recreational_drug_use, drug_type, drug_frequency,
      unlisted_medications, unlisted_reasons, discontinued_medications, discontinuation_reasons,
      counselling_provided, next_review_date, follow_up_type, follow_up_notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateInterviewResponse: db.prepare(`
    UPDATE interview_responses 
    SET medication_understanding = ?, medication_administration = ?, medication_adherence = ?, 
        adherence_comments = ?, fluid_intake = ?, tea_cups_daily = ?, coffee_cups_daily = ?, 
        other_fluids = ?, eating_habits = ?, dietary_concerns = ?, smoking_status = ?, 
        cigarettes_daily = ?, quit_date = ?, alcohol_consumption = ?, alcohol_drinks_weekly = ?, 
        recreational_drug_use = ?, drug_type = ?, drug_frequency = ?, unlisted_medications = ?, 
        unlisted_reasons = ?, discontinued_medications = ?, discontinuation_reasons = ?,
        counselling_provided = ?, next_review_date = ?, follow_up_type = ?, follow_up_notes = ?, 
        status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  getInterviewResponse: db.prepare('SELECT * FROM interview_responses WHERE id = ?'),
  getInterviewResponsesByPatient: db.prepare('SELECT * FROM interview_responses WHERE patient_id = ?'),
  
  // Medication compliance operations
  insertMedicationCompliance: db.prepare(`
    INSERT INTO medication_compliance (patient_id, interview_id, medication_id, prescribed_dosing, actual_usage, compliance_status, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  updateMedicationCompliance: db.prepare(`
    UPDATE medication_compliance 
    SET prescribed_dosing = ?, actual_usage = ?, compliance_status = ?, comments = ?
    WHERE id = ?
  `),
  getMedicationComplianceByInterview: db.prepare('SELECT * FROM medication_compliance WHERE interview_id = ?'),
  
  // Clinical recommendations operations
  insertClinicalRecommendation: db.prepare(`
    INSERT INTO clinical_recommendations (patient_id, interview_id, issue_identified, suggested_action, priority_level, category, order_number)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  updateClinicalRecommendation: db.prepare(`
    UPDATE clinical_recommendations 
    SET issue_identified = ?, suggested_action = ?, priority_level = ?, category = ?, order_number = ?
    WHERE id = ?
  `),
  deleteClinicalRecommendation: db.prepare('DELETE FROM clinical_recommendations WHERE id = ?'),
  getClinicalRecommendationsByInterview: db.prepare('SELECT * FROM clinical_recommendations WHERE interview_id = ? ORDER BY order_number'),
  
  // Legacy operations for backward compatibility
  insertReview: db.prepare(`
    INSERT INTO reviews (patient_id, interview_date, medication_understanding, medication_administration, 
                        medication_adherence, fluid_intake, tea_consumption, coffee_consumption, 
                        eating_habits, smoking_status, cigarettes_per_day, alcohol_use, drug_use, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getReview: db.prepare('SELECT * FROM reviews WHERE id = ?'),
  getReviewsByPatient: db.prepare('SELECT * FROM reviews WHERE patient_id = ?'),
  updateReviewStatus: db.prepare('UPDATE reviews SET status = ? WHERE id = ?'),
  
  insertRecommendation: db.prepare(`
    INSERT INTO recommendations (review_id, issue_identified, suggested_action)
    VALUES (?, ?, ?)
  `),
  getRecommendationsByReview: db.prepare('SELECT * FROM recommendations WHERE review_id = ?'),
  
  // Dashboard queries
  getPendingReviews: db.prepare(`
    SELECT r.*, p.name as patient_name 
    FROM interview_responses r 
    JOIN patients p ON r.patient_id = p.id 
    WHERE r.status = 'draft' 
    ORDER BY r.interview_date ASC
  `),
  getRecentActivity: db.prepare(`
    SELECT r.*, p.name as patient_name 
    FROM interview_responses r 
    JOIN patients p ON r.patient_id = p.id 
    ORDER BY r.created_at DESC 
    LIMIT 10
  `)
};

export default db; 