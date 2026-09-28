import api from './api'
import { AnalyticsData } from '../types'

export const analyticsService = {
  async getAnalytics(
    params: { school_id?: number; grade?: string; gender?: string } = {}
  ): Promise<AnalyticsData> {
    const query: Record<string, string> = {}
    if (params.school_id) query.school_id = String(params.school_id)
    if (params.grade) query.grade = String(params.grade)
    if (params.gender) query.gender = params.gender
    const response = await api.get<AnalyticsData>('/analytics/', { params: query })
    return response.data
  },

  async getDashboardStats(): Promise<any> {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  async getAttendanceTrend(): Promise<any[]> {
    const response = await api.get('/analytics/attendance-trend')
    return response.data
  },

  async getRiskDistribution(): Promise<any[]> {
    const response = await api.get('/analytics/risk-distribution')
    return response.data
  },

  async getSchoolComparison(): Promise<any[]> {
    const response = await api.get('/analytics/school-comparison')
    return response.data
  },

  async getGenderAnalysis(): Promise<any[]> {
    const response = await api.get('/analytics/gender-analysis')
    return response.data
  },
}
