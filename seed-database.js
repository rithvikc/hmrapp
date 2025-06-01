// Seed database with dummy data for development and testing
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'hmr.db');
console.log('Seeding database at:', dbPath);

const db = new Database(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Clear existing data (optional - remove this if you want to keep existing data)
console.log('Clearing existing data...');
db.exec(`
  DELETE FROM clinical_recommendations;
  DELETE FROM medication_compliance;
  DELETE FROM interview_responses;
  DELETE FROM medications;
  DELETE FROM patients;
  DELETE FROM recommendations;
  DELETE FROM reviews;
`);

// Sample patients data
const patients = [
  {
    name: 'Margaret Thompson',
    dob: '1945-03-15',
    gender: 'Female',
    medicare_number: '2468135790',
    address: '123 Elm Street, Westmead NSW 2145',
    phone: '(02) 9876-5432',
    referring_doctor: 'Dr. Sarah Johnson',
    doctor_email: 'sarah.johnson@westmeadgp.com.au',
    practice_name: 'Westmead Family Medical Centre',
    practice_address: '456 Main Road, Westmead NSW 2145',
    practice_phone: '(02) 9876-1234',
    known_allergies: 'Penicillin (rash), Aspirin (stomach upset)',
    current_conditions: 'Hypertension, Type 2 Diabetes, Osteoarthritis',
    past_medical_history: 'Myocardial infarction (2019), Cholecystectomy (2015)'
  },
  {
    name: 'Robert Chen',
    dob: '1952-08-22',
    gender: 'Male',
    medicare_number: '1357924680',
    address: '78 George Street, Parramatta NSW 2150',
    phone: '(02) 9654-3210',
    referring_doctor: 'Dr. Michael Wong',
    doctor_email: 'michael.wong@parramattahealth.com.au',
    practice_name: 'Parramatta Health Centre',
    practice_address: '234 Church Street, Parramatta NSW 2150',
    practice_phone: '(02) 9654-7890',
    known_allergies: 'Nil Known',
    current_conditions: 'COPD, Hypertension, Depression',
    past_medical_history: 'Pneumonia (2020), Smoking cessation (2018)'
  },
  {
    name: 'Dorothy Williams',
    dob: '1938-12-08',
    gender: 'Female',
    medicare_number: '9876543210',
    address: '42 Oak Avenue, Blacktown NSW 2148',
    phone: '(02) 9832-1456',
    referring_doctor: 'Dr. Emma Davis',
    doctor_email: 'emma.davis@blacktownmedical.com.au',
    practice_name: 'Blacktown Medical Practice',
    practice_address: '88 Patrick Street, Blacktown NSW 2148',
    practice_phone: '(02) 9832-5678',
    known_allergies: 'Codeine (nausea), Shellfish (anaphylaxis)',
    current_conditions: 'Atrial Fibrillation, Heart Failure, Chronic Kidney Disease',
    past_medical_history: 'Stroke (2017), Hip replacement (2019), Pacemaker insertion (2020)'
  },
  {
    name: 'James Patterson',
    dob: '1960-06-30',
    gender: 'Male',
    medicare_number: '5432167890',
    address: '15 Pine Crescent, Mount Druitt NSW 2770',
    phone: '(02) 9625-7890',
    referring_doctor: 'Dr. Lisa Brown',
    doctor_email: 'lisa.brown@mountdruitthealth.com.au',
    practice_name: 'Mount Druitt Health Service',
    practice_address: '67 Luxford Road, Mount Druitt NSW 2770',
    practice_phone: '(02) 9625-4321',
    known_allergies: 'Sulfa drugs (rash)',
    current_conditions: 'Type 2 Diabetes, Hypertension, Peripheral Neuropathy',
    past_medical_history: 'Diabetic retinopathy (2021), Foot ulcer (2020)'
  },
  {
    name: 'Helen Rodriguez',
    dob: '1943-11-14',
    gender: 'Female',
    medicare_number: '7890123456',
    address: '91 Maple Street, Seven Hills NSW 2147',
    phone: '(02) 9671-2345',
    referring_doctor: 'Dr. David Kim',
    doctor_email: 'david.kim@sevenhillsmedical.com.au',
    practice_name: 'Seven Hills Medical Centre',
    practice_address: '123 Prospect Highway, Seven Hills NSW 2147',
    practice_phone: '(02) 9671-8901',
    known_allergies: 'Latex (contact dermatitis)',
    current_conditions: 'Osteoporosis, Anxiety, Hypertension',
    past_medical_history: 'Fracture radius (2020), Cataract surgery (2019)'
  }
];

console.log('Inserting patients...');
const insertPatient = db.prepare(`
  INSERT INTO patients (name, dob, gender, medicare_number, address, phone, referring_doctor, doctor_email, 
                       practice_name, practice_address, practice_phone, known_allergies, current_conditions, past_medical_history)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const patientIds = [];
patients.forEach(patient => {
  const result = insertPatient.run(
    patient.name, patient.dob, patient.gender, patient.medicare_number, patient.address,
    patient.phone, patient.referring_doctor, patient.doctor_email, patient.practice_name,
    patient.practice_address, patient.practice_phone, patient.known_allergies,
    patient.current_conditions, patient.past_medical_history
  );
  patientIds.push(result.lastInsertRowid);
  console.log(`Inserted patient: ${patient.name} (ID: ${result.lastInsertRowid})`);
});

// Sample medications for each patient
const medicationsData = [
  // Margaret Thompson (Patient 1)
  [
    { name: 'Metformin', strength: '500mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Twice daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Sarah Johnson', prescribed_usage: 'Twice daily with meals', actual_usage: 'Once daily (forgets evening dose)', compliance_status: 'Poor', compliance_comment: 'Patient reports forgetting evening dose regularly' },
    { name: 'Amlodipine', strength: '5mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Sarah Johnson', prescribed_usage: 'Once daily in morning', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Taking as prescribed' },
    { name: 'Paracetamol', strength: '500mg', form: 'Tablet', dosage: '1-2 tablets', frequency: 'As needed', route: 'Oral', prn_status: 'PRN (as needed)', prescriber: 'Dr. Sarah Johnson', prescribed_usage: 'Up to 8 tablets daily for pain', actual_usage: '4-6 tablets daily', compliance_status: 'Appropriate', compliance_comment: 'Uses for arthritis pain as needed' },
    { name: 'Simvastatin', strength: '20mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Sarah Johnson', prescribed_usage: 'Once daily at night', actual_usage: 'Stopped 2 weeks ago', compliance_status: 'Non-adherent', compliance_comment: 'Stopped due to muscle aches' }
  ],
  // Robert Chen (Patient 2)
  [
    { name: 'Salbutamol', strength: '100mcg', form: 'Inhaler', dosage: '2 puffs', frequency: 'As needed', route: 'Inhalation', prn_status: 'PRN (as needed)', prescriber: 'Dr. Michael Wong', prescribed_usage: 'Up to 8 puffs daily for breathlessness', actual_usage: '6-10 puffs daily', compliance_status: 'Overuse', compliance_comment: 'Using more than prescribed due to worsening breathlessness' },
    { name: 'Tiotropium', strength: '18mcg', form: 'Capsule Inhaler', dosage: '1 capsule', frequency: 'Once daily', route: 'Inhalation', prn_status: 'Regular', prescriber: 'Dr. Michael Wong', prescribed_usage: 'Once daily morning', actual_usage: 'Most days', compliance_status: 'Good', compliance_comment: 'Occasionally forgets on weekends' },
    { name: 'Sertraline', strength: '50mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Michael Wong', prescribed_usage: 'Once daily morning', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Taking regularly' },
    { name: 'Irbesartan', strength: '150mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Michael Wong', prescribed_usage: 'Once daily morning', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Taking as prescribed' }
  ],
  // Dorothy Williams (Patient 3)
  [
    { name: 'Warfarin', strength: '5mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Emma Davis', prescribed_usage: 'Once daily at 6pm', actual_usage: 'Once daily at varying times', compliance_status: 'Poor', compliance_comment: 'Takes at different times daily, sometimes forgets' },
    { name: 'Frusemide', strength: '40mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Emma Davis', prescribed_usage: 'Once daily morning', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Taking as prescribed' },
    { name: 'Perindopril', strength: '4mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Emma Davis', prescribed_usage: 'Once daily morning', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Taking as prescribed' },
    { name: 'Metoprolol', strength: '25mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Twice daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Emma Davis', prescribed_usage: 'Twice daily', actual_usage: 'Once daily', compliance_status: 'Poor', compliance_comment: 'Halved dose due to feeling tired' }
  ],
  // James Patterson (Patient 4)
  [
    { name: 'Insulin Lantus', strength: '100 units/mL', form: 'Injection', dosage: '30 units', frequency: 'Once daily', route: 'Subcutaneous', prn_status: 'Regular', prescriber: 'Dr. Lisa Brown', prescribed_usage: '30 units at bedtime', actual_usage: '30 units daily as prescribed', compliance_status: 'Good', compliance_comment: 'Injecting correctly' },
    { name: 'NovoRapid', strength: '100 units/mL', form: 'Injection', dosage: '8-12 units', frequency: 'Before meals', route: 'Subcutaneous', prn_status: 'Regular', prescriber: 'Dr. Lisa Brown', prescribed_usage: 'Before each meal as per sliding scale', actual_usage: 'Before main meals only', compliance_status: 'Moderate', compliance_comment: 'Skips breakfast injection sometimes' },
    { name: 'Pregabalin', strength: '75mg', form: 'Capsule', dosage: '1 capsule', frequency: 'Twice daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Lisa Brown', prescribed_usage: 'Twice daily for neuropathy', actual_usage: 'Twice daily as prescribed', compliance_status: 'Good', compliance_comment: 'Good pain relief' },
    { name: 'Atorvastatin', strength: '40mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. Lisa Brown', prescribed_usage: 'Once daily at night', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Taking as prescribed' }
  ],
  // Helen Rodriguez (Patient 5)
  [
    { name: 'Alendronate', strength: '70mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Weekly', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. David Kim', prescribed_usage: 'Once weekly on empty stomach', actual_usage: 'Weekly but with food', compliance_status: 'Poor', compliance_comment: 'Takes with breakfast, not on empty stomach' },
    { name: 'Calcium Carbonate + Vitamin D3', strength: '600mg/400IU', form: 'Tablet', dosage: '1 tablet', frequency: 'Twice daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. David Kim', prescribed_usage: 'Twice daily with meals', actual_usage: 'Once daily', compliance_status: 'Poor', compliance_comment: 'Forgets second dose regularly' },
    { name: 'Escitalopram', strength: '10mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', prn_status: 'Regular', prescriber: 'Dr. David Kim', prescribed_usage: 'Once daily morning', actual_usage: 'Once daily as prescribed', compliance_status: 'Good', compliance_comment: 'Helping with anxiety' },
    { name: 'Temazepam', strength: '10mg', form: 'Tablet', dosage: '1 tablet', frequency: 'As needed', route: 'Oral', prn_status: 'PRN (as needed)', prescriber: 'Dr. David Kim', prescribed_usage: 'As needed for sleep, max 3 times per week', actual_usage: 'Nightly', compliance_status: 'Overuse', compliance_comment: 'Using every night instead of as needed' }
  ]
];

console.log('Inserting medications...');
const insertMedication = db.prepare(`
  INSERT INTO medications (patient_id, name, strength, form, dosage, frequency, route, prn_status, prescriber, prescribed_usage, actual_usage, compliance_status, compliance_comment)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

medicationsData.forEach((patientMeds, index) => {
  const patientId = patientIds[index];
  patientMeds.forEach(med => {
    insertMedication.run(
      patientId, med.name, med.strength, med.form, med.dosage, med.frequency,
      med.route, med.prn_status, med.prescriber, med.prescribed_usage,
      med.actual_usage, med.compliance_status, med.compliance_comment
    );
  });
  console.log(`Inserted ${patientMeds.length} medications for patient ${patientIds[index]}`);
});

// Sample interview responses
const interviewsData = [
  // Margaret Thompson
  {
    patient_id: patientIds[0],
    interview_date: '2024-01-15',
    medication_understanding: 'Moderate - Patient has some understanding but needs clarification on some medications',
    medication_administration: true,
    medication_adherence: 'Poor - Patient frequently misses doses or takes medications incorrectly',
    adherence_comments: 'Forgets evening Metformin dose regularly. Stopped Simvastatin due to muscle aches.',
    fluid_intake: 'Adequate - Patient drinks 6-8 glasses of water daily',
    tea_cups_daily: 3,
    coffee_cups_daily: 1,
    eating_habits: 'Good - Patient maintains regular meal times and balanced diet',
    smoking_status: 'Never smoked',
    alcohol_consumption: 'Occasional - 1-2 standard drinks per week',
    recreational_drug_use: 'None',
    status: 'completed'
  },
  // Robert Chen
  {
    patient_id: patientIds[1],
    interview_date: '2024-01-18',
    medication_understanding: 'Good - Patient demonstrates clear understanding of medication purposes',
    medication_administration: true,
    medication_adherence: 'Moderate - Patient has some understanding but needs clarification on some medications',
    adherence_comments: 'Overusing Salbutamol inhaler due to worsening breathlessness symptoms.',
    fluid_intake: 'Adequate - Patient drinks 6-8 glasses of water daily',
    tea_cups_daily: 2,
    coffee_cups_daily: 2,
    eating_habits: 'Good - Patient maintains regular meal times and balanced diet',
    smoking_status: 'Ex-smoker - quit 6 years ago',
    cigarettes_daily: 0,
    quit_date: '2018-03-01',
    alcohol_consumption: 'None - ceased alcohol consumption',
    recreational_drug_use: 'None',
    status: 'completed'
  },
  // Dorothy Williams
  {
    patient_id: patientIds[2],
    interview_date: '2024-01-22',
    medication_understanding: 'Poor - Patient has limited understanding of medication purposes',
    medication_administration: false,
    medication_adherence: 'Poor - Patient frequently misses doses or takes medications incorrectly',
    adherence_comments: 'Inconsistent Warfarin timing. Reduced Metoprolol dose without consulting doctor.',
    fluid_intake: 'Adequate - Patient drinks 6-8 glasses of water daily',
    tea_cups_daily: 4,
    coffee_cups_daily: 0,
    eating_habits: 'Poor - Patient has irregular meal times and limited appetite',
    smoking_status: 'Never smoked',
    alcohol_consumption: 'None',
    recreational_drug_use: 'None',
    status: 'completed'
  },
  // James Patterson
  {
    patient_id: patientIds[3],
    interview_date: '2024-01-25',
    medication_understanding: 'Good - Patient demonstrates clear understanding of medication purposes',
    medication_administration: true,
    medication_adherence: 'Good - Patient takes medications as prescribed',
    adherence_comments: 'Good compliance overall. Occasionally skips breakfast NovoRapid injection.',
    fluid_intake: 'Good - Patient drinks 8-10 glasses of water daily',
    tea_cups_daily: 1,
    coffee_cups_daily: 2,
    eating_habits: 'Good - Patient maintains regular meal times and follows diabetic diet',
    smoking_status: 'Never smoked',
    alcohol_consumption: 'None - advised to avoid due to diabetes',
    recreational_drug_use: 'None',
    status: 'completed'
  },
  // Helen Rodriguez (Draft)
  {
    patient_id: patientIds[4],
    interview_date: '2024-01-28',
    medication_understanding: 'Moderate - Patient has some understanding but needs clarification on some medications',
    medication_administration: true,
    medication_adherence: 'Poor - Patient frequently misses doses or takes medications incorrectly',
    adherence_comments: 'Takes Alendronate with food instead of empty stomach. Using Temazepam nightly.',
    fluid_intake: 'Adequate - Patient drinks 6-8 glasses of water daily',
    tea_cups_daily: 2,
    coffee_cups_daily: 1,
    eating_habits: 'Moderate - Patient has some irregular meal patterns',
    smoking_status: 'Never smoked',
    alcohol_consumption: 'Occasional - 1-2 standard drinks per week',
    recreational_drug_use: 'None',
    status: 'draft'
  }
];

console.log('Inserting interview responses...');
const insertInterview = db.prepare(`
  INSERT INTO interview_responses (
    patient_id, interview_date, pharmacist_name, medication_understanding, medication_administration, 
    medication_adherence, adherence_comments, fluid_intake, tea_cups_daily, coffee_cups_daily,
    eating_habits, smoking_status, cigarettes_daily, quit_date, alcohol_consumption, recreational_drug_use, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const interviewIds = [];
interviewsData.forEach(interview => {
  const result = insertInterview.run(
    interview.patient_id, interview.interview_date, 'Avishkar Lal (MRN 8362)',
    interview.medication_understanding, interview.medication_administration ? 1 : 0, interview.medication_adherence,
    interview.adherence_comments, interview.fluid_intake, interview.tea_cups_daily, interview.coffee_cups_daily,
    interview.eating_habits, interview.smoking_status, interview.cigarettes_daily || null, interview.quit_date || null,
    interview.alcohol_consumption, interview.recreational_drug_use, interview.status
  );
  interviewIds.push(result.lastInsertRowid);
  console.log(`Inserted interview for patient ${interview.patient_id} (Interview ID: ${result.lastInsertRowid})`);
});

// Sample clinical recommendations
const recommendationsData = [
  // Margaret Thompson recommendations
  [
    { issue_identified: 'Poor medication adherence - Metformin evening dose frequently missed', suggested_action: 'Consider once-daily extended-release Metformin formulation. Discuss with prescriber. Provide medication adherence aids (dosette box, phone reminders).', priority_level: 'High', category: 'Adherence', order_number: 1 },
    { issue_identified: 'Simvastatin discontinued due to muscle aches without medical consultation', suggested_action: 'Discuss with prescriber alternative statin therapy or non-statin options. Monitor liver function if restarting statin therapy.', priority_level: 'High', category: 'Drug Therapy', order_number: 2 },
    { issue_identified: 'Potential drug interaction monitoring required', suggested_action: 'Regular monitoring of diabetes control with HbA1c. Blood pressure monitoring due to amlodipine therapy.', priority_level: 'Medium', category: 'Monitoring', order_number: 3 }
  ],
  // Robert Chen recommendations
  [
    { issue_identified: 'Salbutamol inhaler overuse indicating poor COPD control', suggested_action: 'Review with prescriber - may need step-up therapy (ICS/LABA combination). Ensure correct inhaler technique. Consider pulmonary rehabilitation referral.', priority_level: 'High', category: 'Drug Therapy', order_number: 1 },
    { issue_identified: 'Inhaler technique assessment needed', suggested_action: 'Demonstrate correct Tiotropium HandiHaler technique. Provide written instructions. Follow up in 2-4 weeks to reassess technique.', priority_level: 'Medium', category: 'Education', order_number: 2 },
    { issue_identified: 'Depression medication monitoring', suggested_action: 'Monitor effectiveness of Sertraline therapy. Discuss any side effects with prescriber. Regular mental health check-ups recommended.', priority_level: 'Medium', category: 'Monitoring', order_number: 3 }
  ],
  // Dorothy Williams recommendations
  [
    { issue_identified: 'Critical - Warfarin timing inconsistency affecting INR control', suggested_action: 'URGENT: Discuss with prescriber immediately. Emphasize importance of consistent timing (6pm daily). Consider dosette box and family support. INR monitoring required.', priority_level: 'High', category: 'Safety', order_number: 1 },
    { issue_identified: 'Metoprolol dose reduction without medical supervision', suggested_action: 'URGENT: Contact prescriber regarding self-adjusted dose. Discuss fatigue symptoms - may need dose optimization rather than reduction. Monitor blood pressure.', priority_level: 'High', category: 'Safety', order_number: 2 },
    { issue_identified: 'Multiple cardiovascular medications requiring coordinated care', suggested_action: 'Establish medication management plan with family. Consider Home Medicines Review follow-up in 3 months. Regular GP review recommended.', priority_level: 'Medium', category: 'Management', order_number: 3 }
  ],
  // James Patterson recommendations
  [
    { issue_identified: 'Occasional missed breakfast insulin doses', suggested_action: 'Educate on importance of consistent insulin timing with meals. Discuss blood glucose monitoring patterns. Consider CGM if appropriate.', priority_level: 'Medium', category: 'Education', order_number: 1 },
    { issue_identified: 'Diabetes medication management', suggested_action: 'Continue current insulin regime. Monitor HbA1c every 3 months. Feet checks for diabetic complications. Annual eye examination.', priority_level: 'Medium', category: 'Monitoring', order_number: 2 },
    { issue_identified: 'Neuropathy pain management optimization', suggested_action: 'Pregabalin providing good pain relief. Monitor for side effects (dizziness, weight gain). Alternative options available if needed.', priority_level: 'Low', category: 'Monitoring', order_number: 3 }
  ],
  // Helen Rodriguez recommendations (draft)
  [
    { issue_identified: 'Alendronate administration error - taking with food', suggested_action: 'Critical education needed: Take on empty stomach 30 minutes before food with full glass of water. Remain upright for 30 minutes. This affects absorption significantly.', priority_level: 'High', category: 'Education', order_number: 1 },
    { issue_identified: 'Temazepam overuse and potential dependence', suggested_action: 'Discuss with prescriber urgently. Current nightly use exceeds prescription. Consider sleep hygiene counseling and gradual tapering plan.', priority_level: 'High', category: 'Safety', order_number: 2 },
    { issue_identified: 'Calcium supplement poor adherence', suggested_action: 'Discuss importance of twice-daily calcium for osteoporosis. Consider combination tablet or different formulation. Set reminders for second daily dose.', priority_level: 'Medium', category: 'Adherence', order_number: 3 }
  ]
];

console.log('Inserting clinical recommendations...');
const insertRecommendation = db.prepare(`
  INSERT INTO clinical_recommendations (patient_id, interview_id, issue_identified, suggested_action, priority_level, category, order_number)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

recommendationsData.forEach((patientRecs, index) => {
  const patientId = patientIds[index];
  const interviewId = interviewIds[index];
  
  patientRecs.forEach(rec => {
    insertRecommendation.run(
      patientId, interviewId, rec.issue_identified, rec.suggested_action,
      rec.priority_level, rec.category, rec.order_number
    );
  });
  console.log(`Inserted ${patientRecs.length} recommendations for patient ${patientId}`);
});

// Create some legacy reviews for backward compatibility
console.log('Creating legacy review entries...');
const insertLegacyReview = db.prepare(`
  INSERT INTO reviews (patient_id, interview_date, medication_understanding, medication_administration, 
                      medication_adherence, fluid_intake, tea_consumption, coffee_consumption, 
                      eating_habits, smoking_status, cigarettes_per_day, alcohol_use, drug_use, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Create legacy reviews for first 3 patients
for (let i = 0; i < 3; i++) {
  const interview = interviewsData[i];
  const result = insertLegacyReview.run(
    interview.patient_id, interview.interview_date, interview.medication_understanding,
    interview.medication_administration ? 1 : 0, interview.medication_adherence, interview.fluid_intake,
    interview.tea_cups_daily, interview.coffee_cups_daily, interview.eating_habits,
    interview.smoking_status, interview.cigarettes_daily || 0, interview.alcohol_consumption,
    interview.recreational_drug_use, interview.status
  );
  console.log(`Created legacy review ${result.lastInsertRowid} for patient ${interview.patient_id}`);
}

console.log('\n=== Database seeding completed successfully! ===');
console.log(`Added:
- ${patients.length} patients
- ${medicationsData.flat().length} medications  
- ${interviewsData.length} interview responses
- ${recommendationsData.flat().length} clinical recommendations
- 3 legacy reviews for backward compatibility`);

console.log('\nYou can now:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to the dashboard to see all patients');
console.log('3. Start new reviews or continue draft reviews');
console.log('4. Generate reports for completed reviews');

db.close(); 