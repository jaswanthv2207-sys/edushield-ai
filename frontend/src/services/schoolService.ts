import api from './api'
import { School, PaginatedResponse } from '../types'

export const schoolService = {
  async getSchools(params: { page?: number; page_size?: number; search?: string } = {}): Promise<
    PaginatedResponse<School>
  > {
    const response = await api.get('/schools/', { params })
    return response.data as PaginatedResponse<School>
  },
}
