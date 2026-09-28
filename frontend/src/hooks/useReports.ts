import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService, GenerateReportParams } from '../services/reportService'

export function useReports(pageSize = 10) {
  return useQuery({
    queryKey: ['reports', pageSize],
    queryFn: () => reportService.list({ page: 1, page_size: pageSize }),
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: GenerateReportParams) => reportService.generate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
