export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  onboarding_completed: boolean;
}

export interface DoseLog {
  id: string;
  user_id: string;
  medication_name: string;
  dose_amount: number;
  dose_unit: string;
  dose_date: string;
  dose_time: string;
  notes?: string;
  created_at: string;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  dose_log_id?: string;
  symptoms: string[];
  severity: 'low' | 'medium' | 'high';
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface ProgressReport {
  id: string;
  user_id: string;
  report_date: string;
  weight?: number;
  blood_pressure?: string;
  glucose_level?: number;
  notes?: string;
  created_at: string;
}

export const COMMON_SYMPTOMS = [
  'Náusea',
  'Vômito',
  'Diarreia',
  'Constipação',
  'Dor abdominal',
  'Fadiga',
  'Tontura',
  'Dor de cabeça',
  'Perda de apetite',
  'Refluxo',
];
