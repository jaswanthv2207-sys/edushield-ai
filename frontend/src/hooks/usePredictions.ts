import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { predictionService } from '../services/predictionService'

export function usePredictStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentId: number) => predictionService.predictStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
    },
  })
}

export function useManualPrediction() {
  return useMutation({
    mutationFn: (data: any) => predictionService.manualPrediction(data),
  })
}

export function useBulkPrediction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentIds: number[]) => predictionService.bulkPrediction(studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
    },
  })
}

export function usePredictionHistory(studentId: number) {
  return useQuery({
    queryKey: ['predictions', studentId],
    queryFn: () => predictionService.getPredictionHistory(studentId),
    enabled: !!studentId,
  })
}
