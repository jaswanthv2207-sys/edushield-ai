import api from './api'
import { CounsellingSession, PaginatedResponse } from '../types'

interface AssignCounsellorData {
  student_id: number
  counsellor_id: number
  meeting_date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
}

export const counsellingService = {
  async getSessions(filters: any = {}): Promise<PaginatedResponse<CounsellingSession>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, String(value))
      }
    })
    const response = await api.get<PaginatedResponse<CounsellingSession>>(`/counselling?${params}`)
    return response.data
  },

  async assignCounsellor(data: AssignCounsellorData): Promise<CounsellingSession> {
    const response = await api.post<CounsellingSession>('/counselling/assign', data)
    return response.data
  },

  async updateSession(id: number, data: Partial<CounsellingSession>): Promise<CounsellingSession> {
    const response = await api.put<CounsellingSession>(`/counselling/${id}`, data)
    return response.data
  },

  async getSession(id: number): Promise<CounsellingSession> {
    const response = await api.get<CounsellingSession>(`/counselling/${id}`)
    return response.data
  },

  async deleteSession(id: number): Promise<void> {
    await api.delete(`/counselling/${id}`)
  },

  async getHighRiskStudents(): Promise<any[]> {
    const response = await api.get('/counselling/high-risk-students')
    return response.data
  },
}
