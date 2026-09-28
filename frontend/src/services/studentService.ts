import api from './api'
import { Student, PaginatedResponse, StudentFilters } from '../types'

export const studentService = {
  async getStudents(filters: StudentFilters = {}): Promise<PaginatedResponse<Student>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value))
      }
    })
    const response = await api.get<PaginatedResponse<Student>>(`/students?${params}`)
    return response.data
  },

  async getStudent(id: number): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}`)
    return response.data
  },

  async createStudent(student: Partial<Student>): Promise<Student> {
    const response = await api.post<Student>('/students', student)
    return response.data
  },

  async updateStudent(id: number, student: Partial<Student>): Promise<Student> {
    const response = await api.put<Student>(`/students/${id}`, student)
    return response.data
  },

  async deleteStudent(id: number): Promise<void> {
    await api.delete(`/students/${id}`)
  },

  async getStudentPredictions(id: number): Promise<{ predictions: any[]; total: number }> {
    const response = await api.get(`/students/${id}/predictions`)
    return response.data
  },
}
