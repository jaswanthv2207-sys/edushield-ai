export interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'principal' | 'teacher' | 'counsellor'
  school_id?: number
  phone?: string
  is_active: boolean
  created_at?: string
  last_login?: string
}

export interface Student {
  id: number
  student_id: string
  full_name: string
  email?: string
  phone?: string
  gender: 'male' | 'female' | 'other'
  age: number
  school_id: number
  grade: string
  section?: string
  attendance_percentage: number
  final_grade: number
  previous_failures: number
  study_time_weekly: number
  family_support: 'high' | 'medium' | 'low'
  internet_access: boolean
  fee_status: 'paid' | 'pending' | 'overdue' | 'scholarship'
  medical_condition: 'none' | 'minor' | 'chronic' | 'severe'
  higher_education_interest: boolean
  parent_education?: string
  family_income?: string
  distance_from_school: number
  address?: string
  city?: string
  district?: string
  state: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface StudentFilters {
  search?: string
  school_id?: number
  grade?: string
  gender?: string
  fee_status?: string
  risk_level?: string
  min_attendance?: number
  max_attendance?: number
  sort_by?: string
  sort_order?: string
  page?: number
  page_size?: number
}

export interface Prediction {
  id: number
  student_id: number
  risk_level: 'low' | 'medium' | 'high'
  risk_percentage: number
  confidence_score: number
  risk_factors?: string[]
  recommendations?: string[]
  intervention_suggested?: string
  model_version: string
  created_at?: string
}

export interface CounsellingSession {
  id: number
  student_id: number
  counsellor_id: number
  meeting_date: string
  status: 'pending' | 'completed' | 'emergency' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  ai_recommendations?: string[]
  risk_summary?: string
  follow_up_date?: string
  created_at?: string
  updated_at?: string
  student_name?: string
  counsellor_name?: string
}

export interface School {
  id: number
  name: string
  code: string
  address?: string
  city?: string
  district?: string
  state: string
  pincode?: string
  phone?: string
  email?: string
  school_type: string
  medium: string
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  total_students: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  dropout_rate: number
  total_schools: number
  total_counsellors: number
  active_counselling_sessions: number
}

export interface AnalyticsData {
  dashboard_stats: DashboardStats
  attendance_trend: Array<{ month: string; average_attendance: number; student_count: number }>
  risk_distribution: Array<{ risk_level: string; count: number; percentage: number }>
  school_comparison: Array<{
    school_id: number
    school_name: string
    total_students: number
    high_risk_count: number
    medium_risk_count: number
    low_risk_count: number
    dropout_rate: number
    average_attendance: number
  }>
  gender_analysis: Array<{ gender: string; count: number; high_risk_count: number; dropout_rate: number }>
}

export interface PaginatedResponse<T> {
  students?: T[]
  sessions?: T[]
  schools?: T[]
  reports?: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
