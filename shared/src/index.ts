// ─── Enums ──────────────────────────────────────────────────────────────────

export type Role = 'PATIENT' | 'DOCTOR';

export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'bn';

export type AppointmentStatus =
  | 'PENDING'
  | 'TRIAGED'
  | 'WAITING'
  | 'ACTIVE'
  | 'CALL_ENDED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type Urgency = 'ROUTINE' | 'PRIORITY' | 'EMERGENCY';

export type FollowUpResponse = 'BETTER' | 'SAME' | 'WORSE';

export type Severity = 'MILD' | 'MODERATE' | 'SEVERE';

export type Specialisation =
  | 'General Physician'
  | 'Cardiologist'
  | 'Dermatologist'
  | 'Orthopaedist'
  | 'Neurologist'
  | 'Gynaecologist'
  | 'Paediatrician'
  | 'Psychiatrist'
  | 'ENT Specialist'
  | 'Ophthalmologist';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
  preferred_language: Language;
}

export interface RegisterPatientInput {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  blood_group?: string;
  preferred_language: Language;
  role: 'PATIENT';
}

export interface RegisterDoctorInput {
  name: string;
  email: string;
  password: string;
  specialisation: Specialisation;
  experience_years: number;
  license_number: string;
  bio?: string;
  consultation_fee: number;
  role: 'DOCTOR';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
  preferred_language: Language;
  created_at: string;
}

// ─── Doctor ──────────────────────────────────────────────────────────────────

export interface DoctorProfile {
  id: string;
  user_id: string;
  specialisation: Specialisation;
  bio?: string;
  experience_years: number;
  consultation_fee: number;
  license_number: string;
}

export interface DoctorWithRating extends DoctorProfile {
  name: string;
  avg_clarity?: number;
  avg_time?: number;
  avg_prescription?: number;
  avg_overall?: number;
  total_ratings: number;
  next_available_slot?: string;
}

export interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, …
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM"
}

// ─── Appointments ────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface BookAppointmentInput {
  doctorId: string;
  scheduledAt: string;
}

// ─── Triage ──────────────────────────────────────────────────────────────────

export interface TriageInput {
  chiefComplaint: string;
  duration: string;
  severity: Severity;
  existingConditions: string[];
  currentMedications?: string;
  additionalNotes?: string;
  inputLanguage: Language;
}

export interface TriageSummary {
  id: string;
  appointment_id: string;
  chief_complaint: string;
  duration: string;
  severity: string;
  urgency: Urgency;
  ai_summary: string;
  original_patient_text: string;
  original_input_language: Language;
  created_at: string;
}

// ─── Consultation & Prescription ─────────────────────────────────────────────

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionInput {
  appointmentId: string;
  diagnosis: string;
  medicines: Medicine[];
  doctorNotes?: string;
  followUpDate?: string;
  referralSpecialisation?: Specialisation;
}

export interface Consultation {
  id: string;
  appointment_id: string;
  diagnosis: string;
  doctor_notes?: string;
  prescription_url?: string;
  follow_up_date?: string;
  referral_specialisation?: string;
  created_at: string;
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export interface RatingInput {
  appointmentId: string;
  clarity: number;
  timeGiven: number;
  prescriptionQuality: number;
  overall: number;
}

export interface Rating {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  clarity: number;
  time_given: number;
  prescription_quality: number;
  overall: number;
  created_at: string;
}

// ─── Follow-up ───────────────────────────────────────────────────────────────

export interface FollowUpRequest {
  id: string;
  appointment_id: string;
  sent_at: string;
  response?: FollowUpResponse;
  responded_at?: string;
  doctor_flagged: boolean;
  seen_by_doctor: boolean;
}

// ─── SSE Events ──────────────────────────────────────────────────────────────

export type SSEEventType =
  | 'PATIENT_WAITING'
  | 'ADMIT_PATIENT'
  | 'CALL_ENDED'
  | 'APPOINTMENT_EXPIRED';

export interface SSEEvent<T = unknown> {
  event: SSEEventType;
  data: T;
}

// ─── API response wrapper ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
