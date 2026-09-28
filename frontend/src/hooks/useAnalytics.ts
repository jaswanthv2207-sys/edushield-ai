import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/analyticsService'

export interface AnalyticsFilters {
  school?: string
  grade?: string
  gender?: string
}

export function useAnalytics(filters: AnalyticsFilters = {}) {
  const params = {
    school_id:
      filters.school && filters.school !== 'all' ? Number(filters.school) : undefined,
    grade: filters.grade && filters.grade !== 'all' ? filters.grade : undefined,
    gender: filters.gender && filters.gender !== 'all' ? filters.gender : undefined,
  }

  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => analyticsService.getAnalytics(params),
    refetchInterval: 300000, // Refresh every 5 minutes
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.getDashboardStats(),
    refetchInterval: 300000,
  })
}
