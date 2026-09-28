import { useQuery } from '@tanstack/react-query'
import { schoolService } from '../services/schoolService'

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolService.getSchools({ page: 1, page_size: 100 }),
  })
}
