import api from './api'
import { Prediction } from '../types'

interface ManualPredictionData {
  gender: string
  age: number
  school_id: number
  attendance_percentage: number
  previous_failures: number
  final_grade: number
  family_support: string
  internet_access: boolean
  fee_status: string
  medical_condition: string
  higher_education_interest: boolean
  study_time_weekly?: number
  distance_from_school?: number
}

export const predictionService = {
  async predictStudent(studentId: number): Promise<Prediction> {
    const response = await api.post<Prediction>(`/predict/${studentId}`)
    return response.data
  },

  async manualPrediction(data: ManualPredictionData): Promise<any> {
    const response = await api.post('/predict/manual', data)
    return response.data
  },

  async bulkPrediction(studentIds: number[]): Promise<any> {
    const response = await api.post('/predict/bulk', { student_ids: studentIds })
    return response.data
  },

  async uploadCsv(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/predict/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getPredictionHistory(studentId: number): Promise<Prediction[]> {
    const response = await api.get<Prediction[]>(`/predict/history/${studentId}`)
    return response.data
  },
}
