import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { counsellingService } from '../services/counsellingService'
import { authService } from '../services/authService'

export function useCounsellors() {
  return useQuery({
    queryKey: ['counsellors'],
    queryFn: () => authService.getUsers('counsellor'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCounsellingSessions(filters: any = {}) {
  return useQuery({
    queryKey: ['counselling-sessions', filters],
    queryFn: () => counsellingService.getSessions(filters),
  })
}

export function useAssignCounsellor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => counsellingService.assignCounsellor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselling-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['high-risk-students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useHighRiskStudents() {
  return useQuery({
    queryKey: ['high-risk-students'],
    queryFn: () => counsellingService.getHighRiskStudents(),
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      counsellingService.updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselling-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['high-risk-students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => counsellingService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselling-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['high-risk-students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
